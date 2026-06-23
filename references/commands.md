# bgc Command Reference (UTA / v3)

Auto-generated from `@bitget-ai/bitget-agent-sdk` v3.0.0 (OpenAPI spec 3.0.0, 109 operations, UTA (Unified Trading Account) v3).
Do not edit by hand — run `npm run gen-references`.

This catalog is the **static** mirror of the live surface. For a verb's exact, doc-grounded contract at any moment, run `bgc discover --tool <verb> --action <name>`.

## Grammar

```
bgc <tool> [--action <name>] [--<param> <value> ...] [global flags]
bgc discover [--domain <d> | --tool <t> [--action <a>] | --search <q>]
bgc raw --operationId <id> [--args '<json>']
```

One verb per call. `--action` selects the intent for action-routed verbs. Values coerce by shape: `true`/`false` → boolean, a value starting with `[` or `{` → JSON (e.g. `--orders '[{...}]'`), everything else stays a string. Output is JSON on stdout (exit 0); errors are a JSON payload on stderr (exit 1).

## Global flags

| Flag | Effect |
|------|--------|
| `--action <name>` | Action for an action-routed verb |
| `--modules <list>` | Modules to enable (CLI default: `all`). Name a hidden to-B module to expose it, e.g. `--modules broker` |
| `--surface <mode>` | `intent` (default) or `full` (also expose the 1:1 generated operations) |
| `--full` | Shorthand for `--surface full` |
| `--read-only` | Block all writes (mutually exclusive with `--paper-trading`) |
| `--paper-trading` | Route writes to the Bitget demo environment (needs demo credentials) |
| `--dry-run` | Preview a write without sending it (maps to `dryRun`) |
| `--confirm` | Required to execute destructive (high-risk) writes |
| `--base-url <url>` | Override API base URL (else `BITGET_API_BASE_URL`) |
| `--timeout <ms>` | Per-request timeout (else `BITGET_TIMEOUT_MS`, default 15000) |
| `--pretty` | Pretty-print JSON output |
| `--help`, `--version` | Help / version |

## Write safety

Every operation is graded **read** < **write** < **high**. Reads run freely. Writes honor `--dry-run`, `--read-only`, and `--paper-trading`. **High-risk** operations refuse to run without `--confirm` — without it the call returns `{ confirmationRequired: true }` (a normal result on stdout, not an error).

High-risk operations (require `--confirm`): `closeAllPositions`, `cancelAllOrders`, `withdrawal`, `brokerSubaccountWithdrawal`.

Common params available on most verbs (not repeated in the tables below): `dryRun`, `confirm` (writes); `view` (`summary`|`full`) and `fields` (read normalization / token economy); `fetchAll`, `cursor`, `limit` (paginated reads).

## Domains

- **market** — [`market`](#market)
- **trade** — [`order`](#order), [`position`](#position), [`strategy_order`](#strategy-order)
- **account** — [`account_overview`](#account-overview), [`account_config`](#account-config), [`repayment`](#repayment)
- **funds** — [`transfer_funds`](#transfer-funds), [`deposit`](#deposit), [`withdraw`](#withdraw), [`funds_records`](#funds-records)
- **subaccount** — [`subaccount`](#subaccount)
- **broker** — [`broker`](#broker)
- **loan** — [`loan`](#loan)
- **instloan** — [`inst_loan`](#inst-loan)
- **tax** — [`tax`](#tax)
- **meta** — [`raw`](#raw), [`discover`](#discover)

## Domain: market

### `market`

risk: **read** · write: no · auth: public

[VERB] Public market data: tickers, orderbook, candles, instruments, funding rate, open interest, recent fills, and reference reads (no credentials required).

**Actions:** `tickers`, `orderbook`, `candles`, `candlesHistory`, `instruments`, `fundingRate`, `fundingRateHistory`, `openInterest`, `openInterestLimit`, `recentFills`, `positionTier`, `discountRate`, `indexComponents`, `marginLoan`, `proofOfReserves`, `riskReserve`

#### `bgc market --action tickers`

`GET /api/v3/market/tickers` · public

Get Tickers

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

```bash
bgc market --action tickers --category <category>
```

#### `bgc market --action orderbook`

`GET /api/v3/market/orderbook` · public

Get OrderBook

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product Type SPOT Spot trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `limit` | string |  | Level Default: 5. Maximum: 200 |

```bash
bgc market --action orderbook --category <category> --symbol <symbol>
```

#### `bgc market --action candles`

`GET /api/v3/market/candles` · public

Get Kline/Candlestick

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product Type SPOT Spot trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `interval` | string | `1m` \| `3m` \| `5m` \| `15m` \| `30m` \| `1H` \| `4H` \| `6H` \| `12H` \| `1D` | Granularity 1m,3m,5m,15m,30m,1H,4H,6H,12H,1D |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start timestamp A Unix millisecond timestamp, e.g.,1672410780000 |
| `endTime` | string |  | End timestamp A Unix millisecond timestamp, e.g.,1672410781000 |
| `type` | string | `market` \| `mark` \| `index` \| `premium` | Candlestick type market, mark, index, premium. Default: market |
| `limit` | string |  | Limit per page Default:1000. Maximum: 100 |

```bash
bgc market --action candles --category <category> --symbol <symbol> --interval <interval>
```

#### `bgc market --action candlesHistory`

`GET /api/v3/market/history-candles` · public

Get Kline/Candlestick History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product Type SPOT Spot trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `interval` | string | `1m` \| `3m` \| `5m` \| `15m` \| `30m` \| `1H` \| `4H` \| `6H` \| `12H` \| `1D` | Granularity 1m,3m,5m,15m,30m,1H,4H,6H,12H,1D |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start timestamp A Unix millisecond timestamp, e.g.,1672410780000 Request data after this start time (the maximum time query range is 90 days) |
| `endTime` | string |  | End timestamp A Unix millisecond timestamp, e.g.,1672410781000 Request data before this end time (the maximum time query range is 90 days) |
| `type` | string | `market` \| `mark` \| `index` \| `premium` | Candlestick type market, mark, index, premium. Default: market |
| `limit` | string |  | Limit per page Default:100. Maximum: 100 |

```bash
bgc market --action candlesHistory --category <category> --symbol <symbol> --interval <interval>
```

#### `bgc market --action instruments`

`GET /api/v3/market/instruments` · public

Get Instruments

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

```bash
bgc market --action instruments --category <category>
```

#### `bgc market --action fundingRate`

`GET /api/v3/market/current-fund-rate` · public

Get Current Funding Rate

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Trading pair, based on the symbolName, i.e. BTCUSDT |

```bash
bgc market --action fundingRate --symbol <symbol>
```

#### `bgc market --action fundingRateHistory`

`GET /api/v3/market/history-fund-rate` · public

Get Funding Rate History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product Type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `cursor` | string |  | Page number Default: 1. Maximum: 100 |
| `limit` | string |  | Limit per page Default: 200. Maximum: 200 |

```bash
bgc market --action fundingRateHistory --category <category> --symbol <symbol>
```

#### `bgc market --action openInterest`

`GET /api/v3/market/open-interest` · public

Get Open Interest

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product Type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

```bash
bgc market --action openInterest --category <category>
```

#### `bgc market --action openInterestLimit`

`GET /api/v3/market/oi-limit` · public

Get Open Interest Limit

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT-M Futures COIN-FUTURES Coin-M Futures USDC-FUTURES USDC-M Futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Trading pair, based on the symbolName, i.e. BTCUSDT |

```bash
bgc market --action openInterestLimit --category <category>
```

#### `bgc market --action recentFills`

`GET /api/v3/market/fills` · public

Get Recent Public Fills

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product Type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `limit` | string |  | Limit per page Default: 100. Maximum: 100 |

```bash
bgc market --action recentFills --category <category> --symbol <symbol>
```

#### `bgc market --action positionTier`

`GET /api/v3/market/position-tier` · public

Get Position Tier

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT, applies to Futures |
| `coin` | string |  | Coin name e.g.,BTC, applies to Margin |

```bash
bgc market --action positionTier --category <category>
```

#### `bgc market --action discountRate`

`GET /api/v3/market/discount-rate` · public

Get Discount Rate

_No business parameters._

```bash
bgc market --action discountRate
```

#### `bgc market --action indexComponents`

`GET /api/v3/market/index-components` · public

Get Index Price Components

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Trading pair, e.g. BTCUSDT |

```bash
bgc market --action indexComponents --symbol <symbol>
```

#### `bgc market --action marginLoan`

`GET /api/v3/market/margin-loans` · public

Get Margin Loan

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name e.g.,BTC |

```bash
bgc market --action marginLoan --coin <coin>
```

#### `bgc market --action proofOfReserves`

`GET /api/v3/market/proof-of-reserves` · public

Get Proof Of Reserves

_No business parameters._

```bash
bgc market --action proofOfReserves
```

#### `bgc market --action riskReserve`

`GET /api/v3/market/risk-reserve` · public

Get Risk Reserve

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `marginCoin` | string |  | Margin coin, It is required when the category is COIN-FUTURES |

```bash
bgc market --action riskReserve --category <category> --symbol <symbol>
```

## Domain: trade

### `order`

risk: **write** · write: no · auth: private

[VERB] Manage orders by intent: place/cancel/modify (single or batch via `orders`), cancelAll, countdownCancel, plus open/detail/history/fills reads. Writes honor dryRun/confirm/readOnly; cancelAll requires confirm.

**Actions:** `place`, `cancel`, `modify`, `cancelAll`, `countdownCancel`, `open`, `detail`, `history`, `fills`, `maxOpen`

#### `bgc order --action place`

`POST /api/v3/trade/place-order` · private · write

Place Order

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `qty` | string |  | Order quantity Spot/Margin For market buy orders,the unit is quote coin For limit and market sell orders, the unit is base coin USDT/USDC-Futures The unit is base coin COIN-Futures The unit is quote coin |
| `side` | string | `buy` \| `sell` | Order side buy/sell |
| `orderType` | string | `limit` \| `market` | Order type limit/market |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `price` | string |  | Order price This field is required when the order type is a limit order . This field is not applicable when the order type is a market order. |
| `timeInForce` | string | `ioc` \| `fok` \| `gtc` \| `post_only` | Time in force ioc Immediate or cancel. It must be executed immediately, with any unfilled portion canceled. fok Fill or kill. It must be fully executed immediately, or it is canceled entirely. gtc Good 'til canceled. It… |
| `posSide` | string | `long` \| `short` | Position side long/short This field is required in hedge-mode position. Available only for futures |
| `clientOid` | string |  | Client order ID |
| `reduceOnly` | string | `yes` \| `no` | Reduce-only identifier yes/no, default no; yes indicates that your position may only be reduced in size upon the activation of this order |
| `stpMode` | string | `none` \| `cancel_taker` \| `cancel_maker` \| `cancel_both` | STP Mode(Self Trade Prevention) none: not setting STP(default) cancel_taker: cancel taker order cancel_maker: cancel maker order cancel_both: cancel both of taker and maker orders |
| `tpTriggerBy` | string | `market` \| `mark` | Preset Take-Profit Trigger Type market: Market Price mark: Mark Price If not specified, the default value is market price Note: This field is only valid for the contract business lines: USDT-Futures, COIN-Futures, and U… |
| `slTriggerBy` | string | `market` \| `mark` | Preset Stop-Loss Trigger Type market: Market Price mark: Mark Price If not filled in, the default value is market price Note: This field is only valid for the contract business lines: USDT-Futures, COIN-Futures, and USD… |
| `takeProfit` | string |  | Preset Take-Profit Trigger Price |
| `stopLoss` | string |  | Preset Stop-Loss Trigger Price |
| `tpOrderType` | string | `limit` \| `market` | Take-Profit Trigger Strategy Order Type limit: Limit Order market: Market Order |
| `slOrderType` | string | `limit` \| `market` | Stop-Loss Trigger Strategy Order Type limit: Limit Order market: Market Order |
| `tpLimitPrice` | string |  | Take-Profit Strategy Order Execution Price This field is only valid for limit orders (when tpOrderType=limit); it is ignored for market orders. |
| `slLimitPrice` | string |  | Stop-Loss Strategy Order Execution Price This field is only valid for limit orders (when slOrderType=limit); it is ignored for market orders. |

```bash
bgc order --action place --category <category> --symbol <symbol> --qty <qty> --side <side> --orderType <orderType>
```

#### `bgc order --action cancel`

`POST /api/v3/trade/cancel-order` · private · write

Cancel Order

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID Either clientOid or orderId must be provided. If both are present or do not match, orderId will take priority |
| `clientOid` | string |  | Client order ID Either clientOid or orderId must be provided. If both are present or do not match, orderId will take priority |
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

```bash
bgc order --action cancel
```

#### `bgc order --action modify`

`POST /api/v3/trade/modify-order` · private · write

Modify Order

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID Either orderId or clientOid must be provided If both orderId and clientOid are provided simultaneously, orderId takes higher priority |
| `clientOid` | string |  | Client order ID Either orderId or clientOid must be provided If both orderId and clientOid are provided simultaneously, orderId takes higher priority |
| `qty` | string |  | Order quantity Base coin Either qty or price must be provided |
| `price` | string |  | Order price Either qty or price must be provided |
| `autoCancel` | string | `yes` \| `no` | Will the original order be canceled if the order modification fails yes: Cancel no: Not cancel（default） |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

```bash
bgc order --action modify
```

#### `bgc order --action cancelAll` — **[DANGER] requires `--confirm`**

`POST /api/v3/trade/cancel-symbol-order` · private · write

Cancel All Orders

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT If no symbol is provided, all pending orders in the corresponding category will be closed. |

```bash
bgc order --action cancelAll --category <category>
```

#### `bgc order --action countdownCancel`

`POST /api/v3/trade/countdown-cancel-all` · private · write

CountDown Cancel All

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `countdown` | string |  | Reconnect Window - Unit: seconds - Positive integer, range: [5, 60]. The minimum countdown is 5 second, and the maximum is 60 seconds. Filling in 0 cancels the countdown order cancellation function. |

```bash
bgc order --action countdownCancel --countdown <countdown>
```

#### `bgc order --action open`

`GET /api/v3/trade/unfilled-orders` · private

Get Open Orders

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT \| |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383085 |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc order --action open
```

#### `bgc order --action detail`

`GET /api/v3/trade/order-info` · private

Get Order Details

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID Either clientOid or orderId must be provided. If both are present or do not match, orderId will take priority |
| `clientOid` | string |  | Client order ID Either clientOid or orderId must be provided. If both are present or do not match, orderId will take priority |

```bash
bgc order --action detail
```

#### `bgc order --action history`

`GET /api/v3/trade/history-orders` · private

Get Order History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT \| |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 The access window is 90 days |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383185 The time range between startTime and endTime must not exceed 30 days |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc order --action history --category <category>
```

#### `bgc order --action fills`

`GET /api/v3/trade/fills` · private

Get Fill History

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `orderId` | string |  | Order ID |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 The access window is 90 days. |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383185 The time range between startTime and endTime must not exceed 30 days. |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc order --action fills
```

#### `bgc order --action maxOpen`

`POST /api/v3/account/max-open-available` · private

Get Max Open Available

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `orderType` | string | `limit` \| `market` | Order type limit/market |
| `side` | string | `buy` \| `sell` | Transaction direction buy/sell |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `price` | string |  | Order price This field is required when orderType is limit |
| `size` | string |  | Order quantity, base coin |

```bash
bgc order --action maxOpen --category <category> --symbol <symbol> --orderType <orderType> --side <side>
```

### `position`

risk: **write** · write: no · auth: private

[VERB] Positions by intent: info (current) \| history \| adlRank \| close (ONE position by symbol, at market) \| closeAll (every position in a category). close & closeAll are destructive and require confirm; reads are n…

**Actions:** `info`, `history`, `adlRank`, `close`, `closeAll`

#### `bgc position --action info`

`GET /api/v3/position/current-position` · private

Get Position Info

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.BTCUSDT If no symbol is provided, all positions in the corresponding category will be returned. |
| `posSide` | string | `long` \| `short` | Position side long/short If this field is provided, only the position in the corresponding side will be returned. |

```bash
bgc position --action info --category <category>
```

#### `bgc position --action history`

`GET /api/v3/position/history-position` · private

Get Positions History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 The access window is 90 days |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383185 The time range between startTime and endTime must not exceed 30 days |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc position --action history --category <category>
```

#### `bgc position --action adlRank`

`GET /api/v3/position/adlRank` · private

Get Position ADL Rank

_No business parameters._

```bash
bgc position --action adlRank
```

#### `bgc position --action close` — **[DANGER] requires `--confirm`**

`POST /api/v3/trade/close-positions` · private · write

Close All Positions

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT If no symbol is provided, all positions in the corresponding category will be closed. |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `posSide` | string | `long` \| `short` | Position side long/short If this field is provided, only the position in the corresponding side will be closed. |

```bash
bgc position --action close --category <category> --symbol <symbol>
```

#### `bgc position --action closeAll` — **[DANGER] requires `--confirm`**

`POST /api/v3/trade/close-positions` · private · write

Close All Positions

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name e.g.,BTCUSDT If no symbol is provided, all positions in the corresponding category will be closed. |
| `posSide` | string | `long` \| `short` | Position side long/short If this field is provided, only the position in the corresponding side will be closed. |

```bash
bgc position --action closeAll --category <category>
```

### `strategy_order`

risk: **write** · write: no · auth: private

[VERB] Strategy (trigger/plan) orders by intent: place \| cancel \| modify \| open (unfilled) \| history. Writes honor dryRun/confirm/readOnly.

**Actions:** `place`, `cancel`, `modify`, `open`, `history`

#### `bgc strategy_order --action place`

`POST /api/v3/trade/place-strategy-order` · private · write

Place Strategy Order

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |
| `symbol` | string |  | Symbol name e.g.,BTCUSDT |
| `qty` | string |  | Order Quantity This is a required field when tpslMode=partial, and the unit is in the base coin |
| `posSide` | string | `long` \| `short` | Position side long/short |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `clientOid` | string |  | Client order ID The idempotent validity period is six hours (not fully guaranteed) |
| `type` | string | `tpsl` | Strategy Type tpslTake-Profit and Stop-Loss Default:tpsl |
| `tpslMode` | string | `full` \| `partial` | Take-Profit and Stop-Loss Mode fullAll Positions Take-Profit and Stop-Loss partialPartial Position Take-Profit and Stop-Loss If left blank, the default value is full |
| `tpTriggerBy` | string | `market` \| `mark` | Take-Profit Trigger Type market: Market Price mark: Mark Price If not specified, the default value is market price |
| `slTriggerBy` | string | `market` \| `mark` | Stop-Loss Trigger Type market: Market Price mark: Mark Price If not filled in, the default value is market price |
| `takeProfit` | string |  | Take-Profit Trigger Price |
| `stopLoss` | string |  | Stop-Loss Trigger Price |
| `tpOrderType` | string | `limit` \| `market` | Take-Profit Trigger Strategy Order Type limit: Limit Order market: Market Order If not filled in, the default value is market price |
| `slOrderType` | string | `limit` \| `market` | Stop-Loss Trigger Strategy Order Type limit: Limit Order market: Market Order If not filled in, the default value is market price |
| `tpLimitPrice` | string |  | Take-Profit Strategy Order Execution Price This field is only valid for limit orders (when tpOrderType=limit); it is ignored for market orders. |
| `slLimitPrice` | string |  | Stop-Loss Strategy Order Execution Price This field is only valid for limit orders (when slOrderType=limit); it is ignored for market orders |

```bash
bgc strategy_order --action place --category <category> --symbol <symbol> --qty <qty> --posSide <posSide>
```

#### `bgc strategy_order --action cancel`

`POST /api/v3/trade/cancel-strategy-order` · private · write

Cancel Strategy Order

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID Either orderId or clientOid must be provided If both orderId and clientOid are provided simultaneously, orderId takes higher priority |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `clientOid` | string |  | Client order ID Either orderId or clientOid must be provided If both orderId and clientOid are provided simultaneously, orderId takes higher priority |

```bash
bgc strategy_order --action cancel --orderId <orderId>
```

#### `bgc strategy_order --action modify`

`POST /api/v3/trade/modify-strategy-order` · private · write

Modify Strategy Order

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID Either orderId or clientOid must be provided If both orderId and clientOid are provided simultaneously, orderId takes higher priority |
| `qty` | string |  | Order Quantity Can be modified under partial take-profit/stop-loss mode, and the unit is in the base coin |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `clientOid` | string |  | Client order ID Either orderId or clientOid must be provided If both orderId and clientOid are provided simultaneously, orderId takes higher priority |
| `tpTriggerBy` | string | `market` \| `mark` | Take-Profit Trigger Type market: Market Price mark: Mark Price |
| `slTriggerBy` | string | `market` \| `mark` | Stop-Loss Trigger Type market: Market Price mark: Mark Price |
| `takeProfit` | string |  | Take-Profit Trigger Price |
| `stopLoss` | string |  | Stop-Loss Trigger Price |
| `tpOrderType` | string | `limit` \| `market` | Take-Profit Trigger Strategy Order Type limit: Limit Order market: Market Order |
| `slOrderType` | string | `limit` \| `market` | Stop-Loss Trigger Strategy Order Type limit: Limit Order market: Market Order |
| `tpLimitPrice` | string |  | Take-Profit Strategy Order Execution Price This field is only valid for limit orders (when tpOrderType=limit); it is ignored for market orders. |
| `slLimitPrice` | string |  | Stop-Loss Strategy Order Execution Price This field is only valid for limit orders (when slOrderType=limit); it is ignored for market orders |

```bash
bgc strategy_order --action modify --orderId <orderId> --qty <qty>
```

#### `bgc strategy_order --action open`

`GET /api/v3/trade/unfilled-strategy-orders` · private

Unfilled Strategy Orders

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `type` | string | `tpsl` | Strategy Type tpslTake-Profit and Stop-Loss |

```bash
bgc strategy_order --action open --category <category>
```

#### `bgc strategy_order --action history`

`GET /api/v3/trade/history-strategy-orders` · private

History Strategy Orders

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `type` | string | `tpsl` | Strategy Type tpslTake-Profit and Stop-Loss |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383085 |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc strategy_order --action history --category <category>
```

## Domain: account

### `account_overview`

risk: **read** · write: no · auth: private

[VERB] One-call account snapshot: fans out to assets, settings, funding assets, and (with category/symbol) positions and fee rate. Each section reports ok/error independently.

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Optional coin filter for funding assets. |
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | If provided, also fetches current positions (and fee rate when symbol is given too). |
| `symbol` | string |  | With category, also fetches the fee rate for this symbol. |
| `view` | string | `summary` \| `full` | summary (default) trims null fields to save tokens; full returns the untouched payload. |
| `fields` | any |  | Optional list (array or comma-separated string) of fields to keep on each returned row. |

```bash
bgc account_overview
```

### `account_config`

risk: **write** · write: no · auth: private

[VERB] Account settings by intent: set account mode (basic/advanced), position holding mode (one-way/hedge), and leverage; switch account & fee-deduction; plus oiLimit / paymentCoins / switchStatus / deductInfo reads. (…

**Actions:** `setAccountMode`, `setHoldingMode`, `setLeverage`, `switchAccount`, `switchDeduct`, `switchStatus`, `deductInfo`, `oiLimit`, `paymentCoins`

#### `bgc account_config --action setAccountMode`

`POST /api/v3/account/adjust-account-mode` · private · write

Adjust Account Mode

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `mode` | string | `basic` \| `advanced` | Account mode basic Basic mode advanced Advanced mode |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `targetUid` | string |  | Target account UID. If not provided, it defaults to the currently operated account. If a sub-account UID is provided, it indicates the master account is operating on the sub-account. |

```bash
bgc account_config --action setAccountMode --mode <mode>
```

#### `bgc account_config --action setHoldingMode`

`POST /api/v3/account/set-hold-mode` · private · write

Set Holding Mode

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `holdMode` | string | `one_way_mode` \| `hedge_mode` | Holding mode one_way_mode This mode allows holding positions in a single direction, either long or short, but not both at the same time hedge_mode This mode allows holding both long and short positions simultaneously |

```bash
bgc account_config --action setHoldingMode --holdMode <holdMode>
```

#### `bgc account_config --action setLeverage`

`POST /api/v3/account/set-leverage` · private · write

Set Leverage

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURESCoin-M futures USDC-FUTURES USDC futures |
| `leverage` | string |  | Leverage multiple |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol name This field is required to set leverage for futures |
| `coin` | string |  | Coin name This field is required to set leverage for margin trading |
| `posSide` | string | `long` \| `short` | Position side long/short This field is required to set leverage for isolated margin |

```bash
bgc account_config --action setLeverage --category <category> --leverage <leverage>
```

#### `bgc account_config --action switchAccount`

`POST /api/v3/account/switch` · private · write

Switch Account

_No business parameters._

```bash
bgc account_config --action switchAccount
```

#### `bgc account_config --action switchDeduct`

`POST /api/v3/account/switch-deduct` · private · write

Switch Deduct

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `deduct` | string | `on` \| `off` | Is it enabled on enabled off disabled |

```bash
bgc account_config --action switchDeduct --deduct <deduct>
```

#### `bgc account_config --action switchStatus`

`GET /api/v3/account/switch-status` · private

Get Switch Status

_No business parameters._

```bash
bgc account_config --action switchStatus
```

#### `bgc account_config --action deductInfo`

`GET /api/v3/account/deduct-info` · private

Get Deduct Info

_No business parameters._

```bash
bgc account_config --action deductInfo
```

#### `bgc account_config --action oiLimit`

`GET /api/v3/account/open-interest-limit` · private

Get OI Limit

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Symbol e.g.,BTCUSDT |
| `category` | string | `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` | Product type USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures |

```bash
bgc account_config --action oiLimit --symbol <symbol> --category <category>
```

#### `bgc account_config --action paymentCoins`

`GET /api/v3/account/payment-coins` · private

Get Payment Coins

_No business parameters._

```bash
bgc account_config --action paymentCoins
```

### `repayment`

risk: **write** · write: no · auth: private

[VERB] Repay account liabilities: submit a repayment, or list repayable coins/amounts.

**Actions:** `submit`, `repayable`

#### `bgc repayment --action submit`

`POST /api/v3/account/repay` · private · write

Repay

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `repayableCoinList` | array |  | Repayable coin list |
| `paymentCoinList` | array |  | Payment coin list |

```bash
bgc repayment --action submit --repayableCoinList <repayableCoinList> --paymentCoinList <paymentCoinList>
```

#### `bgc repayment --action repayable`

`GET /api/v3/account/repayable-coins` · private

Get Repayable Coins

_No business parameters._

```bash
bgc repayment --action repayable
```

## Domain: funds

### `transfer_funds`

risk: **write** · write: no · auth: private

[VERB] Move funds by intent: action internal \| mainToSub \| subToMain. preflight reports max transferable without moving anything; transfers honor dryRun/readOnly.

**Actions:** `internal`, `mainToSub`, `subToMain`

#### `bgc transfer_funds --action internal`

`POST /api/v3/account/transfer` · private · write

Transfer

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `fromType` | string | `spot` \| `p2p` \| `coin_futures` \| `usdt_futures` \| `usdc_futures` \| `crossed_margin` \| `isolated_margin` \| `uta` | From (source) account type spot Spot account/Funding Account p2p P2P account/OTC account coin_futures Coin-M futures account usdt_futures USDT futures account usdc_futures USDC futures account crossed_margin Cross margi… |
| `toType` | string | `spot` \| `p2p` \| `coin_futures` \| `usdt_futures` \| `usdc_futures` \| `crossed_margin` \| `isolated_margin` \| `uta` | To (target) account type spot Spot account/Funding Account p2p P2P account/OTC account coin_futures Coin-M futures account usdt_futures USDT futures account usdc_futures USDC futures account crossed_margin Cross margin … |
| `amount` | string |  | transfer amount |
| `coin` | string |  | transfer coin e.g: BTC |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `symbol` | string |  | Isolated spot margin e.g: BTCUSDT |
| `allowBorrow` | string |  | Body field allowBorrow. |

```bash
bgc transfer_funds --action internal --fromType <fromType> --toType <toType> --amount <amount> --coin <coin>
```

#### `bgc transfer_funds --action mainToSub`

`POST /api/v3/account/sub-transfer` · private · write

Main-Sub Account Transfer

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `fromType` | string | `spot` \| `p2p` \| `usdt_futures` \| `coin_futures` \| `usdc_futures` \| `crossed_margin` \| `uta` | Transferring Account Type spot Spot account/Funding account p2p P2P account/OTC account usdt_futures USDT-Margined Futures Account coin_futures Coin-Margined Futures Account usdc_futures USDC Futures Account crossed_mar… |
| `toType` | string | `spot` \| `p2p` \| `usdt_futures` \| `coin_futures` \| `usdc_futures` \| `crossed_margin` \| `uta` | Receiving Account Type spot Spot account/Funding account p2p P2P account/OTC account usdt_futures USDT-Margined Futures Account coin_futures Coin-Margined Futures Account usdc_futures USDC Futures Account crossed_margin… |
| `amount` | string |  | Amount to Transfer In |
| `coin` | string |  | Transfer Currency, e.g., BTC |
| `fromUserId` | string |  | Transferring Account UID |
| `toUserId` | string |  | Receiving Account UID |
| `clientOid` | string |  | clientOid,Cannot exceed 64 characters. |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `allowBorrow` | string |  | Body field allowBorrow. |

```bash
bgc transfer_funds --action mainToSub --fromType <fromType> --toType <toType> --amount <amount> --coin <coin> --fromUserId <fromUserId> --toUserId <toUserId> --clientOid <clientOid>
```

#### `bgc transfer_funds --action subToMain`

`POST /api/v3/account/sub-master-transfer` · private · write

Sub-Main Account Transfer

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `fromType` | string | `spot` \| `uta` | Transferring Account Type spot Funding account uta Unified Account |
| `toType` | string | `spot` \| `p2p` \| `uta` | Receiving Account Type spot Funding account p2p OTC account uta Unified Account |
| `amount` | string |  | Amount to Transfer In |
| `coin` | string |  | Transfer Currency, e.g., BTC |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `clientOid` | string |  | clientOid,Cannot exceed 64 characters. |

```bash
bgc transfer_funds --action subToMain --fromType <fromType> --toType <toType> --amount <amount> --coin <coin>
```

### `deposit`

risk: **write** · write: no · auth: private

[VERB] Deposits by intent: address (get a deposit address) \| records (deposit history) \| setupAccount.

**Actions:** `address`, `records`, `setupAccount`

#### `bgc deposit --action address`

`GET /api/v3/account/deposit-address` · private

Get Deposit Address

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name - The currency name can be obtained using the Get Currency Information API. |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `chain` | string |  | Chain Name - The chain name can be obtained using the Get Currency Information API. - If not filled, the system will automatically match a chain to generate a deposit address |
| `size` | string |  | Deposit Quantity - Only applies to BTC Lightning Network - Limit range: 0.000001 - 0.01. |

```bash
bgc deposit --action address --coin <coin>
```

#### `bgc deposit --action records`

`GET /api/v3/account/deposit-records` · private

Get Deposit Records

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Query record start time<ul><li>Unix millisecond timestamp, e.g., 1690196141868</li></ul> |
| `endTime` | string |  | Query record end time<ul><li>Unix millisecond timestamp, e.g., 1690196141868</li></ul> |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name - If left blank, all currency deposit records will be retrieved. |
| `limit` | string |  | Items per page The default value is 20, and the maximum value is 100. |
| `cursor` | string |  | Cursor ID - Used for pagination to reduce query response time - Do not send for the initial query. When querying the second page and subsequent data, use the smallest orderId returned from the previous query. The result… |
| `orderId` | string |  | Order ID - Used for specifying order queries. |

```bash
bgc deposit --action records --startTime <startTime> --endTime <endTime>
```

#### `bgc deposit --action setupAccount`

`POST /api/v3/account/deposit-account` · private · write

Set Up Deposit Account

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Recharge coin 如BTC |
| `accountType` | string | `funding` \| `unified` \| `otc` | Account type funding Funding account unified Unified account otc OTC account The current default is the funding account, and it can be modified to a unified account or an OTC account |

```bash
bgc deposit --action setupAccount --coin <coin> --accountType <accountType>
```

### `withdraw`

risk: **write** · write: no · auth: private

[VERB] Withdrawals by intent: submit (send funds out — irreversible, needs confirm) \| records (withdrawal history).

**Actions:** `submit`, `records`

#### `bgc withdraw --action submit` — **[DANGER] requires `--confirm`**

`POST /api/v3/account/withdrawal` · private · write

Withdrawal

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name |
| `transferType` | string | `on_chain` \| `internal_transfer` | Withdrawal Type on_chainOn-chain deposit internal_transferInternal transfer |
| `address` | string |  | Withdrawal Address - When transferType is on_chain, fill in the chain address. - When transferType is internal_transfer, fill in the UID, email, or mobile number based on innerToType. |
| `size` | string |  | Withdrawal Quantity Special Notes for Bitcoin Lightning Network Withdrawals： This parameter must exactly match the amount on the Bitcoin Lightning Network deposit invoice; The withdrawal quantity for Bitcoin Lightning N… |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `chain` | string |  | Blockchain Network - For example, erc20, trc20, etc. - This parameter is required when transferType=on_chain - The chain name can be obtained using the Get Currency Information API. |
| `innerToType` | string | `uid` \| `email` \| `mobile` | Internal Withdrawal Address Type uidUser ID email Email mobile Mobile phone number - If not filled, the default value is uid |
| `areaCode` | string |  | Area Code This parameter is required when innerToType = mobile |
| `tag` | string |  | Address Tag This is required for withdrawals of certain cryptocurrencies, like EOS. |
| `remark` | string |  | Remark |
| `clientOid` | string |  | Client Order ID |
| `memberCode` | string |  | Member Code bithumb korbit coinone |
| `identityType` | string | `company` \| `user` | Identity Type companyInstitutional Company user Individual User |
| `companyName` | string |  | Company Name Fill in this parameter when identity=company |
| `firstName` | string |  | First Name Fill in this parameter when identity=user |
| `lastName` | string |  | Last Name Fill in this parameter when identity=user |

```bash
bgc withdraw --action submit --coin <coin> --transferType <transferType> --address <address> --size <size>
```

#### `bgc withdraw --action records`

`GET /api/v3/account/withdrawal-records` · private

Get Withdrawal Records

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Query record start time<ul><li>Unix millisecond timestamp, e.g., 1690196141868</li></ul> |
| `endTime` | string |  | Query record end time<ul><li>Unix millisecond timestamp, e.g., 1690196141868</li></ul> |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name - If not filled in, all coin deposit records will be retrieved. |
| `orderId` | string |  | order ID - Either clientOid or orderId must be provided. If both are present or do not match, orderId will take priority |
| `clientOid` | string |  | Client Order ID - Either clientOid or orderId must be provided. If both are present or do not match, orderId will take priority |
| `limit` | string |  | Items per page The default value is 20, and the maximum value is 100. |
| `cursor` | string |  | Cursor ID - Used for pagination to reduce query response time - Do not send for the initial query. When querying the second page and subsequent data, use the smallest orderId returned from the previous query. The result… |

```bash
bgc withdraw --action records --startTime <startTime> --endTime <endTime>
```

### `funds_records`

risk: **read** · write: no · auth: private

[VERB] Funds history (read-only): financial ledger \| convert records \| main↔sub transfer records \| transferableCoins.

**Actions:** `financial`, `convert`, `subTransfers`, `transferableCoins`

#### `bgc funds_records --action financial`

`GET /api/v3/account/financial-records` · private

Get Financial Records

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `category` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` \| `OTHER` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures OTHER Other |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name e.g.,BTC |
| `type` | string | `TRANSFER_IN` \| `TRANSFER_OUT` | Type TRANSFER_IN/TRANSFER_OUT...... All enumeration values can be viewed under the Enumeration category. |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 The access window is 90 days |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383185 The time range between startTime and endTime must not exceed 30 days |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc funds_records --action financial --category <category>
```

#### `bgc funds_records --action convert`

`GET /api/v3/account/convert-records` · private

Get Convert Records

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `fromCoin` | string |  | From coin (source coin) It refers to the coin being converted |
| `toCoin` | string |  | To coin (target coin) It refers to the coin being converted into (received) |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 The access window is 90 days |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383185 The time range between startTime and endTime must not exceed 30 days |
| `limit` | string |  | Limit per page Default:100. Maximum:100 |
| `cursor` | string |  | Cursor Pagination is implemented by omitting the cursor in the first query and applying the cursor from the previous query for subsequent pages |

```bash
bgc funds_records --action convert --fromCoin <fromCoin> --toCoin <toCoin>
```

#### `bgc funds_records --action subTransfers`

`GET /api/v3/account/sub-transfer-record` · private

Get the transfer records of Main-Sub account

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID. If not provided, transfer records of the main account will be retrieved. |
| `role` | string | `initiator` \| `receiver` | Transfer-out account type initiator Initiator of the transfer receiver Recipient of the transfer Default: initiator |
| `coin` | string |  | Coin name |
| `startTime` | string |  | Start time for querying transfer records<ul><li>Unix millisecond timestamp, e.g., 1690196141868</li><li>The time interval between startTime and endTime should not exceed 90 days.</li></ul> |
| `endTime` | string |  | End time for querying transfer records<ul><li>Unix millisecond timestamp, e.g., 1690196141868</li><li>The time interval between startTime and endTime should not exceed 90 days.</li></ul> |
| `clientOid` | string |  | clientOid,Cannot exceed 64 characters. |
| `limit` | string |  | Items per page The default value is 100, and the maximum value is 100. |
| `cursor` | string |  | Cursor ID Used for pagination. Do not pass it for the first query. For subsequent queries (second page and beyond), use the cursor returned from the previous query. |

```bash
bgc funds_records --action subTransfers
```

#### `bgc funds_records --action transferableCoins`

`GET /api/v3/account/transferable-coins` · private

Get Transferable Coins

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `fromType` | string | `spot` \| `p2p` \| `coin_futures` \| `usdt_futures` \| `usdc_futures` \| `crossed_margin` \| `isolated_margin` \| `uta` | From (source) account type spot Spot account/Funding account p2p P2P account/OTC account coin_futures Coin-M futures account usdt_futures USDT futures account usdc_futures USDC futures account crossed_margin Cross margi… |
| `toType` | string | `spot` \| `p2p` \| `coin_futures` \| `usdt_futures` \| `usdc_futures` \| `crossed_margin` \| `isolated_margin` \| `uta` | To (target) account type spot Spot account/Funding account p2p P2P account/OTC account coin_futures Coin-M futures account usdt_futures USDT futures account usdc_futures USDC futures account crossed_margin Cross margin … |

```bash
bgc funds_records --action transferableCoins --fromType <fromType> --toType <toType>
```

## Domain: subaccount

### `subaccount`

risk: **write** · write: no · auth: private

[VERB] Sub-accounts by intent: create \| createAgent \| list \| freeze \| assets \| API keys (apiKeys/createApiKey/modifyApiKey/deleteApiKey) \| depositAddress \| depositRecords.

**Actions:** `create`, `createAgent`, `list`, `freeze`, `assets`, `apiKeys`, `createApiKey`, `modifyApiKey`, `deleteApiKey`, `depositAddress`, `depositRecords`

#### `bgc subaccount --action create`

`POST /api/v3/user/create-sub` · private · write

Create Sub-account

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `username` | string |  | Generate a virtual email address username. It can only contain lowercase letters and cannot exceed 20 characters. |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `accountMode` | string | `classic` \| `unified` | Sub-account Mode classic Classic Account Sub-account unified Unified Account Sub-account |
| `note` | string |  | Note, cannot exceed 50 characters. |

```bash
bgc subaccount --action create --username <username>
```

#### `bgc subaccount --action createAgent`

`POST /api/v3/user/sub-account/agent-create` · private · write

Create Agent Sub-account

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `username` | string |  | Body field username. |
| `passphrase` | string |  | Body field passphrase. |
| `note` | string |  | Body field note. |

```bash
bgc subaccount --action createAgent
```

#### `bgc subaccount --action list`

`GET /api/v3/user/sub-list` · private

Get Sub-account List

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `limit` | string |  | Items per page The default value is 100, and the maximum value is 100. |
| `cursor` | string |  | Cursor ID Used for pagination. Do not pass it for the first query. For subsequent queries (second page and beyond), use the cursor returned from the previous query. |

```bash
bgc subaccount --action list
```

#### `bgc subaccount --action freeze`

`POST /api/v3/user/freeze-sub` · private · write

Freeze/Unfreeze Sub-account

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account ID to be frozen/unfrozen |
| `operation` | string | `freeze` \| `unfreeze` | Operation Type： freeze Freeze unfreeze Unfreeze \| |

```bash
bgc subaccount --action freeze --subUid <subUid> --operation <operation>
```

#### `bgc subaccount --action assets`

`GET /api/v3/account/sub-unified-assets` · private

Get SubAccount Unified Assets

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID Leave blank to return all sub-account asset lists |
| `cursor` | string |  | Cursor ID For pagination. Omit in first request. Pass previous cursor in subsequent requests. |
| `limit` | string |  | Sub-accounts per Page Default value is 10, maximum is 50. |

```bash
bgc subaccount --action assets
```

#### `bgc subaccount --action apiKeys`

`GET /api/v3/user/sub-api-list` · private

Get Sub-account API Keys

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `limit` | string |  | Items per page The default value is 100, and the maximum value is 100. |
| `cursor` | string |  | Cursor ID Used for pagination. Do not pass it for the first query. For subsequent queries (second page and beyond), use the cursor returned from the previous query. |

```bash
bgc subaccount --action apiKeys --subUid <subUid>
```

#### `bgc subaccount --action createApiKey`

`POST /api/v3/user/create-sub-api` · private · write

Create Sub-account API Key

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account ID |
| `note` | string |  | Note Name The note needs to start with a letter and supports [0-9], [a-z], [A-Z], as well as [-,_] |
| `type` | string | `read_write` \| `read_only` | Permission Type read_write Read/Write read_only Read-only |
| `passphrase` | string |  | passphrase A combination of 8 to 32 characters of letters and numbers |
| `permissions` | array |  | permission values <ul><li>Unified Account Permissions: uta_mgt Unified Account Management uta_trade Unified Account Trading </li></ul> |
| `ips` | array |  | Withdrawal Whitelist IP Multiple IP addresses are supported A maximum of 30 IPs can be bound to a single key Only supports IPv4 |

```bash
bgc subaccount --action createApiKey --subUid <subUid> --note <note> --type <type> --passphrase <passphrase> --permissions <permissions> --ips <ips>
```

#### `bgc subaccount --action modifyApiKey`

`POST /api/v3/user/update-sub-api` · private · write

Modify Sub-account API Key

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `apikey` | string |  | Sub-account API Key |
| `passphrase` | string |  | passphrase A combination of 8 to 32 characters of letters and numbers |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `type` | string | `read_write` \| `read_only` | Permission Type read_write Read/Write read_only Read-only This parameter is required when permissions has a value. |
| `permissions` | array |  | permission values <ul><li>Unified Account Permissions: uta_mgt Unified Account Management uta_trade Unified Account Trading </li></ul>This parameter is required when type has a value. |
| `ips` | array |  | Withdrawal Whitelist IP <ul><li>If not provided, the IP address will not be modified.</li><li>If an empty value is provided, the withdrawal whitelist will be deleted.</li></ul>Multiple IP addresses are supported A maxim… |

```bash
bgc subaccount --action modifyApiKey --apikey <apikey> --passphrase <passphrase>
```

#### `bgc subaccount --action deleteApiKey`

`POST /api/v3/user/delete-sub-api` · private · write

Delete Sub-account API Key

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `apikey` | string |  | The sub-account API Key |

```bash
bgc subaccount --action deleteApiKey --apikey <apikey>
```

#### `bgc subaccount --action depositAddress`

`GET /api/v3/account/sub-deposit-address` · private

Get Sub Deposit Address

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID - The sub-account UID can be obtained via the Sub-account List API. |
| `coin` | string |  | Coin name - The currency name can be obtained using the Get Currency Information API. |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `chain` | string |  | Chain Name - The chain name can be obtained using the Get Currency Information API. |
| `size` | string |  | Deposit Quantity - Only applies to BTC Lightning Network - Limit range: 0.000001 - 0.01. |

```bash
bgc subaccount --action depositAddress --subUid <subUid> --coin <coin>
```

#### `bgc subaccount --action depositRecords`

`GET /api/v3/account/sub-deposit-records` · private

Get Sub Deposit Records

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin, e.g. USDT. |
| `subUid` | string |  | Query parameter subUid. |
| `startTime` | string |  | Query parameter startTime. |
| `endTime` | string |  | Query parameter endTime. |
| `limit` | string |  | Query parameter limit. |
| `cursor` | string |  | Pagination cursor returned by the previous page. |

```bash
bgc subaccount --action depositRecords
```

## Domain: broker

### `broker`

risk: **write** · write: no · auth: private

> Hidden to-B verb — opt in with `--modules broker` (not in `--modules all`).

[VERB] Broker sub-accounts by intent: createSub \| modifySub \| listSubs \| API keys (apiKeys/createApiKey/modifyApiKey/deleteApiKey) \| withdraw \| depositAddress \| depositWithdrawRecords \| commission.

**Actions:** `createSub`, `modifySub`, `listSubs`, `createApiKey`, `modifyApiKey`, `deleteApiKey`, `apiKeys`, `withdraw`, `depositAddress`, `depositWithdrawRecords`, `commission`

#### `bgc broker --action createSub`

`POST /api/v3/broker/create-sub` · private · write

Create Broker Sub-Account

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subaccountName` | string |  | Sub-account username. |
| `label` | string |  | label up to a maximum of 50 characters. |

```bash
bgc broker --action createSub --subaccountName <subaccountName> --label <label>
```

#### `bgc broker --action modifySub`

`POST /api/v3/broker/modify-sub` · private · write

Modify Broker Sub-Account

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `status` | string |  | Sub-account status: normal freeze |
| `permList` | string | `spot_trade` \| `contract_trade` \| `margin_trade` \| `deposit` | Permission list withdraw transfer spot_trade spot trading contract_trade futures trading margin_trademargin trading deposit deposit permission |

```bash
bgc broker --action modifySub --subUid <subUid>
```

#### `bgc broker --action listSubs`

`GET /api/v3/broker/sub-list` · private

Get Broker Sub-Account List

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `limit` | string |  | Number of items per page - default 10, maximum 100. |
| `cursor` | string |  | Cursor ID Used for pagination. Omit it on the first call. For subsequent calls, pass in the last subUid returned by the previous query. |
| `status` | string | `normal` \| `freeze` | Account status: normal normal freeze frozen |

```bash
bgc broker --action listSubs
```

#### `bgc broker --action createApiKey`

`POST /api/v3/broker/create-sub-apikey` · private · write

Create Broker Sub-Account API Key

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |
| `passphrase` | string |  | Passphrase required to call the API. If lost, please create a new API key. |
| `label` | string |  | label |
| `ipList` | string |  | IP whitelist up to 30 entries can be provided |
| `permType` | string | `read_and_write` \| `readonly` | Permission type: read_and_write read & write readonly read-only |
| `permList` | string | `uta_trade` \| `uta_mgt` \| `withdraw` | Permission list: uta_trade UTA trading uta_mgt UTA management withdraw (permType must be read_and_write) |

```bash
bgc broker --action createApiKey --subUid <subUid> --passphrase <passphrase> --label <label> --ipList <ipList> --permType <permType> --permList <permList>
```

#### `bgc broker --action modifyApiKey`

`POST /api/v3/broker/modify-sub-apikey` · private · write

Modify Broker Sub-Account API Key

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |
| `passphrase` | string |  | Passphrase required to call the API; if lost, please recreate the API key |
| `apiKey` | string |  | API Key |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `label` | string |  | label |
| `ipList` | string |  | IP whitelist up to 30 entries |
| `permType` | string | `read_and_write` \| `readonly` | Permission type: read_and_write read & write readonly read-only |
| `permList` | string | `uta_trade` \| `uta_mgt` \| `withdraw` | Permission list: uta_trade UTA trading uta_mgt UTA management withdraw (permType must be read_and_write) |

```bash
bgc broker --action modifyApiKey --subUid <subUid> --passphrase <passphrase> --apiKey <apiKey>
```

#### `bgc broker --action deleteApiKey`

`POST /api/v3/broker/delete-sub-apikey` · private · write

Delete Broker Subaccount Apikey

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |
| `apiKey` | string |  | API Key |

```bash
bgc broker --action deleteApiKey --subUid <subUid> --apiKey <apiKey>
```

#### `bgc broker --action apiKeys`

`GET /api/v3/broker/query-sub-apikey` · private

Get Broker Sub-Account API Key

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |

```bash
bgc broker --action apiKeys --subUid <subUid>
```

#### `bgc broker --action withdraw` — **[DANGER] requires `--confirm`**

`POST /api/v3/broker/sub-withdrawal` · private · write

Broker Subaccount Withdrawal

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |
| `coin` | string |  | coin name |
| `dest` | string | `on_chain` \| `internal_transfer` | Withdrawal method: on_chain on-chain withdrawal internal_transfer internal transfer |
| `address` | string |  | Withdrawal address- when using on-chain withdrawal, enter the on-chain address; when using internal transfer, enter the UID |
| `amount` | string |  | Withdrawal amount |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `chain` | string |  | Chain name- if this parameter is not provided, it defaults to the coin’s main chain |
| `tag` | string |  | Tag - used for some chains (e.g., EOS memo, TON comment) |
| `clientOid` | string |  | Custom order ID |

```bash
bgc broker --action withdraw --subUid <subUid> --coin <coin> --dest <dest> --address <address> --amount <amount>
```

#### `bgc broker --action depositAddress`

`POST /api/v3/broker/sub-deposit-address` · private

Get Broker Subaccount Deposit Address

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `subUid` | string |  | Sub-account UID |
| `coin` | string |  | Coin name |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `chain` | string |  | Chain name If this parameter is not provided, the default will be the coin’s primary (main) chain |

```bash
bgc broker --action depositAddress --subUid <subUid> --coin <coin>
```

#### `bgc broker --action depositWithdrawRecords`

`GET /api/v3/broker/all-sub-deposit-withdrawal` · private

Get All Broker Subaccount Deposit Withdrawal

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Record start time Unix timestamp in milliseconds. If both startTime and endTime are empty, the default query time range is yesterday 00:00–23:59 (UTC+0). The time range between startTime and endTime cannot exceed 7 days. |
| `endTime` | string |  | Record end time Unix timestamp in milliseconds. If both startTime and endTime are empty, the default query time range is yesterday 00:00–23:59 (UTC+0). The time range between startTime and endTime cannot exceed 7 days. |
| `limit` | string |  | Number of items per page default 100, maximum 100. |
| `cursor` | string |  | Cursor ID. |
| `status` | string | `pending` \| `fail` \| `success` | Status pendingConfirming failFailed successSuccessful |

```bash
bgc broker --action depositWithdrawRecords
```

#### `bgc broker --action commission`

`GET /api/v3/broker/commission` · private

Get Broker Commission

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Query start time Unix timestamp in milliseconds. If both startTime and endTime are omitted, the default query range is yesterday 00:00–23:59 (UTC+0). The interval between startTime and endTime for a single query cannot … |
| `endTime` | string |  | Query end time Unix timestamp in milliseconds. If both startTime and endTime are omitted, the default query range is yesterday 00:00–23:59 (UTC+0). The interval between startTime and endTime for a single query cannot ex… |
| `pageSize` | string |  | Number of items per page default 100, maximum 1000 |
| `pageNo` | string |  | Page number - default 1. |
| `bizType` | string |  | Business type spot futures - If not provided, commission data for all types will be returned. |
| `subBizType` | string | `spot_trade` \| `spot_margin` \| `usdt_futures` \| `usdc_futures` \| `coin_futures` | Business sub-type: spot_trade spot trading spot_margin spot margin usdt_futures USDT futures usdc_futures USDC futures coin_futures coin-margin futures When bizType=spot, this parameter can be spot_trade or spot_margin.… |

```bash
bgc broker --action commission
```

## Domain: loan

### `loan`

risk: **write** · write: no · auth: private

[VERB] Crypto loans by intent: borrow \| repay \| revisePledge \| ongoing \| borrowHistory \| repayHistory \| debts \| interest \| reduces \| coins \| pledgeRateHistory.

**Actions:** `borrow`, `repay`, `revisePledge`, `ongoing`, `borrowHistory`, `repayHistory`, `debts`, `interest`, `reduces`, `coins`, `pledgeRateHistory`

#### `bgc loan --action borrow`

`POST /api/v3/loan/borrow` · private · write

Borrow Coins

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `loanCoin` | string |  | Coin to borrow e.g.BTC |
| `pledgeCoin` | string |  | Collateral coin e.g.ETH |
| `daily` | string | `SEVEN` \| `THIRTY` \| `FLEXIBLE` | Pledge term: SEVEN 7 days THIRTY 30 days FLEXIBLE flexible |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `pledgeAmount` | string |  | Collateral amount choose one of pledgeAmount or loanAmount |
| `loanAmount` | string |  | Borrow amount choose one of loanAmount or pledgeAmount |

```bash
bgc loan --action borrow --loanCoin <loanCoin> --pledgeCoin <pledgeCoin> --daily <daily>
```

#### `bgc loan --action repay`

`POST /api/v3/loan/repay` · private · write

Repay Coins

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `method` | string | `borrowed_coin` \| `collateral` | Repayment method borrowed_coinborrowed coin collateralcollateral |
| `repayAll` | string |  | Repay in full yes no If yes, the repayment amount will be ignored |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `amount` | string |  | Repayment amount Required when repayAll=no |
| `repayUnlock` | string | `yes` \| `no` | Whether to redeem collateral yesredeem nodo not redeem Default is no if omitted. Not effective when repayAll=yes |

```bash
bgc loan --action repay --orderId <orderId> --method <method> --repayAll <repayAll>
```

#### `bgc loan --action revisePledge`

`POST /api/v3/loan/revise-pledge` · private · write

Revise Pledge

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `amount` | string |  | Adjustment amount |
| `pledgeCoin` | string |  | Collateral coin |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `reviseType` | string | `OUT` \| `IN` | Adjustment type OUT: withdraw collateral IN add collateral |

```bash
bgc loan --action revisePledge --orderId <orderId> --amount <amount> --pledgeCoin <pledgeCoin>
```

#### `bgc loan --action ongoing`

`GET /api/v3/loan/borrow-ongoing` · private

Get Borrow Ongoing

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `loanCoin` | string |  | Borrowed coin |
| `pledgeCoin` | string |  | Collateral coin |

```bash
bgc loan --action ongoing
```

#### `bgc loan --action borrowHistory`

`GET /api/v3/loan/borrow-history` · private

Get Borrow History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start time only supports querying data from the last 3 months |
| `endTime` | string |  | End time |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `loanCoin` | string |  | Borrowed coin |
| `pledgeCoin` | string |  | Collateral coin |
| `status` | string | `ROLLBACK` \| `FORCE` \| `REPAY` | Status ROLLBACK: failed FORCE: liquidated REPAY: repaid |
| `pageNum` | string |  | Page number default is 1 |
| `pageSize` | string |  | Items per page default is 10，maximum is 100 |

```bash
bgc loan --action borrowHistory --startTime <startTime> --endTime <endTime>
```

#### `bgc loan --action repayHistory`

`GET /api/v3/loan/repay-history` · private

Get Repay History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start time only supports querying data from the last 3 months |
| `endTime` | string |  | End time |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `loanCoin` | string |  | Borrowed coin |
| `pledgeCoin` | string |  | Collateral coin |
| `pageNum` | string |  | Page number default is 1 |
| `pageSize` | string |  | Items per page default is 10，maximum is 100 |

```bash
bgc loan --action repayHistory --startTime <startTime> --endTime <endTime>
```

#### `bgc loan --action debts`

`GET /api/v3/loan/debts` · private

Get Loan Debts

_No business parameters._

```bash
bgc loan --action debts
```

#### `bgc loan --action interest`

`GET /api/v3/loan/interest` · private

Get Loan Interest

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `loanCoin` | string |  | Coin to borrow e.g.BTC |
| `pledgeCoin` | string |  | Collateral coin e.g.ETH |
| `daily` | string | `SEVEN` \| `THIRTY` \| `FLEXIBLE` | Pledge term: SEVEN 7 days THIRTY 30 days FLEXIBLE flexible |
| `pledgeAmount` | string |  | Pledge Amount |

```bash
bgc loan --action interest --loanCoin <loanCoin> --pledgeCoin <pledgeCoin> --daily <daily> --pledgeAmount <pledgeAmount>
```

#### `bgc loan --action reduces`

`GET /api/v3/loan/reduces` · private

Get Loan Reduces

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start time only supports querying data from the last 3 months |
| `endTime` | string |  | End time |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `loanCoin` | string |  | Borrowed coin |
| `pledgeCoin` | string |  | Collateral coin |
| `status` | string | `COMPLETE` \| `WAIT` | Liquidation status COMPLETE liquidated WAIT liquidation |
| `pageNum` | string |  | Page number default is 1 |
| `pageSize` | string |  | Items per page default is 10，maximum is 100 |

```bash
bgc loan --action reduces --startTime <startTime> --endTime <endTime>
```

#### `bgc loan --action coins`

`GET /api/v3/loan/coins` · private

Get Loan Coins

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin name |

```bash
bgc loan --action coins
```

#### `bgc loan --action pledgeRateHistory`

`GET /api/v3/loan/pledge-rate-history` · private

Get Pledge Rate History

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | Start time only supports querying data from the last 3 months |
| `endTime` | string |  | End time |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | Order ID |
| `reviseSide` | string | `down` \| `up` | Adjustment direction down: transfer in, decrease up: transfer out, increase |
| `pledgeCoin` | string |  | Collateral coin |
| `pageNum` | string |  | Page number default is 1 |
| `pageSize` | string |  | Items per page default is 10，maximum is 100 |

```bash
bgc loan --action pledgeRateHistory --startTime <startTime> --endTime <endTime>
```

## Domain: instloan

### `inst_loan`

risk: **write** · write: no · auth: private

> Hidden to-B verb — opt in with `--modules instloan` (not in `--modules all`).

[VERB] Institutional loans by intent: bindUid (risk unit) \| orders \| ltv \| marginCoins \| products \| repaymentOrders \| riskUnit \| symbols \| transferred.

**Actions:** `bindUid`, `orders`, `ltv`, `marginCoins`, `products`, `repaymentOrders`, `riskUnit`, `symbols`, `transferred`

#### `bgc inst_loan --action bindUid`

`POST /api/v3/ins-loan/bind-uid` · private · write

Bind/Unbind UID to Risk Unit

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `uid` | string |  | Sub UID（limit 50 UIDS for one Risk Unit） |
| `operate` | string | `bind` \| `unbind` | bind Bind unbind Unbind |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `riskUnitId` | string |  | Risk Unit ID (Required for parent account calls, not required for risk unit account calls) |

```bash
bgc inst_loan --action bindUid --uid <uid> --operate <operate>
```

#### `bgc inst_loan --action orders`

`GET /api/v3/ins-loan/loan-order` · private

Get Loan Orders

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `orderId` | string |  | oan order id. If not passed, then return all orders, sort by loanTime in descend |
| `startTime` | string |  | The start timestamp (ms) |
| `endTime` | string |  | The end timestamp (ms) |

```bash
bgc inst_loan --action orders
```

#### `bgc inst_loan --action ltv`

`GET /api/v3/ins-loan/ltv-convert` · private

Get LTV

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `riskUnitId` | string |  | Risk Unit ID |

```bash
bgc inst_loan --action ltv
```

#### `bgc inst_loan --action marginCoins`

`GET /api/v3/ins-loan/ensure-coins-convert` · private

Get Margin Coin Info

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `productId` | string |  | Product Id |

```bash
bgc inst_loan --action marginCoins --productId <productId>
```

#### `bgc inst_loan --action products`

`GET /api/v3/ins-loan/product-infos` · private

Get Product Info

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `productId` | string |  | Product Id |

```bash
bgc inst_loan --action products --productId <productId>
```

#### `bgc inst_loan --action repaymentOrders`

`GET /api/v3/ins-loan/repaid-history` · private

Get Repayment Orders

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `startTime` | string |  | The start timestamp (ms) |
| `endTime` | string |  | The end timestamp (ms) |
| `limit` | string |  | Limit default 100; max 100 |

```bash
bgc inst_loan --action repaymentOrders
```

#### `bgc inst_loan --action riskUnit`

`GET /api/v3/ins-loan/risk-unit` · private

Get Risk Unit

_No business parameters._

```bash
bgc inst_loan --action riskUnit
```

#### `bgc inst_loan --action symbols`

`GET /api/v3/ins-loan/symbols` · private

Get Trade Symbols

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `productId` | string |  | Product Id |

```bash
bgc inst_loan --action symbols --productId <productId>
```

#### `bgc inst_loan --action transferred`

`GET /api/v3/ins-loan/transfered` · private

Get Transferred Quantity

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `coin` | string |  | Coin |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `userId` | string |  | User Id (Master account or sub-accounts) |

```bash
bgc inst_loan --action transferred --coin <coin>
```

## Domain: tax

### `tax`

risk: **read** · write: no · auth: private

[VERB] Tax records (read-only): records lists unified-account tax records.

**Actions:** `records`

#### `bgc tax --action records`

`GET /api/v3/tax/records` · private

Get Unified Account Tax Records

Required:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `bizType` | string | `SPOT` \| `MARGIN` \| `USDT-FUTURES` \| `COIN-FUTURES` \| `USDC-FUTURES` \| `OTHER` | Product type SPOT Spot trading MARGIN Margin trading USDT-FUTURES USDT futures COIN-FUTURES Coin-M futures USDC-FUTURES USDC futures OTHER Other |
| `startTime` | string |  | Start timestamp A Unix timestamp in milliseconds e.g.,1597026383085 |
| `endTime` | string |  | End timestamp A Unix timestamp in milliseconds e.g.,1597026383185 The time range between startTime and endTime must not exceed 7 days |

Optional:

| Param | Type | Enum | Description |
|-------|------|------|-------------|
| `marginType` | string | `isolated` \| `crossed` | Margin Type: isolated isolated margin crossed cross margin. This field is effective when category=MARGIN. If not specified, the default is crossed (cross margin). |
| `coin` | string |  | Coin name - If not specified, tax records for all coins will be returned. |
| `limit` | string |  | Limit per page Default:500. Maximum:500 |
| `cursor` | string |  | Cursor ID - Used for pagination. Do not include it for the first query. When querying the second page and subsequent data, use the id returned from the previous query. The interface will then return the data for the nex… |

```bash
bgc tax --action records --bizType <bizType> --startTime <startTime> --endTime <endTime>
```

## Meta tools

### `discover`

Progressive introspection of the live surface. `bgc discover` lists domains; `--domain <d>` lists a domain's verbs; `--tool <t>` returns one verb's full schema; `--tool <t> --action <a>` returns one action's exact required/optional contract; `--search <q>` keyword-searches the whole surface.

### `raw`

Escape hatch to any catalog operation by id, bypassing the intent layer: `bgc raw --operationId <id> --args '<json>'`. Use when no verb fronts the operation you need.
