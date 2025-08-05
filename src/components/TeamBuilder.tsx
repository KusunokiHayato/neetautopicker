import React, { useState } from 'react';
import { usePlayerContext } from '../contexts/PlayerContext';
import { teamUtils } from '../utils/lolUtils';
import { performReroll, performFullReroll } from '../utils/rerollUtils';
import { DiscordExport } from './DiscordExport';
import { GoogleSheetsControl } from './GoogleSheetsControl';
import type { Lane, Rank, FilterCriteria, TeamComposition } from '../types/lol';

const RANKS: Rank[] = [
  'UNRANKED', 'IRON', 'BRONZE', 'SILVER', 'GOLD', 
  'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'
];

const LANES: Lane[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

interface LaneFilterProps {
  lane: Lane;
  filter: FilterCriteria;
  onChange: (lane: Lane, filter: FilterCriteria) => void;
}

const LaneFilter: React.FC<LaneFilterProps> = ({ lane, filter, onChange }) => {
  const updateFilter = (updates: Partial<FilterCriteria>) => {
    onChange(lane, { ...filter, ...updates });
  };

  return (
    <div className="lane-filter">
      <h4>{lane}</h4>
      
      <div className="filter-row">
        <label>ランク参照:</label>
        <select
          value={filter.rankReference || 'solo'}
          onChange={(e) => updateFilter({ 
            rankReference: e.target.value as 'solo' | 'flex' | 'both'
          })}
          title="ランク条件の判定に使用するランクを選択"
        >
          <option value="solo">ソロランク</option>
          <option value="flex">フレックスランク</option>
          <option value="both">両方（いずれか満たす）</option>
        </select>
      </div>
      
      <div className="filter-row">
        <label>最小ランク:</label>
        <select
          value={filter.minRank || ''}
          onChange={(e) => updateFilter({ 
            minRank: e.target.value ? e.target.value as Rank : undefined 
          })}
        >
          <option value="">指定なし</option>
          {RANKS.map(rank => (
            <option key={rank} value={rank}>{rank}</option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label>最大ランク:</label>
        <select
          value={filter.maxRank || ''}
          onChange={(e) => updateFilter({ 
            maxRank: e.target.value ? e.target.value as Rank : undefined 
          })}
        >
          <option value="">指定なし</option>
          {RANKS.map(rank => (
            <option key={rank} value={rank}>{rank}</option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label>最小サモナーレベル:</label>
        <input
          type="number"
          value={filter.minSummonerLevel || ''}
          onChange={(e) => updateFilter({ 
            minSummonerLevel: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          placeholder="例: 30"
          min="1"
          max="500"
        />
      </div>

      <div className="filter-row">
        <label>最大サモナーレベル:</label>
        <input
          type="number"
          value={filter.maxSummonerLevel || ''}
          onChange={(e) => updateFilter({ 
            maxSummonerLevel: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          placeholder="例: 200"
          min="1"
          max="500"
        />
      </div>
    </div>
  );
};

interface TeamDisplayProps {
  team: TeamComposition;
  onReroll?: () => void;
  onFullReroll?: () => void;
  preservedPlayers?: { [lane in Lane]?: boolean };
  onTogglePreserve?: (lane: Lane) => void;
  onRerollSingleLane?: (lane: Lane) => void;
  rerollMessage?: string;
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ 
  team, 
  onReroll, 
  onFullReroll, 
  preservedPlayers = {}, 
  onTogglePreserve,
  onRerollSingleLane,
  rerollMessage 
}) => {
  const stats = teamUtils.getTeamStats(team);

  return (
    <div className="team-display">
      <h3>チーム編成結果</h3>
      
      <div className="team-stats">
        <p>完成レーン数: {stats.filledLanes} / {stats.totalLanes}</p>
        <p>平均ランク値: {stats.averageRankValue.toFixed(1)}</p>
        <p>状態: {stats.isComplete ? '完成' : '未完成'}</p>
      </div>

      {rerollMessage && (
        <div className="reroll-message">
          {rerollMessage}
        </div>
      )}

      {(onReroll || onFullReroll) && (
        <div className="reroll-controls">
          <h4>リロール設定</h4>
          <p>プレイヤーをクリックして保持対象を選択してください</p>
          {onReroll && (
            <button 
              onClick={onReroll}
              className="reroll-button"
              disabled={!Object.values(preservedPlayers).some(preserve => !preserve)}
            >
              選択レーンをリロール
            </button>
          )}
          {onFullReroll && (
            <button 
              onClick={onFullReroll}
              className="full-reroll-button"
            >
              全レーンリロール
            </button>
          )}
        </div>
      )}

      <div className="team-composition">
        {LANES.map(lane => (
          <div key={lane} className={`lane-slot ${team[lane] ? 'filled' : 'empty'}`}>
            <div className="lane-name">{lane}</div>
            {team[lane] ? (
              <div className="player-slot-container">
                <div 
                  className={`player-info ${preservedPlayers[lane] ? 'preserved' : 'rerollable'}`}
                  onClick={() => onTogglePreserve && onTogglePreserve(lane)}
                  style={{ cursor: onTogglePreserve ? 'pointer' : 'default' }}
                >
                  {preservedPlayers[lane] && (
                    <div className="preserve-indicator">🔒 保持</div>
                  )}
                  <div className="discord-name-primary">@{team[lane]!.discordUsername}</div>
                  <div className="lol-id">{team[lane]!.summonerName}#{team[lane]!.summonerId}</div>
                  <div className="rank-display">
                    <div className={`solo-rank ${(team[lane]!.soloRank || '').includes('アンランク') ? 'unranked' : ''}`}>
                      S: {team[lane]!.soloRank || 'アンランク'}
                    </div>
                    <div className={`flex-rank ${(team[lane]!.flexRank || '').includes('アンランク') ? 'unranked' : ''}`}>
                      F: {team[lane]!.flexRank || 'アンランク'}
                    </div>
                  </div>
                  <div className="secondary-info">
                    <div className="player-level">Lv.{team[lane]!.summonerLevel}</div>
                    {team[lane]!.freeComment && (
                      <div className="player-comment">{team[lane]!.freeComment}</div>
                    )}
                    {team[lane]!.isSubAccountSuspect && (
                      <div className="sub-account-warning">⚠️ サブ垢疑惑</div>
                    )}
                  </div>
                </div>
                {onRerollSingleLane && (
                  <button 
                    className="single-lane-reroll-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRerollSingleLane(lane);
                    }}
                    title={`${lane}レーンのみリロール`}
                  >
                    🎲
                  </button>
                )}
              </div>
            ) : (
              <div className="empty-slot">未割り当て</div>
            )}
          </div>
        ))}
      </div>
      
      <DiscordExport team={team} />
    </div>
  );
};

export const TeamBuilder: React.FC = () => {
  const { players } = usePlayerContext();
  const [timeFilterType, setTimeFilterType] = useState<'today' | 'minutes'>('today');
  const [maxPlayerAge, setMaxPlayerAge] = useState<number | undefined>(undefined);
  const [filters, setFilters] = useState<FilterCriteria[]>(
    LANES.map(lane => ({ lane }))
  );
  const [generatedTeam, setGeneratedTeam] = useState<TeamComposition | null>(null);
  const [excludeSubAccountSuspects, setExcludeSubAccountSuspects] = useState<boolean>(false);
  const [preservedPlayers, setPreservedPlayers] = useState<{ [lane in Lane]?: boolean }>({});
  const [rerollMessage, setRerollMessage] = useState<string>('');

  const updateFilter = (lane: Lane, filter: FilterCriteria) => {
    setFilters(prev => 
      prev.map(f => f.lane === lane ? filter : f)
    );
  };

  const generateTeam = () => {
    console.log('🎮 チーム編成開始');
    console.log('📊 利用可能プレイヤー数:', players.length);
    console.log('🎯 フィルター設定:', filters);
    
    let effectiveMaxAge: number | undefined = maxPlayerAge;
    
    if (timeFilterType === 'today') {
      const now = new Date();
      let startTime: Date;
      
      if (now.getHours() >= 0 && now.getHours() < 5) {
        // 午前0時〜5時の場合：前日の17時から現在まで
        startTime = new Date();
        startTime.setDate(startTime.getDate() - 1); // 前日
        startTime.setHours(17, 0, 0, 0); // 午後5時
      } else {
        // 午前5時〜23時59分の場合：当日の5時から現在まで
        startTime = new Date();
        startTime.setHours(5, 0, 0, 0); // 午前5時
      }
      
      const minutesSinceStart = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
      effectiveMaxAge = minutesSinceStart;
      console.log('⏰ 時間フィルター適用:', effectiveMaxAge, '分以内');
    }
    
    console.log('🔧 チーム編成実行中...');
    const team = teamUtils.generateTeamComposition(players, filters, effectiveMaxAge);
    console.log('✅ チーム編成結果:', team);
    
    setGeneratedTeam(team);
  };

  const clearTeam = () => {
    setGeneratedTeam(null);
    setRerollMessage('');
  };

  const handleReroll = () => {
    if (!generatedTeam) return;
    
    console.log('🔄 リロール開始');
    console.log('🎯 現在のチーム:', generatedTeam);
    console.log('🔒 保持設定:', preservedPlayers);
    
    try {
      // 保持するプレイヤーを特定
      const preservedPlayersData: { [lane in Lane]?: any } = {};
      Object.entries(preservedPlayers).forEach(([lane, isPreserved]) => {
        if (isPreserved && generatedTeam[lane as Lane]) {
          preservedPlayersData[lane as Lane] = generatedTeam[lane as Lane];
        }
      });
      
      // リロール対象のレーンを特定
      const rerollLanes: Lane[] = LANES.filter(lane => !preservedPlayers[lane]);
      
      console.log('🔄 リロール対象レーン:', rerollLanes);
      console.log('🔒 保持プレイヤー:', preservedPlayersData);
      
      const rerollSettings = {
        excludeSubAccountSuspects,
        preservedPlayers: preservedPlayersData,
        rerollLanes
      };
      
      const result = performReroll(generatedTeam, players, rerollSettings, filters);
      console.log('✅ リロール結果:', result);
      
      setGeneratedTeam(result.team);
      setRerollMessage(result.message || '');
    } catch (error) {
      console.error('❌ リロールエラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setRerollMessage('リロール中にエラーが発生しました: ' + errorMessage);
    }
  };

  const handleFullReroll = () => {
    console.log('🔄 フルリロール開始');
    
    try {
      const result = performFullReroll(players, filters, excludeSubAccountSuspects);
      console.log('✅ フルリロール結果:', result);
      
      setGeneratedTeam(result.team);
      setRerollMessage(result.message || '');
    } catch (error) {
      console.error('❌ フルリロールエラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setRerollMessage('フルリロール中にエラーが発生しました: ' + errorMessage);
    }
  };

  const togglePreservePlayer = (lane: Lane) => {
    setPreservedPlayers(prev => ({
      ...prev,
      [lane]: !prev[lane]
    }));
  };

  const handleSingleLaneReroll = (targetLane: Lane) => {
    if (!generatedTeam) return;
    
    console.log(`🎲 ${targetLane}レーンのみリロール開始`);
    
    try {
      // 対象レーン以外をすべて保持設定にする
      const singleLanePreservedPlayers: { [lane in Lane]?: any } = {};
      LANES.forEach(lane => {
        if (lane !== targetLane && generatedTeam[lane]) {
          singleLanePreservedPlayers[lane] = generatedTeam[lane];
        }
      });
      
      const rerollSettings = {
        excludeSubAccountSuspects,
        preservedPlayers: singleLanePreservedPlayers,
        rerollLanes: [targetLane]
      };
      
      const result = performReroll(generatedTeam, players, rerollSettings, filters);
      console.log(`✅ ${targetLane}レーンリロール結果:`, result);
      
      setGeneratedTeam(result.team);
      setRerollMessage(result.message || '');
    } catch (error) {
      console.error(`❌ ${targetLane}レーンリロールエラー:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setRerollMessage(`${targetLane}レーンリロール中にエラーが発生しました: ` + errorMessage);
    }
  };

  return (
    <div className="team-builder">
      <GoogleSheetsControl />
      
      <h2>チーム編成フィルター</h2>
      
      <div className="global-filters">
        <div className="time-filter-section">
          <h4>時間フィルター</h4>
          <div className="time-filter-options">
            <label className="radio-option">
              <input
                type="radio"
                name="timeFilter"
                value="today"
                checked={timeFilterType === 'today'}
                onChange={(e) => {
                  setTimeFilterType(e.target.value as 'today' | 'minutes');
                  setMaxPlayerAge(undefined);
                }}
              />
              今日登録されたプレイヤー
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="timeFilter"
                value="minutes"
                checked={timeFilterType === 'minutes'}
                onChange={(e) => setTimeFilterType(e.target.value as 'today' | 'minutes')}
              />
              指定時間以内に登録されたプレイヤー
            </label>
          </div>
          {timeFilterType === 'minutes' && (
            <div className="minutes-input">
              <label>経過時間（分）:</label>
              <input
                type="number"
                min="0"
                value={maxPlayerAge || ''}
                onChange={(e) => setMaxPlayerAge(
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
                placeholder="例: 60"
              />
            </div>
          )}
        </div>
      </div>

      <div className="lane-filters">
        <h3>レーン別フィルター</h3>
        <div className="filters-grid">
          {filters.map(filter => (
            <LaneFilter
              key={filter.lane}
              lane={filter.lane}
              filter={filter}
              onChange={updateFilter}
            />
          ))}
        </div>
        
        <div className="reroll-settings">
          <h4>リロール設定</h4>
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={excludeSubAccountSuspects}
              onChange={(e) => setExcludeSubAccountSuspects(e.target.checked)}
            />
            サブ垢疑惑のあるプレイヤーを除外
          </label>
        </div>
      </div>

      <div className="team-actions">
        <button 
          onClick={generateTeam} 
          className="btn-generate"
          disabled={players.length === 0}
        >
          チーム編成を実行
        </button>
        {generatedTeam && (
          <button onClick={clearTeam} className="btn-clear">
            結果をクリア
          </button>
        )}
      </div>

      {generatedTeam && (
        <TeamDisplay 
          team={generatedTeam}
          onReroll={handleReroll}
          onFullReroll={handleFullReroll}
          preservedPlayers={preservedPlayers}
          onTogglePreserve={togglePreservePlayer}
          onRerollSingleLane={handleSingleLaneReroll}
          rerollMessage={rerollMessage}
        />
      )}

      {players.length === 0 && (
        <div className="empty-state">
          <p>プレイヤーを追加してからチーム編成を行ってください。</p>
        </div>
      )}
    </div>
  );
};
