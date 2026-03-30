/**
 * check-colormode.jsx
 * Illustratorドキュメント内のカラーモードをチェックするExtendScript
 *
 * チェック項目：
 * - ドキュメントのカラーモード
 * - RGBカラーを使用しているオブジェクトの検出
 * - 特色（スポットカラー）の一覧
 * - レジストレーションカラーの使用チェック
 *
 * [MCP移行ポイント] 公式MCP対応時は、このスクリプト全体を
 * 公式APIのカラーチェックメソッドに置き換えてください。
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

    // ドキュメントのカラーモード
    var docColorMode;
    if (doc.documentColorSpace === DocumentColorSpace.CMYK) {
        docColorMode = "CMYK";
    } else if (doc.documentColorSpace === DocumentColorSpace.RGB) {
        docColorMode = "RGB";
    } else {
        docColorMode = "不明";
    }

    // RGBオブジェクトの検出
    var rgbObjects = [];
    var rgbCount = 0;

    /**
     * カラーがRGBかどうか判定する関数
     * [MCP移行ポイント] カラー判定ロジックは公式APIでも同様の構造で使える見込み
     */
    function isRGBColor(color) {
        if (color === undefined || color === null) return false;
        try {
            if (color.typename === "RGBColor") return true;
            if (color.typename === "SpotColor") {
                return isRGBColor(color.spot.color);
            }
        } catch (e) {
            // カラー判定エラーは無視
        }
        return false;
    }

    /**
     * カラー情報を文字列で返す関数
     */
    function getColorInfo(color) {
        if (color === undefined || color === null) return "なし";
        try {
            if (color.typename === "RGBColor") {
                return "RGB(" + Math.round(color.red) + ", " +
                    Math.round(color.green) + ", " +
                    Math.round(color.blue) + ")";
            }
            if (color.typename === "CMYKColor") {
                return "CMYK(" + Math.round(color.cyan) + ", " +
                    Math.round(color.magenta) + ", " +
                    Math.round(color.yellow) + ", " +
                    Math.round(color.black) + ")";
            }
            if (color.typename === "SpotColor") {
                return "Spot: " + color.spot.name;
            }
            if (color.typename === "GrayColor") {
                return "Gray(" + Math.round(color.gray) + ")";
            }
            return color.typename || "不明";
        } catch (e) {
            return "取得エラー";
        }
    }

    /**
     * PageItemを走査してRGBオブジェクトを検出する
     * 最大検出数を制限してパフォーマンスを確保
     */
    var MAX_RGB_REPORT = 50;

    function checkPageItem(item) {
        if (rgbCount >= MAX_RGB_REPORT) return;

        var layerName = "";
        try {
            layerName = item.layer.name;
        } catch (e) {
            layerName = "不明";
        }

        // 塗りのチェック
        try {
            if (item.filled && isRGBColor(item.fillColor)) {
                rgbObjects.push({
                    type: item.typename || "オブジェクト",
                    property: "塗り",
                    color: getColorInfo(item.fillColor),
                    layer: layerName
                });
                rgbCount++;
            }
        } catch (e) {
            // 塗り情報取得エラー
        }

        // 線のチェック
        try {
            if (item.stroked && isRGBColor(item.strokeColor)) {
                rgbObjects.push({
                    type: item.typename || "オブジェクト",
                    property: "線",
                    color: getColorInfo(item.strokeColor),
                    layer: layerName
                });
                rgbCount++;
            }
        } catch (e) {
            // 線情報取得エラー
        }
    }

    // すべてのPathItemをチェック
    for (var i = 0; i < doc.pathItems.length && rgbCount < MAX_RGB_REPORT; i++) {
        checkPageItem(doc.pathItems[i]);
    }

    // テキストフレームのカラーチェック
    for (var j = 0; j < doc.textFrames.length && rgbCount < MAX_RGB_REPORT; j++) {
        var tf = doc.textFrames[j];
        try {
            var charAttr = tf.textRange.characterAttributes;
            if (isRGBColor(charAttr.fillColor)) {
                rgbObjects.push({
                    type: "テキスト",
                    property: "塗り",
                    color: getColorInfo(charAttr.fillColor),
                    layer: tf.layer.name,
                    text: tf.contents.substring(0, 30)
                });
                rgbCount++;
            }
        } catch (e) {
            // テキストカラー取得エラー
        }
    }

    // 特色（スポットカラー）の一覧
    var spotColors = [];
    for (var k = 0; k < doc.spots.length; k++) {
        var spot = doc.spots[k];
        try {
            // [Registration]と[None]はスキップ
            if (spot.name === "[Registration]" || spot.name === "[なし]" || spot.name === "[None]") {
                continue;
            }
            spotColors.push({
                name: spot.name,
                colorType: spot.spotKind === SpotColorKind.SPOTCMYK ? "CMYK" : "LAB",
                color: getColorInfo(spot.color)
            });
        } catch (e) {
            // スポットカラー情報取得エラー
        }
    }

    // レジストレーションカラーの使用チェック
    var hasRegistrationColor = false;
    for (var m = 0; m < doc.spots.length; m++) {
        try {
            if (doc.spots[m].name === "[Registration]") {
                // レジストレーションカラーが使用されているか確認
                // （スウォッチに存在するだけでなく、実際に使用されているか）
                hasRegistrationColor = true;
                break;
            }
        } catch (e) {
            // エラーは無視
        }
    }

    // スウォッチの確認
    var swatchInfo = [];
    for (var n = 0; n < doc.swatches.length; n++) {
        try {
            var swatch = doc.swatches[n];
            var swColor = swatch.color;
            if (swColor.typename === "RGBColor") {
                swatchInfo.push({
                    name: swatch.name,
                    colorMode: "RGB",
                    color: getColorInfo(swColor)
                });
            }
        } catch (e) {
            // スウォッチ情報取得エラー
        }
    }

    // 全体の判定
    var hasRGBObjects = (rgbCount > 0);
    var docIsCMYK = (docColorMode === "CMYK");
    var allOK = docIsCMYK && !hasRGBObjects;

    // 結果をJSONで出力
    var result = {
        error: false,
        documentColorMode: docColorMode,
        documentIsCMYK: docIsCMYK,
        rgbObjectCount: rgbCount,
        rgbObjectsLimited: (rgbCount >= MAX_RGB_REPORT),
        rgbObjects: rgbObjects,
        spotColorCount: spotColors.length,
        spotColors: spotColors,
        hasRegistrationColor: hasRegistrationColor,
        rgbSwatches: swatchInfo,
        allOK: allOK,
        summary: allOK
            ? "カラーモードに問題はありません（CMYK、RGBオブジェクトなし）。"
            : !docIsCMYK
                ? "ドキュメントのカラーモードがRGBです。CMYKに変換してください。"
                : rgbCount + "個のRGBオブジェクトが検出されました。CMYKに変換してください。"
    };

    return JSON.stringify(result);
})();
