/**
 * スプレッドシートIDとシート名をテストする関数
 * GASエディタで実行して、ログを確認してください
 */
function testSpreadsheetConnection() {
  const SPREADSHEET_ID = '1Qaln6zXIC1HYUtJ3aHXsJqz8RcUpsDbNq8k2jcQG_F1G-FxCPw-gXA0y';
  const SHEET_NAME = 'フォームの回答 1';
  
  try {
    // スプレッドシートを開いてみる
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ スプレッドシートに接続成功: ' + spreadsheet.getName());
    
    // シートを取得してみる
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (sheet) {
      Logger.log('✅ シートに接続成功: ' + SHEET_NAME);
      Logger.log('📊 データ行数: ' + sheet.getLastRow());
      Logger.log('📊 データ列数: ' + sheet.getLastColumn());
      
      // ヘッダー行を取得
      if (sheet.getLastRow() > 0) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        Logger.log('📋 ヘッダー行: ' + headers.join(', '));
      }
    } else {
      Logger.log('❌ シートが見つかりません: ' + SHEET_NAME);
      
      // 利用可能なシート名を表示
      const sheets = spreadsheet.getSheets();
      Logger.log('📝 利用可能なシート名:');
      sheets.forEach(s => Logger.log('  - ' + s.getName()));
    }
    
  } catch (error) {
    Logger.log('❌ エラー: ' + error.toString());
    
    if (error.toString().includes('permissions')) {
      Logger.log('💡 解決案: スプレッドシートの共有設定を確認してください');
    } else if (error.toString().includes('not found')) {
      Logger.log('💡 解決案: スプレッドシートIDが正しいか確認してください');
    }
  }
}

/**
 * データ取得をテストする関数
 */
function testDataRetrieval() {
  try {
    const result = getTeamBuildingPlayers();
    const data = JSON.parse(result.getContent());
    
    Logger.log('✅ データ取得成功');
    Logger.log('📊 プレイヤー数: ' + data.totalCount);
    Logger.log('🕐 最終更新: ' + data.lastUpdated);
    
    if (data.players.length > 0) {
      Logger.log('👤 最初のプレイヤー例:');
      Logger.log('  - Discord: ' + data.players[0].discordUsername);
      Logger.log('  - サモナー: ' + data.players[0].summonerName);
      Logger.log('  - レーン: ' + data.players[0].declaredLane);
    }
    
  } catch (error) {
    Logger.log('❌ データ取得エラー: ' + error.toString());
  }
}
