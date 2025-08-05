import React, { useState } from 'react';
import type { TeamComposition } from '../types/lol';
import { generateDiscordText, copyToClipboard } from '../utils/discordUtils';

interface DiscordExportProps {
  team: TeamComposition;
}

export const DiscordExport: React.FC<DiscordExportProps> = ({ team }) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  const discordText = generateDiscordText(team);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(discordText);
    setCopySuccess(success);
    
    if (success) {
      setTimeout(() => setCopySuccess(false), 2000); // 2秒後にメッセージを消す
    }
  };

  return (
    <div className="discord-export">
      <h4>Discord用テキスト出力</h4>
      
      <div className="export-actions">
        <button 
          onClick={handleCopy}
          className={`copy-button ${copySuccess ? 'success' : ''}`}
          disabled={!discordText.trim()}
        >
          {copySuccess ? '✅ コピー完了!' : '📋 コピー'}
        </button>
        
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="preview-toggle"
        >
          {showPreview ? '👁️ プレビューを隠す' : '👁️ プレビューを表示'}
        </button>
      </div>

      {showPreview && (
        <div className="discord-preview">
          <h5>プレビュー:</h5>
          <div className="preview-content">
            <pre>{discordText}</pre>
          </div>
        </div>
      )}

      <div className="export-info">
        <p className="info-text">
          📌 生成されたテキストはDiscordにそのまま貼り付けできます
        </p>
        <p className="info-text">
          🎯 形式: ロール名 → @名前 → OP.GG → ID → ランク の順で出力
        </p>
      </div>
    </div>
  );
};
