---
name: bitget-agentic-connect
description: >
  FIRST-TIME ONLY Bitget Agentic setup: install local bitget-agentic, connect
  remote HTTP MCP https://agent.bitget.com/mcp, legacy MCP/API-key check, then
  client OAuth. Invoke only when the user has not yet connected / is following
  the online connection guide. Chinese triggers: 首次接入、第一次授权、安装并连接
  云端 MCP、Agentic 账户开通. After MCP is connected and first login succeeds,
  STOP using this skill — hand off to installed bitget-agentic for re-auth and
  trading (do not compete on 「连接 Agent」 once setup is done). Server tools are
  guide / do_query / do_request_open_api; mcp_auth is client-side OAuth (Cursor),
  not a server tool.
metadata:
  version: 1.0.1
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

# Bitget Agentic 账户 · 连接指南（仅首次）

**本文是什么：**首次接入指南。读完后按 Step 0–5 完成：装本地 `bitget-agentic` → 登记云端 MCP `https://agent.bitget.com/mcp` → 旧版快检 → 客户端 OAuth → 用账户只读调用确认已登录。不要手填 API Key，不要自己拼授权链接。

**服务端 tool 只有三个：** `guide`、`do_query`、`do_request_open_api`。  
**`mcp_auth` 是客户端鉴权入口（Cursor），不是服务端 tool。**

**之后：**首次授权成功后本文使命结束；重新授权、交易、断连一律交给已热加载的本地 `bitget-agentic`（`npx @bitget-ai/bitget-agent-skill --skill agentic`）。旧版快检文案、交易规则、失败表以该文件为准，本文不重复维护。

只有用户明确说不要授权时，才不发起 OAuth。只说「先看行情」不算拒绝。

---

## 先看这几条

- 行情可不登录；交易 / 账户 / Reality 要 OAuth。先 `guide` 再调用。
- 不做：提现、主→子划转、改主账户安全设置；美股直连、CFD、税务、质押/机构借贷不接入。
- 登录态是 OAuth token（不是 API Key）。Agentic 账户与 Agent **1:1**；换绑会替换原授权（提醒用户处理挂单/监控）。
- 多 Agent 可各绑一个子账户；一个 Agent 管多子账户 → [进群反馈](https://telegram.me/+o1tYqQ_lXxllYjgy)。
- 产品困惑（非操作细节）也可提示同一进群链接。

---

## Step 0 · 装本地 skill 并热加载

```bash
npx @bitget-ai/bitget-agent-skill --target all --skill agentic
```

必须带 `--skill agentic`。装完后 **Agent 在本对话读取安装输出里的 `SKILL.md` 全文**（热加载），不要让用户去打开文件。与 Step 1 顺序不固定，但都要在本对话做完。

若读到的 skill 仍要求装 `@bitget-ai/bitget-agent-mcp` 或手填 Key，忽略那些步骤，按本文连云端 MCP。

---

## Step 1 · 连接云端 MCP

只登记：`https://agent.bitget.com/mcp`。不要配 `BITGET_API_*`。

- Claude Code：`claude mcp add -s user bitget-mcp-server --transport http https://agent.bitget.com/mcp`（无 Cursor 的 `CLIENT_ID`）
- Cursor：合并写入 `~/.cursor/mcp.json`（勿整份覆盖）：

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

- 其他客户端：按各自 HTTP MCP 方式填同一 URL。

写完后在本对话先试 `guide()`。多数情况立刻可用，不要默认要求新开对话。  
仍看不到三个 tool 时：先查是否残留旧版 stdio `@bitget-ai/bitget-agent-mcp` 或手填 Key 的本地 MCP（软冲突可共存、产品上硬冲突）→ 引导用户自清理 → 仍不行再新开对话。新对话可发：

```
我已经把 https://agent.bitget.com/mcp 写进本地 MCP 配置，但这个对话里还是调不到 guide / do_query / do_request_open_api。请检查是否还留着旧版 @bitget-ai/bitget-agent-mcp 或手填 API Key 的本地 MCP；有的话告诉我怎么清理，再确认新连接。
```

---

## Step 2 · 旧版快检

即将授权前看当前客户端 MCP 配置。命中即旧版：

- stdio 启动 `@bitget-ai/bitget-agent-mcp`
- 或配置了 `BITGET_API_KEY` / `BITGET_SECRET_KEY` / `BITGET_PASSPHRASE`

命中后：只用云端三个 tool + 客户端对本 MCP 的鉴权；把本地 `bitget-agentic` §2 里的升级提醒原文发给用户后即可进 Step 3（不必等「同意升级」）。用户明确拒绝升级则停止。  
只配了云端 URL、或仅有 skill/bgc/signal 等，不算旧版、不拦 OAuth。不要用 `npm list` 判断。找不到配置路径时让用户自确认，不要默认「没有旧版」。

---

## Step 3 · 客户端授权

1. Cursor：对本 MCP 一轮 `mcp_auth` / Connect（勿连点）。有链接先本机打开浏览器，打不开再发原文。
2. 无 `mcp_auth`：先 `do_request_open_api(operation_id="getAccountAssets", params={})`；未授权 / 401 则按该客户端完成 MCP 登录。
3. 不改 Bitget 域名，不拼 authorize URL。出现「Authorization session ended」且回调已有 `code` → 旧会话作废，再走一轮即可。

---

## Step 4 · 网络（bitget.com）

超时 / ECONNREFUSED / ENOTFOUND / network / fetch failed / 打不开 Bitget → 先查已生效代理，再重试 Step 3；无代理则请用户开好后再授权。不要未查网络就反复点允许，不要手填 Key。

---

## Step 5 · 成功

已登录标志：客户端显示已登录，且例如：

```
do_request_open_api(operation_id="getAccountAssets", params={})
```

成功（也可用 `getDeductInfo`）。页面走完不算。

> 授权完成。不会把 API Key 发给你。登录状态在云端 MCP 的连接里，不用把密钥交给我。
>
> 若要断开，到网页「子账户管理」使用「断开 Agent 连接」。断开前必须先处理未成交挂单。资金可以在子账户管理转回，这一步不是断开的前置条件。从主账户转入由你在网页完成。

然后 **只按已读过的本地 `bitget-agentic` 继续**（行情 `guide`→`do_query`，交易 `guide`→`do_request_open_api`）。不要把 token 写入 skill。删旧账户话术见本地 skill §6。

---

## 没成功

| 情况 | 动作 |
|-|-|
| 账户已满 | 授权页改选已有账户 |
| KYC 未完成 | 完成后再授权 |
| 三个 tool 都不在 | 回 Step 1；不要装旧 stdio 包 / 手填 Key；不必重装 skill |
| bitget.com 连不上 | Step 4 |
| 用户拒绝升级 | 停止 |
| 授权页 JSON 422，缺 OAuth 参数只剩 challenge/nonce | 前端丢参；清站点登录态后再一轮，或反馈前端 |
| token 换票 403 且返回 HTML | 多为 WAF；非应用层错误 |

无明确原因不要猜，问要不要再发起一次。
