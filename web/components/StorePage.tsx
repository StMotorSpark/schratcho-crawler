import { useState } from 'react';
import type { UserState } from '../../core/user-state';
import { TICKET_LAYOUTS, getTicketGoldCost, type TicketLayout, type TicketType } from '../../core/mechanics/ticketLayouts';
import {
  purchaseTicketForLayout,
  canAfford,
  getOwnedTicketsForLayout,
} from '../../core/user-state';
import OddsInfoModal from './OddsInfoModal';
import './StorePage.css';
import './shared-tabs.css';

interface StorePageProps {
  userState: UserState | null;
  onNavigateToInventory: () => void;
}

/**
 * Store page where users can purchase scratch tickets.
 * Displays all available ticket layouts with their costs.
 */
export default function StorePage({ userState, onNavigateToInventory }: StorePageProps) {
  const [activeTab, setActiveTab] = useState<TicketType>('Core');
  const allTicketLayouts = Object.values(TICKET_LAYOUTS);
  const ticketLayouts = allTicketLayouts.filter(layout => (layout.type || 'Core') === activeTab);
  const [oddsModalLayout, setOddsModalLayout] = useState<TicketLayout | null>(null);

  const handlePurchaseSingle = (layout: TicketLayout) => {
    const cost = getTicketGoldCost(layout);
    if (purchaseTicketForLayout(layout.id, cost)) {
      // Purchase successful - state will update via subscription
    }
  };

  const handlePurchaseFivePack = (layout: TicketLayout) => {
    const singleCost = getTicketGoldCost(layout);
    const packCost = singleCost * 5;
    
    if (!canAfford(packCost)) {
      return;
    }

    // Purchase 5 tickets atomically by checking total cost upfront
    // This prevents partial purchases if gold changes between purchases
    for (let i = 0; i < 5; i++) {
      purchaseTicketForLayout(layout.id, singleCost);
    }
  };

  return (
    <div className="store-page">
      <div className="store-header">
        <h2 className="store-title">🏪 Ticket Store</h2>
        <p className="store-subtitle">Purchase scratch tickets to try your luck!</p>
      </div>

      {/* Ticket Type Tabs */}
      <div className="ticket-tabs">
        <button
          className={`ticket-tab ${activeTab === 'Core' ? 'active' : ''}`}
          onClick={() => setActiveTab('Core')}
        >
          Core Tickets
        </button>
        <button
          className={`ticket-tab ${activeTab === 'Hand' ? 'active' : ''}`}
          onClick={() => setActiveTab('Hand')}
        >
          Hand Tickets
        </button>
      </div>

      <div className="ticket-grid">
        {ticketLayouts.map((layout) => {
          const cost = getTicketGoldCost(layout);
          const fivePackCost = cost * 5;
          const canAffordSingle = userState ? canAfford(cost) : false;
          const canAffordFivePack = userState ? canAfford(fivePackCost) : false;
          const ownedCount = getOwnedTicketsForLayout(layout.id);

          return (
            <div key={layout.id} className="ticket-card">
              <div className="ticket-card-header">
                <h3 className="ticket-card-title">{layout.name}</h3>
                <div className="ticket-card-header-actions">
                  <button
                    className="odds-info-btn"
                    onClick={() => setOddsModalLayout(layout)}
                    aria-label="View odds information"
                    title="View odds information"
                  >
                    ℹ️
                  </button>
                  {ownedCount > 0 && (
                    <span className="owned-badge">Owned: {ownedCount}</span>
                  )}
                </div>
              </div>
              
              <p className="ticket-card-description">{layout.description}</p>
              
              <div className="ticket-card-info">
                <span className="ticket-areas">
                  📦 {layout.scratchAreas.length} scratch area{layout.scratchAreas.length > 1 ? 's' : ''}
                </span>
                <span className="ticket-win-condition">
                  🎯 {formatWinCondition(layout.winCondition)}
                </span>
              </div>

              <div className="ticket-card-actions">
                <div className="price-tag">
                  <span className="price-icon">🪙</span>
                  <span className="price-amount">{cost}</span>
                  <span className="price-label">each</span>
                </div>

                <div className="purchase-buttons">
                  <button
                    className={`purchase-btn single ${!canAffordSingle ? 'disabled' : ''}`}
                    onClick={() => handlePurchaseSingle(layout)}
                    disabled={!canAffordSingle}
                  >
                    Buy 1
                  </button>
                  <button
                    className={`purchase-btn pack ${!canAffordFivePack ? 'disabled' : ''}`}
                    onClick={() => handlePurchaseFivePack(layout)}
                    disabled={!canAffordFivePack}
                    title={`Buy 5 tickets for ${fivePackCost} gold`}
                  >
                    Buy 5 ({fivePackCost} 🪙)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {userState && getTotalOwnedTickets() > 0 && (
        <div className="store-footer">
          <button className="go-to-inventory-btn" onClick={onNavigateToInventory}>
            🎒 Go to Inventory ({getTotalOwnedTickets()} ticket{getTotalOwnedTickets() > 1 ? 's' : ''})
          </button>
        </div>
      )}

      {/* Odds Information Modal */}
      {oddsModalLayout && (
        <OddsInfoModal
          layout={oddsModalLayout}
          onClose={() => setOddsModalLayout(null)}
        />
      )}
    </div>
  );
}

function getTotalOwnedTickets(): number {
  return Object.keys(TICKET_LAYOUTS).reduce((total, layoutId) => {
    return total + getOwnedTicketsForLayout(layoutId);
  }, 0);
}

function formatWinCondition(winCondition: string): string {
  switch (winCondition) {
    case 'no-win-condition':
      return 'Always wins';
    case 'match-two':
      return 'Match 2 to win';
    case 'match-three':
      return 'Match 3 to win';
    case 'match-all':
      return 'Match all to win';
    case 'find-one':
      return 'Find target to win';
    case 'total-value-threshold':
      return 'Value threshold';
    default:
      return winCondition;
  }
}
