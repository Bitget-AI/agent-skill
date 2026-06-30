# Bitget API Authentication Setup

Public market data (`bgc market ...`, `bgc discover`) needs no credentials.
Account, trading, transfer, and withdrawal operations are private and require
API credentials.

## Environment variables (recommended)

Set all three before running `bgc` — they must be provided together:

```bash
export BITGET_API_KEY="your-api-key"
export BITGET_SECRET_KEY="your-secret-key"
export BITGET_PASSPHRASE="your-passphrase"
```

Providing only some of them is an error (`Partial API credentials detected`).

## Optional environment variables

```bash
export BITGET_API_BASE_URL="https://api.bitget.com"   # override the API host
export BITGET_TIMEOUT_MS="15000"                       # per-request timeout (default 15000)
export BITGET_MAX_RETRIES="3"                          # transient-error retries
```

## Get API credentials

1. Log in to https://www.bitget.com
2. Go to **Settings → API Management**
3. Create a new API key with the permissions you need:
   - **Read Only** — market data and account queries
   - **Trade** — placing/cancelling orders, transfers
   - **Withdraw** — only if you intend to withdraw (and whitelist your IP)

## Verify

```bash
bgc account_overview          # private — confirms credentials work
bgc market --action tickers --category SPOT --symbol BTCUSDT   # public — no creds needed
```

If credentials are missing or wrong, the error payload's `error.category` is `auth`
and `error.suggestion` tells you which credential to fix.

## Read-only mode

To block every write for a session (reads still work):

```bash
bgc --read-only order --action open --category SPOT --symbol BTCUSDT
```

`--read-only` is mutually exclusive with `--paper-trading`.
