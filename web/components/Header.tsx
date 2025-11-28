import type { UserState } from '../../core/user-state';

export type PageType = 'store' | 'inventory' | 'scratch';

interface HeaderProps {
  userState: UserState | null;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onOpenSettings: () => void;
  /** Whether the user has pending prizes that haven't been claimed */
  hasPendingPrizes?: boolean;
}

/**
 * Header component displayed on all pages.
 * Shows gold balance, navigation, and settings.
 */
export default function Header({
  userState,
  currentPage,
  onNavigate,
  onOpenSettings,
  hasPendingPrizes = false,
}: HeaderProps) {
  const handleNavigate = (page: PageType) => {
    if (hasPendingPrizes && currentPage === 'scratch' && page !== 'scratch') {
      const confirmLeave = window.confirm(
        '⚠️ Warning: You have pending prizes that haven\'t been claimed!\n\nIf you leave now, you will lose your unclaimed prizes.\n\nAre you sure you want to leave?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    onNavigate(page);
  };

  return (
    <header className="game-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">🎮 Schratcho</h1>
        </div>
        
        <nav className="header-nav">
          <button
            className={`nav-button ${currentPage === 'store' ? 'active' : ''}`}
            onClick={() => handleNavigate('store')}
          >
            🏪 Store
          </button>
          <button
            className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
            onClick={() => handleNavigate('inventory')}
          >
            🎒 Inventory
          </button>
        </nav>

        <div className="header-right">
          {userState && (
            <div className="header-gold">
              <span className="gold-icon">🪙</span>
              <span className="gold-amount">{userState.currentGold}</span>
            </div>
          )}
          <button
            className="header-settings-button"
            onClick={onOpenSettings}
            aria-label="Open settings"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
