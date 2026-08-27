---
title: Claude CodeまたはCodexを接続する
description: 保存したプロジェクトを、MCPを介して自分のAIエージェント（Claude Code / Codex）で操作します。回路を組み立て、ファームウェアをキャンバス上にライブで書き込みます。
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

Velxioに組み込まれている[エージェントモード](/docs/ja/ai/agent-mode/)は、アシスタントをアプリ
_内_ で実行します。**Connect AI agent** はその逆で、ターミナル内の自分のエージェント
（**Claude Code** または **OpenAI Codex**）が、保存されたVelxioプロジェクトにアクセスして
構築できるようにします。回路とコードは数秒以内にキャンバス上に表示され、アプリ内エージェントが
実行した場合とまったく同じように動作します。

これは[MCP](https://modelcontextprotocol.io)（Model Context Protocol）を介して動作します。
Velxioは回路とコードのツールをMCPサーバーとして公開し、プロジェクトごとのトークンを使って
エージェントをそこに向けます。

![Connect AI agentモーダル。Claude Code / Codexタブ、セットアップコマンド、アクティブな接続を示す](../../../../assets/docs/ai/connect-agent.png)

:::note
外部エージェントの接続は**Pro**機能です。FreeプランとMakerプランでは、代わりにアプリ内の
[エージェント](/docs/ja/ai/agent-mode/)モードと[チューター](/docs/ja/ai/tutor-mode/)モードを
使用します。[プラン](/docs/ja/getting-started/plans/)を参照してください。
:::

## 最も簡単な方法：Claude Codeプラグイン

Claude Codeを使用している場合は、プラグインをインストールしてください。ツール、`/velxio:build`
コマンド、配線のノウハウが1つのステップで導入されます。

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

次に、トークンを生成し（以下の手順）、エクスポートして、Claude Codeを再起動します。

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...your token..."
```

これで、`/velxio:build an HC-SR04 that prints distance over serial` を実行すると、すべてが完了します。
`/velxio:check` は、既存の内容を検証してコンパイルします。

## 手動で接続する（3つのステップ）

1. **最初にプロジェクトを保存します。** エージェントは保存されたプロジェクトに接続するため、
   まだの場合はプロジェクトに名前を付けて保存してください。
2. **コネクタを開きます。** エディタで、**File → Connect AI agent (Claude/Codex)** に移動し、
   **Claude Code** または **Codex CLI** タブを選択して、**Generate connection token** をクリックします。
3. **表示される1行のセットアップコマンド**をターミナルで実行します。

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_your_token_here"
   ```

   **Codex** — `~/.codex/config.toml` に追加します。

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_your_token_here" }
   ```

これで完了です。`claude`（または `codex`）を起動して、何か構築するように依頼します。

> _"Using the velxio tools, wire an HC-SR04 to the board and write the
> firmware that prints the distance over serial."_

エージェントが最初の呼び出しを行うと、モーダルのステータス行が**Connected**に変わり、
部品、配線、コードがキャンバス上にライブで表示されます。

## エージェントができること

エージェントは、アプリ内エージェントと同じツールセットを取得します。プロジェクトの読み取り、
コンポーネントの追加と配線、ボードの追加、ブレッドボードへの部品の配置、スケッチの作成と編集、
回路の検証ができます。また、Velxioのコンポーネントごとの**スキル**（正確なピン名、配線レシピ、
シミュレーターの注意点）も備えているため、推測ではなく、SSD1306やDHT22を正しく配線できます。

さらに、**コンパイル**もできます。`compile_sketch` はVelxioサーバー上でファームウェアをビルドし、
コンパイラの出力をエージェントに渡すため、ビルドできないコードを伝える代わりに、エージェント自身が
自分のミスを修正できます。シミュレーションの実行とシリアルモニターの読み取りは、ブラウザのライブ
エミュレーターで行う必要があります。ビルドが成功したら、Velxioで**Run**を押してください。

## トークンなしでサインインする

OAuthに対応したクライアント（Claude Codeを含む）は、貼り付けたトークンの代わりにVelxioアカウントで
接続できます。認証情報なしで `https://velxio.dev/api/pro/mcp` を指定すると、ログインフローを検出し、
ブラウザを開いて承認を求めます。同意画面にはクライアント名とアカウント名が表示され、受け取った
アクセストークンはVelxioのMCPエンドポイントにのみバインドされます。

トークンは依然として最も簡単な方法であり、その仕組みに変更はありません。

## セキュリティ

接続トークンは、サードパーティのCLIに貼り付けるように設計された、**範囲が限定されたプロジェクト固有の
権限**です。

- **1つのプロジェクトに限定。** トークンは、発行された単一のプロジェクトにのみアクセスできます。
  他のプロジェクトやアカウントには決してアクセスできません。
- **ハッシュ化して保存、一度だけ表示。** Velxioはトークンのハッシュのみを保持します。
  平文は生成時に一度だけ表示されます。
- **失効可能。** モーダルには、すべてのライブ接続と**Revoke**ボタンが一覧表示され、
  **Revoke all**アクションで一度にすべてを無効化できます。失効は即座に有効になります。
- **有効期限。** すべてのトークンは90日後に失効します。継続するには新しいトークンを生成してください。

トークンを誤って貼り付けてしまった場合は、モーダルを開いて**Revoke**を押してください。
押した瞬間に古いトークンは無効になります。

## 注意事項と制限

- エージェントによる編集は、他の変更と同様にプロジェクトに保存されるため、通常の元に戻す履歴と
  自動保存が適用されます。
- プロジェクトが[GitHub Sync](/docs/ja/getting-started/github-sync/)にリンクされている場合、
  エージェントの編集はリポジトリにもミラーリングされます（バッチ処理されるため、編集のバーストが
  コミットを大量に生成することはありません）。
- コンパイル、実行、シリアルモニターの読み取りはブラウザで行われるため、エージェントからプロジェクトを
  操作している間はVelxioタブを開いたままにしてください。

----- END PAGE -----
