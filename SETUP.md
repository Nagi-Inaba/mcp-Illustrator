# セットアップ手順

Illustrator MCP Skillを使い始めるための手順を説明します。
パソコンの操作に慣れていなくても大丈夫です。ひとつずつ進めていきましょう。

## 前提条件

以下がすでにインストールされていることを確認してください：

- **Adobe Illustrator**（Creative Cloudサブスクリプション）
- **Claude Desktop**（[ダウンロードページ](https://claude.ai/download)からインストール）

## 手順1：adb-mcpをインストールする

adb-mcpは、Claude DesktopからIllustratorを操作するための橋渡し役です。

### Macの場合

1. ターミナルを開きます（Finder → アプリケーション → ユーティリティ → ターミナル）
2. 以下のコマンドを入力してEnterを押します：

```bash
git clone https://github.com/nickchambers/adb-mcp.git ~/adb-mcp
cd ~/adb-mcp
npm install
```

### Windowsの場合

1. コマンドプロンプトを開きます（スタートメニューで「cmd」と検索）
2. 以下のコマンドを入力してEnterを押します：

```cmd
git clone https://github.com/nickchambers/adb-mcp.git %USERPROFILE%\adb-mcp
cd %USERPROFILE%\adb-mcp
npm install
```

> **Node.jsが必要です**：もし `npm` コマンドが見つからないと言われたら、
> [Node.js公式サイト](https://nodejs.org/) からLTS版をインストールしてください。

## 手順2：Claude Desktopにadb-mcpを登録する

### Macの場合

1. Claude Desktopを開く
2. メニューバーから **Claude** → **Settings** → **Developer** → **Edit Config** を選択
3. 開いたファイル（`claude_desktop_config.json`）を以下のように編集して保存：

```json
{
  "mcpServers": {
    "adb-mcp": {
      "command": "node",
      "args": ["/Users/あなたのユーザー名/adb-mcp/server.js"],
      "env": {
        "ADB_MCP_APP": "illustrator"
      }
    }
  }
}
```

> `/Users/あなたのユーザー名/` の部分は、ご自分のユーザー名に置き換えてください。
> ターミナルで `whoami` と入力すれば確認できます。

### Windowsの場合

1. Claude Desktopを開く
2. メニューバーから **File** → **Settings** → **Developer** → **Edit Config** を選択
3. 開いたファイル（`claude_desktop_config.json`）を以下のように編集して保存：

```json
{
  "mcpServers": {
    "adb-mcp": {
      "command": "node",
      "args": ["C:\\Users\\あなたのユーザー名\\adb-mcp\\server.js"],
      "env": {
        "ADB_MCP_APP": "illustrator"
      }
    }
  }
}
```

## 手順3：Illustrator側のCEPパネルを設定する

adb-mcpはCEP（Common Extensibility Platform）パネルを通じてIllustratorと通信します。

1. adb-mcpのREADMEに記載されている手順に従って、CEPパネルをIllustratorにインストールします
2. Illustratorを再起動します
3. メニューから **ウィンドウ** → **エクステンション** → **adb-mcp** パネルが表示されることを確認します

## 手順4：スキルファイルをClaude Desktopに登録する

### 方法A：プロジェクトナレッジとして登録（推奨）

1. Claude Desktopで新しいプロジェクトを作成
2. プロジェクトの設定画面を開く
3. 「Project Knowledge」に以下のファイルの内容をそれぞれコピー＆ペーストする：
   - `skills/il-checklist-builder.md`
   - `skills/il-preflight-check.md`
   - `skills/il-routine-tasks.md`

### 方法B：会話の最初に貼り付ける

毎回の会話の最初に、使いたいスキルファイルの内容を貼り付けます。
手軽ですが、毎回貼り付ける手間がかかります。

## 手順5：動作確認

1. Illustratorを起動し、何かドキュメントを開く
2. Claude Desktopで「ドキュメント情報を教えて」と話しかける
3. ドキュメントの情報（サイズ、カラーモード等）が表示されればセットアップ完了！

## トラブルシューティング

### 「adb-mcpに接続できません」と言われる

- Illustratorが起動しているか確認してください
- CEPパネルが有効になっているか確認してください（ウィンドウ → エクステンション）
- Claude Desktopを再起動してみてください

### 「Node.jsが見つかりません」と言われる

- [Node.js公式サイト](https://nodejs.org/) からLTS版をインストールしてください
- インストール後、ターミナル/コマンドプロンプトを再起動してください

### ExtendScriptのエラーが出る

- Illustratorのバージョンが最新か確認してください
- ドキュメントが開いているか確認してください（ドキュメントなしでは動作しません）

## 次のステップ

セットアップが完了したら、Claude Desktopで以下のように話しかけてみましょう：

- 「入稿チェックリストを作りたい」→ チェックリスト作成を開始
- 「入稿チェックをやって」→ 自動チェックを実行
- 「レイヤー整理して」→ 定型作業を実行
