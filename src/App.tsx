import { PlayerProvider } from './contexts/PlayerContext';
import { TeamBuilder } from './components/TeamBuilder';
import './components/LoLTeamBuilder.css';

function App() {
  return (
    <PlayerProvider>
      <div className="app">
        <header className="app-header">
          <h1>League of Legends チーム編成システム</h1>
          <p>ランクと時間条件を指定してチーム編成を自動化</p>
        </header>

        <main>
          <TeamBuilder />
        </main>
      </div>
    </PlayerProvider>
  );
}

export default App;
