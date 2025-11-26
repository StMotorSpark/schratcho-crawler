import { useState, useEffect } from 'react';
import ScratchTicketCSS from './components/ScratchTicketCSS';
import Settings from './components/Settings';
import { getRandomPrize, getPrizeGoldValue, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout, TICKET_LAYOUTS } from '../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES } from '../core/mechanics/scratchers';
import {
  initializeUserState,
  getUserState,
  addGold,
  recordTicketScratched,
  checkAndUnlockAchievements,
  logEvent,
  type UserState,
} from '../core/user-state';
import './App.css';

function App() {
  const [prize, setPrize] = useState<Prize>(getRandomPrize());
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutId, setLayoutId] = useState('classic');
  const [scratcherId, setScratcherId] = useState('coin');
  const [userState, setUserState] = useState<UserState | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const currentLayout = getTicketLayout(layoutId);
  const currentScratcher = getScratcher(scratcherId);

  // Initialize user state on mount
  useEffect(() => {
    initializeUserState();
    setUserState(getUserState());
  }, []);

  const handleNewTicket = () => {
    setPrize(getRandomPrize());
    setIsCompleted(false);
    setKey((prev) => prev + 1);
    setNewAchievements([]);
    logEvent('ticket_start', { layoutId, scratcherId });
  };

  const handleComplete = () => {
    setIsCompleted(true);
    
    // Record ticket scratched
    recordTicketScratched();
    
    // Apply prize gold effect
    const goldValue = getPrizeGoldValue(prize);
    if (goldValue > 0) {
      addGold(goldValue);
    }
    
    // Log ticket completion
    logEvent('ticket_complete', { 
      layoutId, 
      scratcherId, 
      prizeValue: goldValue,
      prizeName: prize.name,
    });
    
    // Check for new achievements
    const unlocked = checkAndUnlockAchievements();
    if (unlocked.length > 0) {
      setNewAchievements(unlocked);
    }
    
    // Update UI state
    setUserState(getUserState());
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

        {/* User State Display */}
        {userState && (
          <div className="user-state-display">
            <div className="gold-display">
              <span className="gold-icon">🪙</span>
              <span className="gold-amount">{userState.currentGold}</span>
              <span className="gold-label">Gold</span>
            </div>
            <div className="stats-display">
              <span className="stat-item" title="Tickets Scratched">
                🎫 {userState.totalTicketsScratched}
              </span>
              <span className="stat-item" title="Highest Win">
                🏆 {userState.highestWin}
              </span>
            </div>
          </div>
        )}

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
            {getPrizeGoldValue(prize) > 0 && (
              <p className="gold-won">+{getPrizeGoldValue(prize)} 🪙</p>
            )}
          </div>
        )}

        {/* New Achievements Display */}
        {newAchievements.length > 0 && (
          <div className="achievements-popup">
            <h3>🎉 Achievement Unlocked!</h3>
            {newAchievements.map((id) => (
              <div key={id} className="achievement-item">
                {id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
