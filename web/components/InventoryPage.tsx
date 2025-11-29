import type { UserState } from '../../core/user-state';
import { TICKET_LAYOUTS, getTicketGoldCost, type TicketLayout } from '../../core/mechanics/ticketLayouts';
import { getOwnedTicketsForLayout, isHandFull, hasHand } from '../../core/user-state';
import FloatingHandButton from './FloatingHandButton';
import './InventoryPage.css';

interface InventoryPageProps {
  userState: UserState | null;
  onNavigateToStore: () => void;
  onSelectTicket: (layoutId: string) => void;
  onOpenHandModal: () => void;
}

interface OwnedTicket {
  layout: TicketLayout;
  count: number;
}

/**
 * Inventory page where users can view their owned tickets
 * and select one to scratch.
 */
export default function InventoryPage({
  onNavigateToStore,
  onSelectTicket,
  onOpenHandModal,
}: InventoryPageProps) {
  // Get all owned tickets
  const ownedTickets: OwnedTicket[] = Object.values(TICKET_LAYOUTS)
    .map((layout) => ({
      layout,
      count: getOwnedTicketsForLayout(layout.id),
    }))
    .filter((item) => item.count > 0);

  const totalTickets = ownedTickets.reduce((sum, item) => sum + item.count, 0);

  // Check if hand is full - user must cash out before scratching more
  const handIsFull = isHandFull();
  const hasActiveHand = hasHand();

  const handleSelectTicket = (layoutId: string) => {
    if (handIsFull) {
      // Prompt user to cash out their hand first
      onOpenHandModal();
      return;
    }
    onSelectTicket(layoutId);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2 className="inventory-title">🎒 Your Tickets</h2>
        <p className="inventory-subtitle">
          {totalTickets > 0
            ? `You have ${totalTickets} ticket${totalTickets > 1 ? 's' : ''} ready to scratch!`
            : 'Your inventory is empty. Visit the store to buy tickets!'}
        </p>
      </div>

      {/* Hand full warning banner */}
      {handIsFull && (
        <div className="hand-full-banner" onClick={onOpenHandModal}>
          <span className="banner-icon">✋</span>
          <span className="banner-text">Your hand is full! Tap here to cash out.</span>
        </div>
      )}

      {/* Active hand info banner */}
      {hasActiveHand && !handIsFull && (
        <div className="active-hand-banner" onClick={onOpenHandModal}>
          <span className="banner-icon">🖐</span>
          <span className="banner-text">You have an active hand. Tap to view.</span>
        </div>
      )}

      {ownedTickets.length > 0 ? (
        <div className="inventory-grid">
          {ownedTickets.map(({ layout, count }) => (
            <div key={layout.id} className="inventory-ticket-card">
              <div className="inventory-card-header">
                <h3 className="inventory-card-title">{layout.name}</h3>
                <span className="ticket-count-badge">×{count}</span>
              </div>

              <p className="inventory-card-description">{layout.description}</p>

              <div className="inventory-card-info">
                <span className="info-item">
                  📦 {layout.scratchAreas.length} area{layout.scratchAreas.length > 1 ? 's' : ''}
                </span>
                <span className="info-item">
                  💰 Value: {getTicketGoldCost(layout)} 🪙
                </span>
              </div>

              <button
                className={`scratch-ticket-btn ${handIsFull ? 'disabled' : ''}`}
                onClick={() => handleSelectTicket(layout.id)}
                disabled={handIsFull}
              >
                {handIsFull ? '✋ Hand Full' : '🎫 Scratch This Ticket'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-inventory">
          <div className="empty-icon">📭</div>
          <p className="empty-message">No tickets in your inventory</p>
          <button className="go-to-store-btn" onClick={onNavigateToStore}>
            🏪 Visit Store
          </button>
        </div>
      )}

      {ownedTickets.length > 0 && (
        <div className="inventory-footer">
          <button className="go-to-store-btn secondary" onClick={onNavigateToStore}>
            🏪 Buy More Tickets
          </button>
        </div>
      )}

      {/* Floating hand button */}
      <FloatingHandButton onClick={onOpenHandModal} />
    </div>
  );
}
