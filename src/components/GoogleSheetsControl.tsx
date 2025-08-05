import React, { useState } from 'react';
import { usePlayerContext } from '../contexts/PlayerContext';
import { GASSetupHelper } from './GASSetupHelper';

export const GoogleSheetsControl: React.FC = () => {
  const { 
    isLoading, 
    error, 
    lastUpdated, 
    loadPlayersFromGoogleSheets, 
    isGoogleSheetsConfigured,
    players 
  } = usePlayerContext();

  const [showSetupHelper, setShowSetupHelper] = useState(false);

  const handleLoadData = async () => {
    await loadPlayersFromGoogleSheets();
  };

  const handleConfigComplete = (gasUrl: string) => {
    // 環境変数は実行時には変更できないため、ユーザーに手動設定を促す
    alert(`設定完了！\n\n.envファイルに以下を追加して、アプリを再起動してください：\n\nVITE_GAS_URL=${gasUrl}`);
    setShowSetupHelper(false);
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return '未取得';
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  return (
    <div className="google-sheets-control">
      <h3>Google Sheets 連携</h3>
      
      <div className="sheets-status">
        <div className="status-info">
          <span className={`status-indicator ${isGoogleSheetsConfigured ? 'configured' : 'not-configured'}`}>
            {isGoogleSheetsConfigured ? '✅ 設定済み' : '❌ 未設定'}
          </span>
          <span className="player-count">
            プレイヤー数: {players.length}人
          </span>
          <span className="last-updated">
            最終更新: {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      <div className="sheets-actions">
        <button
          onClick={handleLoadData}
          disabled={!isGoogleSheetsConfigured || isLoading}
          className={`load-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner">⟳</span>
              データ取得中...
            </>
          ) : (
            <>
              <span className="refresh-icon">🔄</span>
              Google Sheetsからデータ取得
            </>
          )}
        </button>
      </div>

      {!isGoogleSheetsConfigured && (
        <div className="setup-instructions">
          <h4>📋 セットアップ手順</h4>
          <div className="setup-options">
            <button 
              onClick={() => setShowSetupHelper(!showSetupHelper)}
              className="setup-helper-button"
            >
              {showSetupHelper ? '❌ ヘルパーを閉じる' : '🧙‍♂️ セットアップヘルパー'}
            </button>
          </div>
          
          {showSetupHelper ? (
            <GASSetupHelper onConfigComplete={handleConfigComplete} />
          ) : (
            <ol>
              <li>Google Apps Scriptでプロジェクトを作成</li>
              <li>提供されたCode.gsファイルの内容をコピー</li>
              <li>SPREADSHEET_IDを実際のスプレッドシートIDに変更</li>
              <li>Web Appとしてデプロイ（実行ユーザー: 自分、アクセス: 全員）</li>
              <li>デプロイURLを環境変数 VITE_GAS_URL に設定</li>
              <li>アプリケーションを再起動</li>
            </ol>
          )}
        </div>
      )}

      <div className="technical-info">
        <details>
          <summary>🔧 技術情報</summary>
          <div className="tech-details">
            <p><strong>GAS URL:</strong> {isGoogleSheetsConfigured ? '設定済み' : '未設定'}</p>
            <p><strong>取得方式:</strong> REST API (CORS対応)</p>
            <p><strong>データ形式:</strong> JSON</p>
            <p><strong>自動更新:</strong> 手動</p>
          </div>
        </details>
      </div>
    </div>
  );
};
