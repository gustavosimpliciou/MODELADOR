---
name: supabase-py shared client mutates session on auth calls
description: Why login/register broke every subsequent RLS-bypassing table query, and the fix (separate client for .auth.* calls).
---

## The bug
A single `supabase-py` `Client` instance created with the **service-role** key
is commonly reused for both `.table(...)` queries (expected to bypass RLS)
and `.auth.sign_in_with_password(...)` / `.auth.admin.create_user(...)`.
Calling any `.auth.*` method on that client mutates its internal postgrest
session headers to the just-authenticated **user's** JWT. Every table query
made afterwards on that same client then runs as that user, not as
service_role — so RLS blocks reads/writes that should have bypassed it. This
manifests as: registration insert succeeding once, but the next request
(`/me`, or any `require_auth` lookup) getting an empty result -> spurious
"session expired" / user-not-found errors, or `"new row violates row-level
security policy"` on inserts that used to work.

**Why:** the `sign_in_with_password`/`admin.create_user` calls internally set
the client's active session, and supabase-py's postgrest sub-client shares
that same underlying session/header state by default.

**How to apply:** keep the `.table(...)` client (service-role, RLS-bypass)
completely separate from anything that calls `.auth.*`. But one shared
"auth" client is still not safe — calling `sign_in_with_password` on it once,
then `admin.create_user` on it again later, fails the second call with a 403
("User not allowed") because the first call's mutated session/bearer token
persists on that instance. The robust fix is a **fresh `create_client(...)`
per `.auth.*` call** (sign in, sign up, admin create/update user, password
reset) — never reuse one client instance across two `.auth.*` calls, and never
call `.auth.*` on the client used for table queries. Verified with a matrix
test across multiple sequential register+login+admin-update flows.
