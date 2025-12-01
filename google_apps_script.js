/**
 * Pudu Video Library Backend
 * 
 * 1. Create a new Google Spreadsheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Run `setup()` once to initialize headers.
 * 5. Deploy as Web App (Execute as Me, Access: Anyone).
 */

const SCRIPT_PROP = PropertiesService.getScriptProperties();

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Cases Sheet
  let sheet = doc.getSheetByName('Cases');
  if (!sheet) {
    sheet = doc.insertSheet('Cases');
    // Remove default sheet if it exists and is empty
    const defaultSheet = doc.getSheetByName('Sheet1');
    if (defaultSheet && defaultSheet.getLastRow() === 0) {
      doc.deleteSheet(defaultSheet);
    }
  }
  
  const headers = [
    "id", 
    "category", 
    "subcategory", 
    "region", 
    "robotType", 
    "clientName", 
    "videoUrl", 
    "rating", 
    "keywords", 
    "timestamp"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  // 2. Setup Admins Sheet
  let adminSheet = doc.getSheetByName('Admins');
  if (!adminSheet) {
    adminSheet = doc.insertSheet('Admins');
  }

  const adminHeaders = ["email", "addedBy", "addedAt"];
  if (adminSheet.getLastRow() === 0) {
    adminSheet.getRange(1, 1, 1, adminHeaders.length).setValues([adminHeaders]);
    adminSheet.setFrozenRows(1);
    // Add default admin
    adminSheet.appendRow(["williamhsiao@aurotek.com", "System", new Date()]);
  }
}

function doGet(e) {
  return handleRequest('get', null);
}

function doPost(e) {
  try {
    const json = JSON.parse(e.postData.contents);
    return handleRequest(json.action, json);
  } catch (ex) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: ex.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(action, payload) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let result = { success: true, data: [] };
    
    // --- CASES MANAGEMENT ---
    if (['get', 'create', 'update', 'delete'].includes(action)) {
      const sheet = doc.getSheetByName('Cases') || doc.getSheets()[0];
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      const rows = values.slice(1);
      
      if (action === 'get') {
        result.data = rows.map(row => {
          return {
            id: row[0].toString(),
            category: row[1],
            subcategory: row[2],
            region: row[3],
            robotType: row[4],
            clientName: row[5],
            videoUrl: row[6],
            rating: Number(row[7]),
            keywords: row[8] ? row[8].split(',').map(k => k.trim()) : []
          };
        });
      } 
      else if (action === 'create') {
        const d = payload.data;
        const newRow = [
          Date.now().toString(),
          d.category,
          d.subcategory,
          d.region,
          d.robotType,
          d.clientName,
          d.videoUrl,
          d.rating,
          d.keywords.join(','),
          new Date()
        ];
        sheet.appendRow(newRow);
        result.data = [{
          id: newRow[0],
          category: newRow[1],
          subcategory: newRow[2],
          region: newRow[3],
          robotType: newRow[4],
          clientName: newRow[5],
          videoUrl: newRow[6],
          rating: newRow[7],
          keywords: d.keywords
        }];
      }
      else if (action === 'update') {
        const d = payload.data;
        const rowIndex = rows.findIndex(r => r[0].toString() === d.id.toString());
        if (rowIndex !== -1) {
          const realRowIndex = rowIndex + 2; 
          sheet.getRange(realRowIndex, 2).setValue(d.category);
          sheet.getRange(realRowIndex, 3).setValue(d.subcategory);
          sheet.getRange(realRowIndex, 4).setValue(d.region);
          sheet.getRange(realRowIndex, 5).setValue(d.robotType);
          sheet.getRange(realRowIndex, 6).setValue(d.clientName);
          sheet.getRange(realRowIndex, 7).setValue(d.videoUrl);
          sheet.getRange(realRowIndex, 8).setValue(d.rating);
          sheet.getRange(realRowIndex, 9).setValue(d.keywords.join(','));
          result.data = [d];
        } else {
          result.success = false;
          result.message = "ID not found";
        }
      }
      else if (action === 'delete') {
         const id = payload.id;
         const rowIndex = rows.findIndex(r => r[0].toString() === id.toString());
         if (rowIndex !== -1) {
           sheet.deleteRow(rowIndex + 2);
         }
      }
    }
    
    // --- ADMIN MANAGEMENT ---
    else if (['getAdmins', 'addAdmin', 'deleteAdmin'].includes(action)) {
      const adminSheet = doc.getSheetByName('Admins');
      if (!adminSheet) throw new Error("Admins sheet not found. Run setup() again.");
      
      const dataRange = adminSheet.getDataRange();
      const values = dataRange.getValues();
      // Skip header
      const rows = values.length > 1 ? values.slice(1) : [];

      if (action === 'getAdmins') {
         result.data = rows.map(row => ({
           email: row[0],
           addedBy: row[1],
           addedAt: row[2]
         }));
      }
      else if (action === 'addAdmin') {
         const email = payload.email;
         const addedBy = payload.addedBy || 'System';
         // Check duplicate
         const exists = rows.some(r => r[0].toString().toLowerCase() === email.toLowerCase());
         if (!exists) {
           adminSheet.appendRow([email, addedBy, new Date()]);
         }
         result.success = true;
      }
      else if (action === 'deleteAdmin') {
         const email = payload.email;
         // Prevent deleting the last admin or safe-guard default (optional)
         const rowIndex = rows.findIndex(r => r[0].toString().toLowerCase() === email.toLowerCase());
         if (rowIndex !== -1) {
           adminSheet.deleteRow(rowIndex + 2); // +2 for header and 0-index
         }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}