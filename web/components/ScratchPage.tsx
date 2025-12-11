import { useState, useEffect, useRef } from 'react';
import ScratchTicketCSS from './ScratchTicketCSS';
import BettingSelector from './BettingSelector';
import { getPrizeGoldValue, type Prize } from '../../core/mechanics/prizes';
import {
  getTicketLayout,
  generateAreaPrizes,
  calculateBettingBonus,
  type TicketLayout,
  type BetOption,
} from '../../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES, type Scratcher } from '../../core/mechanics/scratchers';
import {
  useTicketForLayout,
  addGold,
  spendGold,
  getUserState,
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
  getOwnedTicketsForLayout,
  refundTicketForLayout,
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

type ScratchState = 'preparing' | 'betting' | 'scratching' | 'completed';

/**
 * Scratch page where users interactively scratch their ticket.
 * Prizes are tracked as pending and only added when "Turn In Ticket" is clicked.
 * If betting is enabled, user must place a bet before scratching.
 */
export default function ScratchPage({
  layoutId,
  onComplete,
  onCancel,
  onHasPendingPrizesChange,
  onOpenHandModal,
}: ScratchPageProps) {
  const [layout] = useState<TicketLayout>(() => getTicketLayout(layoutId));
  const [areaPrizes, setAreaPrizes] = useState<Prize[]>(() => generateAreaPrizes(getTicketLayout(layoutId)));
  const [scratcherId, setScratcherId] = useState(() => getSelectedScratcherId());
  const [scratcher, setScratcher] = useState<Scratcher>(() => getScratcher(getSelectedScratcherId()));
  const [scratchState, setScratchState] = useState<ScratchState>('preparing');
  const [pendingPrizes, setPendingPrizes] = useState<Prize[]>([]);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [key, setKey] = useState(0);
  const [showScratcherMenu, setShowScratcherMenu] = useState(false);
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const [isWinningTicket, setIsWinningTicket] = useState(false);
  
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
      
      // Check if betting is enabled for this ticket
      if (layout.bettingConfig?.enabled) {
        setScratchState('betting');
        // Don't log ticket_start yet - wait for bet selection
      } else {
        setScratchState('scratching');
        logEvent('ticket_start', { layoutId, scratcherId });
      }
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

  const handleBetSelected = (betOption: BetOption) => {
    // Deduct bet amount from player's balance
    const success = spendGold(betOption.betAmount);
    
    if (!success) {
      // This shouldn't happen as the UI prevents selecting unaffordable bets,
      // but handle it gracefully just in case
      console.error('Failed to deduct bet amount:', betOption.betAmount);
      alert('Insufficient funds to place this bet. Please try again.');
      return;
    }
    
    setSelectedBet(betOption);
    setScratchState('scratching');
    
    logEvent('ticket_start', {
      layoutId,
      scratcherId,
      betAmount: betOption.betAmount,
      betMultiplier: betOption.winMultiplier,
    });
  };

  const handleBetCancelled = () => {
    // User cancelled betting - refund the ticket that was consumed
    refundTicketForLayout(layoutId);
    onCancel();
  };

  const handleScratcherChange = (newScratcherId: string) => {
    setScratcherId(newScratcherId);
    setScratcher(getScratcher(newScratcherId));
    setSelectedScratcherId(newScratcherId);
    setShowScratcherMenu(false);
  };

  const handleTicketComplete = (revealedPrizes: Prize[]) => {
    setScratchState('completed');
    
    // Check if ticket is a winner (has any nonzero-value prizes)
    const totalPrizeValue = revealedPrizes.reduce(
      (sum, prize) => sum + getPrizeGoldValue(prize),
      0
    );
    const hasWon = totalPrizeValue > 0;
    setIsWinningTicket(hasWon);
    
    // If betting is enabled, apply betting bonus
    if (selectedBet && layout.bettingConfig?.enabled) {
      const baseValue = revealedPrizes.reduce(
        (sum, prize) => sum + getPrizeGoldValue(prize),
        0
      );
      
      const { finalValue, bonusApplied, refundAmount } = calculateBettingBonus(
        baseValue,
        selectedBet,
        hasWon
      );
      
      // Store the final value for display
      // We'll need to track this separately from the prizes
      // For now, we'll add/remove gold dynamically in handleTurnInTicket
      
      // Log the betting result
      logEvent('ticket_complete', {
        layoutId,
        scratcherId,
        baseValue,
        finalValue,
        betAmount: selectedBet.betAmount,
        betMultiplier: selectedBet.winMultiplier,
        bonusApplied,
        refundAmount,
        prizeCount: revealedPrizes.length,
        prizeNames: revealedPrizes.map((p) => p.name).join(', '),
      });
    } else {
      // No betting - standard flow
      logEvent('ticket_complete', {
        layoutId,
        scratcherId,
        prizeValue: revealedPrizes.reduce((sum, prize) => sum + getPrizeGoldValue(prize), 0),
        prizeCount: revealedPrizes.length,
        prizeNames: revealedPrizes.map((p) => p.name).join(', '),
      });
    }
    
    setPendingPrizes(revealedPrizes);
    recordTicketScratched();
  };

  const handleTurnInTicket = () => {
    // Calculate base gold value from prizes
    const baseGoldValue = pendingPrizes.reduce(
      (sum, prize) => sum + getPrizeGoldValue(prize),
      0
    );
    
    let finalGoldValue = baseGoldValue;
    
    // Apply betting bonus if applicable
    if (selectedBet && layout.bettingConfig?.enabled) {
      const { finalValue } = calculateBettingBonus(
        baseGoldValue,
        selectedBet,
        isWinningTicket
      );
      finalGoldValue = finalValue;
    }
    
    if (finalGoldValue > 0) {
      addGold(finalGoldValue);
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
      totalGoldValue: finalGoldValue,
      prizeCount: pendingPrizes.length,
      betApplied: selectedBet !== null,
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

  const handleScratchAnother = () => {
    // Check if user has tickets available
    if (!hasMoreTickets) {
      return;
    }
    
    // Consume another ticket from inventory
    if (useTicketForLayout(layoutId)) {
      // Reset ticket state for new scratch
      setAreaPrizes(generateAreaPrizes(getTicketLayout(layoutId)));
      setPendingPrizes([]);
      setNewAchievements([]);
      setSelectedBet(null);
      setIsWinningTicket(false);
      setKey(prevKey => prevKey + 1); // Force re-render of ScratchTicketCSS
      
      // Check if betting is required
      if (layout.bettingConfig?.enabled) {
        setScratchState('betting');
      } else {
        setScratchState('scratching');
        // Only log ticket_start if betting is not enabled
        logEvent('ticket_start', { layoutId, scratcherId });
      }
      
      ticketInitializedRef.current = true;
      ticketConsumedRef.current = true;
    } else {
      // No more tickets available - go back to inventory
      onComplete();
    }
  };

  const handleReturnToInventory = () => {
    // Simply return to inventory without claiming anything
    onComplete();
  };

  const totalPendingGold = pendingPrizes.reduce(
    (sum, prize) => sum + getPrizeGoldValue(prize),
    0
  );
  
  // Calculate final gold with betting bonus
  let displayGoldValue = totalPendingGold;
  let bettingBonusInfo: { bonusApplied: boolean; refundAmount: number; finalValue: number } | null = null;
  
  if (selectedBet && layout.bettingConfig?.enabled && scratchState === 'completed') {
    const result = calculateBettingBonus(totalPendingGold, selectedBet, isWinningTicket);
    displayGoldValue = result.finalValue;
    bettingBonusInfo = result;
  }

  // Check if user has more tickets of the same type
  // Note: This check happens AFTER the current ticket was consumed (in the initialization effect),
  // so it correctly checks for REMAINING tickets available to scratch
  const hasMoreTickets = getOwnedTicketsForLayout(layoutId) > 0;
  const isNonWinningTicket = scratchState === 'completed' && pendingPrizes.length === 0;

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

  // Show betting selector if betting is enabled and not yet selected
  if (scratchState === 'betting' && layout.bettingConfig?.enabled) {
    return (
      <div className="scratch-page">
        <BettingSelector
          bettingConfig={layout.bettingConfig}
          playerGold={getUserState().currentGold}
          onBetSelected={handleBetSelected}
          onCancel={handleBetCancelled}
        />
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

      {/* Compact completion section - options depend on hand state and win condition */}
      {scratchState === 'completed' && (
        <div className="completion-section-compact">
          {isNonWinningTicket ? (
            /* Non-winning ticket UI */
            <>
              <div className="non-winning-message">
                <p className="no-win-text">Sorry, this ticket did not win.</p>
                {bettingBonusInfo?.refundAmount && bettingBonusInfo.refundAmount > 0 ? (
                  <p className="refund-text">✅ Bet refunded: +{bettingBonusInfo.refundAmount} 🪙</p>
                ) : (
                  <p className="better-luck-text">Better luck next time!</p>
                )}
              </div>
              <div className="non-winning-actions">
                {hasMoreTickets && (
                  <button className="scratch-another-btn" onClick={handleScratchAnother}>
                    🎫 Scratch Another {layout.name}
                  </button>
                )}
                <button className="return-to-inventory-btn" onClick={handleReturnToInventory}>
                  🎒 Return to Inventory
                </button>
              </div>
            </>
          ) : (
            /* Winning ticket UI */
            <>
              {/* If hand exists, player MUST add to hand (cannot cash out individually) */}
              {hasHand() ? (
                <>
                  {!isHandFull() ? (
                    <button className="add-to-hand-btn" onClick={handleAddToHand}>
                      🖐 Add to Hand
                      {displayGoldValue > 0 && (
                        <>
                          {' (+'}
                          {displayGoldValue}
                          {' 🪙'}
                          {bettingBonusInfo?.bonusApplied && ' ✨'}
                          {')'}
                        </>
                      )}
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
                    {displayGoldValue > 0 && (
                      <>
                        {' (+'}
                        {displayGoldValue}
                        {' 🪙'}
                        {bettingBonusInfo?.bonusApplied && ' ✨'}
                        {')'}
                      </>
                    )}
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
            </>
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
            {displayGoldValue > 0 && (
              <div className="total-gold-section">
                <p className="total-gold">
                  Total: +{displayGoldValue} 🪙
                  {bettingBonusInfo?.bonusApplied && (
                    <span className="betting-bonus-tag">
                      {' '}✨ {selectedBet?.winMultiplier}x Betting Bonus!
                    </span>
                  )}
                </p>
                {bettingBonusInfo?.bonusApplied && totalPendingGold > 0 && (
                  <p className="base-value-note">
                    (Base: {totalPendingGold} 🪙)
                  </p>
                )}
              </div>
            )}
            {bettingBonusInfo?.refundAmount && bettingBonusInfo.refundAmount > 0 && (
              <p className="refund-notice">
                ℹ️ Bet refunded: +{bettingBonusInfo.refundAmount} 🪙
              </p>
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
