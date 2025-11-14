import { useState } from 'react';
import ScratchTicketCSS from './components/ScratchTicketCSS';
import Settings from './components/Settings';
import { getRandomPrize, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout, TICKET_LAYOUTS } from '../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES } from '../core/mechanics/scratchers';
import './App.css';

function App() {
  const [prize, setPrize] = useState<Prize>(getRandomPrize());
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutId, setLayoutId] = useState('classic');
  const [scratcherId, setScratcherId] = useState('coin');
  const currentLayout = getTicketLayout(layoutId);
  const currentScratcher = getScratcher(scratcherId);

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

        <div className="layout-selector">
          <label htmlFor="layout-select">Ticket Layout: </label>
          <select 
            id="layout-select"
            value={layoutId} 
            onChange={(e) => {
              setLayoutId(e.target.value);
              setKey((prev) => prev + 1);
              setIsCompleted(false);
              setPrize(getRandomPrize());
            }}
          >
            {Object.keys(TICKET_LAYOUTS).map((id) => (
              <option key={id} value={id}>
                {TICKET_LAYOUTS[id].name}
              </option>
            ))}
          </select>
        </div>

        <div className="layout-selector">
          <label htmlFor="scratcher-select">Scratcher: </label>
          <select 
            id="scratcher-select"
            value={scratcherId} 
            onChange={(e) => {
              setScratcherId(e.target.value);
            }}
          >
            {Object.keys(SCRATCHER_TYPES).map((id) => (
              <option key={id} value={id}>
                {SCRATCHER_TYPES[id].symbol} {SCRATCHER_TYPES[id].name}
              </option>
            ))}
          </select>
        </div>

        <div className="ticket-wrapper">
          <ScratchTicketCSS key={key} prize={prize} onComplete={handleComplete} layout={currentLayout} scratcher={currentScratcher} />
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
