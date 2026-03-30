# Illustrator入稿チェックツール 導入ガイド

**（友人向け・非エンジニア向けの手順書）**

---

こんにちは！
このツールを使うと、Claude（AI）がIllustratorと連携して、
入稿前のチェック作業を自動でやってくれるようになります。

「フォントのアウトライン忘れ」「RGB画像の混入」「リンク画像の埋め込み漏れ」
...こういう入稿ミスを、AIが一発で見つけてくれます。

セットアップは少し手順がありますが、一度やれば終わりです。
上から順番にやっていけば大丈夫！

---

## 全体の流れ（所要時間：30〜60分）

```
Step 0  必要なアプリを揃える
Step 1  Node.jsをインストールする
Step 2  adb-mcp（橋渡し役）をインストールする
Step 3  Illustrator側の設定をする
Step 4  Claude Desktopの設定をする
Step 5  スキルファイルをClaudeに読み込ませる
Step 6  動作確認！
```

---

## Step 0：必要なアプリを揃える

以下の2つが入っていることを確認してください。

### Adobe Illustrator
いつも使ってるやつでOK。Creative Cloudサブスクリプションで入れてるはず。

### Claude Desktop
まだ入れてない場合はここからダウンロード：
https://claude.ai/download

Mac版とWindows版があるので、自分のパソコンに合ったほうをインストールしてね。
（スマホ版のClaudeアプリでは使えません。パソコン版が必要です）

---

## Step 1：Node.jsをインストールする

Node.jsは「裏方のプログラム実行環境」です。
自分で何かプログラムを書く必要はないけど、ツールの動作に必要です。

### ダウンロード

https://nodejs.org/ja

ページを開くと「LTS（推奨版）」と書かれたボタンがあるので、それをクリック。
ダウンロードしたファイルを開いて、画面の指示に従ってインストールしてね。
（全部「次へ」でOK）

### インストールできたか確認

**Macの場合：**
1. 「ターミナル」を開く（Finderで アプリケーション → ユーティリティ → ターミナル）
2. 以下を入力してEnter：
```
node --version
```

**Windowsの場合：**
1. スタートメニューで「cmd」と検索して「コマンドプロンプト」を開く
2. 以下を入力してEnter：
```
node --version
```

`v20.xx.x` みたいなバージョン番号が出ればOK！

---

## Step 2：adb-mcpをインストールする

adb-mcpは「ClaudeとIllustratorの橋渡し役」です。
これがないとClaudeがIllustratorを操作できません。

### Macの場合

ターミナルで以下を**1行ずつ**入力してEnter：

```bash
git clone https://github.com/nickchambers/adb-mcp.git ~/adb-mcp
```
```bash
cd ~/adb-mcp
```
```bash
npm install
```

> もし `git` が見つからないと言われたら、
> 「Xcodeコマンドラインツールをインストールしますか？」と聞かれるので「インストール」を押してね。

### Windowsの場合

コマンドプロンプトで以下を**1行ずつ**入力してEnter：

```cmd
git clone https://github.com/nickchambers/adb-mcp.git %USERPROFILE%\adb-mcp
```
```cmd
cd %USERPROFILE%\adb-mcp
```
```cmd
npm install
```

> `git` が見つからない場合は https://git-scm.com/ からGitをインストールしてね。

`npm install` のあと、いろいろ文字が流れますが、最後に赤い「ERROR」がなければ成功です。

---

## Step 3：Illustrator側の設定をする

adb-mcpにはCEPパネル（Illustratorの拡張機能）が必要です。

1. adb-mcpのフォルダ（さっきダウンロードした `adb-mcp`）の中を確認
2. READMEに書かれている手順に従って、CEPパネルをIllustratorにインストール
3. Illustratorを**再起動**する
4. メニューの **ウィンドウ → エクステンション** を開いて **adb-mcp** が表示されていればOK

---

## Step 4：Claude Desktopの設定をする

ClaudeがIllustratorと通信するための設定です。ここが一番大事！

### まず自分のユーザー名を確認

**Macの場合：** ターミナルで `whoami` と入力してEnter → 表示された名前がユーザー名
**Windowsの場合：** コマンドプロンプトで `echo %USERNAME%` と入力してEnter

この名前をメモしておいてね。

### 設定ファイルを編集

1. Claude Desktopを開く
2. 設定画面を開く：
   - **Mac：** メニューバーの Claude → Settings → Developer → Edit Config
   - **Windows：** メニューバーの File → Settings → Developer → Edit Config
3. テキストエディタで設定ファイルが開くので、中身を**すべて消して**以下を貼り付ける：

**Macの場合：**
```json
{
  "mcpServers": {
    "adb-mcp": {
      "command": "node",
      "args": ["/Users/ここにユーザー名/adb-mcp/server.js"],
      "env": {
        "ADB_MCP_APP": "illustrator"
      }
    }
  }
}
```

**Windowsの場合：**
```json
{
  "mcpServers": {
    "adb-mcp": {
      "command": "node",
      "args": ["C:\\Users\\ここにユーザー名\\adb-mcp\\server.js"],
      "env": {
        "ADB_MCP_APP": "illustrator"
      }
    }
  }
}
```

4. `ここにユーザー名` の部分を、さっき確認した自分のユーザー名に書き換える
5. 保存して閉じる
6. **Claude Desktopを再起動する**（一度完全に終了して、もう一度開く）

### 確認ポイント

> 設定ファイルを書き換えるとき、よくあるミス：
> - カンマ(`,`)やコロン(`:`)の消し忘れ・付け忘れ
> - `"` が全角（"）になっている → 半角（"）にする
> - Windowsのパスは `\\`（バックスラッシュ2つ）が必要
>
> うまくいかないときは、もう一度正確にコピペし直してみてね。

---

## Step 5：スキルファイルをClaudeに読み込ませる

ここまでで「ClaudeがIllustratorを操作できる」状態になりました。
次に「何をチェックするか」のルールをClaudeに教えます。

### GitHubからファイルを取得

以下のページにアクセスしてください：
https://github.com/nagi-inaba/mcp-illustrator

`skills/` フォルダの中に3つのファイルがあります：

| ファイル | 役割 |
|---------|------|
| `il-checklist-builder.md` | チェックリスト作成（対話型） |
| `il-preflight-check.md` | 入稿前チェック実行 |
| `il-routine-tasks.md` | レイヤー整理などの定型作業 |

### Claude Desktopに登録する（推奨：プロジェクト機能を使う方法）

1. Claude Desktopを開く
2. 左サイドバーの「Projects」から**新しいプロジェクトを作成**
3. プロジェクト名を「Illustrator入稿チェック」などわかりやすい名前にする
4. プロジェクト設定画面で **「Project Knowledge」** を開く
5. 上の3ファイルの内容を**それぞれ**コピー＆ペーストして追加する

> やり方：GitHubでファイルをクリック → 中身が表示される → 右上の「Raw」ボタンを押す → 全選択(Ctrl+A / Cmd+A) → コピー(Ctrl+C / Cmd+C) → Claude DesktopのProject Knowledgeにペースト

これで、このプロジェクト内での会話ではClaudeが自動的にスキルを使えるようになります。

---

## Step 6：動作確認！

ここまで来たら、あとは試すだけ！

1. **Illustrator**を起動して、何かドキュメントを開く
2. **Claude Desktop**で、さっき作ったプロジェクトを開く
3. Claudeに話しかける：

```
ドキュメント情報を教えて
```

ドキュメントのサイズ、カラーモード、レイヤー数などが返ってきたら**セットアップ成功**！

---

## 使い方かんたんガイド

セットアップが終わったら、あとはClaudeに話しかけるだけ。

### 入稿チェックリストを作る

```
入稿チェックリストを作りたい
```
→ Claudeが「印刷会社は？」「サイズは？」と順番に聞いてくれるので、答えていくだけ。
  案件ごとのチェックリストが完成します。

### 入稿前チェックを実行する

```
入稿チェックをやって
```
→ Illustratorで開いているドキュメントを自動でチェック。
  CMYK、フォント、画像埋め込み、塗り足し...全部まとめてOK/NGで教えてくれます。

### よく使う定型作業

| 話しかけ方 | やってくれること |
|-----------|----------------|
| 「レイヤー整理して」 | 空レイヤー・非表示レイヤーを見つけて整理 |
| 「アートボード一覧を見せて」 | 全アートボードのサイズ一覧 |
| 「孤立点を消して」 | ゴミの孤立点を検出＆削除 |
| 「スウォッチ整理して」 | 未使用スウォッチを検出＆削除 |
| 「オーバープリント確認して」 | 意図しないOPがないかチェック |

---

## うまくいかないとき

### Claudeが「Illustratorに接続できません」と言う

- Illustratorは起動してる？ドキュメントは開いてる？
- Illustratorの ウィンドウ → エクステンション → adb-mcp は表示されてる？
- Claude Desktopを再起動してみて

### 設定ファイルを保存したのに反映されない

- Claude Desktopを**完全に終了**してから再起動した？
  - Mac：Dockのアイコンを右クリック → 終了
  - Windows：タスクバーの通知領域からも終了する

### 「node が見つかりません」と言われる

- Step 1のNode.jsインストールをやり直してみて
- インストール後、ターミナル/コマンドプロンプトを**新しく開き直す**必要がある

### それでもダメなとき

スクリーンショットを撮って送ってくれれば、一緒に見るよ！

---

## チェックリストのサンプル

リポジトリの `checklists/` フォルダにサンプルが入っています：

- **example-poster-A1.md** — A1ポスター（ラクスル入稿）のチェックリスト
- **example-signboard.md** — 屋外看板（アルミ複合板）のチェックリスト

これを参考にして、自分の案件に合わせたチェックリストをClaudeと一緒に作ってみてね。

---

*わからないことがあったらいつでも聞いてね！*
