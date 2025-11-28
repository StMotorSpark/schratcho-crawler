import type { UserState } from '../../core/user-state';
import { TICKET_LAYOUTS, getTicketGoldCost, type TicketLayout } from '../../core/mechanics/ticketLayouts';
import { getOwnedTicketsForLayout } from '../../core/user-state';
import './InventoryPage.css';

interface InventoryPageProps {
  userState: UserState | null;
  onNavigateToStore: () => void;
  onSelectTicket: (layoutId: string) => void;
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
}: InventoryPageProps) {
  // Get all owned tickets
  const ownedTickets: OwnedTicket[] = Object.values(TICKET_LAYOUTS)
    .map((layout) => ({
      layout,
      count: getOwnedTicketsForLayout(layout.id),
    }))
    .filter((item) => item.count > 0);

  const totalTickets = ownedTickets.reduce((sum, item) => sum + item.count, 0);

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
                className="scratch-ticket-btn"
                onClick={() => onSelectTicket(layout.id)}
              >
                🎫 Scratch This Ticket
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
    </div>
  );
}
