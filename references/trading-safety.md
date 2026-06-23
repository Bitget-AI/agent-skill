# Trading Safety (UTA / v3)

Read this before constructing futures close, TP/SL, cancel-all, or withdrawal
commands. For the exact parameter contract of any action, always confirm with
`bgc discover --tool <verb> --action <name>`.

## Always preview a risky write

Run with `--dry-run` first to see the exact would-send payload, show it to the user,
then execute. For high-risk operations, the real run also needs `--confirm`.

```bash
bgc order --action place --category USDT-FUTURES --symbol BTCUSDT \
  --side sell --orderType market --qty 0.01 --reduceOnly yes --dry-run
```

## Closing a position (the #1 mistake)

Two ways to close, by whether you want a **market** close (fastest) or to exit **at your
own price**. Either way, check the position first so you get the side and mode right:

```bash
bgc position --action info --category USDT-FUTURES --symbol BTCUSDT
```

### Market-close ONE position — `position --action close`

The direct way to flatten a single position at market. It **hard-requires `--symbol`**
(so it can never close the whole category by omission), is **high-risk → requires
`--confirm`**, and in hedge mode also needs `--posSide`:

```bash
# one-way mode
bgc position --action close --category USDT-FUTURES --symbol BTCUSDT --confirm

# hedge mode — name the book you're closing
bgc position --action close --category USDT-FUTURES --symbol BTCUSDT --posSide long --confirm
```

> Omitting `--symbol` is rejected with a clear error — use `closeAll` if you really mean
> the whole category.

### Close at YOUR price — opposite-side `order --action place`

To exit at a chosen price (or with a limit) instead of at market, place an order on the
**opposite side** of the position with `--reduceOnly`. There is no `close` action on the
`order` verb itself — this is how you close through `order`.

#### One-way mode

A symbol holds one net position. Close it with the opposite `side` + `--reduceOnly yes`:

| Position | `--side` to close | Extra |
|----------|-------------------|-------|
| Long | `sell` | `--reduceOnly yes` |
| Short | `buy` | `--reduceOnly yes` |

```bash
# Close a long in one-way mode, at a limit price
bgc order --action place --category USDT-FUTURES --symbol BTCUSDT \
  --side sell --orderType limit --price 70000 --qty 0.01 --reduceOnly yes
```

#### Hedge mode

Long and short books coexist. Set `--posSide` to the book you are closing and use the
opposite `--side`:

| Position book | `--posSide` | `--side` to close |
|---------------|-------------|-------------------|
| Long | `long` | `sell` |
| Short | `short` | `buy` |

```bash
# Close the short book in hedge mode
bgc order --action place --category USDT-FUTURES --symbol BTCUSDT \
  --side buy --orderType market --qty 0.01 --posSide short
```

> **Selling to "close" a short opens MORE short.** Confirm the position's side before
> choosing `--side`.

### Close EVERYTHING in a category — `position --action closeAll`

`position --action closeAll` flattens every position (optionally narrowed by
`--category` / `--symbol`). It is **high-risk and requires `--confirm`**. When you mean
just one position, prefer `--action close --symbol`:

```bash
bgc position --action closeAll --category USDT-FUTURES --confirm
```

## Limit vs market: `--price` is conditionally required

- **Limit** orders **require `--price`** — omitting it is rejected.
- **Market** orders take **no `--price`** (the price is the market).
- In **hedge mode**, `--posSide` is required on the order.

`bgc discover --tool order --action place` reports these under `conditionalRequired` (and
`requiredWhen` on each field), so you can see the obligation before you send.

## Take-profit / stop-loss

**Preset at entry** — attach to the opening `order --action place`:

```bash
bgc order --action place --category USDT-FUTURES --symbol BTCUSDT \
  --side buy --orderType limit --price 60000 --qty 0.01 \
  --takeProfit 66000 --stopLoss 57000
```

Fine-tune with `--tpTriggerBy` / `--slTriggerBy` (`market`|`mark`), `--tpOrderType` /
`--slOrderType` (`limit`|`market`), and `--tpLimitPrice` / `--slLimitPrice` (for limit
TP/SL). Confirm exact fields with `bgc discover --tool order --action place`.

**Manage after entry** — use the `strategy_order` verb (trigger/plan orders):

```bash
bgc discover --tool strategy_order          # place | cancel | modify | open | history
bgc strategy_order --action open --category USDT-FUTURES --symbol BTCUSDT
```

## Order quantity (`qty`) units — easy to get wrong

`qty` means different things by category and side:

| Market | `qty` unit |
|--------|-----------|
| Spot/Margin — **market BUY** | **quote coin (e.g. USDT)** |
| Spot/Margin — limit, or market SELL | base coin |
| USDT-FUTURES / USDC-FUTURES | base coin |
| COIN-FUTURES | quote coin |

> For a spot market buy, `--qty 100` means **100 USDT of BTC**, not 100 BTC. Confirm
> the user's intent before sizing a market buy.

## Cancelling

- `order --action cancel` — cancel one order (needs `--orderId` or `--clientOid`).
- `order --action cancelAll` — **high-risk, requires `--confirm`**. Scope it with
  `--category` / `--symbol` to avoid wiping unrelated orders.

```bash
bgc order --action cancelAll --category SPOT --symbol BTCUSDT --confirm
```

## Withdrawals

`withdraw --action submit` is **high-risk and requires `--confirm`**. Withdrawals are
**irreversible**:

- Always show the **coin, chain, destination address, and amount** in the confirmation prompt.
- If the user hasn't named a chain, do not assume one — confirm it explicitly. A wrong
  chain loses the funds.
- Preview with `--dry-run` and show the `wouldSend` payload before the real `--confirm` run.

## High-risk operations (require `--confirm`)

`closeAllPositions` · `cancelAllOrders` · `withdrawal` · `brokerSubaccountWithdrawal`

Without `--confirm`, these return `{ confirmationRequired: true }` and send nothing —
that is a normal result, not an error. Surface it to the user, get a yes, then re-run
with `--confirm`.
