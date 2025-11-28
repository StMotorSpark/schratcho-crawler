import { useState, useEffect, useRef } from 'react';
import ScratchTicketCSS from './ScratchTicketCSS';
import { getPrizeGoldValue, type Prize } from '../../core/mechanics/prizes';
import {
  getTicketLayout,
  generateAreaPrizes,
  type TicketLayout,
} from '../../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES, type Scratcher } from '../../core/mechanics/scratchers';
import {
  useTicketForLayout,
  addGold,
  recordTicketScratched,
  checkAndUnlockAchievements,
  getAchievementDefinition,
  logEvent,
} from '../../core/user-state';
import './ScratchPage.css';

interface ScratchPageProps {
  layoutId: string;
  onComplete: () => void;
  onCancel: () => void;
  onHasPendingPrizesChange: (hasPending: boolean) => void;
}

type ScratchState = 'preparing' | 'scratching' | 'completed';

/**
 * Scratch page where users interactively scratch their ticket.
 * Prizes are tracked as pending and only added when "Turn In Ticket" is clicked.
 */
export default function ScratchPage({
  layoutId,
  onComplete,
  onCancel,
  onHasPendingPrizesChange,
}: ScratchPageProps) {
  const [layout] = useState<TicketLayout>(() => getTicketLayout(layoutId));
  const [areaPrizes] = useState<Prize[]>(() => generateAreaPrizes(getTicketLayout(layoutId)));
  const [scratcherId, setScratcherId] = useState('coin');
  const [scratcher, setScratcher] = useState<Scratcher>(() => getScratcher('coin'));
  const [scratchState, setScratchState] = useState<ScratchState>('preparing');
  const [pendingPrizes, setPendingPrizes] = useState<Prize[]>([]);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [key] = useState(0);
  
  // Use a ref to prevent double-initialization in StrictMode
  const ticketInitializedRef = useRef(false);
  const ticketConsumedRef = useRef(false);

  // Initialize ticket on mount - consume the ticket from inventory
  useEffect(() => {
    // Guard against double-execution in StrictMode
    if (ticketInitializedRef.current) {
      return;
    }
    ticketInitializedRef.current = true;

    // Try to use a ticket from inventory
    if (useTicketForLayout(layoutId)) {
      ticketConsumedRef.current = true;
      setScratchState('scratching');
      logEvent('ticket_start', { layoutId, scratcherId });
    } else {
      // No ticket available - go back
      onCancel();
    }
  }, [layoutId, scratcherId, onCancel]);

  // Update pending prizes state for parent component
  useEffect(() => {
    const hasPending = pendingPrizes.length > 0 && scratchState === 'completed';
    onHasPendingPrizesChange(hasPending);
  }, [pendingPrizes, scratchState, onHasPendingPrizesChange]);

  const handleScratcherChange = (newScratcherId: string) => {
    setScratcherId(newScratcherId);
    setScratcher(getScratcher(newScratcherId));
  };

  const handleTicketComplete = (revealedPrizes: Prize[]) => {
    setScratchState('completed');
    setPendingPrizes(revealedPrizes);
    recordTicketScratched();

    // Log completion but don't add gold yet
    const totalGoldValue = revealedPrizes.reduce(
      (sum, prize) => sum + getPrizeGoldValue(prize),
      0
    );
    logEvent('ticket_complete', {
      layoutId,
      scratcherId,
      prizeValue: totalGoldValue,
      prizeCount: revealedPrizes.length,
      prizeNames: revealedPrizes.map((p) => p.name).join(', '),
    });
  };

  const handleTurnInTicket = () => {
    // Apply prize gold effects for all pending prizes
    const totalGoldValue = pendingPrizes.reduce(
      (sum, prize) => sum + getPrizeGoldValue(prize),
      0
    );
    
    if (totalGoldValue > 0) {
      addGold(totalGoldValue);
    }

    // Check for new achievements
    const unlocked = checkAndUnlockAchievements();
    if (unlocked.length > 0) {
      setNewAchievements(unlocked);
    }

    // Clear pending prizes
    setPendingPrizes([]);
    onHasPendingPrizesChange(false);

    // Log prize claim
    logEvent('ticket_win', {
      layoutId,
      totalGoldValue,
      prizeCount: pendingPrizes.length,
    });

    // Navigate back to inventory
    onComplete();
  };

  const handleCancelTicket = () => {
    if (pendingPrizes.length > 0) {
      const confirmLeave = window.confirm(
        '⚠️ Warning: You have pending prizes that haven\'t been claimed!\n\nIf you leave now, you will lose your unclaimed prizes.\n\nAre you sure you want to leave?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    onHasPendingPrizesChange(false);
    onCancel();
  };

  const totalPendingGold = pendingPrizes.reduce(
    (sum, prize) => sum + getPrizeGoldValue(prize),
    0
  );

  if (scratchState === 'preparing') {
    return (
      <div className="scratch-page">
        <div className="loading-state">
          <div className="loading-spinner">🎫</div>
          <p>Preparing your ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scratch-page">
      <div className="scratch-page-header">
        <h2 className="scratch-page-title">🎫 {layout.name}</h2>
        <button className="cancel-btn" onClick={handleCancelTicket}>
          ← Back to Inventory
        </button>
      </div>

      <div className="scratcher-selector">
        <label htmlFor="scratcher-select">Scratcher: </label>
        <select
          id="scratcher-select"
          value={scratcherId}
          onChange={(e) => handleScratcherChange(e.target.value)}
          disabled={scratchState === 'completed'}
        >
          {Object.keys(SCRATCHER_TYPES).map((id) => (
            <option key={id} value={id}>
              {SCRATCHER_TYPES[id].symbol} {SCRATCHER_TYPES[id].name}
            </option>
          ))}
        </select>
      </div>

      <div className="ticket-wrapper">
        <ScratchTicketCSS
          key={key}
          areaPrizes={areaPrizes}
          onComplete={handleTicketComplete}
          layout={layout}
          scratcher={scratcher}
        />
      </div>

      {scratchState === 'completed' && (
        <div className="completion-section">
          <div className="pending-prizes-display">
            <h3>🎉 Ticket Completed!</h3>
            {pendingPrizes.length > 0 ? (
              <>
                <div className="prizes-preview">
                  {pendingPrizes.map((prize, index) => (
                    <span key={index} className="prize-icon-large">
                      {prize.emoji}
                    </span>
                  ))}
                </div>
                {totalPendingGold > 0 && (
                  <p className="pending-gold">
                    +{totalPendingGold} 🪙 waiting to be claimed!
                  </p>
                )}
              </>
            ) : (
              <p className="no-prizes">No prizes this time. Better luck next time!</p>
            )}
          </div>

          <button className="turn-in-btn" onClick={handleTurnInTicket}>
            ✅ Turn In Ticket
            {totalPendingGold > 0 && ` (+${totalPendingGold} 🪙)`}
          </button>
        </div>
      )}

      {scratchState === 'scratching' && (
        <div className="scratch-instructions">
          <p>👆 Scratch all areas to reveal your prizes!</p>
        </div>
      )}

      {/* Achievement Popup */}
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
  );
}
