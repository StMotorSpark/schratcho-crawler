import { useState, useEffect } from 'react';
import type { TicketLayout } from '../../core/mechanics/ticketLayouts';
import { calculateTicketOdds, type TicketOdds } from '../../core/mechanics/odds';
import './OddsInfoModal.css';

interface OddsInfoModalProps {
  layout: TicketLayout;
  onClose: () => void;
}

/**
 * Modal component that displays odds information for a ticket layout.
 * Shows overall win probability and probability for each prize.
 */
export default function OddsInfoModal({ layout, onClose }: OddsInfoModalProps) {
  const [odds, setOdds] = useState<TicketOdds | null>(null);

  useEffect(() => {
    const ticketOdds = calculateTicketOdds(layout);
    setOdds(ticketOdds);
  }, [layout]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!odds) {
    return null;
  }

  return (
    <div className="odds-modal-backdrop" onClick={handleBackdropClick}>
      <div className="odds-modal">
        <div className="odds-modal-header">
          <h2>📊 {layout.name}</h2>
          <button className="odds-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="odds-modal-content">
          {/* Overview Section */}
          <section className="odds-section">
            <h3>🎯 Win Condition</h3>
            <p className="odds-explanation">{odds.winConditionExplanation}</p>
            <div className="odds-highlight">
              <span className="odds-label">Win Probability:</span>
              <span className="odds-value">{odds.winProbabilityStr}</span>
            </div>
          </section>

          {/* Ticket Info */}
          <section className="odds-section">
            <h3>🎫 Ticket Info</h3>
            <div className="odds-info-grid">
              <div className="odds-info-item">
                <span className="info-label">Scratch Areas</span>
                <span className="info-value">{odds.scratchAreaCount}</span>
              </div>
              <div className="odds-info-item">
                <span className="info-label">Prize Types</span>
                <span className="info-value">{odds.prizes.length}</span>
              </div>
              <div className="odds-info-item">
                <span className="info-label">Total Weight</span>
                <span className="info-value">{odds.totalWeight}</span>
              </div>
            </div>
          </section>

          {/* Prize Odds Table */}
          <section className="odds-section">
            <h3>🏆 Prize Odds</h3>
            {odds.prizes.length > 0 ? (
              <div className="odds-table-container">
                <table className="odds-table">
                  <thead>
                    <tr>
                      <th>Prize</th>
                      <th>Chance</th>
                      <th>Odds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {odds.prizes
                      .sort((a, b) => b.probability - a.probability)
                      .map((prize) => (
                        <tr key={prize.prizeId}>
                          <td className="prize-cell">
                            <span className="prize-emoji">{prize.emoji}</span>
                            <span className="prize-name">{prize.name}</span>
                            <span className="prize-value">({prize.value})</span>
                          </td>
                          <td className="chance-cell">{prize.percentageStr}</td>
                          <td className="odds-cell">{prize.oddsStr}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-prizes-message">No prizes configured for this ticket.</p>
            )}
          </section>

          {/* Disclaimer */}
          <section className="odds-disclaimer">
            <p>
              <strong>ℹ️ Note:</strong> Odds shown are approximate and based on random prize selection 
              for each scratch area. Actual results may vary.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
