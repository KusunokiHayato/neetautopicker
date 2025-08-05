import React, { useState } from 'react';

interface SetupHelperProps {
  onConfigComplete: (gasUrl: string) => void;
}

export const GASSetupHelper: React.FC<SetupHelperProps> = ({ onConfigComplete }) => {
  const [step, setStep] = useState(1);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('フォームの回答 1');
  const [gasUrl, setGasUrl] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const handleSpreadsheetUrlChange = (url: string) => {
    const id = extractSpreadsheetId(url);
    setSpreadsheetId(id);
  };

  const testConnection = async () => {
    if (!gasUrl) return;
    
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const response = await fetch(`${gasUrl}?action=health&timestamp=${Date.now()}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setTestResult({ success: true, message: '接続成功！データを取得できます。' });
      } else {
        setTestResult({ success: false, message: 'GASは応答しましたが、設定に問題があります。' });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: '接続に失敗しました。URLとデプロイ設定を確認してください。' 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const generateGASCode = () => {
    return `// 設定値
const YOUR_SPREADSHEET_ID = '${spreadsheetId}';
const YOUR_SHEET_NAME = '${sheetName}';

// 以下、integration-code.gsの残りのコードをコピーしてください...`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="gas-setup-helper">
      <h3>🚀 GAS統合セットアップウィザード</h3>
      
      <div className="setup-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <h4>Step 1: スプレッドシート情報</h4>
          
          <div className="form-group">
            <label>Google SheetsのURL:</label>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              onChange={(e) => handleSpreadsheetUrlChange(e.target.value)}
              className="url-input"
            />
            {spreadsheetId && (
              <div className="extracted-id">
                ✅ スプレッドシートID: <code>{spreadsheetId}</code>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>シート名:</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="フォームの回答 1"
            />
          </div>

          {spreadsheetId && (
            <button onClick={() => setStep(2)} className="next-button">
              Next: GASコード生成 →
            </button>
          )}
        </div>

        {step >= 2 && (
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <h4>Step 2: GASコード</h4>
            
            <div className="code-section">
              <p>以下のコードを既存のGASプロジェクトに追加してください：</p>
              <div className="code-block">
                <pre>{generateGASCode()}</pre>
                <button 
                  onClick={() => copyToClipboard(generateGASCode())}
                  className="copy-button"
                >
                  📋 コピー
                </button>
              </div>
            </div>

            <div className="instructions">
              <ol>
                <li>上記のコードをGASプロジェクトに追加</li>
                <li>「デプロイ」→「新しいデプロイ」→「ウェブアプリ」</li>
                <li>実行ユーザー: 自分、アクセス: 全員</li>
                <li>デプロイして Web App URL を取得</li>
              </ol>
            </div>

            <button onClick={() => setStep(3)} className="next-button">
              Next: URL設定 →
            </button>
          </div>
        )}

        {step >= 3 && (
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <h4>Step 3: Web App URL設定</h4>
            
            <div className="form-group">
              <label>GAS Web App URL:</label>
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="url-input"
              />
            </div>

            <div className="test-section">
              <button 
                onClick={testConnection}
                disabled={!gasUrl || isTestingConnection}
                className="test-button"
              >
                {isTestingConnection ? '🔄 テスト中...' : '🧪 接続テスト'}
              </button>

              {testResult && (
                <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.message}
                </div>
              )}
            </div>

            {testResult?.success && (
              <button 
                onClick={() => onConfigComplete(gasUrl)}
                className="complete-button"
              >
                ✅ 設定完了
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
