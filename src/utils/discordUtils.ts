import type { TeamComposition, Lane } from '../types/lol';

// Discord用のテキスト形式を生成
export const generateDiscordText = (team: TeamComposition): string => {
  const lanes: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const roleNames = {
    'TOP': 'TOP',
    'JUNGLE': 'JG', 
    'MID': 'MID',
    'ADC': 'ADC',
    'SUPPORT': 'SUP'
  };

  let discordText = '';

  lanes.forEach(lane => {
    const player = team[lane];
    if (player) {
      discordText += `## ${roleNames[lane]}\n`;
      discordText += `@${player.discordUsername}\n`;
      
      // OP.GG URLがある場合のみ追加
      if (player.opggUrl && player.opggUrl.trim()) {
        discordText += `${player.opggUrl}\n`;
      }
      
      discordText += `${player.summonerName}#${player.summonerId}\n`;
      
      // ランク情報（ソロランク優先、フレックスも表示）
      const soloRank = player.soloRank;
      const flexRank = player.flexRank;
      
      if (soloRank && !soloRank.includes('アンランク')) {
        discordText += `ソロ: ${soloRank}`;
        if (flexRank && !flexRank.includes('アンランク')) {
          discordText += ` / フレックス: ${flexRank}`;
        }
        discordText += '\n';
      } else if (flexRank && !flexRank.includes('アンランク')) {
        discordText += `フレックス: ${flexRank}\n`;
      } else {
        discordText += 'アンランク\n';
      }
      
      discordText += '\n'; // レーン間の空行
    } else {
      discordText += `## ${roleNames[lane]}\n`;
      discordText += '未割り当て\n\n';
    }
  });

  return discordText.trim();
};

// クリップボードにテキストをコピー
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // フォールバック方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    return false;
  }
};

// Discord形式のプレビューを生成（HTML形式）
export const generateDiscordPreview = (team: TeamComposition): string => {
  const lanes: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const roleNames = {
    'TOP': 'TOP',
    'JUNGLE': 'JG', 
    'MID': 'MID',
    'ADC': 'ADC',
    'SUPPORT': 'SUP'
  };

  let html = '';

  lanes.forEach(lane => {
    const player = team[lane];
    if (player) {
      html += `<div class="discord-section">`;
      html += `<h3>## ${roleNames[lane]}</h3>`;
      html += `<p>@${player.discordUsername}</p>`;
      
      // OP.GG URLがある場合のみ追加
      if (player.opggUrl && player.opggUrl.trim()) {
        html += `<p><a href="${player.opggUrl}" target="_blank">${player.opggUrl}</a></p>`;
      }
      
      html += `<p>${player.summonerName}#${player.summonerId}</p>`;
      
      // ランク情報
      const soloRank = player.soloRank;
      const flexRank = player.flexRank;
      
      if (soloRank && !soloRank.includes('アンランク')) {
        html += `<p>ソロ: ${soloRank}`;
        if (flexRank && !flexRank.includes('アンランク')) {
          html += ` / フレックス: ${flexRank}`;
        }
        html += '</p>';
      } else if (flexRank && !flexRank.includes('アンランク')) {
        html += `<p>フレックス: ${flexRank}</p>`;
      } else {
        html += '<p>アンランク</p>';
      }
      
      html += `</div>`;
    } else {
      html += `<div class="discord-section">`;
      html += `<h3>## ${roleNames[lane]}</h3>`;
      html += '<p>未割り当て</p>';
      html += `</div>`;
    }
  });

  return html;
};
