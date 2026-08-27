---
title: 连接 Claude Code 或 Codex
description: 通过 MCP 从您自己的 AI 代理（Claude Code / Codex）驱动已保存的项目——它会在您的画布上实时构建电路并编写固件。
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

Velxio 内置的 [Agent 模式](/docs/zh-cn/ai/agent-mode/) 在应用_内部_运行助手。**连接 AI 代理**则相反：它让您自己的代理——终端中的 **Claude Code** 或 **OpenAI Codex**——访问已保存的 Velxio 项目并为您构建。电路和代码会在几秒钟内出现在您的画布上，就像应用内代理完成的一样。

它通过 [MCP](https://modelcontextprotocol.io)（模型上下文协议）工作：Velxio 将其电路和代码工具作为 MCP 服务器暴露，您使用每个项目的令牌将代理指向它。

![连接 AI 代理模态框，显示 Claude Code / Codex 选项卡、设置命令和活动连接](../../../../assets/docs/ai/connect-agent.png)

:::note
连接外部代理是一项 **Pro** 功能。免费版和 Maker 计划请改用应用内的 [Agent](/docs/zh-cn/ai/agent-mode/) 和 [Tutor](/docs/zh-cn/ai/tutor-mode/) 模式。请参阅 [计划](/docs/zh-cn/getting-started/plans/)。
:::

## 最快的方式：Claude Code 插件

如果您使用 Claude Code，请安装该插件——它一步到位地提供工具、`/velxio:build` 命令和接线知识：

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

然后生成一个令牌（步骤如下），导出它，并重启 Claude Code：

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...您的令牌..."
```

现在，`/velxio:build an HC-SR04 that prints distance over serial` 就能完成全部工作。`/velxio:check` 会验证并编译已有的内容。

## 手动连接，分三步

1. **先保存项目。** 代理连接到已保存的项目，所以如果还没有保存，请给它命名并保存。
2. **打开连接器。** 在编辑器中，转到 **File → Connect AI agent (Claude/Codex)**（文件 → 连接 AI 代理），选择 **Claude Code** 或 **Codex CLI** 选项卡，然后点击 **Generate connection token**（生成连接令牌）。
3. **在终端中运行**它显示的一行设置命令：

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_your_token_here"
   ```

   **Codex** — 添加到 `~/.codex/config.toml`：

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_your_token_here" }
   ```

就这样。启动 `claude`（或 `codex`）并让它构建一些东西：

> _"使用 velxio 工具，将 HC-SR04 连接到板上，并编写通过串口打印距离的固件。"_

当您的代理发出第一次调用时，模态框中的状态行会切换到 **Connected**（已连接），部件、导线和代码会实时出现在您的画布上。

## 代理能做什么

您的代理获得与应用内代理相同的工具集：它可以读取项目、添加和连接组件、添加开发板、将部件放置在面包板上、编写和编辑草图，以及验证电路。它还拥有 Velxio 的每个组件**技能**——精确的引脚名称、接线配方和模拟器注意事项——因此它可以正确连接 SSD1306 或 DHT22，而不是猜测。

它还可以**编译**：`compile_sketch` 在 Velxio 服务器上构建固件，并将编译器输出交给代理，这样它就可以修复自己的错误，而不是告诉您无法构建的代码。运行模拟和读取串行监视器仍然需要您标签页中的实时模拟器——当构建通过时，请在 Velxio 中按 **Run**（运行）。

## 无需令牌登录

支持 OAuth 的客户端（包括 Claude Code）可以使用您的 Velxio 账户连接，而不是粘贴令牌：将它们指向 `https://velxio.dev/api/pro/mcp`，无需凭据，它们会发现登录流程，打开浏览器，并要求您批准。同意屏幕会显示客户端和账户的名称，它收到的访问令牌仅绑定到 Velxio 的 MCP 端点。

令牌仍然是最简单的路径，并且它们的一切都没有改变。

## 安全性

连接令牌是一种**狭窄的、按项目划分的能力**，设计用于粘贴到第三方 CLI 中：

- **仅限于一个项目。** 令牌只能访问为其生成的单个项目——绝不会访问您的其他项目或账户。
- **哈希存储，仅显示一次。** Velxio 只保留令牌的哈希值；明文在您生成时仅显示一次。
- **可撤销。** 模态框列出每个活动连接，并带有 **Revoke**（撤销）按钮，以及一个 **Revoke all**（全部撤销）操作，可一次性终止所有连接。撤销会立即生效。
- **会过期。** 每个令牌在 90 天后停止工作；生成一个新令牌以继续使用。

如果您曾经将令牌粘贴到不该粘贴的地方，请打开模态框并点击 **Revoke**（撤销）——旧令牌会立即失效。

## 注意事项和限制

- 代理的编辑会像其他更改一样保存到您的项目中，因此您的正常撤销历史和自动保存仍然适用。
- 如果项目已链接到 [GitHub 同步](/docs/zh-cn/getting-started/github-sync/)，代理的编辑也会镜像到您的仓库（批量处理，因此编辑突发不会刷屏提交）。
- 编译、运行和读取串行监视器在浏览器中进行，因此在从您的代理驱动项目时，请保持 Velxio 标签页打开。
