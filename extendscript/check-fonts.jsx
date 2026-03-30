/**
 * check-fonts.jsx
 * Illustratorドキュメントのフォント状態をチェックするExtendScript
 *
 * チェック項目：
 * - アウトライン化されていないテキストフレームの一覧
 * - 使用中のフォント一覧
 * - 不足フォントの一覧
 *
 * [MCP移行ポイント] 公式MCP対応時は、このスクリプト全体を
 * 公式APIのフォントチェックメソッドに置き換えてください。
 * 出力のJSON構造はそのまま維持してください。
 */

(function () {
    // ドキュメントが開いているか確認
    if (app.documents.length === 0) {
        return JSON.stringify({
            error: true,
            message: "ドキュメントが開いていません。Illustratorでドキュメントを開いてから再実行してください。"
        });
    }

    var doc = app.activeDocument;

    // テキストフレームの検出
    var textFrames = [];
    var liveTextCount = 0;

    // すべてのテキストフレームを走査
    for (var i = 0; i < doc.textFrames.length; i++) {
        var tf = doc.textFrames[i];
        var layerName = "";
        try {
            layerName = tf.layer.name;
        } catch (e) {
            layerName = "不明";
        }

        textFrames.push({
            index: i + 1,
            content: tf.contents.substring(0, 50) + (tf.contents.length > 50 ? "..." : ""),
            layer: layerName,
            fontName: tf.textRange.characterAttributes.textFont.name
        });
        liveTextCount++;
    }

    // 使用中フォントの一覧
    var usedFonts = [];
    var fontDict = {};

    for (var j = 0; j < doc.textFrames.length; j++) {
        var frame = doc.textFrames[j];
        for (var k = 0; k < frame.textRanges.length; k++) {
            var range = frame.textRanges[k];
            try {
                var fontName = range.characterAttributes.textFont.name;
                if (!fontDict[fontName]) {
                    fontDict[fontName] = true;
                    usedFonts.push(fontName);
                }
            } catch (e) {
                // フォント情報取得失敗（不足フォントの可能性）
            }
        }
    }

    // 不足フォントの検出
    // [MCP移行ポイント] ExtendScriptでの不足フォント検出は間接的な方法を使用。
    // 公式APIでは直接的な不足フォント一覧取得が可能になる可能性が高い。
    var missingFonts = [];
    try {
        // Illustratorはドキュメントを開いたときに不足フォントを内部で管理している
        // テキストフレームのフォント参照で例外が発生するものを不足フォントとみなす
        for (var m = 0; m < doc.textFrames.length; m++) {
            var tf2 = doc.textFrames[m];
            for (var n = 0; n < tf2.textRanges.length; n++) {
                try {
                    var testFont = tf2.textRanges[n].characterAttributes.textFont;
                    // フォントファミリーへのアクセスを試みる
                    var family = testFont.family;
                } catch (fontErr) {
                    var missingName = "不明なフォント（テキスト: " +
                        tf2.contents.substring(0, 30) + "）";
                    missingFonts.push(missingName);
                    break; // 同一フレーム内は1回だけ報告
                }
            }
        }
    } catch (e) {
        // 不足フォント検出中にエラー
    }

    // アウトライン化の判定
    var allOutlined = (liveTextCount === 0);

    // 結果をJSONで出力
    var result = {
        error: false,
        allOutlined: allOutlined,
        liveTextCount: liveTextCount,
        textFrames: textFrames,
        usedFonts: usedFonts,
        missingFonts: missingFonts,
        summary: allOutlined
            ? "すべてのフォントがアウトライン化されています。"
            : liveTextCount + "個のテキストフレームがアウトライン化されていません。"
    };

    return JSON.stringify(result);
})();
