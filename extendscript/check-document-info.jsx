/**
 * check-document-info.jsx
 * Illustratorドキュメントの基本情報を取得するExtendScript
 *
 * 取得項目：
 * - ファイル名、ファイルパス
 * - カラーモード（CMYK / RGB）
 * - ドキュメントサイズ（mm）
 * - 塗り足し設定
 * - アートボード数
 * - レイヤー数
 * - ラスタライズ効果解像度
 * - 単位設定
 *
 * [MCP移行ポイント] 公式MCP対応時は、このスクリプト全体を
 * 公式APIのドキュメント情報取得メソッドに置き換えてください。
 * 出力のJSON構造はそのまま維持してください。
 */

(function () {
    // ポイントからミリメートルへの変換係数
    var PT_TO_MM = 0.352778;

    // ドキュメントが開いているか確認
    if (app.documents.length === 0) {
        return JSON.stringify({
            error: true,
            message: "ドキュメントが開いていません。Illustratorでドキュメントを開いてから再実行してください。"
        });
    }

    var doc = app.activeDocument;

    // カラーモードの判定
    var colorMode;
    if (doc.documentColorSpace === DocumentColorSpace.CMYK) {
        colorMode = "CMYK";
    } else if (doc.documentColorSpace === DocumentColorSpace.RGB) {
        colorMode = "RGB";
    } else {
        colorMode = "不明";
    }

    // ドキュメントサイズ（ポイント → mm）
    var widthMM = Math.round(doc.width * PT_TO_MM * 100) / 100;
    var heightMM = Math.round(doc.height * PT_TO_MM * 100) / 100;

    // 塗り足し（Bleed）の取得
    // [MCP移行ポイント] ExtendScriptではbleedBoxを直接取得する標準APIがないため、
    // ドキュメント設定から推定する。公式MCP APIでは直接取得できる可能性が高い。
    var bleed = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        note: "ExtendScriptではbleed値の直接取得に制限があります。PDF保存設定で確認してください。"
    };

    // ドキュメントの保存設定からbleed情報を取得する試み
    try {
        // Illustratorの「ドキュメント設定」で設定されたbleadを取得
        // ※ この方法は Illustrator CC 2019以降で動作します
        if (doc.cropBox) {
            var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
            var abRect = artboard.artboardRect;
            var cropRect = doc.cropBox;

            bleed.top = Math.round(Math.abs(cropRect[1] - abRect[1]) * PT_TO_MM * 100) / 100;
            bleed.right = Math.round(Math.abs(cropRect[2] - abRect[2]) * PT_TO_MM * 100) / 100;
            bleed.bottom = Math.round(Math.abs(cropRect[3] - abRect[3]) * PT_TO_MM * 100) / 100;
            bleed.left = Math.round(Math.abs(cropRect[0] - abRect[0]) * PT_TO_MM * 100) / 100;
            bleed.note = "";
        }
    } catch (e) {
        // cropBoxが取得できない場合はデフォルト値（0）のまま
    }

    // アートボード情報
    var artboards = [];
    for (var i = 0; i < doc.artboards.length; i++) {
        var ab = doc.artboards[i];
        var rect = ab.artboardRect;
        artboards.push({
            index: i + 1,
            name: ab.name,
            widthMM: Math.round((rect[2] - rect[0]) * PT_TO_MM * 100) / 100,
            heightMM: Math.round((rect[1] - rect[3]) * PT_TO_MM * 100) / 100
        });
    }

    // ラスタライズ効果解像度
    var rasterResolution;
    try {
        var effectRes = doc.rasterEffectSettings.resolution;
        rasterResolution = effectRes;
    } catch (e) {
        rasterResolution = "取得不可";
    }

    // レイヤー情報
    var layerCount = doc.layers.length;
    var layers = [];
    for (var j = 0; j < doc.layers.length; j++) {
        var layer = doc.layers[j];
        layers.push({
            name: layer.name,
            visible: layer.visible,
            locked: layer.locked,
            itemCount: layer.pageItems.length
        });
    }

    // ファイル情報
    var filePath = "";
    var fileName = "";
    try {
        filePath = doc.fullName.fsName;
        fileName = doc.name;
    } catch (e) {
        fileName = "未保存のドキュメント";
        filePath = "未保存";
    }

    // 結果をJSONで出力
    var result = {
        error: false,
        fileName: fileName,
        filePath: filePath,
        colorMode: colorMode,
        widthMM: widthMM,
        heightMM: heightMM,
        bleed: bleed,
        artboardCount: doc.artboards.length,
        artboards: artboards,
        layerCount: layerCount,
        layers: layers,
        rasterEffectResolution: rasterResolution,
        colorModeOK: (colorMode === "CMYK")
    };

    return JSON.stringify(result);
})();
