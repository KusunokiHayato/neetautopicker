import type { Player } from '../types/lol';

// Google Apps Script Web AppのURL（デプロイ後に設定）
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_URL || 'YOUR_GAS_WEB_APP_URL_HERE';

export interface GoogleSheetsResponse {
  players: Player[];
  totalCount: number;
  lastUpdated: string;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

/**
 * Google Sheetsからプレイヤーデータを取得
 */
export const fetchPlayersFromGoogleSheets = async (): Promise<GoogleSheetsResponse> => {
  try {
    const url = `${GAS_WEB_APP_URL}?action=getPlayers&timestamp=${Date.now()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoogleSheetsResponse = await response.json();
    
    // データの整合性チェック
    if (!data.players || !Array.isArray(data.players)) {
      throw new Error('Invalid response format: players array is missing');
    }

    // プレイヤーデータの後処理
    const processedPlayers = data.players.map(player => ({
      ...player,
      timestamp: new Date(player.timestamp),
      lastActiveAt: new Date(player.timestamp),
      createdAt: new Date(player.timestamp),
      isSubAccountSuspect: false, // デフォルトはfalse
    }));

    return {
      ...data,
      players: processedPlayers,
    };

  } catch (error) {
    console.error('Error fetching players from Google Sheets:', error);
    throw new Error(`Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * GAS APIのヘルスチェック
 */
export const checkGASHealth = async (): Promise<{ status: string; timestamp: string }> => {
  try {
    const url = `${GAS_WEB_APP_URL}?action=health&timestamp=${Date.now()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error checking GAS health:', error);
    throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * 設定チェック：GAS URLが設定されているかどうか
 */
export const isGASConfigured = (): boolean => {
  return GAS_WEB_APP_URL !== 'YOUR_GAS_WEB_APP_URL_HERE' && GAS_WEB_APP_URL.length > 0;
};

/**
 * エラーハンドリング用のユーティリティ
 */
export const handleGASError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Google Sheetsに接続できませんでした。ネットワーク接続とGAS URLを確認してください。';
    }
    if (error.message.includes('HTTP error')) {
      return 'Google Sheetsからデータを取得できませんでした。権限設定を確認してください。';
    }
    return error.message;
  }
  return '不明なエラーが発生しました。';
};
