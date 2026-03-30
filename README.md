# Illustrator MCP Skill

Adobe Illustratorでの看板・印刷物制作をサポートするClaude Desktop用スキル集です。

## これは何？

Claude Desktop（AIアシスタント）と連携して、Illustratorでの入稿前チェックや定型作業を自動化するツールです。
印刷・看板業界のプロデザイナーが、入稿ミスを減らし作業効率を上げるために使えます。

## 主な機能

### 1. チェックリスト作成（対話型）
Claudeと会話しながら、印刷会社・用途に合わせた入稿チェックリストを作成できます。
作ったチェックリストはファイルとして保存され、何度でも使い回せます。

### 2. 入稿前チェック（自動実行）
保存済みのチェックリストを使って、開いているIllustratorドキュメントを自動でチェックします。
- CMYKカラーモードの確認
- 塗り足し（印刷物3mm / 看板5mm）
- フォントのアウトライン化
- 画像の埋め込み状態
- 解像度（350dpi以上）

### 3. 定型作業の実行
「レイヤー整理」「ドキュメント情報」などのコマンドで、よく使う操作をすぐ実行できます。

## 必要なもの

- Adobe Illustrator（Creative Cloudサブスクリプション）
- Claude Desktop（Mac または Windows）
- [adb-mcp](https://github.com/nickchambers/adb-mcp)（Adobe連携用の非公式MCPサーバー）

## セットアップ

詳しい手順は [SETUP.md](./SETUP.md) をご覧ください。

## 使い方

### チェックリストを作る
Claude Desktopで以下のように話しかけてください：
```
入稿チェックリストを作りたい
```
Claudeが質問しながら、あなたの案件に合ったチェックリストを作成します。

### 入稿チェックを実行する
```
入稿チェックをやって
```
チェックリストを選択すると、Illustratorのドキュメントを自動でチェックします。

### 定型作業を実行する
```
レイヤー整理して
ドキュメント情報を教えて
アートボード一覧を見せて
```

## ファイル構成

```
illustrator-mcp-skill/
├── README.md           ← このファイル
├── SETUP.md            ← セットアップ手順
├── skills/             ← Claude用スキル定義
│   ├── il-checklist-builder.md
│   ├── il-preflight-check.md
│   └── il-routine-tasks.md
├── checklists/         ← チェックリスト（テンプレート＆実例）
│   ├── _template.md
│   ├── example-poster-A1.md
│   └── example-signboard.md
├── extendscript/       ← Illustrator操作用スクリプト
│   ├── check-document-info.jsx
│   ├── check-fonts.jsx
│   ├── check-links.jsx
│   └── check-colormode.jsx
└── docs/
    └── migration-guide.md  ← 公式MCP移行ガイド
```

## 印刷データの基本ルール

このスキルは以下のルールを前提としています：

| 項目 | ルール |
|------|--------|
| カラーモード | CMYK必須（RGB禁止） |
| 塗り足し | 印刷物：3mm / 看板：5mm |
| フォント | アウトライン化必須 |
| 画像 | 埋め込みのみ（リンク禁止） |
| 解像度 | 350dpi以上 |
| 単位 | mm固定 |

## 将来の展望

Adobe公式のMCP対応が発表された場合、ExtendScriptの部分を公式APIに差し替えるだけで
ロジックをそのまま使える設計にしています。詳しくは [移行ガイド](./docs/migration-guide.md) を参照してください。

## ライセンス

MIT License
