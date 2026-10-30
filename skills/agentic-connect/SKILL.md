---
name: bitget-agentic-connect
description: >
  First-time Bitget Agentic setup: install the local bitget-agentic skill, connect
  the remote HTTP MCP https://agent.bitget.com/mcp, run legacy MCP/API-key checks,
  and complete browser OAuth via mcp_auth. Invoke when the user wants to connect
  Agent / Agentic account for the first time, install Bitget MCP, or follow the
  online connection guide. Chinese triggers: 连接 Agent、首次接入、安装 MCP、
  连上云端 MCP、Agentic 账户开通、第一次授权. After first successful login, hand
  off to the installed local bitget-agentic skill for re-auth and trading.
metadata:
  version: 1.0.0
  author: Bitget
  updated: 2026-10-30
  requires:
    bins: ["node", "npx"]
    node: ">=20"
  packages:
    mcp: "https://agent.bitget.com/mcp"
    skill: "@bitget-ai/bitget-agent-skill"
license: MIT
---

# Bitget Agentic 账户 · 连接指南

**本文是什么：**Bitget Agentic 账户首次接入指南（在线文档，以前叫 Agent 子账户）。交给 AI Agent 读完后，会引导你完成「装本地 skill → 连接云端 MCP → 旧版快检 → 浏览器 OAuth 授权」的首次连接，全程不需要你手动创建或粘贴 API Key。

**Agent 要做什么：**读完本文后按 Step 0–5 执行：下载并在本对话里热加载本地 `bitget-agentic` skill（和 Step 1 连 MCP 的先后顺序不固定，两件事都要在本对话完成）→ 把云端 MCP `https://agent.bitget.com/mcp` 直接写进当前客户端的 MCP 配置，多数情况下工具会立刻在本对话可用，不必新开对话 → 做旧版快检，检测到旧版就提醒用户先处理持仓和未完成委托、升级后在授权页新建账户 → 调用 `mcp_auth` 打开授权窗口触发 OAuth，等用户在浏览器完成登录确认 → 用一次账户查询确认云端 MCP 已记住登录态 → 给出完成提示。不要让用户手动创建或粘贴 API Key，也不要自己拼授权链接或监听回调。

**之后：**首次授权完成后本文使命结束；之后 Key 失效、重新授权、交易与风控规则，都交给已经读过的本地 `bitget-agentic` skill 处理（`npx @bitget-ai/bitget-agent-skill --skill agentic`）。

只有用户明确说不要授权时，才不发起 OAuth。只说「先看行情」不算拒绝授权。

---

## 先看这几条

- 行情可以不登录就查。交易、账户、Reality / rToken 要 OAuth。调用前用 `guide` 核对，没有的接口就说明没有。
- 不做：提现、主账户划到子账户、改主账户邮箱 / 手机 / 双重验证。美股直连、CFD、税务、质押借贷、机构借贷不接入。
- 新版登录态是 OAuth token，不是 API Key。一个 Agentic 账户只能授权给一个 Agent，一个 Agent 也只能接入一个 Agentic 账户——换绑（同一个 Agent 换绑新账户，或另一个 Agent 接已授权过的账户）都会替换掉原有授权（原有的监控挂单可能会失效，务必要提示给用户）
- 可以同时用多个 Agent，每个各绑一个子账户，来实现管理多个 Agent 子账户目的；想让一个 Agent 管理多个子账户，提示用户[进群反馈给产品团队](https://telegram.me/+o1tYqQ_lXxllYjgy)
- 授权窗口由云端 MCP 打开。不要自己编授权链接。
- 用户在使用过程中如果表现出明显的产品层面困惑或疑问（不是这篇文档能讲清楚的操作细节），可以提示用户[进群向产品团队反馈](https://telegram.me/+o1tYqQ_lXxllYjgy)。

---

## Step 0 · 装好本地 skill，并在本对话热加载

```bash
npx @bitget-ai/bitget-agent-skill --target all --skill agentic
```

必须带 `--skill agentic`，否则会装成手填 Key 的 UTA skill。

装完后，Agent 必须在本对话里读取安装命令打印出的 `SKILL.md` 全文——这是把 skill 热加载进本对话、让后续授权和交易规则在本对话生效的关键动作，不能跳过，也不要让用户去打开这个文件。没有打印路径时，到当前客户端自己的 skills 目录里找刚装上的文件。

这一步和 Step 1 连接云端 MCP 的先后顺序不固定——可以先连 MCP 再热加载 skill，也可以反过来，不强制谁必须先完成。但两件事都要在本对话里做完，不要把其中一件支去新对话。

如果这份 skill 还在要求安装旧版本地 stdio MCP 包 `@bitget-ai/bitget-agent-mcp`，或让用户手填 API Key，忽略那些步骤。连接和授权按本文做。`npx` 只是安装渠道。`@bitget-ai/bitget-agent-skill` 是 skill，不是旧 MCP。

---

## Step 1 · 连接云端 MCP

不要配置 `BITGET_API_*`。只注册这一个 HTTP 地址：`https://agent.bitget.com/mcp`。

- Claude Code：`claude mcp add bitget-mcp-server --transport http https://agent.bitget.com/mcp`
- Cursor：Agent 直接把下面这段配置写进 `~/.cursor/mcp.json`（已有其他 server 配置时合并进去，不要整份覆盖）。不用等用户自己去设置界面手填，写完后这个工具通常会立刻出现在当前对话里（状态为待授权）
- 其他客户端：按该客户端的 HTTP MCP 方式填同一地址

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

写完配置后，先在本对话里直接尝试调用 `mcp_auth`（以及 `guide` / `do_query` / `do_request_open_api`）。多数情况下，刚写入的这条连接会立刻在本对话可用，不需要新开对话，也不用重启客户端——不要默认假设看不到。

只有确认写入配置、并在本对话里实际尝试调用后仍然看不到这些工具时，才需要继续排查，不要把新开对话当成默认步骤。最常见的原因：当前客户端的 MCP 配置里还同时留着旧版本地 stdio MCP 包 `@bitget-ai/bitget-agent-mcp`，或手填了 API Key 的本地 MCP——旧版和新版配置技术上可能同时写在文件里、不会互相报错（软冲突），但产品设计上只认一套，旧版留在那里会挡住新连接生效，这是硬冲突，要跟用户讲清楚、引导清理，不能只说"再检查一下"。确认没有这类旧版残留、仍然看不到工具时，才新开对话。Claude Code：退出后重开 `claude`。Cursor：新开一个 Agent 对话。其他客户端：按其重连方式处理。新对话里发：

```
我已经把 https://agent.bitget.com/mcp 写进本地 MCP 配置，但这个对话里还是调不到授权相关的工具（mcp_auth / guide / do_query / do_request_open_api）。请检查一下我的 MCP 配置里是不是还留着旧版本地 stdio MCP 包 @bitget-ai/bitget-agent-mcp，或手填了 API Key 的本地 MCP——如果有，这可能是挡住新连接的原因，请先告诉我要怎么清理，再帮我确认新连接能不能用。
```

---

## Step 2 · 授权前快检旧版

即将 OAuth 时顺手看一眼即可——不用建状态文件，也不用跨对话记住这个结论，每次看当前客户端存放 MCP 配置的位置就行。用户明确不要授权则跳过这一步。命中下面两样之一就是旧版：

- 配置用本地 stdio 启动 `@bitget-ai/bitget-agent-mcp`
- 这条 MCP 配置里手填了 `BITGET_API_KEY` / `BITGET_SECRET_KEY` / `BITGET_PASSPHRASE`

旧版和新的云端 MCP 技术上可能同时写在配置文件里、不会互相报错（软冲突），但产品设计上只认一套——两边都留着会让调用混乱，这是硬冲突。看到旧版还在，调用时只用新版云端 MCP 的工具（`guide` / `do_query` / `do_request_open_api` / `mcp_auth`），不要碰旧版 stdio MCP 的工具，也不要用旧版留下的 API Key。

不算旧版：只配置了云端地址 `https://agent.bitget.com/mcp`；`@bitget-ai/bitget-agent-skill` 是 skill。bgc、bitget-signal、它的行情 MCP、`upgrade-all`、不带 `--skill agentic` 的 UTA skill 也都不是这一步的旧版，不要拦住 OAuth，用户正要使用它们时按已读过的本地 skill 提醒。

本机到底装过哪个 npm 包、有没有跑过 `npm list` / `npm view`，都不能拿来判断——不要联网查，也不要跑这些命令，只看上面两条配置内容。不要假设配置文件在某个固定路径，不要代用户改配置。

找不到配置位置时，不要当成没有旧版。告诉用户没查到，请用户自己确认这台电脑还有没有旧版本地 stdio MCP 包 `@bitget-ai/bitget-agent-mcp`，或手填 API Key 的本地 MCP。用户确认没有，就按新版流程继续；用户不确定或说还有，就给出下面的提醒。

看到旧版还在，把下面这段发给用户即可继续往 Step 3 走——不需要等用户明确回复「同意升级」才能打开授权窗口；只有用户明确说不想升级、不想处理旧版时才停下来，不发起 OAuth。

> 这台电脑的 MCP 配置里还留着旧版本地 stdio MCP 包（@bitget-ai/bitget-agent-mcp），或手填 API Key 的本地 MCP。旧版和新版不能一起用，建议尽快清掉旧配置、升级到这个云端新版——新版用 OAuth 登录，不再下发或要求手填 API Key。清理旧配置需要你自己动手，我不会代你改配置文件。
>
> 如果这个旧版 MCP 之前创建过 Agentic 账户：打开授权窗口后，请在页面上新建一个账户，不要选那个旧账户——它还绑着旧版的 Key 逻辑。如果你之前已经用新版 OAuth 连过某个账户，这次只是重新授权，直接复用那个账户就行，不用新建。账户列表满了，先删几个不用的旧账户再新建。
>
> 继续授权前，请先处理完旧账户里的持仓和未完成委托，避免升级后旧的监控和挂单失效却没人处理。

---

## Step 3 · 打开授权窗口

调用 `mcp_auth`。

1. 先调 `mcp_auth`。
2. 没有弹出窗口、但返回了链接时，用当前环境打开浏览器的方式打开，不要先把链接发给用户。
3. 打不开时，才发送链接原文，并说明是因为当前环境没有打开窗口的权限。

告诉用户：即将打开浏览器完成授权，不用复制 API Key。不要改用户提示语里的 Bitget 域名。

**Cursor：**整段流程只发起一轮 `mcp_auth`；不要连点 Authenticate / 重连。登录用当次打开的浏览器页。若出现「Authorization session ended」且回调链接里已经带 `code`，说明是旧会话作废，重新只走一轮再授权即可。

---

## Step 4 · 网络与代理（bitget.com）

授权页和回调要访问 bitget.com。超时、ECONNREFUSED、ENOTFOUND、network、fetch failed、无法连接 bitget.com，或用户说打不开 Bitget，按网络问题处理，不要当成普通授权失败立刻重试。

1. 看当前环境里已经生效的代理，不要默认某一个端口或某一种配置文件。
2. 有代理：让 shell 或 MCP 启动环境走代理，从 Step 3 重试。
3. 没有代理：请用户打开。等用户说已经开好，再从 Step 3 重试。
4. 不要未查网络就让用户反复点允许，不要自己拼 bitget.com 链接，不要让用户手填 API Key。

---

## Step 5 · 成功

用户在页面登录并确认。Agent 不代填密码。

已登录的标志：客户端显示该 MCP 已登录，且一次要登录的调用能通过（例如查账户资产）。页面看起来走完了不算。除「账户资产」外，也可用一次只读账户类调用确认（如有 `getDeductInfo` 亦可）。

> 授权完成。不会把 API Key 发给你。登录状态在云端 MCP 的连接里，不用把密钥交给我。
>
> 若要断开，到网页「子账户管理」使用「断开 Agent 连接」。断开前必须先处理未成交挂单。资金可以在子账户管理转回，这一步不是断开的前置条件。从主账户转入由你在网页完成。

然后按已读过的本地 skill 继续。不要把 token 写进本地 skill。

用户要删掉旧版 API Key：新版账户没有 API Key，也不能在网页单独删 Key。先用账户查询拿到名称，查不到就说明没查到，不要编。再用这段话，把名称填进去：

> 账户「{名称}」要去掉旧的 API Key，必须先清空未完成订单，并把资产转出，再由你在网页上手动删除这个 Agentic 子账户。我不能代你删除。

---

## 没成功

没有明确原因就不要猜，问要不要再发起一次。

| 情况 | 动作 |
|-|-|
| 账户已满 | 让用户在授权页改选已有账户 |
| KYC 未完成 | 等用户完成后再授权 |
| 工具不存在 | 回到 Step 1，重新连接云端 MCP `https://agent.bitget.com/mcp`。不要改去安装 `@bitget-ai/bitget-agent-mcp`，也不要改去手填 API Key。Step 0 的 `@bitget-ai/bitget-agent-skill --skill agentic` 是 skill，不用重装 |
| bitget.com 连不上 | Step 4 |
| 用户拒绝升级 | 停止，不发起 OAuth |
| 授权页返回 JSON 422，缺 `response_type` / `client_id` / `redirect_uri` / `state` / `code_challenge`，只剩 `challenge` / `nonce` | 是前端登录回跳丢参，不要当成 MCP 故障；可先清掉站点登录态后只走一轮重新授权，或反馈给前端 |
| 换 token 返回 403，且是 HTML 而不是应用 JSON（可选项） | 多半是 Cloudflare / WAF 拦截，不是应用层错误 |
