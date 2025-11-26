import { useState, useEffect } from 'react';
import ScratchTicketCSS from './components/ScratchTicketCSS';
import Settings from './components/Settings';
import { getRandomPrize, getPrizeGoldValue, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout, getTicketGoldCost, TICKET_LAYOUTS } from '../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES } from '../core/mechanics/scratchers';
import {
  initializeUserState,
  getUserState,
  addGold,
  recordTicketScratched,
  checkAndUnlockAchievements,
  getAchievementDefinition,
  logEvent,
  purchaseTicketForLayout,
  useTicketForLayout,
  getOwnedTicketsForLayout,
  canAfford,
  subscribeToUserState,
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
  const [hasTicket, setHasTicket] = useState(false);
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(true);
  const [isTicketInProgress, setIsTicketInProgress] = useState(false);
  const currentLayout = getTicketLayout(layoutId);
  const currentScratcher = getScratcher(scratcherId);
  const ticketCost = getTicketGoldCost(currentLayout);

  // Initialize user state on mount and subscribe to changes
  useEffect(() => {
    initializeUserState();
    setUserState(getUserState());
    
    // Subscribe to state changes
    const unsubscribe = subscribeToUserState((newState) => {
      setUserState(newState);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Update ticket availability when layout or state changes
  useEffect(() => {
    const ownedCount = getOwnedTicketsForLayout(layoutId);
    setHasTicket(ownedCount > 0);
    // Only show purchase prompt if no tickets owned AND no ticket in progress
    setShowPurchasePrompt(ownedCount === 0 && !isTicketInProgress);
  }, [layoutId, userState, isTicketInProgress]);

  const handlePurchaseTicket = () => {
    if (purchaseTicketForLayout(layoutId, ticketCost)) {
      setHasTicket(true);
      setShowPurchasePrompt(false);
    }
  };

  const handleStartTicket = () => {
    if (useTicketForLayout(layoutId)) {
      setPrize(getRandomPrize());
      setIsCompleted(false);
      setIsTicketInProgress(true);
      setShowPurchasePrompt(false);
      setKey((prev) => prev + 1);
      setNewAchievements([]);
      logEvent('ticket_start', { layoutId, scratcherId });
    }
  };

  const handleNewTicket = () => {
    // If user has a ticket, start a new one
    if (hasTicket) {
      handleStartTicket();
    } else {
      // Show purchase prompt
      setShowPurchasePrompt(true);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsTicketInProgress(false);
    
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

  const ownedTicketCount = getOwnedTicketsForLayout(layoutId);
  const canAffordTicket = canAfford(ticketCost);

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
                {TICKET_LAYOUTS[id].name} ({getTicketGoldCost(TICKET_LAYOUTS[id])} 🪙)
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

        {/* Ticket Info Display */}
        <div className="ticket-info">
          <span className="ticket-count">
            🎫 Owned: {ownedTicketCount}
          </span>
          <span className="ticket-cost">
            💰 Cost: {ticketCost} 🪙
          </span>
        </div>

        {/* Purchase Prompt or Ticket */}
        {showPurchasePrompt && !hasTicket ? (
          <div className="purchase-prompt">
            <p className="purchase-message">
              You need to purchase a ticket to play!
            </p>
            <button 
              className={`purchase-button ${!canAffordTicket ? 'disabled' : ''}`}
              onClick={handlePurchaseTicket}
              disabled={!canAffordTicket}
            >
              🎫 Buy Ticket ({ticketCost} 🪙)
            </button>
            {!canAffordTicket && (
              <p className="insufficient-funds">
                ❌ Not enough gold! You need {Math.max(0, ticketCost - (userState?.currentGold ?? 0))} more.
              </p>
            )}
          </div>
        ) : hasTicket && !isTicketInProgress ? (
          <div className="start-prompt">
            <button 
              className="start-button"
              onClick={handleStartTicket}
            >
              🎫 Start Scratching!
            </button>
          </div>
        ) : isTicketInProgress ? (
          <div className="ticket-wrapper">
            <ScratchTicketCSS key={key} prize={prize} onComplete={handleComplete} layout={currentLayout} scratcher={currentScratcher} />
          </div>
        ) : null}

        {/* Only show New Ticket button when not showing purchase prompt */}
        {!showPurchasePrompt && (
          <button className="new-ticket-button" onClick={handleNewTicket}>
            {hasTicket ? '🎫 New Ticket' : '🎫 Buy Ticket'}
          </button>
        )}

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
          <div className="achievements-popup" onClick={() => setNewAchievements([])}>
            <h3>🎉 Achievement Unlocked!</h3>
            {newAchievements.map((id) => {
              const achievement = getAchievementDefinition(id);
              return (
                <div key={id} className="achievement-item">
                  {achievement ? `${achievement.icon} ${achievement.name}` : id}
                </div>
              );
            })}
            <p className="achievement-dismiss">Tap to dismiss</p>
          </div>
        )}
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
