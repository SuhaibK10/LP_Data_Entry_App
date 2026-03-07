/**
 * ═══════════════════════════════════════════════════════════════
 * LOUIS POLO — GS1 Product Data Collection
 * ═══════════════════════════════════════════════════════════════
 *
 * HEADERS in Row 1:
 *   A: Timestamp
 *   B: Product Name
 *   C: MRP
 *   D: Net Weight (kg)
 *   E: Gross Weight (kg)
 *   F: Rendered Photos      (comma-separated URLs, up to 3)
 *   G: Packaging Front
 *   H: Packaging Back
 *   I: Barcode Side
 *
 * ═══════════════════════════════════════════════════════════════
 */

var SPREADSHEET_ID = "1YePYsnp8X1BtXjp9Jajl-YWRAMo_AWEu4qAW-Y4ICvk";
var SHEET_NAME = "Sheet1";

var COLUMNS = {
  TIMESTAMP:       0,
  PRODUCT_NAME:    1,
  MRP:             2,
  NET_WEIGHT:      3,
  GROSS_WEIGHT:    4,
  RENDERED_PHOTOS: 5,
  PACK_FRONT:      6,
  PACK_BACK:       7,
  PACK_BARCODE:    8,
};

var TOTAL_COLUMNS = 9;


function doGet(e) {
  try {
    var sheet = _getSheet();
    if (!sheet) return _error("Sheet not found");

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return _json({ status: "ok", products: [] });

    var products = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var isEmpty = row.every(function(cell) {
        return cell === "" || cell === null || cell === undefined;
      });
      if (isEmpty) continue;

      products.push({
        rowNumber:         i + 1,
        timestamp:         row[COLUMNS.TIMESTAMP]       || "",
        productName:       row[COLUMNS.PRODUCT_NAME]    || "",
        mrp:               row[COLUMNS.MRP]             || "",
        netWeight:         row[COLUMNS.NET_WEIGHT]      || "",
        grossWeight:       row[COLUMNS.GROSS_WEIGHT]    || "",
        renderedPhotoUrls: row[COLUMNS.RENDERED_PHOTOS] || "",
        packFrontUrl:      row[COLUMNS.PACK_FRONT]      || "",
        packBackUrl:       row[COLUMNS.PACK_BACK]        || "",
        packBarcodeUrl:    row[COLUMNS.PACK_BARCODE]     || "",
      });
    }

    return _json({ status: "ok", products: products });
  } catch (error) {
    return _error(error.toString());
  }
}


function doPost(e) {
  try {
    var sheet = _getSheet();
    if (!sheet) return _error("Sheet not found");

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "create";
    var timestamp = _formatTimestamp(data.timestamp);
    var values = _buildRow(timestamp, data);

    if (action === "update") {
      return _handleUpdate(sheet, data.rowNumber, values, data.productName);
    } else {
      return _handleCreate(sheet, values, data.productName);
    }
  } catch (error) {
    return _error(error.toString());
  }
}


function _getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

function _buildRow(timestamp, data) {
  return [
    timestamp,
    data.productName       || "",
    data.mrp               || "",
    data.netWeight         || "",
    data.grossWeight       || "",
    data.renderedPhotoUrls || "",
    data.packFrontUrl      || "",
    data.packBackUrl       || "",
    data.packBarcodeUrl    || "",
  ];
}

function _handleCreate(sheet, values, productName) {
  sheet.appendRow(values);
  return _json({
    status: "success",
    message: "Product saved: " + (productName || "Unknown"),
    row: sheet.getLastRow(),
  });
}

function _handleUpdate(sheet, rowNumber, values, productName) {
  if (!rowNumber || rowNumber < 2) return _error("Invalid row number");
  values[COLUMNS.TIMESTAMP] = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  sheet.getRange(rowNumber, 1, 1, TOTAL_COLUMNS).setValues([values]);
  return _json({
    status: "success",
    message: "Updated: " + (productName || "Unknown"),
    row: rowNumber,
  });
}

function _formatTimestamp(isoTimestamp) {
  var ts = isoTimestamp || new Date().toISOString();
  try {
    return Utilities.formatDate(new Date(ts), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  } catch (err) {
    return ts;
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function _error(message) {
  return _json({ status: "error", message: message });
}
