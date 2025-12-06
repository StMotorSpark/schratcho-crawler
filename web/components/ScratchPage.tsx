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
  hasHand,
  isHandFull,
  addTicketToHand,
  getHandSize,
  MAX_HAND_SIZE,
  getSelectedScratcherId,
  setSelectedScratcherId,
  type HandTicket,
} from '../../core/user-state';
import FloatingHandButton from './FloatingHandButton';
import './ScratchPage.css';

interface ScratchPageProps {
  layoutId: string;
  onComplete: () => void;
  onCancel: () => void;
  onHasPendingPrizesChange: (hasPending: boolean) => void;
  onOpenHandModal: () => void;
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
  onOpenHandModal,
}: ScratchPageProps) {
  const [layout] = useState<TicketLayout>(() => getTicketLayout(layoutId));
  const [areaPrizes] = useState<Prize[]>(() => generateAreaPrizes(getTicketLayout(layoutId)));
  const [scratcherId, setScratcherId] = useState(() => getSelectedScratcherId());
  const [scratcher, setScratcher] = useState<Scratcher>(() => getScratcher(getSelectedScratcherId()));
  const [scratchState, setScratchState] = useState<ScratchState>('preparing');
  const [pendingPrizes, setPendingPrizes] = useState<Prize[]>([]);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [key] = useState(0);
  const [showScratcherMenu, setShowScratcherMenu] = useState(false);
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  
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
    setSelectedScratcherId(newScratcherId);
    setShowScratcherMenu(false);
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

  const handleAddToHand = () => {
    // Add each pending prize as a hand ticket
    // For simplicity, we aggregate all prizes into a single hand ticket
    const totalGoldValue = pendingPrizes.reduce(
      (sum, prize) => sum + getPrizeGoldValue(prize),
      0
    );

    // Use the first prize's ID for reference (or create a composite ID)
    const prizeId = pendingPrizes.length > 0 ? pendingPrizes[0].id : 'unknown';

    // Check if first prize has a hand effect
    const handEffect = pendingPrizes.length > 0 ? pendingPrizes[0].effects?.handEffect : undefined;

    const handTicket: HandTicket = {
      layoutId,
      prizeId,
      goldValue: totalGoldValue,
      addedAt: Date.now(),
      handEffect,
    };

    const added = addTicketToHand(handTicket);

    if (added) {
      // Check for new achievements
      const unlocked = checkAndUnlockAchievements();
      if (unlocked.length > 0) {
        setNewAchievements(unlocked);
      }

      // Clear pending prizes
      setPendingPrizes([]);
      onHasPendingPrizesChange(false);

      // Navigate back to inventory
      onComplete();
    }
  };

  const handleBackClick = () => {
    if (pendingPrizes.length > 0 && scratchState === 'completed') {
      const confirmLeave = window.confirm(
        '⚠️ Warning: You have pending prizes that haven\'t been claimed!\n\nIf you leave now, you will lose your unclaimed prizes.\n\nAre you sure you want to leave?'
      );
      if (!confirmLeave) {
        return;
      }
    }
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
      {/* Floating navigation bar */}
      <div className="scratch-floating-nav">
        <button 
          className="floating-back-btn" 
          onClick={handleBackClick}
          aria-label="Back to inventory"
        >
          ←
        </button>
        
        <button 
          className="floating-scratcher-btn"
          onClick={() => setShowScratcherMenu(!showScratcherMenu)}
          disabled={scratchState === 'completed'}
          aria-label="Select scratcher"
        >
          {SCRATCHER_TYPES[scratcherId].symbol}
        </button>
      </div>

      {/* Scratcher selection popup */}
      {showScratcherMenu && (
        <div className="scratcher-popup-overlay" onClick={() => setShowScratcherMenu(false)}>
          <div className="scratcher-popup" onClick={(e) => e.stopPropagation()}>
            <h4>Select Scratcher</h4>
            <div className="scratcher-options">
              {Object.keys(SCRATCHER_TYPES).map((id) => (
                <button
                  key={id}
                  className={`scratcher-option ${id === scratcherId ? 'active' : ''}`}
                  onClick={() => handleScratcherChange(id)}
                >
                  <span className="scratcher-symbol">{SCRATCHER_TYPES[id].symbol}</span>
                  <span className="scratcher-name">{SCRATCHER_TYPES[id].name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="ticket-wrapper">
        <ScratchTicketCSS
          key={key}
          areaPrizes={areaPrizes}
          onComplete={handleTicketComplete}
          layout={layout}
          scratcher={scratcher}
        />
      </div>

      {/* Compact completion section - options depend on hand state */}
      {scratchState === 'completed' && (
        <div className="completion-section-compact">
          {/* If hand exists, player MUST add to hand (cannot cash out individually) */}
          {hasHand() ? (
            <>
              {!isHandFull() ? (
                <button className="add-to-hand-btn" onClick={handleAddToHand}>
                  🖐 Add to Hand
                  {totalPendingGold > 0 && ` (+${totalPendingGold} 🪙)`}
                  <span className="hand-count-hint">
                    ({getHandSize()}/{MAX_HAND_SIZE})
                  </span>
                </button>
              ) : (
                <div className="hand-full-warning">
                  <p>✋ Your hand is full!</p>
                  <p>Cash out your hand to continue.</p>
                  <button className="view-hand-btn" onClick={onOpenHandModal}>
                    🖐 View Hand
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* No hand - offer both options */}
              <button className="turn-in-btn" onClick={handleTurnInTicket}>
                ✅ Turn In Ticket
                {totalPendingGold > 0 && ` (+${totalPendingGold} 🪙)`}
              </button>
              
              <button className="add-to-hand-btn secondary" onClick={handleAddToHand}>
                🖐 Add to Hand
              </button>
            </>
          )}
          
          {/* Info icon for prize details */}
          {pendingPrizes.length > 0 && (
            <button 
              className="prize-info-btn"
              onClick={() => setShowPrizeDetails(true)}
              aria-label="View prize details"
            >
              ℹ️
            </button>
          )}
        </div>
      )}

      {/* Prize details popup */}
      {showPrizeDetails && (
        <div className="prize-details-overlay" onClick={() => setShowPrizeDetails(false)}>
          <div className="prize-details-popup" onClick={(e) => e.stopPropagation()}>
            <h4>🎉 Your Prizes</h4>
            <div className="prizes-preview">
              {pendingPrizes.map((prize, index) => {
                const goldValue = getPrizeGoldValue(prize);
                const hasHandEffect = !!prize.effects?.handEffect;
                
                return (
                  <div key={index} className={`prize-detail-item ${hasHandEffect ? 'has-hand-effect' : ''}`}>
                    <span className="prize-emoji">{prize.emoji}</span>
                    <div className="prize-info">
                      <span className="prize-name">{prize.name}</span>
                      {hasHandEffect && (
                        <span className="hand-effect-indicator">
                          ⚡ Hand Effect: {prize.value}
                        </span>
                      )}
                    </div>
                    <span className="prize-value">
                      {hasHandEffect ? '🖐' : `+${goldValue} 🪙`}
                    </span>
                  </div>
                );
              })}
            </div>
            {totalPendingGold > 0 && (
              <p className="total-gold">Total: +{totalPendingGold} 🪙</p>
            )}
            <button className="close-popup-btn" onClick={() => setShowPrizeDetails(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {scratchState === 'scratching' && (
        <div className="scratch-instructions">
          <p>👆 Scratch to reveal!</p>
        </div>
      )}

      {/* Achievement Popup */}
      {newAchievements.length > 0 && (
        <div 
          className="achievements-popup" 
          onClick={() => setNewAchievements([])}
          role="dialog"
          aria-labelledby="achievement-title"
          aria-modal="true"
        >
          <h3 id="achievement-title">🎉 Achievement Unlocked!</h3>
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

      {/* Floating hand button */}
      <FloatingHandButton onClick={onOpenHandModal} />
    </div>
  );
}
