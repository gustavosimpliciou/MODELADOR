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
SECRET_KEY = os.environ.get('SESSION_SECRET', 'dev-secret-change-in-production')
ALGORITHM  = 'HS256'
TOKEN_DAYS = 30

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
    return {
        'id':                    row.get('id', ''),
        'name':                  row.get('name', ''),
        'email':                 row.get('email', ''),
        'credits':               row.get('credits', 0),
        'freeDownloadUsed':      row.get('free_download_used', False),
        'firstUpgradePurchased': row.get('first_upgrade_purchased', False),
        'plan':                  row.get('plan', 'free'),
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

    # Só processa vendas aprovadas — outros eventos (boleto/pix gerado,
    # carrinho abandonado, recusada, etc.) são apenas confirmados (200).
    if order_status != 'paid' and event_type != 'order_approved':
        return {'ok': True, 'ignored': True, 'order_status': order_status}

    customer = body.get('Customer') or {}
    email = (customer.get('email') or '').strip().lower()
    if not email:
        logger.warning(f"Webhook Kiwify sem e-mail do cliente (order {order_id})")
        return {'ok': True, 'ignored': True, 'reason': 'sem e-mail'}

    product      = body.get('Product') or {}
    product_name = product.get('product_name') or ''
    product_id   = product.get('product_id') or ''
    tier = detect_plan_tier(product_name, product_id)

    now = datetime.now(timezone.utc).isoformat()
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

    res = await srun(lambda: sb.table('users').select('*').eq('email', email).execute())
    if not res.data:
        logger.warning(f"Webhook Kiwify: usuário não encontrado para {email} (order {order_id})")
        await srun(lambda: sb.table('payments').insert({
            'id': str(uuid.uuid4()), 'user_id': None,
            'kiwify_transaction_id': order_id, 'product': product_name or product_id,
            'value': value, 'status': f'{order_status or event_type}_user_not_found',
            'created_at': now,
        }).execute())
        return {'ok': True, 'ignored': True, 'reason': 'usuário não encontrado'}

    user = res.data[0]
    credits_to_add = PLAN_CREDITS[tier]
    new_credits = user.get('credits', 0) + credits_to_add

    await srun(lambda: sb.table('users').update({
        'credits':                 new_credits,
        'plan':                    tier,
        'first_upgrade_purchased': True,
    }).eq('id', user['id']).execute())

    await srun(lambda: sb.table('payments').insert({
        'id': str(uuid.uuid4()), 'user_id': user['id'],
        'kiwify_transaction_id': order_id, 'product': product_name or product_id,
        'value': value, 'status': order_status or event_type,
        'created_at': now,
    }).execute())

    await srun(lambda: sb.table('credit_history').insert({
        'id': str(uuid.uuid4()), 'user_id': user['id'],
        'type': 'purchase', 'credits': credits_to_add,
        'description': f'Compra aprovada: {product_name or product_id} (pedido {order_id})',
        'created_at': now,
    }).execute())

    logger.info(f"Kiwify: +{credits_to_add} créditos / plano {tier} para {email} (order {order_id})")
    return {'ok': True}


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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)
