// League of Legends specific types

export type Lane = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

// フォームで使用されるレーン表記
export type FormLane = 'TOP' | 'JG' | 'MID' | 'BOT' | 'SUP';

// フォームレーンから内部レーンへの変換マップ
export const FORM_LANE_MAP: Record<FormLane, Lane> = {
  'TOP': 'TOP',
  'JG': 'JUNGLE',
  'MID': 'MID',
  'BOT': 'ADC',
  'SUP': 'SUPPORT'
};

export type Rank = 
  | 'IRON'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'CHALLENGER'
  | 'UNRANKED';

export interface Player {
  id: string;
  timestamp: Date; // A列: タイムスタンプ
  discordUsername: string; // B列: Discordユーザー名
  summonerName: string; // C列: サモナー名
  summonerId: string; // D列: サモナーID
  tier: string; // E列: Tier
  division: string; // F列: Division
  declaredLane: Lane; // G列: 宣言レーン（内部でFormLaneから変換）
  opggUrl: string; // H列: OPGG URL
  freeComment?: string; // I列: 自由記入
  summonerLevel: number; // K列: サモナーレベル
  soloRank: string; // L列: ソロランク
  flexRank: string; // M列: フレックスランク
  isSubAccountSuspect?: boolean; // サブ垢疑惑フラグ
  
  // 互換性のため保持
  username: string; // summonerNameのエイリアス
  rank: Rank; // soloRankから解析
  preferredLanes: Lane[]; // declaredLaneから配列化
  lastActiveAt: Date; // timestampのエイリアス
  createdAt: Date; // timestampのエイリアス
}

// ランク参照タイプ
export type RankReference = 'solo' | 'flex' | 'both';

export interface TeamComposition {
  TOP?: Player;
  JUNGLE?: Player;
  MID?: Player;
  ADC?: Player;
  SUPPORT?: Player;
}

export interface FilterCriteria {
  lane: Lane;
  rankReference?: RankReference; // どのランクを参照するか
  requiredRank?: Rank;
  minRank?: Rank;
  maxRank?: Rank;
  minSummonerLevel?: number;
  maxSummonerLevel?: number;
}

export interface TeamFormationRequest {
  filters: FilterCriteria[];
  maxPlayerAge?: number; // minutes since player was registered
  excludeSubAccountSuspects?: boolean; // サブ垢疑惑を除外するか
  preservedPlayers?: { [lane in Lane]?: Player }; // レーンごとに保持するプレイヤー
}

// リロール設定
export interface RerollSettings {
  excludeSubAccountSuspects: boolean; // サブ垢疑惑を除外
  preservedPlayers: { [lane in Lane]?: Player }; // 保持するプレイヤー
  rerollLanes: Lane[]; // リロール対象のレーン
}

// リロール結果
export interface RerollResult {
  success: boolean;
  team: TeamComposition;
  rerolledLanes: Lane[];
  message?: string;
}
