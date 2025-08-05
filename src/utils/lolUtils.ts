import type { Player, Lane, Rank, TeamComposition, FilterCriteria, RankReference } from '../types/lol';

// ランクの優先度を数値で表現（高いほど上位ランク）
const RANK_VALUES: Record<Rank, number> = {
  UNRANKED: 0,
  IRON: 1,
  BRONZE: 2,
  SILVER: 3,
  GOLD: 4,
  PLATINUM: 5,
  DIAMOND: 6,
  MASTER: 7,
  GRANDMASTER: 8,
  CHALLENGER: 9,
};

export const rankUtils = {
  getValue: (rank: Rank): number => RANK_VALUES[rank],
  isHigherOrEqual: (rank1: Rank, rank2: Rank): boolean => 
    RANK_VALUES[rank1] >= RANK_VALUES[rank2],
  isLowerOrEqual: (rank1: Rank, rank2: Rank): boolean => 
    RANK_VALUES[rank1] <= RANK_VALUES[rank2],
  compare: (rank1: Rank, rank2: Rank): number => 
    RANK_VALUES[rank1] - RANK_VALUES[rank2],
  
  // ランク文字列からRank型への変換
  parseFromString: (rankString: string): Rank => {
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
  },
};

export const playerUtils = {
  // プレイヤーが指定した時間以内に登録されたかチェック
  isRecentlyRegistered: (player: Player, maxAgeMinutes: number): boolean => {
    const now = new Date();
    const timeDiff = (now.getTime() - player.createdAt.getTime()) / (1000 * 60);
    return timeDiff <= maxAgeMinutes;
  },

  // フィルター条件に合うプレイヤーかチェック
  matchesFilter: (player: Player, filter: FilterCriteria): boolean => {
    // preferredLanes のフォールバック処理
    const preferredLanes = player.preferredLanes || [player.declaredLane || 'TOP'];
    
    // レーン要件をチェック
    if (!preferredLanes.includes(filter.lane)) {
      return false;
    }

    // ランク要件をチェック（参照タイプに応じて）
    const getPlayerRanks = (player: Player, rankReference: RankReference = 'solo'): Rank[] => {
      const soloRank = rankUtils.parseFromString(player.soloRank);
      const flexRank = rankUtils.parseFromString(player.flexRank);
      
      switch (rankReference) {
        case 'solo':
          return [soloRank];
        case 'flex':
          return [flexRank];
        case 'both':
          return [soloRank, flexRank];
        default:
          return [soloRank];
      }
    };
    
    const playerRanks = getPlayerRanks(player, filter.rankReference);
    
    if (filter.requiredRank && !playerRanks.some(rank => rank === filter.requiredRank)) {
      return false;
    }

    if (filter.minRank && !playerRanks.some(rank => rankUtils.isHigherOrEqual(rank, filter.minRank!))) {
      return false;
    }

    if (filter.maxRank && !playerRanks.some(rank => rankUtils.isLowerOrEqual(rank, filter.maxRank!))) {
      return false;
    }

    // サモナーレベル要件をチェック
    if (filter.minSummonerLevel && player.summonerLevel < filter.minSummonerLevel) {
      return false;
    }

    if (filter.maxSummonerLevel && player.summonerLevel > filter.maxSummonerLevel) {
      return false;
    }

    return true;
  },

  // プレイヤーリストをフィルタリング
  filterPlayers: (players: Player[], filter: FilterCriteria, maxPlayerAge?: number): Player[] => {
    return players.filter(player => {
      // 基本フィルターをチェック
      if (!playerUtils.matchesFilter(player, filter)) {
        return false;
      }

      // プレイヤーの登録時間をチェック
      if (maxPlayerAge !== undefined && !playerUtils.isRecentlyRegistered(player, maxPlayerAge)) {
        return false;
      }

      return true;
    });
  },
};

export const teamUtils = {
  // チーム編成を自動生成
  generateTeamComposition: (
    players: Player[], 
    filters: FilterCriteria[], 
    maxPlayerAge?: number
  ): TeamComposition => {
    const team: TeamComposition = {};

    // 各レーンごとに最適なプレイヤーを選出
    for (const filter of filters) {
      const availablePlayers = playerUtils.filterPlayers(players, filter, maxPlayerAge);
      
      if (availablePlayers.length > 0) {
        // 該当する全員からランダム選択
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        team[filter.lane] = availablePlayers[randomIndex];
      }
    }

    return team;
  },

  // チーム編成が完全かチェック
  isTeamComplete: (team: TeamComposition): boolean => {
    const lanes: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
    return lanes.every(lane => team[lane] !== undefined);
  },

  // チーム編成の統計を取得
  getTeamStats: (team: TeamComposition) => {
    const lanes: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
    const filledLanes = lanes.filter(lane => team[lane] !== undefined);
    const averageRank = filledLanes.length > 0 
      ? filledLanes.reduce((sum, lane) => sum + rankUtils.getValue(team[lane]!.rank), 0) / filledLanes.length
      : 0;

    return {
      filledLanes: filledLanes.length,
      totalLanes: lanes.length,
      averageRankValue: averageRank,
      isComplete: filledLanes.length === lanes.length,
    };
  },
};

// getPlayerRanks関数をエクスポート
export const getPlayerRanks = (player: Player, rankReference: RankReference = 'solo'): Rank[] => {
  const soloRank = rankUtils.parseFromString(player.soloRank);
  const flexRank = rankUtils.parseFromString(player.flexRank);
  
  switch (rankReference) {
    case 'solo':
      return [soloRank];
    case 'flex':
      return [flexRank];
    case 'both':
      return [soloRank, flexRank];
    default:
      return [soloRank];
  }
};
