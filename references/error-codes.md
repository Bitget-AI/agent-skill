# Bitget Errors (UTA / v3)

## Error payload shape

On failure, `bgc` writes this JSON to **stderr** and exits **1**:

```json
{
  "ok": false,
  "error": {
    "type": "ValidationError",
    "category": "param",
    "message": "human-readable what-went-wrong",
    "suggestion": "the concrete next step",
    "retryable": false
  },
  "timestamp": "2026-06-18T09:38:09.514Z"
}
```

> A high-risk write run without `--confirm` is **not** an error — it returns
> `{ confirmationRequired: true, ... }` on stdout (exit 0). Likewise `--dry-run`
> returns `{ dryRun: true, wouldSend, ... }` on stdout. Don't treat these as failures.

## Branch on `error.category`

The category tells you how to recover without parsing the message:

| Category | Meaning | What to do |
|----------|---------|-----------|
| `auth` | Bad/missing credentials, signature, permission, IP | Fix credentials/permissions; do **not** retry blindly |
| `param` | Invalid/missing parameter, bad order/price/qty | Fix the request and resend |
| `balance` | Insufficient balance or margin | Surface to user — cannot self-heal |
| `risk` | Account at risk / liquidating | Surface to user — reduce risk first |
| `rate` | Throttled (too frequent / HTTP 429) | Back off and retry |
| `network` | Transient server/transport error (5xx, timeout) | Back off and retry |
| `region` | Geo-restricted | Fall back to another surface |
| `config` | Account not in UTA mode, unsupported mode switch | Check account mode / config |
| `unknown` | Uncategorized | Show message + suggestion to user |

`error.retryable` is the authoritative retry signal: only retry the identical call
when it is `true` (rate/network). Everything else needs a change first.

## Error types (`error.type`)

- `ValidationError` — bad input or a blocked write (category `param`).
- `ConfigError` — bad configuration / partial credentials (category `config`/`auth`).
- `AuthenticationError` — signature/key/permission failure (category `auth`).
- `RateLimitError` — throttled (category `rate`, retryable).
- `NetworkError` — transport failure/timeout (category `network`, retryable).
- `BitgetApiError` — a Bitget API error code (see table below).

## Curated Bitget API codes

A high-confidence subset; uncatalogued codes fall back to type-based classification.

### Transport (HTTP status)

| Code | Category | Retry | Meaning |
|------|----------|-------|---------|
| `429` | rate | yes | Rate limit exceeded — back off and retry |
| `500`/`502`/`503`/`504` | network | yes | Transient server/upstream error — retry after backoff |

### Account & trading (UTA `25xxx`)

| Code | Category | Retry | Meaning / fix |
|------|----------|-------|---------------|
| `25000` | network | yes | System error — retry |
| `25001` | network | yes | Operation timed out — retry |
| `25003` | network | yes | Concurrent operation conflict — retry |
| `25004` | rate | yes | Operations too frequent — slow down |
| `25008` | risk | no | Account in liquidation — cannot trade |
| `25009` | config | no | Unsupported account-mode switch |
| `25010` | config | no | Unsupported position-mode switch |
| `25012` | risk | no | Account at risk — add margin / close exposure first |
| `25110` | config | no | Coin can't be moved into the unified account |
| `25200` | param | no | Parameter validation failed — re-check the schema |
| `25202` | balance | no | Insufficient balance — fund the account or reduce size |
| `25203` | balance | no | Insufficient margin — add margin / lower leverage / reduce size |
| `25204` | param | no | Order not found — verify orderId/clientOid |
| `25207` | param | no | Quantity below the minimum — increase `qty` |
| `25212` | param | no | Duplicate `clientOid` — use a fresh idempotency key |
| `25236` | param | no | Incorrect open type — check `posSide`/`reduceOnly` vs position mode |
| `25244` | param | no | Price not a multiple of tick size — round to the price step |
| `25245` | config | no | Account not in unified (UTA) mode — switch to unified |
| `25620` | auth | no | No permission for this resource — enable it on the API key |

### Auth (`40xxx`) & risk

| Code | Category | Retry | Meaning / fix |
|------|----------|-------|---------------|
| `40001` | auth | no | ACCESS_KEY empty — set `BITGET_API_KEY` |
| `40002` | auth | no | SECRET_KEY empty — set `BITGET_SECRET_KEY` |
| `40003` | auth | no | Signature empty — request not signed |
| `40006` | auth | no | Invalid ACCESS_KEY — verify the key |
| `40008` | auth | no | Timestamp expired — sync the local clock |
| `40009` | auth | no | Signature verification failed — check secret/payload |
| `40017` | auth | no | Signature parameter check failed — check key/secret/passphrase |
| `40018` | auth | no | Permission or IP restriction — check perms & IP whitelist |
| `40034` | param | no | A parameter is invalid/missing — re-check names and values |
| `40036` | auth | no | API key invalid/revoked — regenerate and update creds |
| `40042` | auth | no | Restricted institutional sub-account — use a different account |
| `95001` | risk | no | User being liquidated — wait until it completes |

## Missing credentials

```bash
export BITGET_API_KEY="your-key"
export BITGET_SECRET_KEY="your-secret"
export BITGET_PASSPHRASE="your-passphrase"
```

All three are required together; providing a partial set is a `config` error.

## `category` values (the v3 model)

`SPOT`, `MARGIN`, `USDT-FUTURES`, `COIN-FUTURES`, `USDC-FUTURES`. There are no
separate spot/futures modules and no `productType` — one `--category` selects the market.
