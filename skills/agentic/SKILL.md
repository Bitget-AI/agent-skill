---
name: bitget-agentic
description: >
  Use for Bitget Agentic account on the remote MCP https://agent.bitget.com/mcp
  (OAuth token, not local API keys). Invoke when the user connects an Agentic
  account, re-authorizes, says Connect Agent, reports auth expired, cannot trade,
  or trades or queries an account via that remote MCP — even without saying
  "Bitget". Chinese triggers: 连接 Agent、重新授权、同意升级到新版MCP、Agentic 账户、
  Agent 子账户、Agent 账户、AI 账户、智能交易账户、Key 失效、连不上、
  Connect Agent、帮我下单、查 Agentic 余额/持仓. Do NOT use for UTA env API keys,
  @bitget-ai/bitget-signal (including its market-data MCP), bgc, a local MCP filled
  with BITGET_API_KEY / BITGET_SECRET_KEY / BITGET_PASSPHRASE, or the old
  local stdio package @bitget-ai/bitget-agent-mcp. npm and npx are
  install channels, not the old edition.
  After install, this file covers later chats (prefer this over
  bitget-agentic-connect once MCP is already connected). The online connect
  guide is only for first-time setup. Server tools are guide, do_query, and
  do_request_open_api only — mcp_auth is a client-side OAuth entry (Cursor),
  not a server tool. If those three tools are missing, reconnect the remote
  MCP before OAuth. Do not invent an auth link.
metadata:
  version: 2.2.4
  author: Bitget
  updated: 2026-10-30
  requires:
    bins: ["node", "npx"]
    node: ">=20"
  packages:
    mcp: "https://agent.bitget.com/mcp"
license: MIT
---

# Bitget Agentic · 本地 Skill

云端 MCP：`https://agent.bitget.com/mcp`（以前叫 Agent 子账户）。登录态是 OAuth token，留在这个云端 MCP 连接里。不要把 token 抄进本文件或另存一份。

**服务端只有三个 tool：** `guide`、`do_query`、`do_request_open_api`。  
**`mcp_auth` 不是服务端 tool**——它是 Cursor 等客户端对本 MCP 发起 OAuth 的入口（Connect / Authenticate）。不要对远端做 `tools/call` 名叫 `mcp_auth` 的调用。Claude Code 等无此入口时，用私有 `do_request_open_api` 触发的未授权 / HTTP 401 走客户端 OAuth，或按该客户端的 MCP 登录方式操作。

在线连接指南（`bitget-agentic-connect`）只负责第一次安装并把云端 MCP 接上、完成第一次授权。本文件安装之后一直有效；MCP 已连上后的重新授权、交易、断连，以本文件为准，不要再抢连 connect 指南。

若本对话是刚装上后被要求读这个文件：先读完全文，不要只看开头。还没读完时，不要把用户支去另一个对话。

只有用户明确说不要授权时，才不发起 OAuth。只说「先看行情」不算拒绝。行情可以不登录就查。

---

## 规则

- 行情可以不登录就查。交易、账户、Reality / rToken 要已登录。调用前用 `guide` 核对，没有的接口就说明没有。
- 不做：提现、主账户划到子账户、改主账户邮箱 / 手机 / 双重验证。美股直连、CFD、税务、质押借贷、机构借贷不接入。
- 不下发、不粘贴 API Key，不配置 `BITGET_API_*`。一个 Agentic 账户只能授权给一个 Agent，一个 Agent 也只能接入一个 Agentic 账户——换绑（同一个 Agent 换绑新账户，或另一个 Agent 接已授权过的账户）都会替换掉原有授权（原有的监控挂单可能会失效，务必要提示给用户）
- 可以同时用多个 Agent，每个各绑一个子账户，来实现管理多个 Agent 子账户目的；想让一个 Agent 管理多个子账户，提示用户[进群反馈给产品团队](https://telegram.me/+o1tYqQ_lXxllYjgy)
- 网页断开在「子账户管理」→「断开 Agent 连接」，不是 API Key 列表。
- 授权由**客户端**对本 MCP 打开窗口（Cursor 用 `mcp_auth` / Connect）。不要自己编授权链接。
- 旧能力不要主动用，也不要每次对话都提醒。只有用户正要用时，才告诉他们尽量不要用，并让他们自己清掉对应配置。不要代用户改配置，也不要假设配置文件在某个固定路径。不要用 npm / npx 来指代旧版。下面这些不是第 2 节的旧版判定，不要因为它们当成旧版、也不要因为它们拦住 OAuth：

  - 终端 CLI `bgc`（`@bitget-ai/bitget-agent-cli`）
  - 不带 `--skill agentic` 的 UTA skill。包名仍是 `@bitget-ai/bitget-agent-skill`，这是手填 API Key 的 skill，不是 MCP
  - `@bitget-ai/bitget-signal` 及其自带的行情 MCP（非本 Agentic 云端 MCP）
  - `npx @bitget-ai/bitget-agent-installer upgrade-all`（会连带装上 signal 及其行情 MCP）
  - `--target all` 只是把 skill 装到多个客户端，不是旧能力
- token 是否有效看 MCP 的未授权错误（私有调用失败 / HTTP 401），不要背 TTL，也不要说成 API Key 有效期。
- 已登录判定：对 `do_request_open_api` 调用只读账户类 `operation_id` 成功即可，优先 `getAccountAssets`，也可用 `getDeductInfo`。Cursor 的 `auth.CLIENT_ID` 填错（不是 `cursor`）会导致鉴权异常，表现为授权流程走完仍提示未登录或 403。
- 用户在使用过程中如果表现出明显的产品层面困惑或疑问（不是这篇文档能讲清楚的操作细节），可以提示用户[进群向产品团队反馈](https://telegram.me/+o1tYqQ_lXxllYjgy)。

安全优先于把状态说清楚，再说响应速度。

---

## 调用面（先 guide，再执行）

```
行情：guide(surface="market_data") → … → entry_id → do_query(entry_id, params)
交易/账户：guide(surface="open_api") → … → operation_id
         → do_request_open_api(operation_id, params)
写操作：先 dry_run=true 出确认卡 → 用户明确「是/确认」→ confirm=true 再执行
```

不确定 id 时必须先 `guide`，不要猜 `entry_id` / `operation_id`。

---

## 1. 授权

先看本会话能不能用上云端 MCP 的三个 tool（至少 `guide`）。三个都看不到，按下面「工具不在本会话」处理，停在这里——这是连接问题，不是授权失败。不要编授权链接，不要安装 `@bitget-ai/bitget-agent-mcp`，也不要重装本 skill。

工具已经在本会话里：用一次账户只读调用判断是否已登录，例如：

```
do_request_open_api(operation_id="getAccountAssets", params={})
```

（也可用 `getDeductInfo`。）查得过就是已登录，不用重新授权。没登录，或私有调用报未授权 / 401，按这个顺序：

1. 做第 2 节检查。看到旧版就先给出清理/升级提醒，不用等用户回复「同意升级」才能继续——除非用户明确说不想升级、不想处理旧版，才停下来。
2. 告知：再次授权会换掉这条云端 MCP 连接上的旧 token；请先处理持仓和未完成委托。
3. 按第 3 节打开客户端授权。告诉用户即将打开浏览器完成授权，不用复制 API Key。不代填密码。
4. 再用 `getAccountAssets`（或 `getDeductInfo`）确认已登录。页面走完不等于成功。确认后对用户说：

> 授权完成。不会把 API Key 发给你。登录状态在云端 MCP 的连接里，不用把密钥交给我。

用户要断开或去掉旧 API Key 时，用第 6 节的原文，不要在这里另写一套。

### 工具不在本会话

本会话看不到 `guide` / `do_query` / `do_request_open_api`。地址可能还没登记到当前客户端的 MCP 配置里，也可能已登记但这个对话没扫到。先按下面登记/确认，并直接在本对话里试一次 `guide()`，不要默认当成一定要新开对话。  
**不要**用「有没有 `mcp_auth`」当唯一判据——没有客户端鉴权入口、但三个服务端 tool 已在，说明 MCP 已连上，只需走 OAuth。

地址只有一个：`https://agent.bitget.com/mcp`。不要改这个域名，不要配置 `BITGET_API_*`。

还没登记时，Agent 直接帮忙登记：

- Claude Code：`claude mcp add -s user bitget-mcp-server --transport http https://agent.bitget.com/mcp`，然后退出并重开 `claude`（Claude 侧无 Cursor 的 `CLIENT_ID` 配置项）
- Cursor：Agent 直接把 HTTP server 配置写进 `~/.cursor/mcp.json`（已有其他 server 配置时合并进去，不要整份覆盖），URL 为这个地址，`auth.CLIENT_ID` 设为 `cursor`（大写 CLIENT_ID）。写完后这个工具通常会立刻出现在当前对话里
- 其他客户端：按该客户端登记 HTTP MCP 的方式直接帮忙填同一地址，先在本对话里试一次

```json
{
  "mcpServers": {
    "bitget-mcp-server": {
      "url": "https://agent.bitget.com/mcp",
      "auth": { "CLIENT_ID": "cursor" }
    }
  }
}
```

登记后，先在本对话里直接尝试 `guide()`，以及（若客户端提供）对本 MCP 的鉴权入口。多数情况下连接会立刻在本对话可用，不需要新开对话。仍然看不到时，最常见的原因是配置里还同时留着旧版本地 stdio MCP 包 `@bitget-ai/bitget-agent-mcp`，或手填了 API Key 的本地 MCP——旧版和新版技术上可能同时写在配置文件里不报错（软冲突），但产品设计上只认一套，旧版会挡住新连接生效，这是硬冲突，要跟用户讲清楚、引导清理，不能只说"再检查一下"。确认没有这类旧版残留、仍然看不到时，才让用户新开对话，在新对话里再说一次要授权或要交易。新对话会读到本文件，从第 1 节再走。不要把在线指南的安装步骤搬过来。

---

## 2. 旧版快检

打开授权窗口之前顺手看一眼即可——不用建状态文件，也不用跨对话记住这个结论，每次看当前客户端存放 MCP 配置的位置就行。命中下面两样之一即算旧版：

- 配置用本地 stdio 启动 `@bitget-ai/bitget-agent-mcp`
- 这条 MCP 配置里手填了 `BITGET_API_KEY` / `BITGET_SECRET_KEY` / `BITGET_PASSPHRASE`

旧版和新的云端 MCP 技术上可能同时写在配置文件里、不会互相报错（软冲突），但产品设计上只认一套——两边都留着会让调用混乱，这是硬冲突。看到旧版还在，调用时只用新版云端 MCP 的三个 tool（以及客户端对本 MCP 的鉴权入口），不要碰旧版 stdio MCP 的工具，也不要用旧版留下的 API Key。

不算旧版：只配置了云端地址 `https://agent.bitget.com/mcp`；`@bitget-ai/bitget-agent-skill` 是 skill。规则里的 bgc、bitget-signal、其行情 MCP、upgrade-all、不带 `--skill agentic` 的 UTA skill 也都不是旧版，不要因为它们就当成旧版，也不要让它们拦住 OAuth。

本机到底装过哪个 npm 包、有没有跑过 `npm list` / `npm view`，都不能拿来判断——不要联网查，也不要跑这些命令，只看上面两条配置内容。不要假设配置文件在某个固定路径，不要代用户改配置。

找不到配置位置时，不要当成没有旧版。告诉用户没查到，请用户自己确认这台电脑还有没有旧版本地 stdio MCP 包 `@bitget-ai/bitget-agent-mcp`，或手填 API Key 的本地 MCP。用户确认没有，就按新版流程继续；用户不确定或说还有，就给出下面的提醒。

看到旧版还在，把下面这段发给用户即可继续往第 3 节走——不需要等用户明确回复「同意升级」才能打开授权窗口；只有用户明确说不想升级、不想处理旧版时才停下来，不发起 OAuth。

> 这台电脑的 MCP 配置里还留着旧版本地 stdio MCP 包（@bitget-ai/bitget-agent-mcp），或手填 API Key 的本地 MCP。旧版和新版不能一起用，建议尽快清掉旧配置、升级到这个云端新版——新版用 OAuth 登录，不再下发或要求手填 API Key。清理旧配置需要你自己动手，我不会代你改配置文件。
>
> 如果这个旧版 MCP 之前创建过 Agentic 账户：打开授权窗口后，请在页面上新建一个账户，不要选那个旧账户——它还绑着旧版的 Key 逻辑。如果你之前已经用新版 OAuth 连过某个账户，这次只是重新授权，直接复用那个账户就行，不用新建。账户列表满了，先删几个不用的旧账户再新建。
>
> 继续授权前，请先处理完旧账户里的持仓和未完成委托，避免升级后旧的监控和挂单失效却没人处理。

---

## 3. 打开授权（客户端）

对本 MCP 发起客户端 OAuth，不要只发链接、不要自己拼 authorize URL。

1. **Cursor：**对本 MCP 调用客户端 `mcp_auth`（或点 Connect / Authenticate）。整段流程只发起一轮；不要连点 Authenticate / 重连。登录用当次打开的浏览器页。若出现「Authorization session ended」且回调链接里已经带 `code`，说明是旧会话作废，重新只走一轮再授权即可。
2. 没弹出窗口但返回了链接：用当前环境打开浏览器的方式打开。
3. 命令也失败：发送链接原文，并说明是因为没有打开窗口的权限。
4. **无 `mcp_auth` 的客户端：**先发一次私有只读调用（如 `getAccountAssets`）；若返回未授权 / 401，按该客户端文档完成 MCP 登录；仍无入口则请用户在客户端 MCP 设置里对该 server 登录。

链接用工具/客户端返回的原文，不要自己改，也不要改用户提示语里的 Bitget 域名。

---

## 4. 网络

授权页和回调要访问 bitget.com。超时、ECONNREFUSED、ENOTFOUND、network、fetch failed，或用户说打不开 Bitget：先查代理，不要立刻当成授权失败重试。

看当前环境里已经生效的代理，不要默认某一个端口或某一种配置文件。有代理就让环境走代理后重开第 3 节。没有就请用户打开，等用户确认后再授权。不要未查网络就让用户反复点允许，不要自己编 bitget.com 链接，不要让用户手填 API Key。

---

## 5. 交易与行情

已登录后：

- **行情：** `guide(surface="market_data", …)` → `do_query(entry_id, params)`
- **交易 / 账户 / Reality：** `guide(surface="open_api", …)` → `do_request_open_api(operation_id, params)`

写操作：先 `dry_run: true` 出确认卡。用户明确回复「是」或「确认」后，再带 `confirm: true` 执行。高风险写入（如撤全单、平全仓、设杠杆、还款）必须 `confirm: true`。「直接帮我做」不算确认。

确认卡：交易对、方向、数量、价格类型、账户、主网、「确认执行？」。平仓前先查仓。有强平价就写上。风险类错误不要加仓。余额不够时，入金由用户在网页从主账户转入。

批量下单 / 撤单 / 改单（`batchOrder` / `batchCancel` / `batchModifyOrders`）：`params` 用订单对象的 JSON 数组，或 `{"orderList"|"orders": [...]}`。

---

## 6. 断开和删旧账户

断开时用这段，不要代点：

> 请到网页「子账户管理」使用「断开 Agent 连接」。断开前必须先处理未成交挂单。资金可以在子账户管理转回，这一步不是断开的前置条件。

删旧 API Key：新版没有 API Key，也不能在网页单独删 Key。先用 `getAccountAssets`（或等价只读账户调用）拿到名称。查不到就说明没查到，不要编。未登录就先授权，不要让用户盲删。名称拿到后用这段：

> 账户「{名称}」要去掉旧的 API Key，必须先清空未完成订单，并把资产转出，再由你在网页上手动删除这个 Agentic 子账户。我不能代你删除。

---

## 7. 失败

| 情况 | 动作 |
|-|-|
| 未登录却要交易或查账户 | 第 1 节 |
| 用户取消、回调没完成、原因不清楚 | 「授权未完成。要我再发起一次吗？」 |
| token 失效或网页已断开 | 第 1 节 |
| 限流 | 稍后重试，不要重新授权 |
| 余额不足 | 让用户在网页入金 |
| 三个服务端 tool 都不存在 | 回到第 1 节「工具不在本会话」。不要编链接，不要安装 `@bitget-ai/bitget-agent-mcp`，不要重装本 skill |
| 账户已满 | 授权页改选已有账户 |
| KYC 未完成 | 等用户完成 |
| bitget.com 连不上 | 第 4 节 |
| 设备验证失败 | 请用户核对是同一个 App 账号，再授权。这不是 token 失效 |
| 授权页返回 JSON 422，缺 `response_type` / `client_id` / `redirect_uri` / `state` / `code_challenge` 等 OAuth 参数 | 是前端登录回跳丢参，不要当成 MCP 故障；回到第 3 节只走一轮重新授权，不要装旧的 stdio 包，也不要手填 API Key |

不要：静默换登录态、代删子账户、代改配置文件、失效后继续交易、用户明确说不想升级或不想处理旧版后仍发起 OAuth、只给链接却不打开授权窗口（没有打开窗口权限时除外）、看不到工具却编授权链接、把「没有 mcp_auth」或「工具不存在」当成同一种失败、对服务端 `tools/call` 虚构的 `mcp_auth`。
