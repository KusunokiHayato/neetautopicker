import type { Player, Lane, TeamComposition, RerollSettings, RerollResult, FilterCriteria } from '../types/lol';
import { getPlayerRanks, rankUtils } from './lolUtils';

// プレイヤープールからサブ垢疑惑を除外
export const filterOutSubAccountSuspects = (players: Player[]): Player[] => {
  return players.filter(player => !player.isSubAccountSuspect);
};

// 特定のレーンの候補プレイヤーを取得（フィルタリング条件付き）
export const getCandidatesForLane = (
  players: Player[],
  lane: Lane,
  criteria: FilterCriteria,
  excludeSubAccountSuspects: boolean = false
): Player[] => {
  let candidates = players.filter(player => player.declaredLane === lane);
  
  // サブ垢疑惑を除外
  if (excludeSubAccountSuspects) {
    candidates = filterOutSubAccountSuspects(candidates);
  }
  
  // ランクフィルタリング
  if (criteria.minRank) {
    candidates = candidates.filter(player => {
      const playerRanks = getPlayerRanks(player, criteria.rankReference || 'solo');
      return playerRanks.some(rank => rankUtils.isHigherOrEqual(rank, criteria.minRank!));
    });
  }
  
  // サモナーレベルフィルタリング
  if (criteria.minSummonerLevel) {
    candidates = candidates.filter(player => player.summonerLevel >= criteria.minSummonerLevel!);
  }
  
  return candidates;
};

// ランダムにプレイヤーを選択
export const selectRandomPlayer = (candidates: Player[]): Player | null => {
  if (candidates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

// チーム編成のリロール
export const performReroll = (
  currentTeam: TeamComposition,
  allPlayers: Player[],
  rerollSettings: RerollSettings,
  filterCriteria: FilterCriteria[]
): RerollResult => {
  const newTeam: TeamComposition = { ...currentTeam };
  const rerolledLanes: Lane[] = [];
  
  // 使用済みプレイヤーを追跡
  const usedPlayerIds = new Set<string>();
  
  // 保持するプレイヤーを先に使用済みに追加
  Object.entries(rerollSettings.preservedPlayers).forEach(([lane, player]) => {
    if (player) {
      usedPlayerIds.add(player.id);
      newTeam[lane as Lane] = player;
    }
  });
  
  // 各レーンをリロール
  for (const lane of rerollSettings.rerollLanes) {
    const criteria = filterCriteria.find(c => c.lane === lane);
    if (!criteria) continue;
    
    // 候補プレイヤーを取得（使用済みを除外）
    let candidates = getCandidatesForLane(
      allPlayers,
      lane,
      criteria,
      rerollSettings.excludeSubAccountSuspects
    ).filter(player => !usedPlayerIds.has(player.id));
    
    const selectedPlayer = selectRandomPlayer(candidates);
    
    if (selectedPlayer) {
      newTeam[lane] = selectedPlayer;
      usedPlayerIds.add(selectedPlayer.id);
      rerolledLanes.push(lane);
    } else {
      // 候補が見つからない場合、既存のプレイヤーを保持
      const currentPlayer = currentTeam[lane];
      if (currentPlayer && !usedPlayerIds.has(currentPlayer.id)) {
        newTeam[lane] = currentPlayer;
        usedPlayerIds.add(currentPlayer.id);
      }
    }
  }
  
  return {
    success: rerolledLanes.length > 0,
    team: newTeam,
    rerolledLanes,
    message: rerolledLanes.length === 0 
      ? 'リロール対象のレーンが見つかりませんでした'
      : `${rerolledLanes.join(', ')} レーンをリロールしました`
  };
};

// 完全なチーム再編成（全レーンリロール）
export const performFullReroll = (
  allPlayers: Player[],
  filterCriteria: FilterCriteria[],
  excludeSubAccountSuspects: boolean = false
): RerollResult => {
  const newTeam: TeamComposition = {};
  const usedPlayerIds = new Set<string>();
  const lanes: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const rerolledLanes: Lane[] = [];
  
  for (const lane of lanes) {
    const criteria = filterCriteria.find(c => c.lane === lane);
    if (!criteria) continue;
    
    const candidates = getCandidatesForLane(
      allPlayers,
      lane,
      criteria,
      excludeSubAccountSuspects
    ).filter(player => !usedPlayerIds.has(player.id));
    
    const selectedPlayer = selectRandomPlayer(candidates);
    
    if (selectedPlayer) {
      newTeam[lane] = selectedPlayer;
      usedPlayerIds.add(selectedPlayer.id);
      rerolledLanes.push(lane);
    }
  }
  
  return {
    success: rerolledLanes.length === lanes.length,
    team: newTeam,
    rerolledLanes,
    message: rerolledLanes.length === lanes.length
      ? '全レーンのチーム編成を完了しました'
      : `${rerolledLanes.join(', ')} レーンのみ編成できました`
  };
};
