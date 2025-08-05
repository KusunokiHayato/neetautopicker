/**
 * Google Apps Script for LoL Team Builder
 * NeetDivision Google Sheets からプレイヤーデータを取得するAPI
 */

// スプレッドシートのIDを設定（実際のスプレッドシートIDに変更してください）
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'フォームの回答 1'; // または実際のシート名

/**
 * メイン関数：HTTPリクエストを処理
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'getPlayers';
    
    switch (action) {
      case 'getPlayers':
        return handleGetPlayers();
      case 'health':
        return handleHealthCheck();
      default:
        return createResponse({ error: 'Unknown action' }, 400);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * プレイヤーデータを取得する関数
 */
function handleGetPlayers() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    // データの範囲を取得（ヘッダー行を除く）
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      return createResponse({ players: [] });
    }
    
    // ヘッダー行を取得
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    
    // データ行を取得
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    const data = dataRange.getValues();
    
    // プレイヤーデータを構築
    const players = data.map((row, index) => {
      const player = {};
      
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        player[getFieldName(header)] = formatValue(value, header);
      });
      
      // 一意のIDを生成
      player.id = `player_${index + 2}`; // 行番号基準
      
      // 互換性フィールドを追加
      player.username = player.summonerName || '';
      player.rank = parseRankFromString(player.soloRank || '');
      player.preferredLanes = [player.declaredLane].filter(Boolean);
      player.lastActiveAt = player.timestamp || new Date();
      player.createdAt = player.timestamp || new Date();
      
      return player;
    });
    
    // 有効なプレイヤーのみをフィルター
    const validPlayers = players.filter(player => 
      player.discordUsername && 
      player.summonerName && 
      player.declaredLane
    );
    
    return createResponse({ 
      players: validPlayers,
      totalCount: validPlayers.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in handleGetPlayers:', error);
    throw error;
  }
}

/**
 * ヘルスチェック用の関数
 */
function handleHealthCheck() {
  return createResponse({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}

/**
 * ヘッダー名をフィールド名に変換
 */
function getFieldName(header) {
  const fieldMap = {
    'タイムスタンプ': 'timestamp',
    'Discordユーザー名': 'discordUsername',
    'サモナー名': 'summonerName', 
    'サモナーID': 'summonerId',
    'Tier': 'tier',
    'Division': 'division',
    '宣言レーン': 'declaredLane',
    'OPGG': 'opggUrl',
    '自由記入': 'freeComment',
    'サモナーレベル': 'summonerLevel',
    'ソロランク': 'soloRank',
    'フレックス': 'flexRank'
  };
  
  return fieldMap[header] || header;
}

/**
 * 値をフォーマット
 */
function formatValue(value, header) {
  if (value === null || value === undefined || value === '') {
    return getDefaultValue(header);
  }
  
  // タイムスタンプの処理
  if (header === 'タイムスタンプ' || header === 'timestamp') {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
  
  // 数値の処理
  if (header === 'サモナーレベル' || header === 'summonerLevel') {
    return parseInt(value) || 30;
  }
  
  // レーンの変換
  if (header === '宣言レーン' || header === 'declaredLane') {
    return convertLane(value);
  }
  
  return value.toString();
}

/**
 * デフォルト値を取得
 */
function getDefaultValue(header) {
  const defaults = {
    'タイムスタンプ': new Date().toISOString(),
    'timestamp': new Date().toISOString(),
    'Discordユーザー名': '',
    'discordUsername': '',
    'サモナー名': '',
    'summonerName': '',
    'サモナーID': '',
    'summonerId': '',
    'Tier': '',
    'tier': '',
    'Division': '',
    'division': '',
    '宣言レーン': 'TOP',
    'declaredLane': 'TOP',
    'OPGG': '',
    'opggUrl': '',
    '自由記入': '',
    'freeComment': '',
    'サモナーレベル': 30,
    'summonerLevel': 30,
    'ソロランク': 'アンランク',
    'soloRank': 'アンランク',
    'フレックス': 'アンランク',
    'flexRank': 'アンランク'
  };
  
  return defaults[header] || '';
}

/**
 * レーン名を変換
 */
function convertLane(laneValue) {
  const laneMap = {
    'TOP': 'TOP',
    'トップ': 'TOP',
    'top': 'TOP',
    'JG': 'JUNGLE',
    'JUNGLE': 'JUNGLE',
    'ジャングル': 'JUNGLE',
    'jungle': 'JUNGLE',
    'MID': 'MID', 
    'ミッド': 'MID',
    'mid': 'MID',
    'BOT': 'ADC',
    'ADC': 'ADC',
    'エーディーシー': 'ADC',
    'adc': 'ADC',
    'SUP': 'SUPPORT',
    'SUPPORT': 'SUPPORT',
    'サポート': 'SUPPORT',
    'support': 'SUPPORT'
  };
  
  return laneMap[laneValue] || 'TOP';
}

/**
 * ランク文字列を解析
 */
function parseRankFromString(rankString) {
  if (!rankString || rankString === "アンランク" || rankString === "アンランク/情報なし") {
    return 'UNRANKED';
  }
  
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
 * レスポンスを作成
 */
function createResponse(data, statusCode = 200) {
  const response = {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(data)
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
