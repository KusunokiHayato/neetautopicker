/**
 * League of Legends チーム編成用 Google Apps Script
 * デバッグ機能付きバージョン
 */

// ===== 設定 =====
const SPREADSHEET_ID = '1deYG1StxgX0E2fyNB-8Tmg8D_bavB8QaXa8cnx0b6iY';

/**
 * Web App のメインエントリーポイント
 */
function doGet(e) {
  try {
    // パラメータを安全に取得
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || 'getPlayers';

    let result;
    switch (action) {
      case 'getPlayers':
        result = getPlayers();
        break;
      case 'health':
        result = getHealthCheck();
        break;
      case 'sheets':
        result = getAllSheetNames();
        break;
      case 'debug':
        result = getDebugInfo();
        break;
      default:
        result = { error: `Unknown action: ${action}` };
    }

    return createJsonResponse(result);

  } catch (error) {
    console.error('doGet Error:', error);
    return createJsonResponse({ 
      error: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * プレイヤーデータを取得
 */
function getTeamBuildingPlayers() {
  try {
    const spreadsheet = SpreadsheetApp.openById(YOUR_SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(YOUR_SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${YOUR_SHEET_NAME}" not found`);
    }
    
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      return jsonResponse({ players: [], totalCount: 0, lastUpdated: new Date().toISOString() });
    }
    
    // ヘッダー行を取得
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    
    // データ行を取得
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    const data = dataRange.getValues();
    
    // プレイヤーデータを構築
    const players = data.map((row, index) => {
      const player = { id: `player_${index + 2}` };
      
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        const fieldName = mapHeaderToField(header);
        player[fieldName] = formatPlayerValue(value, fieldName);
      });
      
      // 互換性フィールドを追加
      addCompatibilityFields(player);
      
      return player;
    });
    
    // 有効なプレイヤーのみをフィルター
    const validPlayers = players.filter(player => 
      player.discordUsername && 
      player.summonerName && 
      player.declaredLane
    );
    
    return jsonResponse({ 
      players: validPlayers,
      totalCount: validPlayers.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('Error in getTeamBuildingPlayers: ' + error.toString());
    throw error;
  }
}

/**
 * ヘルスチェック
 */
function healthCheck() {
  return jsonResponse({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    spreadsheetId: YOUR_SPREADSHEET_ID,
    sheetName: YOUR_SHEET_NAME
  });
}

/**
 * ヘッダー名をフィールド名にマッピング
 */
function mapHeaderToField(header) {
  const fieldMap = {
    'タイムスタンプ': 'timestamp',
    'Discordユーザー名': 'discordUsername',
    'Discord ユーザー名': 'discordUsername',
    'サモナー名': 'summonerName',
    'サモナーID': 'summonerId',
    'Tier': 'tier',
    'Division': 'division',
    '宣言レーン': 'declaredLane',
    'レーン': 'declaredLane',
    'OPGG': 'opggUrl',
    'OP.GG': 'opggUrl',
    '自由記入': 'freeComment',
    'コメント': 'freeComment',
    'サモナーレベル': 'summonerLevel',
    'レベル': 'summonerLevel',
    'ソロランク': 'soloRank',
    'ソロ': 'soloRank',
    'フレックス': 'flexRank',
    'フレックスランク': 'flexRank'
  };
  
  return fieldMap[header] || header.replace(/\s+/g, '').toLowerCase();
}

/**
 * 値をフォーマット
 */
function formatPlayerValue(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return getDefaultValue(fieldName);
  }
  
  switch (fieldName) {
    case 'timestamp':
      return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
    
    case 'summonerLevel':
      return parseInt(value) || 30;
    
    case 'declaredLane':
      return convertLaneValue(value);
    
    default:
      return value.toString();
  }
}

/**
 * デフォルト値を取得
 */
function getDefaultValue(fieldName) {
  const defaults = {
    'timestamp': new Date().toISOString(),
    'discordUsername': '',
    'summonerName': '',
    'summonerId': '',
    'tier': '',
    'division': '',
    'declaredLane': 'TOP',
    'opggUrl': '',
    'freeComment': '',
    'summonerLevel': 30,
    'soloRank': 'アンランク',
    'flexRank': 'アンランク'
  };
  
  return defaults[fieldName] || '';
}

/**
 * レーン値を変換
 */
function convertLaneValue(laneValue) {
  const laneMap = {
    'TOP': 'TOP', 'トップ': 'TOP', 'top': 'TOP',
    'JG': 'JUNGLE', 'JUNGLE': 'JUNGLE', 'ジャングル': 'JUNGLE', 'jungle': 'JUNGLE',
    'MID': 'MID', 'ミッド': 'MID', 'mid': 'MID',
    'BOT': 'ADC', 'ADC': 'ADC', 'エーディーシー': 'ADC', 'adc': 'ADC',
    'SUP': 'SUPPORT', 'SUPPORT': 'SUPPORT', 'サポート': 'SUPPORT', 'support': 'SUPPORT'
  };
  
  return laneMap[laneValue] || 'TOP';
}

/**
 * 互換性フィールドを追加
 */
function addCompatibilityFields(player) {
  player.username = player.summonerName || '';
  player.rank = parseRankString(player.soloRank || '');
  player.preferredLanes = [player.declaredLane].filter(Boolean);
  player.lastActiveAt = player.timestamp || new Date().toISOString();
  player.createdAt = player.timestamp || new Date().toISOString();
  player.isSubAccountSuspect = false; // デフォルト
}

/**
 * ランク文字列を解析
 */
function parseRankString(rankString) {
  if (!rankString || rankString === "アンランク") return 'UNRANKED';
  
  const upperRank = rankString.toUpperCase();
  if (upperRank.includes('IRON')) return 'IRON';
  if (upperRank.includes('BRONZE')) return 'BRONZE';
  if (upperRank.includes('SILVER')) return 'SILVER';
  if (upperRank.includes('GOLD')) return 'GOLD';
  if (upperRank.includes('PLATINUM')) return 'PLATINUM';
  if (upperRank.includes('DIAMOND')) return 'DIAMOND';
  if (upperRank.includes('MASTER')) return 'MASTER';
  if (upperRank.includes('GRANDMASTER')) return 'GRANDMASTER';
  if (upperRank.includes('CHALLENGER')) return 'CHALLENGER';
  
  return 'UNRANKED';
}

/**
 * JSONレスポンスを作成
 */
function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * スプレッドシート内の全シート名を取得（デバッグ用）
 */
function listAllSheets() {
  try {
    const spreadsheet = SpreadsheetApp.openById(YOUR_SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    console.log('利用可能なシート名:', sheetNames);
    return {
      success: true,
      sheetNames: sheetNames,
      totalSheets: sheets.length
    };
  } catch (error) {
    console.error('シート一覧取得エラー:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
