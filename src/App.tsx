import { useState } from 'react';
import ScratchTicketCSS from './components/ScratchTicketCSS';
import Settings from './components/Settings';
import { getRandomPrize, type Prize } from './utils/prizes';
import { getTicketLayout } from './utils/ticketLayouts';
import './App.css';

function App() {
  const [prize, setPrize] = useState<Prize>(getRandomPrize());
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentLayout] = useState(() => getTicketLayout('classic'));

  const handleNewTicket = () => {
    setPrize(getRandomPrize());
    setIsCompleted(false);
    setKey((prev) => prev + 1);
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header-section">
          <h1 className="title">🎮 Schratcho Crawler</h1>
          <button 
            className="settings-button" 
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
          >
            ⚙️
          </button>
        </div>
        <p className="subtitle">Scratch to reveal your prize!</p>

        <div className="ticket-wrapper">
          <ScratchTicketCSS key={key} prize={prize} onComplete={handleComplete} layout={currentLayout} />
        </div>

        <button className="new-ticket-button" onClick={handleNewTicket}>
          🎫 New Ticket
        </button>

        {isCompleted && (
          <div className="completion-badge">
            <p>✨ Ticket Completed! ✨</p>
          </div>
        )}
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
