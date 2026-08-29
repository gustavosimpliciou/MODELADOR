from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, logging, asyncio, uuid, re, unicodedata
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ─── Logging ─────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# ─── Supabase ────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

sb: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized ✓")
    except Exception as e:
        logger.warning(f"Supabase init failed: {e}")
else:
    logger.warning("SUPABASE_URL / SUPABASE_KEY not set — auth disabled")


def new_auth_client() -> Client:
    """
    Fresh Supabase client for a single `.auth.*` call (sign in, admin
    create/update user, password reset).

    IMPORTANT: never reuse one client instance across multiple `.auth.*`
    calls, and never call `.auth.*` on `sb`. The supabase-py client mutates
    its own session/Authorization headers to whatever identity the last
    `.auth.*` call established — e.g. after `sign_in_with_password`, that
    *same client* starts sending the logged-in user's JWT instead of the
    service-role key. Reusing a client for a second `.auth.*` call (or for
    `.table(...)` queries that need service-role/RLS-bypass) then silently
    fails or gets blocked by RLS. A fresh client per call sidesteps this
    entirely and also avoids cross-request session bleed under concurrency.
    """
    return create_client(SUPABASE_URL, SUPABASE_KEY)


async def srun(fn):
    """Run a synchronous Supabase call without blocking the event loop."""
    return await asyncio.to_thread(fn)


def require_db():
    if sb is None:
        raise HTTPException(
            503,
            "Banco de dados não configurado. Verifique SUPABASE_URL e SUPABASE_KEY.",
        )


# ─── Kiwify (planos / créditos) ──────────────────────────────────────
KIWIFY_WEBHOOK_TOKEN = os.environ.get('KIWIFY_WEBHOOK_TOKEN', '')

EXPORT_COST = 40

# plano → créditos concedidos na compra
PLAN_CREDITS = {
    'easy':    200,
    'medium':  565,
    'premium': 1500,
}

# Expiração de créditos comprados
CREDIT_EXPIRY_DAYS   = 90   # 3 meses
EXPIRED_CREDIT_BALANCE = 100  # saldo após expirar (independente do valor anterior)


def _normalize(text: str) -> str:
    text = unicodedata.normalize('NFKD', text or '').encode('ascii', 'ignore').decode('ascii')
    return text.lower()


def detect_plan_tier(product_name: str, product_id: str = '') -> Optional[str]:
    """Identify which plan (easy/medium/premium) a Kiwify product maps to,
    based on its name — tolerant of 'promoção', 'plano', accents, etc."""
    haystack = _normalize(f'{product_name} {product_id}')
    if 'premium' in haystack:
        return 'premium'
    if re.search(r'\bmedium\b|\bmedio\b|\bpro\b', haystack):
        return 'medium'
    if 'easy' in haystack:
        return 'easy'
    return None


# ─── JWT helpers ─────────────────────────────────────────────────────
SECRET_KEY   = os.environ.get('SESSION_SECRET', 'dev-secret-change-in-production')
ALGORITHM    = 'HS256'
TOKEN_DAYS   = 30
ADMIN_EMAIL  = 'nativos3d.adm@gmail.com'

bearer = HTTPBearer(auto_error=False)


def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS)
    return jwt.encode({'sub': user_id, 'exp': exp}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[str]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]).get('sub')
    except JWTError:
        return None


def safe_user(row: dict) -> dict:
    """Return only the fields the frontend needs (no password hash)."""
    is_admin = row.get('email', '') == ADMIN_EMAIL
    return {
        'id':                    row.get('id', ''),
        'name':                  row.get('name', ''),
        'email':                 row.get('email', ''),
        'is_admin':              is_admin,
        'credits':               99999 if is_admin else row.get('credits', 0),
        'freeDownloadUsed':      False  if is_admin else row.get('free_download_used', False),
        'firstUpgradePurchased': row.get('first_upgrade_purchased', False),
        'plan':                  row.get('plan', 'free'),
        'creditsExpiresAt':      row.get('credits_expires_at'),
    }


async def get_or_create_profile(user_id: str, email: str, name: str = '') -> dict:
    """Return existing profile or create one for a Supabase Auth user."""
    res = await srun(lambda: sb.table('users').select('*').eq('id', user_id).execute())
    if res.data:
        return res.data[0]

    # First login for an existing Supabase Auth user — create their profile
    display_name = name or email.split('@')[0]
    row = {
        'id':                    user_id,
        'name':                  display_name,
        'email':                 email,
        'password_hash':         '',          # password lives in Supabase Auth
        'credits':               0,
        'free_download_used':    False,
        'first_upgrade_purchased': False,
        'plan':                  'free',
        'created_at':            datetime.now(timezone.utc).isoformat(),
        'reset_token':           None,
        'reset_token_expiry':    None,
    }
    try:
        await srun(lambda: sb.table('users').insert(row).execute())
    except Exception as e:
        logger.warning(f"Could not insert profile for {user_id}: {e}")
        return row

    # Auto-link orphaned payments for this email
    try:
        orphan_res = await srun(
            lambda: sb.table('payments')
                .select('*')
                .eq('status', 'paid_user_not_found')
                .ilike('product', f'%|||buyer:{email}%')
                .execute()
        )
        for payment in (orphan_res.data or []):
            product_name = payment.get('product', '').split('|||buyer:')[0]
            tier = detect_plan_tier(product_name, '')
            if not tier:
                continue
            credits_to_add = PLAN_CREDITS[tier]
            new_credits = credits_to_add  # new user starts at 0
            now = datetime.now(timezone.utc).isoformat()

            paid_at_str = payment.get('created_at')
            try:
                paid_at = datetime.fromisoformat(str(paid_at_str).replace('Z', '+00:00'))
            except (ValueError, TypeError):
                paid_at = datetime.now(timezone.utc)
            expires_at = (paid_at + timedelta(days=90)).isoformat()

            await srun(lambda: sb.table('users').update({
                'credits':                 new_credits,
                'plan':                    tier,
                'first_upgrade_purchased': True,
                'credits_expires_at':      expires_at,
            }).eq('id', user_id).execute())

            await srun(lambda: sb.table('payments').update({
                'user_id': user_id,
                'status': 'paid_linked_auto',
            }).eq('id', payment['id']).execute())

            await srun(lambda: sb.table('credit_history').insert({
                'id': str(uuid.uuid4()), 'user_id': user_id,
                'type': 'purchase', 'credits': credits_to_add,
                'description': f'Compra vinculada automaticamente no cadastro: {product_name} (pedido {payment.get("kiwify_transaction_id")})',
                'created_at': now,
            }).execute())

            logger.info(f"Auto-vinculou pagamento {payment.get('kiwify_transaction_id')} ao novo usuário {user_id} (+{credits_to_add} créditos)")
    except Exception as e:
        logger.warning(f"Erro ao auto-vincular pagamentos para {user_id}: {e}")

    return row


async def require_auth(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if creds is None:
        raise HTTPException(401, 'Não autenticado')
    user_id = decode_token(creds.credentials)
    if not user_id:
        raise HTTPException(401, 'Token inválido ou expirado')
    require_db()
    try:
        res = await srun(lambda: sb.table('users').select('*').eq('id', user_id).execute())
    except Exception as e:
        raise HTTPException(500, f'Erro ao verificar autenticação: {e}')
    if not res.data:
        raise HTTPException(401, 'Sessão expirada. Faça login novamente.')
    return res.data[0]


async def require_admin(request: Request):
    """
    Accept Supabase JWTs (what the frontend sends) OR FastAPI JWTs.
    Verify identity, then enforce ADMIN_EMAIL check.
    Returns the admin's profile row from the users table, creating it
    on first access if the admin exists in Supabase Auth but not yet
    in the local users table.
    """
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        raise HTTPException(401, 'Token não fornecido')
    token = auth[7:]

    email: Optional[str] = None
    auth_user_id: Optional[str] = None

    # ── Try Supabase JWT first (frontend sends Supabase access tokens) ──
    try:
        client = new_auth_client()
        result = await srun(lambda: client.auth.get_user(token))
        if result and result.user:
            email = result.user.email
            auth_user_id = str(result.user.id)
    except Exception:
        pass

    # ── Fallback: try FastAPI JWT ──────────────────────────────────────
    if not email:
        fb_user_id = decode_token(token)
        if fb_user_id and sb:
            try:
                res = await srun(lambda: sb.table('users').select('email').eq('id', fb_user_id).execute())
                if res.data:
                    email = res.data[0]['email']
                    auth_user_id = fb_user_id
            except Exception:
                pass

    if not email:
        raise HTTPException(401, 'Sessão inválida ou expirada')
    if email != ADMIN_EMAIL:
        raise HTTPException(403, 'Acesso restrito a administradores')

    require_db()
    res = await srun(lambda: sb.table('users').select('*').eq('email', email).execute())
    if res.data:
        return res.data[0]

    # Admin exists in Supabase Auth but not yet in the users table.
    # Auto-create the profile so the dashboard works immediately.
    if not auth_user_id:
        raise HTTPException(
            404,
            'Perfil de administrador não encontrado e não foi possível criá-lo automaticamente. '
            'Faça login novamente.',
        )
    logger.info(f"Criando perfil de administrador para {email} (id={auth_user_id})")
    profile = await get_or_create_profile(auth_user_id, email, 'Admin')
    return profile


# ─── Pydantic models ─────────────────────────────────────────────────

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    # accepts e-mail address OR display name
    identifier: str
    password: str

class ForgotPasswordInput(BaseModel):
    email: str

class ResetPasswordInput(BaseModel):
    token: str
    password: str

class UpdateCreditsInput(BaseModel):
    credits: int
    freeDownloadUsed: bool
    firstUpgradePurchased: bool

class AdminCreditInput(BaseModel):
    operation: str          # 'add' | 'remove' | 'set'
    amount: int
    note: Optional[str] = None


# ─── App & routers ────────────────────────────────────────────────────
app = FastAPI()
auth_router = APIRouter(prefix='/api/auth', tags=['auth'])
api_router  = APIRouter(prefix='/api',      tags=['api'])


# ─── Auth endpoints ───────────────────────────────────────────────────

@auth_router.post('/register')
async def register(body: RegisterInput):
    require_db()
    if len(body.password) < 6:
        raise HTTPException(400, 'A senha deve ter pelo menos 6 caracteres')

    email = body.email.strip().lower()
    name  = body.name.strip()

    # Use Supabase Auth admin to create the user (auto-confirms email)
    try:
        result = await srun(lambda: new_auth_client().auth.admin.create_user({
            'email':         email,
            'password':      body.password,
            'email_confirm': True,
            'user_metadata': {'name': name},
        }))
        auth_user = result.user
    except Exception as e:
        err = str(e).lower()
        if 'already registered' in err or 'already exists' in err or 'duplicate' in err:
            raise HTTPException(409, 'E-mail já cadastrado')
        raise HTTPException(400, f'Erro ao criar conta: {e}')

    # Create profile row
    profile = await get_or_create_profile(str(auth_user.id), email, name)
    return {'token': create_token(str(auth_user.id)), 'user': safe_user(profile)}


@auth_router.post('/login')
async def login(body: LoginInput):
    require_db()

    identifier = body.identifier.strip()

    # ── Resolve the email ─────────────────────────────────────────────
    if '@' in identifier:
        # Looks like an e-mail address — use it directly
        email = identifier.lower()
    else:
        # Treat as display name — look it up in profiles
        try:
            res = await srun(
                lambda: sb.table('users')
                    .select('email')
                    .ilike('name', identifier)
                    .limit(1)
                    .execute()
            )
        except Exception as e:
            raise HTTPException(500, f'Erro ao buscar usuário: {e}')

        if not res.data:
            raise HTTPException(401, 'Usuário ou senha incorretos')
        email = res.data[0]['email']

    # ── Verify password via Supabase Auth ─────────────────────────────
    try:
        auth_res = await srun(
            lambda: new_auth_client().auth.sign_in_with_password({'email': email, 'password': body.password})
        )
        auth_user = auth_res.user
    except Exception as e:
        err = str(e).lower()
        if 'invalid' in err or 'credentials' in err or 'password' in err or '400' in err:
            raise HTTPException(401, 'Usuário ou senha incorretos')
        raise HTTPException(500, f'Erro de autenticação: {e}')

    if auth_user is None:
        raise HTTPException(401, 'Usuário ou senha incorretos')

    # ── Get or create profile ─────────────────────────────────────────
    meta         = getattr(auth_user, 'user_metadata', {}) or {}
    display_name = meta.get('name', '') or meta.get('full_name', '') or email.split('@')[0]
    profile      = await get_or_create_profile(str(auth_user.id), email, display_name)

    return {'token': create_token(str(auth_user.id)), 'user': safe_user(profile)}


@auth_router.get('/me')
async def me(current_user=Depends(require_auth)):
    return safe_user(current_user)


@auth_router.post('/forgot-password')
async def forgot_password(body: ForgotPasswordInput):
    require_db()
    email = body.email.strip().lower()
    try:
        # Supabase sends the reset email automatically
        await srun(lambda: new_auth_client().auth.reset_password_email(email))
        logger.info(f"Password reset email requested for {email}")
    except Exception as e:
        logger.warning(f"reset_password_email error for {email}: {e}")
        # Don't reveal whether e-mail exists
    return {'message': 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'}


@auth_router.post('/reset-password')
async def reset_password(body: ResetPasswordInput):
    """
    This endpoint handles resets from our legacy token system.
    Supabase sends its own reset link directly to the user's email.
    """
    require_db()
    if len(body.password) < 6:
        raise HTTPException(400, 'A senha deve ter pelo menos 6 caracteres')
    try:
        res = await srun(
            lambda: sb.table('users').select('id').eq('reset_token', body.token).execute()
        )
    except Exception:
        raise HTTPException(500, 'Erro interno')

    if not res.data:
        raise HTTPException(400, 'Token inválido ou expirado')

    user_id = res.data[0]['id']

    # Update via Supabase Auth admin
    try:
        await srun(lambda: new_auth_client().auth.admin.update_user_by_id(
            user_id, {'password': body.password}
        ))
    except Exception as e:
        raise HTTPException(500, f'Erro ao redefinir senha: {e}')

    await srun(lambda: sb.table('users').update({
        'reset_token': None, 'reset_token_expiry': None,
    }).eq('id', user_id).execute())

    return {'message': 'Senha redefinida com sucesso'}


@auth_router.put('/credits')
async def update_credits(body: UpdateCreditsInput, current_user=Depends(require_auth)):
    require_db()
    await srun(lambda: sb.table('users').update({
        'credits':               body.credits,
        'free_download_used':    body.freeDownloadUsed,
        'first_upgrade_purchased': body.firstUpgradePurchased,
    }).eq('id', current_user['id']).execute())
    return {'ok': True}


# ─── Créditos / exportação (aplicado no servidor, não confia no cliente) ──

@auth_router.post('/consume-export')
async def consume_export(current_user=Depends(require_auth)):
    """
    Chamado antes de gerar o arquivo de exportação. Concede o primeiro
    download gratuito, ou debita EXPORT_COST créditos. Bloqueia (402) se
    não houver créditos suficientes, para que o front abra o Upgrade.
    """
    require_db()
    now = datetime.now(timezone.utc).isoformat()

    # Admin bypass — unlimited exports, never deduct credits
    if current_user.get('email') == ADMIN_EMAIL:
        return {'ok': True, 'freeDownload': False, 'credits': 99999, 'admin': True}

    # Crédito expirado → saldo cai para EXPIRED_CREDIT_BALANCE (uma vez)
    expires_at = current_user.get('credits_expires_at')
    if expires_at:
        try:
            exp = datetime.fromisoformat(str(expires_at).replace('Z', '+00:00'))
        except (ValueError, TypeError):
            exp = None
        if exp and exp <= datetime.now(timezone.utc):
            now = datetime.now(timezone.utc).isoformat()
            await srun(lambda: sb.table('users').update({
                'credits': EXPIRED_CREDIT_BALANCE,
                'credits_expires_at': None,
            }).eq('id', current_user['id']).execute())
            current_user['credits'] = EXPIRED_CREDIT_BALANCE
            try:
                await srun(lambda: sb.table('credit_history').insert({
                    'id': str(uuid.uuid4()), 'user_id': current_user['id'],
                    'type': 'expiry_reset', 'credits': EXPIRED_CREDIT_BALANCE,
                    'description': 'Crédito expirado — saldo ajustado para '
                                   f'{EXPIRED_CREDIT_BALANCE}', 'created_at': now,
                }).execute())
            except Exception:
                logger.warning('credit_history insert failed on expiry_reset')

    if not current_user.get('free_download_used'):
        await srun(lambda: sb.table('users').update({
            'free_download_used': True,
        }).eq('id', current_user['id']).execute())
        await srun(lambda: sb.table('credit_history').insert({
            'id': str(uuid.uuid4()), 'user_id': current_user['id'],
            'type': 'free_download', 'credits': 0,
            'description': 'Primeiro download gratuito', 'created_at': now,
        }).execute())
        return {'ok': True, 'freeDownload': True, 'credits': current_user.get('credits', 0)}

    credits = current_user.get('credits', 0)
    if credits < EXPORT_COST:
        raise HTTPException(402, 'Créditos insuficientes. Faça upgrade do seu plano.')

    new_credits = credits - EXPORT_COST
    await srun(lambda: sb.table('users').update({
        'credits': new_credits,
    }).eq('id', current_user['id']).execute())
    await srun(lambda: sb.table('credit_history').insert({
        'id': str(uuid.uuid4()), 'user_id': current_user['id'],
        'type': 'export', 'credits': -EXPORT_COST,
        'description': 'Exportação de modelo', 'created_at': now,
    }).execute())
    return {'ok': True, 'freeDownload': False, 'credits': new_credits}


# ─── Projects ────────────────────────────────────────────────────────

class SaveProjectInput(BaseModel):
    id:   Optional[str] = None   # None → create new; set → update
    name: str
    data: dict


@api_router.get('/projects')
async def list_projects(current_user=Depends(require_auth)):
    require_db()
    res = await srun(
        lambda: sb.table('projects')
            .select('id, name, updated_at')
            .eq('user_id', current_user['id'])
            .order('updated_at', desc=True)
            .execute()
    )
    return res.data


@api_router.post('/projects')
async def save_project(body: SaveProjectInput, current_user=Depends(require_auth)):
    require_db()
    now = datetime.now(timezone.utc).isoformat()
    if body.id:
        # Update existing
        await srun(
            lambda: sb.table('projects')
                .update({'name': body.name, 'data': body.data, 'updated_at': now})
                .eq('id', body.id)
                .eq('user_id', current_user['id'])
                .execute()
        )
        return {'id': body.id, 'name': body.name}
    else:
        # Create new
        proj_id = str(uuid.uuid4())
        await srun(
            lambda: sb.table('projects').insert({
                'id':         proj_id,
                'user_id':    current_user['id'],
                'name':       body.name,
                'data':       body.data,
                'created_at': now,
                'updated_at': now,
            }).execute()
        )
        return {'id': proj_id, 'name': body.name}


@api_router.get('/projects/{project_id}')
async def get_project(project_id: str, current_user=Depends(require_auth)):
    require_db()
    res = await srun(
        lambda: sb.table('projects')
            .select('*')
            .eq('id', project_id)
            .eq('user_id', current_user['id'])
            .execute()
    )
    if not res.data:
        raise HTTPException(404, 'Projeto não encontrado')
    return res.data[0]


@api_router.delete('/projects/{project_id}')
async def delete_project(project_id: str, current_user=Depends(require_auth)):
    require_db()
    await srun(
        lambda: sb.table('projects')
            .delete()
            .eq('id', project_id)
            .eq('user_id', current_user['id'])
            .execute()
    )
    return {'ok': True}


# ─── Webhook Kiwify ────────────────────────────────────────────────────

@api_router.post('/webhook/kiwify')
async def kiwify_webhook(request: Request):
    """
    Recebe as notificações de venda da Kiwify. Autenticidade validada por um
    token compartilhado (definido em KIWIFY_WEBHOOK_TOKEN e configurado na
    URL do webhook no painel da Kiwify, ex: .../api/webhook/kiwify?token=...).
    """
    require_db()

    if not KIWIFY_WEBHOOK_TOKEN:
        raise HTTPException(503, 'KIWIFY_WEBHOOK_TOKEN não configurado')

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, 'Payload inválido')

    incoming_token = (
        request.query_params.get('token')
        or request.headers.get('x-webhook-token')
        or (body.get('token') if isinstance(body, dict) else None)
    )
    if incoming_token != KIWIFY_WEBHOOK_TOKEN:
        raise HTTPException(401, 'Token inválido')

    order_status = (body.get('order_status') or '').lower()
    event_type   = (body.get('webhook_event_type') or '').lower()
    order_id     = body.get('order_id') or body.get('order_ref') or ''

    # Kiwify usa vários status para "pago aprovado"
    PAID_STATUSES = {
        'paid', 'approved', 'completed', 'confirmed', 'success',
        'order_approved', 'payment_approved', 'payment_confirmed'
    }
    is_paid = order_status in PAID_STATUSES or event_type in PAID_STATUSES

    # Só processa vendas aprovadas — outros eventos (boleto/pix gerado,
    # carrinho abandonado, recusada, etc.) são apenas confirmados (200).
    if not is_paid:
        return {'ok': True, 'ignored': True, 'order_status': order_status, 'event_type': event_type}

    customer = body.get('Customer') or {}
    email = (customer.get('email') or '').strip().lower()
    tracking = body.get('TrackingParameters') or body.get('tracking_parameters') or {}
    # Expand tracking fields — Kiwify may send user_id in various params
    tracked_user_id = (
        (tracking.get('src') or tracking.get('sck') or
         tracking.get('utm_content') or tracking.get('utm_term') or
         tracking.get('user_id') or tracking.get('external_id') or
         tracking.get('customer_id') or tracking.get('subscriber_id') or '')
        or ''
    )
    tracked_user_id = str(tracked_user_id).strip() or None

    product      = body.get('Product') or {}
    product_name = product.get('product_name') or ''
    product_id   = product.get('product_id') or ''
    tier = detect_plan_tier(product_name, product_id)

    now = datetime.now(timezone.utc).isoformat()
    # Use Kiwify's order_date if available for accurate expiry calculation
    paid_raw = body.get('order_date') or body.get('OrderDate') or body.get('payment_date') or now
    try:
        paid_at = datetime.fromisoformat(str(paid_raw).replace('Z', '+00:00'))
        if paid_at.tzinfo is None:
            paid_at = paid_at.replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        paid_at = datetime.now(timezone.utc)
    commissions = body.get('Commissions') or {}
    value = commissions.get('charge_amount') or commissions.get('product_base_price') or ''

    if tier is None:
        logger.warning(f"Webhook Kiwify: produto não reconhecido '{product_name}' (order {order_id})")
        await srun(lambda: sb.table('payments').insert({
            'id': str(uuid.uuid4()), 'user_id': None,
            'kiwify_transaction_id': order_id, 'product': product_name or product_id,
            'value': value, 'status': f'{order_status or event_type}_unrecognized_product',
            'created_at': now,
        }).execute())
        return {'ok': True, 'ignored': True, 'reason': 'produto não reconhecido'}

    # Idempotência — não processa a mesma venda duas vezes
    try:
        existing = await srun(
            lambda: sb.table('payments').select('id').eq('kiwify_transaction_id', order_id).execute()
        )
    except Exception as e:
        raise HTTPException(500, f'Erro ao verificar pagamento: {e}')
    if existing.data:
        return {'ok': True, 'duplicate': True}

    # Resolver usuário: USER_ID (tracking do checkout) → e-mail
    user = None
    resolved_by = None
    if tracked_user_id:
        res_id = await srun(lambda: sb.table('users').select('*').eq('id', tracked_user_id).execute())
        if res_id.data:
            user = res_id.data[0]
            resolved_by = 'tracking_user_id'
    if user is None and email:
        res_em = await srun(lambda: sb.table('users').select('*').eq('email', email).execute())
        if res_em.data:
            user = res_em.data[0]
            resolved_by = 'email'

    if user is None:
        logger.warning(
            f"Webhook Kiwify: usuário não encontrado "
            f"(email={email}, tracked={tracked_user_id}, order={order_id}, product={product_name})"
        )
        product_stored = (
            f"{product_name or product_id}|||buyer:{email}" if email
            else (product_name or product_id)
        )
        await srun(lambda: sb.table('payments').insert({
            'id': str(uuid.uuid4()), 'user_id': None,
            'kiwify_transaction_id': order_id, 'product': product_stored,
            'value': value,
            'status': 'paid_user_not_found',
            'created_at': now,
        }).execute())
        return {
            'ok': True, 'ignored': True, 'reason': 'usuário não encontrado',
            'email': email or None, 'tracked_user_id': tracked_user_id,
        }

    # User found — log resolution method for debugging
    logger.info(
        f"Kiwify webhook: usuário resolvido via {resolved_by} "
        f"(email={email}, tracked={tracked_user_id}, order={order_id})"
    )

    credits_to_add = PLAN_CREDITS[tier]
    new_credits = user.get('credits', 0) + credits_to_add

    # Créditos comprados expiram 3 meses após a data do pagamento (não do webhook).
    expires_at = (paid_at + timedelta(days=90)).isoformat()

    # Transação: atualiza usuário + insere payment + credit_history atomicamente
    # Se qualquer etapa falhar, rollback automático via exceção
    try:
        await srun(lambda: sb.table('users').update({
            'credits':                 new_credits,
            'plan':                    tier,
            'first_upgrade_purchased': True,
            'credits_expires_at':      expires_at,
        }).eq('id', user['id']).execute())

        await srun(lambda: sb.table('payments').insert({
            'id': str(uuid.uuid4()), 'user_id': user['id'],
            'kiwify_transaction_id': order_id, 'product': product_name or product_id,
            'value': value, 'status': order_status or event_type or 'paid',
            'created_at': now,
        }).execute())

        await srun(lambda: sb.table('credit_history').insert({
            'id': str(uuid.uuid4()), 'user_id': user['id'],
            'type': 'purchase', 'credits': credits_to_add,
            'description': f'Compra aprovada: {product_name or product_id} (pedido {order_id})',
            'created_at': now,
        }).execute())

    except Exception as e:
        logger.error(f"Kiwify webhook: erro ao creditar usuário {user['id']} (order {order_id}): {e}")
        # Rollback: tenta reverter créditos se user foi atualizado
        try:
            await srun(lambda: sb.table('users').update({
                'credits': user.get('credits', 0),
                'plan': user.get('plan', 'free'),
                'credits_expires_at': user.get('credits_expires_at'),
            }).eq('id', user['id']).execute())
        except Exception:
            pass
        raise HTTPException(500, 'Erro interno ao processar pagamento')

    logger.info(
        f"Kiwify: +{credits_to_add} créditos / plano {tier} "
        f"user={user['id']} via={resolved_by} (order {order_id})"
    )
    return {
        'ok': True, 'credits_added': credits_to_add, 'plan': tier,
        'resolved_by': resolved_by, 'user_id': user['id'],
    }


# ─── Admin routes ────────────────────────────────────────────────────

admin_router = APIRouter(prefix='/api/admin', tags=['admin'])


@admin_router.get('/stats')
async def admin_stats(current_user: dict = Depends(require_admin)):
    require_db()
    users_res    = await srun(lambda: sb.table('users').select('id,name,email,credits,plan').execute())
    payments_res = await srun(
        lambda: sb.table('payments')
            .select('id,user_id,product,value,status,created_at,kiwify_transaction_id')
            .order('created_at', desc=True).limit(20).execute()
    )
    all_vals_res = await srun(
        lambda: sb.table('payments').select('value,status').execute()
    )
    users    = users_res.data    or []
    payments = payments_res.data or []
    all_vals = all_vals_res.data or []

    total_users         = len(users)
    total_admins        = sum(1 for u in users if u.get('email') == ADMIN_EMAIL)
    total_credits       = sum(u.get('credits') or 0 for u in users)
    users_with_credits  = sum(1 for u in users if (u.get('credits') or 0) > 0)
    users_no_credits    = total_users - users_with_credits

    def to_reais(raw):
        """Kiwify = centavos (inteiro). Registros com ponto decimal = já em reais."""
        if raw is None or raw == '':
            return None
        as_str = str(raw).strip().replace(',', '.')
        try:
            n = float(as_str)
        except (TypeError, ValueError):
            return None
        if '.' in as_str:
            return n
        return n / 100.0

    user_map = {u['id']: u for u in users}
    recent_payments = []
    for p in payments:
        value_reais = to_reais(p.get('value'))
        u = user_map.get(p.get('user_id')) if p.get('user_id') else None
        recent_payments.append({
            'id': p.get('id'),
            'user_id': p.get('user_id'),
            'product': p.get('product'),
            'value': value_reais,
            'status': p.get('status'),
            'created_at': p.get('created_at'),
            'kiwify_transaction_id': p.get('kiwify_transaction_id'),
            'user_name': u.get('name') if u else None,
            'user_email': u.get('email') if u else None,
            'user_credits': (u.get('credits') or 0) if u else None,
            'user_plan': u.get('plan') if u else None,
        })

    total_revenue = 0.0
    total_paid_count = 0
    for p in all_vals:
        s = (p.get('status') or '').lower()
        is_money = (
            'paid' in s or 'approved' in s or 'user_not_found' in s
        ) and 'unrecognized_product' not in s
        if not is_money:
            continue
        v = to_reais(p.get('value'))
        if v is not None and v > 0:
            total_revenue += v
            total_paid_count += 1
    total_revenue = round(total_revenue, 2)

    return {
        'total_users':         total_users,
        'total_admins':        total_admins,
        'total_credits':       total_credits,
        'users_with_credits':  users_with_credits,
        'users_without_credits': users_no_credits,
        'total_revenue':       total_revenue,
        'total_paid_count':    total_paid_count,
        'recent_payments':     recent_payments,
    }


@admin_router.get('/users')
async def admin_users(
    current_user: dict = Depends(require_admin),
    page:     int = 1,
    limit:    int = 20,
    search:   str = '',
    sort_by:  str = 'created_at',
    sort_dir: str = 'desc',
):
    require_db()
    allowed_sort = {'name', 'created_at', 'credits', 'email', 'credits_expires_at'}
    if sort_by not in allowed_sort:
        sort_by = 'created_at'
    desc_order = sort_dir != 'asc'
    offset     = (page - 1) * limit
    cols       = 'id,name,email,plan,credits,created_at,credits_expires_at'

    if search:
        sf = re.sub(r'[%(),]', ' ', search).strip()
        res = await srun(
            lambda: sb.table('users')
                .select(cols, count='exact')
                .or_(f'name.ilike.%{sf}%,email.ilike.%{sf}%,id.ilike.%{sf}%')
                .order(sort_by, desc=desc_order)
                .range(offset, offset + limit - 1)
                .execute()
        )
    else:
        res = await srun(
            lambda: sb.table('users')
                .select(cols, count='exact')
                .order(sort_by, desc=desc_order)
                .range(offset, offset + limit - 1)
                .execute()
        )

    total = res.count or 0
    rows  = []
    for u in (res.data or []):
        u['is_admin'] = u.get('email') == ADMIN_EMAIL
        rows.append(u)

    return {
        'users': rows,
        'total': total,
        'page':  page,
        'limit': limit,
        'pages': max(1, -(-total // limit)),
    }


@admin_router.get('/users/{user_id}')
async def admin_get_user(user_id: str, current_user: dict = Depends(require_admin)):
    require_db()
    res = await srun(
        lambda: sb.table('users')
            .select('id,name,email,plan,credits,created_at,credits_expires_at')
            .eq('id', user_id)
            .execute()
    )
    if not res.data:
        raise HTTPException(404, 'Usuário não encontrado')
    u = res.data[0]
    u['is_admin'] = u.get('email') == ADMIN_EMAIL
    return u


@admin_router.patch('/users/{user_id}/credits')
async def admin_update_user_credits(
    user_id: str,
    body:    AdminCreditInput,
    current_user: dict = Depends(require_admin),
):
    require_db()
    if body.operation not in ('add', 'remove', 'set'):
        raise HTTPException(400, 'Operação inválida — use: add | remove | set')
    if body.amount < 0:
        raise HTTPException(400, 'O valor deve ser positivo')

    res = await srun(lambda: sb.table('users').select('*').eq('id', user_id).execute())
    if not res.data:
        raise HTTPException(404, 'Usuário não encontrado')
    target          = res.data[0]
    current_credits = target.get('credits', 0)

    if body.operation == 'add':
        new_credits = current_credits + body.amount
        change      = body.amount
        op_type     = 'admin_add'
        desc        = f'ADM +{body.amount} créditos'
    elif body.operation == 'remove':
        if body.amount > current_credits:
            raise HTTPException(
                400,
                f'Saldo insuficiente: usuário tem {current_credits} créditos',
            )
        new_credits = current_credits - body.amount
        change      = -body.amount
        op_type     = 'admin_remove'
        desc        = f'ADM -{body.amount} créditos'
    else:  # set
        new_credits = max(0, body.amount)
        change      = new_credits - current_credits
        op_type     = 'admin_set'
        desc        = f'ADM definiu saldo para {new_credits}'

    if body.note:
        desc += f' ({body.note})'
    desc += f' | admin: {current_user.get("email")}'
    now = datetime.now(timezone.utc).isoformat()

    await srun(lambda: sb.table('users').update({'credits': new_credits}).eq('id', user_id).execute())

    try:
        await srun(lambda: sb.table('credit_history').insert({
            'id':          str(uuid.uuid4()),
            'user_id':     user_id,
            'type':        op_type,
            'credits':     change,
            'description': desc,
            'created_at':  now,
        }).execute())
    except Exception as e:
        logger.warning(f'credit_history insert failed: {e}')

    return {
        'ok':               True,
        'previous_credits': current_credits,
        'new_credits':      new_credits,
        'change':           change,
    }


# ─── Admin: Orphaned payments (paid but user not found) ────────────────
class LinkPaymentInput(BaseModel):
    user_id: str
    payment_id: str


@admin_router.get('/orphaned-payments')
async def admin_orphaned_payments(current_user: dict = Depends(require_admin)):
    """List payments with status 'paid_user_not_found' — payments made but user not linked."""
    require_db()
    res = await srun(
        lambda: sb.table('payments')
            .select('id,kiwify_transaction_id,product,value,status,created_at')
            .eq('status', 'paid_user_not_found')
            .order('created_at', desc=True)
            .execute()
    )
    payments = res.data or []
    # Try to extract email from product field (format: "Product|||buyer:email@x.com")
    for p in payments:
        prod = p.get('product', '')
        if '|||buyer:' in prod:
            p['buyer_email'] = prod.split('|||buyer:')[1]
        else:
            p['buyer_email'] = None
    return {'orphaned_payments': payments}


@admin_router.post('/link-payment')
async def admin_link_payment(
    body: LinkPaymentInput,
    current_user: dict = Depends(require_admin),
):
    """Link an orphaned payment to a user, crediting them and updating payment record."""
    require_db()

    # Verify payment exists and is orphaned
    pay_res = await srun(
        lambda: sb.table('payments')
            .select('*')
            .eq('id', body.payment_id)
            .eq('status', 'paid_user_not_found')
            .execute()
    )
    if not pay_res.data:
        raise HTTPException(404, 'Pagamento órfão não encontrado')
    payment = pay_res.data[0]

    # Verify user exists
    user_res = await srun(
        lambda: sb.table('users').select('*').eq('id', body.user_id).execute()
    )
    if not user_res.data:
        raise HTTPException(404, 'Usuário não encontrado')
    user = user_res.data[0]

    # Detect tier from product
    product_name = payment.get('product', '').split('|||buyer:')[0]
    tier = detect_plan_tier(product_name, '')
    if not tier:
        raise HTTPException(400, 'Não foi possível identificar o plano do produto')

    credits_to_add = PLAN_CREDITS[tier]
    new_credits = (user.get('credits', 0) or 0) + credits_to_add
    now = datetime.now(timezone.utc).isoformat()

    # Use payment's created_at for expiry if available
    paid_at_str = payment.get('created_at')
    try:
        paid_at = datetime.fromisoformat(str(paid_at_str).replace('Z', '+00:00'))
    except (ValueError, TypeError):
        paid_at = datetime.now(timezone.utc)
    expires_at = (paid_at + timedelta(days=90)).isoformat()

    try:
        # Update user credits
        await srun(lambda: sb.table('users').update({
            'credits':                 new_credits,
            'plan':                    tier,
            'first_upgrade_purchased': True,
            'credits_expires_at':      expires_at,
        }).eq('id', body.user_id).execute())

        # Update payment with user_id and new status
        await srun(lambda: sb.table('payments').update({
            'user_id': body.user_id,
            'status': 'paid_linked_manual',
        }).eq('id', body.payment_id).execute())

        # Insert credit history
        await srun(lambda: sb.table('credit_history').insert({
            'id': str(uuid.uuid4()), 'user_id': body.user_id,
            'type': 'purchase', 'credits': credits_to_add,
            'description': f'Compra vinculada manualmente: {product_name} (pedido {payment.get("kiwify_transaction_id")})',
            'created_at': now,
        }).execute())

        logger.info(f"Admin vinculou pagamento {payment.get('kiwify_transaction_id')} ao usuário {body.user_id} (+{credits_to_add} créditos)")

        return {
            'ok': True,
            'credits_added': credits_to_add,
            'new_credits': new_credits,
            'plan': tier,
        }
    except Exception as e:
        logger.error(f"Erro ao vincular pagamento {body.payment_id} ao usuário {body.user_id}: {e}")
        raise HTTPException(500, 'Erro ao vincular pagamento')


# ─── Health ───────────────────────────────────────────────────────────

@api_router.get('/')
async def root():
    db_ok = False
    if sb:
        try:
            await srun(lambda: sb.table('users').select('id').limit(1).execute())
            db_ok = True
        except Exception:
            pass
    return {'message': 'Nativos Studio API', 'db': db_ok}


# ─── Mount ────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(api_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)
