import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Player } from '../types/lol';
import { fetchPlayersFromGoogleSheets, isGASConfigured, handleGASError } from '../services/googleSheetsService';

interface PlayerContextType {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  clearPlayers: () => void;
  loadPlayersFromGoogleSheets: () => Promise<void>;
  isGoogleSheetsConfigured: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  // 初期データとして固定のプレイヤーデータを設定
  const now = new Date();
  
  // 現在時刻によって異なる登録時間を設定（時間フィルターのテスト用）
  const getTestRegistrationTime = (hoursAgo: number, minutesAgo: number = 0) => {
    return new Date(now.getTime() - (hoursAgo * 60 + minutesAgo) * 60 * 1000);
  };
  
  const initialPlayers: Player[] = [
    {
      id: '1',
      timestamp: getTestRegistrationTime(0, 30),
      discordUsername: 'TopMain#1234',
      summonerName: 'TopMain123',
      summonerId: 'JP1',
      tier: 'GOLD',
      division: 'III',
      declaredLane: 'TOP',
      opggUrl: 'https://op.gg/summoners/kr/TopMain123-JP1',
      freeComment: 'トップレーン専門です',
      summonerLevel: 145,
      soloRank: 'GOLD III',
      flexRank: 'SILVER I',
      isSubAccountSuspect: false,
      // 互換性フィールド
      username: 'TopMain123',
      rank: 'GOLD',
      preferredLanes: ['TOP'],
      lastActiveAt: new Date(now.getTime() - 5 * 60 * 1000),
      createdAt: getTestRegistrationTime(0, 30),
    },
    {
      id: '2',
      timestamp: getTestRegistrationTime(2),
      discordUsername: 'JungleKing#5678',
      summonerName: 'JungleKing',
      summonerId: 'JP1',
      tier: 'PLATINUM',
      division: 'II',
      declaredLane: 'JUNGLE',
      opggUrl: 'https://op.gg/summoners/kr/JungleKing-JP1',
      freeComment: 'ジャングル得意です',
      summonerLevel: 230,
      soloRank: 'PLATINUM II',
      flexRank: 'PLATINUM IV',
      isSubAccountSuspect: false,
      // 互換性フィールド
      username: 'JungleKing',
      rank: 'PLATINUM',
      preferredLanes: ['JUNGLE'],
      lastActiveAt: new Date(now.getTime() - 3 * 60 * 1000),
      createdAt: getTestRegistrationTime(2),
    },
    {
      id: '3',
      timestamp: getTestRegistrationTime(0, 15),
      discordUsername: 'MidLaner#9999',
      summonerName: 'MidLaner99',
      summonerId: 'JP1',
      tier: 'DIAMOND',
      division: 'IV',
      declaredLane: 'MID',
      opggUrl: 'https://op.gg/summoners/kr/MidLaner99-JP1',
      freeComment: 'ミッドメイン、アサシン系得意',
      summonerLevel: 320,
      soloRank: 'DIAMOND IV',
      flexRank: 'DIAMOND V',
      isSubAccountSuspect: true, // サブ垢疑惑のプレイヤー
      // 互換性フィールド
      username: 'MidLaner99',
      rank: 'DIAMOND',
      preferredLanes: ['MID'],
      lastActiveAt: new Date(now.getTime() - 1 * 60 * 1000),
      createdAt: getTestRegistrationTime(0, 15),
    },
    {
      id: '4',
      timestamp: getTestRegistrationTime(8),
      discordUsername: 'ADCPlayer#4444',
      summonerName: 'ADCPlayer',
      summonerId: 'JP1',
      tier: 'GOLD',
      division: 'I',
      declaredLane: 'ADC',
      opggUrl: 'https://op.gg/summoners/kr/ADCPlayer-JP1',
      freeComment: 'ADC専門、レートマッチング重視',
      summonerLevel: 85,
      soloRank: 'GOLD I',
      flexRank: 'アンランク',
      isSubAccountSuspect: true, // サブ垢疑惑のプレイヤー
      // 互換性フィールド
      username: 'ADCPlayer',
      rank: 'GOLD',
      preferredLanes: ['ADC'],
      lastActiveAt: new Date(now.getTime() - 10 * 60 * 1000),
      createdAt: getTestRegistrationTime(8),
    },
    {
      id: '5',
      timestamp: getTestRegistrationTime(1),
      discordUsername: 'SupportMain#7777',
      summonerName: 'SupportMain',
      summonerId: 'JP1',
      tier: 'SILVER',
      division: 'II',
      declaredLane: 'SUPPORT',
      opggUrl: 'https://op.gg/summoners/kr/SupportMain-JP1',
      freeComment: 'サポート専門、エンゲージ系得意',
      summonerLevel: 67,
      soloRank: 'SILVER II',
      flexRank: 'SILVER III',
      isSubAccountSuspect: false,
      // 互換性フィールド
      username: 'SupportMain',
      rank: 'SILVER',
      preferredLanes: ['SUPPORT'],
      lastActiveAt: new Date(now.getTime() - 2 * 60 * 1000),
      createdAt: getTestRegistrationTime(1),
    },
    {
      id: '6',
      timestamp: getTestRegistrationTime(15),
      discordUsername: 'FlexPlayer#8888',
      summonerName: 'FlexPlayer',
      summonerId: 'JP1',
      tier: 'PLATINUM',
      division: 'III',
      declaredLane: 'TOP',
      opggUrl: 'https://op.gg/summoners/kr/FlexPlayer-JP1',
      freeComment: 'トップ・ミッドどちらも可能',
      summonerLevel: 178,
      soloRank: 'PLATINUM III',
      flexRank: 'PLATINUM II',
      isSubAccountSuspect: false,
      // 互換性フィールド
      username: 'FlexPlayer',
      rank: 'PLATINUM',
      preferredLanes: ['TOP', 'MID'],
      lastActiveAt: new Date(now.getTime() - 1 * 60 * 1000),
      createdAt: getTestRegistrationTime(15),
    },
  ];

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const clearPlayers = () => {
    setPlayers([]);
    setError(null);
  };

  const loadPlayersFromGoogleSheets = async () => {
    if (!isGASConfigured()) {
      setError('Google Sheets連携が設定されていません。「Google Sheets連携」タブから設定を行ってください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPlayersFromGoogleSheets();
      setPlayers(response.players);
      setLastUpdated(response.lastUpdated);
      setError(null);
    } catch (err) {
      const errorMessage = handleGASError(err);
      setError(errorMessage);
      console.error('Failed to load players from Google Sheets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isGoogleSheetsConfigured = isGASConfigured();

  return (
    <PlayerContext.Provider value={{
      players,
      isLoading,
      error,
      lastUpdated,
      clearPlayers,
      loadPlayersFromGoogleSheets,
      isGoogleSheetsConfigured,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
