# Bitget Demo / Paper Trading

Demo Trading lets you trade with virtual funds against real market data. Use it to
test strategies without risking real money.

## Prerequisites

1. Log in to https://www.bitget.com
2. Switch to **Demo Trading** mode (toggle in the top navigation bar)
3. Go to **Personal Center → API Key Management**
4. Create a **Demo API Key** with Trade permissions
5. Demo API Keys are completely separate from live keys

## Using demo mode with `bgc`

Set your **demo** credentials as the environment variables, then add `--paper-trading`
to route writes to the Bitget demo environment:

```bash
export BITGET_API_KEY="your-demo-api-key"
export BITGET_SECRET_KEY="your-demo-secret-key"
export BITGET_PASSPHRASE="your-demo-passphrase"

# Demo account snapshot
bgc --paper-trading account_overview

# Demo spot market buy (qty is quote coin = USDT for a spot market buy)
bgc --paper-trading order --action place \
  --category SPOT --symbol BTCUSDT --side buy --orderType market --qty 50

# Demo futures positions
bgc --paper-trading position --action info --category USDT-FUTURES --symbol BTCUSDT

# Demo futures order
bgc --paper-trading order --action place \
  --category USDT-FUTURES --symbol BTCUSDT --side buy --orderType market --qty 0.01
```

`--paper-trading` is mutually exclusive with `--read-only`.

## Using demo mode with the MCP server

Start the MCP server with `--paper-trading`; every tool in that session runs in demo mode:

```bash
bitget-agent-mcp --paper-trading --modules market,trade,account
```

(Install: `npm install -g @bitget-ai/bitget-agent-mcp`.)

## Important caveats

- **Demo keys ≠ live keys.** Never mix them. Demo keys only work with `--paper-trading`.
- **Keep the whole session in one mode.** Don't interleave live and `--paper-trading`
  commands — decide up front and stay consistent.
- **Virtual funds only.** No real money; reset balances from the Bitget demo dashboard.
- **Real market data.** Prices reflect live conditions.
- **All categories supported.** SPOT, MARGIN, and the futures categories all work in demo.
