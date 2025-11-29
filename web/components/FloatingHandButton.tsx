import { getHandSize, hasHand } from '../../core/user-state';
import './HandModal.css';

interface FloatingHandButtonProps {
  onClick: () => void;
}

/**
 * Floating button to access the current hand.
 * Shows a badge with the number of tickets in the hand.
 * Only visible when there's at least one ticket in the hand.
 */
export default function FloatingHandButton({ onClick }: FloatingHandButtonProps) {
  const handSize = getHandSize();
  const hasActiveHand = hasHand();

  if (!hasActiveHand) {
    return null;
  }

  return (
    <button
      className={`floating-hand-btn ${handSize > 0 ? 'has-tickets' : ''}`}
      onClick={onClick}
      aria-label={`View hand with ${handSize} tickets`}
    >
      🖐
      {handSize > 0 && (
        <span className="hand-badge">{handSize}</span>
      )}
    </button>
  );
}
