/**
 * check-links.jsx
 * Illustratorドキュメントのリンク画像状態をチェックするExtendScript
 *
 * チェック項目：
 * - 埋め込まれていないリンク画像の一覧
 * - 不足しているリンクファイルの一覧
 * - 各画像の解像度情報
 *
 * [MCP移行ポイント] 公式MCP対応時は、このスクリプト全体を
 * 公式APIのリンク画像チェックメソッドに置き換えてください。
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

    // 配置画像の一覧と状態チェック
    var linkedImages = [];   // 埋め込まれていないリンク画像
    var embeddedImages = []; // 埋め込み済み画像
    var missingLinks = [];   // リンク切れ画像
    var lowResImages = [];   // 低解像度画像

    // PlacedItems（リンク画像）のチェック
    for (var i = 0; i < doc.placedItems.length; i++) {
        var item = doc.placedItems[i];
        var info = {
            index: i + 1,
            name: "",
            filePath: "",
            layer: ""
        };

        try {
            info.layer = item.layer.name;
        } catch (e) {
            info.layer = "不明";
        }

        try {
            info.name = item.file.name;
            info.filePath = item.file.fsName;

            // ファイルが存在するかチェック
            if (!item.file.exists) {
                missingLinks.push({
                    name: info.name,
                    filePath: info.filePath,
                    layer: info.layer
                });
            }
        } catch (e) {
            // ファイル参照エラー = リンク切れ
            info.name = "リンク切れ";
            info.filePath = "参照先不明";
            missingLinks.push({
                name: info.name,
                filePath: info.filePath,
                layer: info.layer
            });
        }

        linkedImages.push(info);
    }

    // RasterItems（ラスター画像）のチェック
    // ※ 埋め込み画像はRasterItemとして扱われる
    for (var j = 0; j < doc.rasterItems.length; j++) {
        var raster = doc.rasterItems[j];
        var rasterInfo = {
            index: j + 1,
            layer: "",
            embedded: false,
            colorSpace: "",
            resolution: { horizontal: 0, vertical: 0 }
        };

        try {
            rasterInfo.layer = raster.layer.name;
        } catch (e) {
            rasterInfo.layer = "不明";
        }

        // 埋め込み状態の確認
        rasterInfo.embedded = raster.embedded;

        // カラースペースの確認
        // [MCP移行ポイント] カラースペースの取得方法が公式APIで変わる可能性あり
        try {
            switch (raster.imageColorSpace) {
                case ImageColorSpace.CMYK:
                    rasterInfo.colorSpace = "CMYK";
                    break;
                case ImageColorSpace.RGB:
                    rasterInfo.colorSpace = "RGB";
                    break;
                case ImageColorSpace.GrayScale:
                    rasterInfo.colorSpace = "Grayscale";
                    break;
                default:
                    rasterInfo.colorSpace = "その他";
            }
        } catch (e) {
            rasterInfo.colorSpace = "取得不可";
        }

        // 解像度の計算（配置サイズとピクセル数から推定）
        // [MCP移行ポイント] 解像度の直接取得が公式APIで可能になる可能性が高い
        try {
            // ポイント単位の配置サイズ
            var placedWidthPt = raster.boundingBox[2] - raster.boundingBox[0];
            var placedHeightPt = Math.abs(raster.boundingBox[3] - raster.boundingBox[1]);

            // インチに変換（1inch = 72pt）
            var placedWidthInch = placedWidthPt / 72;
            var placedHeightInch = placedHeightPt / 72;

            if (placedWidthInch > 0 && placedHeightInch > 0) {
                // ピクセル数が取得できないため、matrix情報から推定
                var hRes = Math.round(raster.matrix.mValueA * 72);
                var vRes = Math.round(Math.abs(raster.matrix.mValueD) * 72);
                rasterInfo.resolution.horizontal = hRes > 0 ? hRes : "推定不可";
                rasterInfo.resolution.vertical = vRes > 0 ? vRes : "推定不可";
            }
        } catch (e) {
            rasterInfo.resolution.horizontal = "計算エラー";
            rasterInfo.resolution.vertical = "計算エラー";
        }

        if (rasterInfo.embedded) {
            embeddedImages.push(rasterInfo);
        } else {
            linkedImages.push({
                index: linkedImages.length + 1,
                name: "ラスター画像（非埋め込み）",
                filePath: "不明",
                layer: rasterInfo.layer
            });
        }
    }

    // 全画像が埋め込み済みかどうか
    var allEmbedded = (linkedImages.length === 0);

    // 結果をJSONで出力
    var result = {
        error: false,
        allEmbedded: allEmbedded,
        linkedCount: linkedImages.length,
        embeddedCount: embeddedImages.length,
        missingCount: missingLinks.length,
        linkedImages: linkedImages,
        embeddedImages: embeddedImages,
        missingLinks: missingLinks,
        summary: allEmbedded
            ? "すべての画像が埋め込み済みです。"
            : linkedImages.length + "個のリンク画像が見つかりました。埋め込みが必要です。"
    };

    return JSON.stringify(result);
})();
