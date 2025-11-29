import {
  getCurrentHand,
  getHandTotalValue,
  cashOutHand,
  clearHand,
  MAX_HAND_SIZE,
} from '../../core/user-state';
import { getTicketLayout } from '../../core/mechanics/ticketLayouts';
import { getPrizeById } from '../../core/mechanics/prizes';
import './HandModal.css';

interface HandModalProps {
  onClose: () => void;
  onHandCashedOut: (totalValue: number) => void;
  onContinueScratch: () => void;
}

/**
 * Modal to display and manage the current hand of tickets.
 * Allows users to view their collected tickets, cash out the hand,
 * or continue scratching more tickets.
 */
export default function HandModal({
  onClose,
  onHandCashedOut,
  onContinueScratch,
}: HandModalProps) {
  const hand = getCurrentHand();
  const totalValue = getHandTotalValue();

  const handleCashOut = () => {
    const value = cashOutHand();
    onHandCashedOut(value);
    onClose();
  };

  const handleContinue = () => {
    onContinueScratch();
    onClose();
  };

  const handleDiscard = () => {
    const confirmed = window.confirm(
      '⚠️ Warning: This will discard all tickets in your hand without claiming the prizes.\n\nAre you sure you want to discard your hand?'
    );
    if (confirmed) {
      clearHand();
      onClose();
    }
  };

  if (!hand || hand.tickets.length === 0) {
    return (
      <div className="hand-modal-overlay" onClick={onClose}>
        <div className="hand-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="hand-modal-title">🖐 Your Hand</h2>
          <div className="hand-empty">
            <div className="empty-hand-icon">✋</div>
            <p>Your hand is empty!</p>
            <p className="empty-hint">
              Scratch a ticket and choose &quot;Add to Hand&quot; to start building your hand.
            </p>
          </div>
          <button className="hand-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const isHandFull = hand.tickets.length >= MAX_HAND_SIZE;

  return (
    <div className="hand-modal-overlay" onClick={onClose}>
      <div className="hand-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="hand-modal-title">🖐 Your Hand</h2>
        
        <div className="hand-progress">
          <span className="hand-count">
            {hand.tickets.length} / {MAX_HAND_SIZE} tickets
          </span>
          <div className="hand-progress-bar">
            <div 
              className="hand-progress-fill"
              style={{ width: `${(hand.tickets.length / MAX_HAND_SIZE) * 100}%` }}
            />
          </div>
        </div>

        <div className="hand-tickets">
          {hand.tickets.map((ticket, index) => {
            const layout = getTicketLayout(ticket.layoutId);
            const prize = getPrizeById(ticket.prizeId);
            return (
              <div key={index} className="hand-ticket-item">
                <span className="ticket-index">#{index + 1}</span>
                <span className="ticket-layout-name">{layout.name}</span>
                {prize && (
                  <span className="ticket-prize">
                    {prize.emoji} +{ticket.goldValue} 🪙
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="hand-total">
          <span className="total-label">Total Value:</span>
          <span className="total-value">+{totalValue} 🪙</span>
        </div>

        <div className="hand-actions">
          <button 
            className="cash-out-hand-btn"
            onClick={handleCashOut}
          >
            💰 Cash Out Hand (+{totalValue} 🪙)
          </button>
          
          {!isHandFull && (
            <button 
              className="continue-scratching-btn"
              onClick={handleContinue}
            >
              🎫 Continue Scratching
            </button>
          )}
          
          {isHandFull && (
            <p className="hand-full-message">
              ✋ Hand is full! You must cash out before scratching more tickets.
            </p>
          )}
        </div>

        <div className="hand-secondary-actions">
          <button 
            className="discard-hand-btn"
            onClick={handleDiscard}
          >
            🗑️ Discard Hand
          </button>
        </div>
      </div>
    </div>
  );
}
