import { useState } from 'react';
import type { BettingConfig, BetOption } from '../../core/mechanics/ticketLayouts';
import { getSortedBetOptions } from '../../core/mechanics/ticketLayouts';
import './BettingSelector.css';

interface BettingSelectorProps {
  bettingConfig: BettingConfig;
  playerGold: number;
  onBetSelected: (betOption: BetOption) => void;
  onCancel: () => void;
}

/**
 * BettingSelector component displays betting options and allows player to select one.
 * Shows bet amount, condition, reward, and validates player has sufficient funds.
 */
export default function BettingSelector({
  bettingConfig,
  playerGold,
  onBetSelected,
  onCancel,
}: BettingSelectorProps) {
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const sortedBets = getSortedBetOptions(bettingConfig);

  const handleBetClick = (bet: BetOption) => {
    if (playerGold >= bet.betAmount) {
      setSelectedBet(bet);
    }
  };

  const handleConfirm = () => {
    if (selectedBet && playerGold >= selectedBet.betAmount) {
      onBetSelected(selectedBet);
    }
  };

  // Check if player can afford any bet
  const canAffordAnyBet = sortedBets.some(bet => playerGold >= bet.betAmount);

  return (
    <div className="betting-selector-overlay">
      <div className="betting-selector">
        <h2 className="betting-title">Place Your Bet</h2>
        <p className="betting-subtitle">
          Choose a bet option to continue. The bet will be deducted from your balance.
        </p>

        <div className="player-gold-display">
          <span className="gold-label">Your Balance:</span>
          <span className="gold-amount">🪙 {playerGold} Gold</span>
        </div>

        {!canAffordAnyBet && (
          <div className="insufficient-funds-warning">
            ⚠️ {bettingConfig.insufficientFundsMessage || 'You don\'t have enough gold to place any bet!'}
          </div>
        )}

        <div className="bet-options">
          {sortedBets.map((bet) => {
            const canAfford = playerGold >= bet.betAmount;
            const isSelected = selectedBet === bet;

            return (
              <button
                key={bet.order}
                className={`bet-option ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                onClick={() => handleBetClick(bet)}
                disabled={!canAfford}
              >
                {bet.badge && <div className="bet-badge">{bet.badge}</div>}
                
                <div className="bet-amount">
                  <span className="bet-cost-label">Bet:</span>
                  <span className="bet-cost-value">🪙 {bet.betAmount}</span>
                </div>

                <div className="bet-description">
                  {bet.description}
                </div>

                {bet.minPrizeThreshold > 0 && (
                  <div className="bet-condition">
                    Requires win ≥ {bet.minPrizeThreshold} gold
                  </div>
                )}

                <div className="bet-multiplier">
                  {bet.winMultiplier}x Multiplier
                </div>

                {bet.isRefundable && (
                  <div className="bet-refund-notice">
                    ✓ Refunded if you don't win
                  </div>
                )}

                {!canAfford && (
                  <div className="insufficient-funds-label">
                    Not enough gold
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="betting-actions">
          <button
            className="cancel-bet-button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="confirm-bet-button"
            onClick={handleConfirm}
            disabled={!selectedBet || !canAffordAnyBet}
          >
            {selectedBet
              ? `Confirm Bet (${selectedBet.betAmount} Gold)`
              : 'Select a Bet'}
          </button>
        </div>
      </div>
    </div>
  );
}
