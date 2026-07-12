---
name: Kiwify webhook integration
description: How Kiwify's classic product webhook is authenticated and how its payload is shaped, since there's no official skill for it.
---

## Payload shape
Kiwify POSTs JSON with top-level fields: `order_id`, `order_status` (e.g. `"paid"`),
`webhook_event_type` (e.g. `"order_approved"`), plus nested objects `Product`
(`product_name`, `product_id`), `Customer` (`email`, `full_name`), `Commissions`
(`charge_amount`, `product_base_price`). There is no request-body signature field
for this webhook type.

## Authentication approach
Kiwify's classic product-webhook flow has no built-in HMAC/signature scheme
(the Ed25519/HMAC docs that turn up in search are for a separate "Conta
Digital" banking API and don't apply here). The standard approach is a shared
secret appended as a query param on the webhook URL configured in the Kiwify
panel, e.g. `.../webhook/kiwify?token=SECRET`. Accept the token from the query
param, an `x-webhook-token` header, or a top-level `token` body field, to be
resilient to how the user actually configures it.

**Why:** avoids depending on a signature mechanism Kiwify doesn't offer for
this webhook type, while still blocking unauthenticated calls.

**How to apply:** when wiring any Kiwify product webhook, use this token
approach rather than looking for a signature header.

## Gotcha: curl + long tokens in query strings
A shared-secret token can contain characters that break a URL when interpolated
directly into `?token=$TOKEN` in a shell/curl command (curl exits with code 3,
"URL malformed"). Test via the `x-webhook-token` header instead of stuffing the
token into the query string when curling manually.
