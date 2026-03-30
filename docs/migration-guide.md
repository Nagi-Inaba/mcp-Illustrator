# Adobe公式MCP移行ガイド

このドキュメントは、現在のadb-mcp（非公式）ベースの実装を、
将来のAdobe公式MCPに移行するための手順とポイントをまとめたものです。

## 現在のアーキテクチャ

```
Claude Desktop
  ↓ MCP Protocol
adb-mcp（非公式MCPサーバー）
  ↓ CEP Panel
ExtendScript
  ↓
Adobe Illustrator
```

## 公式MCP移行後の想定アーキテクチャ

```
Claude Desktop
  ↓ MCP Protocol
Adobe公式MCPサーバー
  ↓ UXP / 公式API
Adobe Illustrator
```

## 移行が必要なレイヤー

### 変更が必要

| コンポーネント | 現在 | 移行後 |
|---------------|------|--------|
| MCPサーバー | adb-mcp | Adobe公式MCPサーバー |
| スクリプト実行 | ExtendScript (CEP経由) | UXP または 公式API |
| 通信方式 | CEP Panel経由 | 公式プロトコル |

### 変更不要（そのまま使える）

| コンポーネント | 理由 |
|---------------|------|
| スキルファイル（skills/*.md） | Claude側のロジックのため、MCP実装に依存しない |
| チェックリスト（checklists/*.md） | 純粋なデータファイルのため影響なし |
| チェックロジックの構造 | JSON入出力の構造を維持すれば差し替え可能 |

## ExtendScriptの移行ポイント

各ExtendScriptファイルには `[MCP移行ポイント]` コメントが記載されています。
移行時はこのコメントを目印にしてください。

### check-document-info.jsx

```
[移行ポイント一覧]
1. スクリプト全体 → 公式APIのドキュメント情報取得メソッドに置き換え
2. bleed値の取得 → 公式APIでは直接取得が可能になる見込み
```

**出力JSONの維持すべき構造：**
```json
{
  "error": false,
  "colorMode": "CMYK",
  "widthMM": 594,
  "heightMM": 841,
  "bleed": { "top": 3, "bottom": 3, "left": 3, "right": 3 },
  "artboardCount": 1,
  "layerCount": 5,
  "rasterEffectResolution": 350,
  "colorModeOK": true
}
```

### check-fonts.jsx

```
[移行ポイント一覧]
1. スクリプト全体 → 公式APIのフォントチェックメソッドに置き換え
2. 不足フォント検出 → 公式APIで直接取得可能になる見込み
```

**出力JSONの維持すべき構造：**
```json
{
  "error": false,
  "allOutlined": true,
  "liveTextCount": 0,
  "textFrames": [],
  "usedFonts": [],
  "missingFonts": []
}
```

### check-links.jsx

```
[移行ポイント一覧]
1. スクリプト全体 → 公式APIのリンク画像チェックメソッドに置き換え
2. カラースペース取得 → 公式APIで取得方法が変わる可能性
3. 解像度取得 → 公式APIで直接取得可能になる見込み
```

**出力JSONの維持すべき構造：**
```json
{
  "error": false,
  "allEmbedded": true,
  "linkedCount": 0,
  "embeddedCount": 3,
  "missingCount": 0,
  "linkedImages": [],
  "embeddedImages": [],
  "missingLinks": []
}
```

### check-colormode.jsx

```
[移行ポイント一覧]
1. スクリプト全体 → 公式APIのカラーチェックメソッドに置き換え
2. RGB判定ロジック → 公式APIでも同様の構造で使える見込み
```

**出力JSONの維持すべき構造：**
```json
{
  "error": false,
  "documentColorMode": "CMYK",
  "documentIsCMYK": true,
  "rgbObjectCount": 0,
  "spotColorCount": 1,
  "spotColors": [],
  "hasRegistrationColor": false,
  "allOK": true
}
```

## 移行手順

### Step 1: 公式MCPサーバーの導入

1. Adobe公式MCPサーバーをインストール
2. Claude Desktopの `claude_desktop_config.json` を更新
3. adb-mcpの設定を公式MCPの設定に置き換え

### Step 2: ExtendScriptの移行

1. 各 `.jsx` ファイルの `[MCP移行ポイント]` を確認
2. 公式APIの対応メソッドに書き換え
3. **出力JSONの構造は変更しない**（スキルファイルとの互換性維持）
4. 単体テストで動作確認

### Step 3: スキルファイルの微調整

スキルファイル自体の変更は最小限で済むはずですが、以下を確認：

1. adb-mcp固有の呼び出し方法（CEP経由のExtendScript実行）が記述されている箇所を修正
2. 公式MCPのツール名・メソッド名に合わせてスキル内の参照を更新
3. 新しいAPIで追加された機能があれば、チェック項目を拡充

### Step 4: テスト

1. 各ExtendScriptの単体テスト
2. スキルからの統合テスト
3. 実際の入稿データでの動作確認

## 互換性を維持するための設計原則

1. **JSON入出力の構造を固定する**：ExtendScriptの実装が変わっても、出力するJSONの構造を同じにすれば、スキルファイル側の変更は不要
2. **ロジックとI/Oを分離する**：チェックのロジック（何をOK/NGとするか）はスキルファイル側に、データ取得はExtendScript側に分離
3. **エラーハンドリングの統一**：エラー時は必ず `{ "error": true, "message": "..." }` の形式で返す

## 注意事項

- Adobe公式MCPの仕様は2025年3月時点で未発表です。実際の仕様が判明し次第、このガイドを更新してください
- 公式MCPでは、ExtendScript以外のスクリプト言語（UXPのJavaScript等）が使える可能性があります
- 公式APIでは、現在ExtendScriptで取得できない情報（正確な解像度、bleed値等）が直接取得できるようになる可能性があります
