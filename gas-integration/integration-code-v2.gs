/**
 * League of Legends チーム編成用 Google Apps Script
 * シンプルで確実に動作するバージョン
 */

// ===== 設定 =====
const SPREADSHEET_ID = '1deYG1StxgX0E2fyNB-8Tmg8D_bavB8QaXa8cnx0b6iY';

/**
 * Web App のメインエントリーポイント
 */
function doGet(e) {
  try {
    // CORSヘッダーを設定
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };

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
 * デバッグ情報を取得（最初の5行のデータを表示）
 */
function getDebugInfo() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    const sheet = sheets[0]; // 最初のシートを使用
    const sheetName = sheet.getName();
    
    const lastRow = Math.min(sheet.getLastRow(), 5); // 最初の5行まで
    const lastColumn = sheet.getLastColumn();
    
    const debugData = [];
    for (let row = 1; row <= lastRow; row++) {
      const rowData = sheet.getRange(row, 1, 1, lastColumn).getValues()[0];
      debugData.push({
        row: row,
        data: rowData
      });
    }
    
    return {
      success: true,
      sheetName: sheetName,
      totalRows: sheet.getLastRow(),
      totalColumns: lastColumn,
      sampleData: debugData
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 全シート名を取得（デバッグ用）
 */
function getAllSheetNames() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    return {
      success: true,
      sheetNames: sheetNames,
      totalSheets: sheets.length,
      spreadsheetId: SPREADSHEET_ID
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * プレイヤーデータを取得
 */
function getPlayers() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 全シート名を取得して、最初のシートを使用
    const sheets = spreadsheet.getSheets();
    if (sheets.length === 0) {
      throw new Error('スプレッドシートにシートが見つかりません');
    }
    
    // 最初のシートを使用（通常はフォームの回答シート）
    const sheet = sheets[0];
    const sheetName = sheet.getName();
    
    console.log(`使用中のシート: ${sheetName}`);
    
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    // データが存在するかチェック（最低3行必要：空行+ヘッダー+データ）
    if (lastRow <= 2) {
      return {
        players: [],
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
        sheetName: sheetName,
        info: 'データが見つかりません（ヘッダー行とデータ行が不足）'
      };
    }
    
    // データ構造：1行目=空行、2行目=ヘッダー、3行目以降=データ
    const headers = sheet.getRange(2, 1, 1, lastColumn).getValues()[0]; // 2行目がヘッダー
    const dataRange = sheet.getRange(3, 1, lastRow - 2, lastColumn); // 3行目以降がデータ
    const dataRows = dataRange.getValues();
    
    console.log('Headers (row 2):', headers);
    console.log('Data rows count:', dataRows.length);
    
    // プレイヤーデータを構築
    const players = dataRows.map((row, index) => {
      const player = {
        id: `player_${index + 1}`,
        timestamp: new Date().toISOString(),
        discordUsername: '',
        summonerName: '',
        declaredLane: 'TOP',
        rank: 'UNRANKED',
        summonerLevel: 30,
        isSubAccountSuspect: false,
        // 重要: preferredLanes を初期化
        preferredLanes: ['TOP'],
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      
      // 各列のデータをマッピング
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        if (value !== null && value !== undefined && value !== '') {
          mapDataToPlayer(player, header, value);
        }
      });
      
      // デフォルト値の設定（重要）
      if (!player.soloRank) {
        player.soloRank = 'アンランク/情報なし';
      }
      if (!player.flexRank) {
        player.flexRank = 'アンランク/情報なし';
      }
      if (!player.summonerId) {
        player.summonerId = '';
      }
      
      // preferredLanes を declaredLane に基づいて設定
      if (player.declaredLane) {
        player.preferredLanes = [player.declaredLane];
      }
      
      // createdAt をタイムスタンプに設定
      if (player.timestamp) {
        player.createdAt = player.timestamp;
        player.lastActiveAt = player.timestamp;
      }
      
      return player;
    });
    
    // 最低限の必須データがあるプレイヤーのみフィルタ
    const validPlayers = players.filter(player => 
      player.discordUsername || player.summonerName
    );
    
    return {
      players: validPlayers,
      totalCount: validPlayers.length,
      lastUpdated: new Date().toISOString(),
      sheetName: sheetName,
      rawDataCount: dataRows.length,
      headers: headers
    };
    
  } catch (error) {
    console.error('getPlayers Error:', error);
    throw error;
  }
}

/**
 * ヘッダー名に基づいてデータをプレイヤーオブジェクトにマッピング
 */
function mapDataToPlayer(player, header, value) {
  const headerStr = header.toString();
  
  // タイムスタンプ
  if (headerStr === 'タイムスタンプ') {
    player.timestamp = value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
  // Discord ユーザー名
  else if (headerStr.includes('Discordユーザー名')) {
    player.discordUsername = value.toString();
  }
  // サモナー名
  else if (headerStr === 'サモナー名') {
    player.summonerName = value.toString();
  }
  // サモナーID
  else if (headerStr === 'サモナーID') {
    player.summonerId = value.toString();
  }
  // ランクティア
  else if (headerStr === 'ランクティア') {
    player.tier = value.toString();
  }
  // ランクディビジョン
  else if (headerStr === 'ランクディビジョン') {
    player.division = value.toString();
  }
  // 宣言レーン
  else if (headerStr === '宣言レーン') {
    player.declaredLane = convertLane(value.toString());
  }
  // OPGG URL
  else if (headerStr === 'OPGG') {
    player.opggUrl = value.toString();
  }
  // 自由記述
  else if (headerStr === '自由記述欄') {
    player.freeComment = value.toString();
  }
  // サモナーレベル
  else if (headerStr === 'サモナーレベル') {
    const level = parseInt(value);
    if (!isNaN(level)) {
      player.summonerLevel = level;
    }
  }
  // ソロランク
  else if (headerStr === 'ソロランク') {
    const soloRank = value.toString();
    player.soloRank = soloRank || 'アンランク/情報なし';
    player.rank = convertRank(soloRank); // 互換性のため
  }
  // フレックスランク
  else if (headerStr === 'フレックス') {
    player.flexRank = value.toString() || 'アンランク/情報なし';
  }
  // PUUID
  else if (headerStr === 'puuid') {
    player.puuid = value.toString();
  }
}

/**
 * レーン値を標準形式に変換
 */
function convertLane(laneValue) {
  const lane = laneValue.toUpperCase();
  
  if (lane.includes('TOP') || lane.includes('トップ')) return 'TOP';
  if (lane.includes('JG') || lane.includes('JUNGLE') || lane.includes('ジャングル')) return 'JUNGLE';
  if (lane.includes('MID') || lane.includes('ミッド')) return 'MID';
  if (lane.includes('BOT') || lane.includes('ADC') || lane.includes('エーディーシー')) return 'ADC';
  if (lane.includes('SUP') || lane.includes('SUPPORT') || lane.includes('サポート')) return 'SUPPORT';
  
  return 'TOP'; // デフォルト
}

/**
 * ランク値を標準形式に変換
 */
function convertRank(rankValue) {
  const rank = rankValue.toUpperCase();
  
  if (rank.includes('IRON')) return 'IRON';
  if (rank.includes('BRONZE')) return 'BRONZE';
  if (rank.includes('SILVER')) return 'SILVER';
  if (rank.includes('GOLD')) return 'GOLD';
  if (rank.includes('PLATINUM')) return 'PLATINUM';
  if (rank.includes('DIAMOND')) return 'DIAMOND';
  if (rank.includes('MASTER')) return 'MASTER';
  if (rank.includes('GRANDMASTER')) return 'GRANDMASTER';
  if (rank.includes('CHALLENGER')) return 'CHALLENGER';
  
  return 'UNRANKED';
}

/**
 * ヘルスチェック
 */
function getHealthCheck() {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    spreadsheetId: SPREADSHEET_ID
  };
}

/**
 * JSON レスポンスを作成（CORS対応）
 */
function createJsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
    
  // CORSヘッダーを追加
  return output;
}

/**
 * テスト関数（GASエディタで実行用）
 */
function testGetAllSheets() {
  const result = getAllSheetNames();
  console.log('Sheet Names Result:', result);
  return result;
}

function testGetPlayers() {
  const result = getPlayers();
  console.log('Players Result:', result);
  return result;
}
