import { useMemo } from 'react';
import type { UserState } from '../../core/user-state';
import { DEFAULT_STORES, getStorePriceRange, isStoreUnlocked, type Store } from '../../core/mechanics/stores';
import { useGameData } from '../contexts/GameDataContext';
import './StoreSelectionPage.css';

interface StoreSelectionPageProps {
  userState: UserState | null;
  onSelectStore: (storeId: string) => void;
}

/**
 * Store selection page where users can browse and select from multiple stores.
 * Stores may be locked based on total gold earned.
 */
export default function StoreSelectionPage({ userState, onSelectStore }: StoreSelectionPageProps) {
  const totalGoldEarned = userState?.totalGoldEarned || 0;
  const { data: gameData } = useGameData();
  
  // Use API stores if available, fall back to hardcoded stores
  const stores = useMemo(() => {
    return gameData?.stores && gameData.stores.length > 0 ? gameData.stores : DEFAULT_STORES;
  }, [gameData]);

  const handleStoreClick = (store: Store) => {
    const unlocked = isStoreUnlocked(store, totalGoldEarned);
    if (unlocked) {
      onSelectStore(store.id);
    }
  };

  return (
    <div className="store-selection-page">
      <div className="store-selection-header">
        <h2 className="store-selection-title">🏪 Markets & Parlors</h2>
        <p className="store-selection-subtitle">Choose a store to browse tickets</p>
      </div>

      <div className="stores-grid">
        {stores.map((store) => {
          const unlocked = isStoreUnlocked(store, totalGoldEarned);
          const priceRange = getStorePriceRange(store);
          const priceText = priceRange.min === priceRange.max 
            ? `${priceRange.min} gold`
            : `${priceRange.min}-${priceRange.max} gold`;

          return (
            <div
              key={store.id}
              className={`store-card ${unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => handleStoreClick(store)}
              role="button"
              tabIndex={unlocked ? 0 : -1}
              aria-disabled={!unlocked}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoreClick(store);
                }
              }}
            >
              <div className="store-card-icon">{store.icon}</div>
              <h3 className="store-card-name">{store.name}</h3>
              <p className="store-card-description">{store.description}</p>
              
              {unlocked ? (
                <div className="store-card-info">
                  <div className="store-price-range">
                    <span className="price-label">Tickets:</span>
                    <span className="price-value">{priceText}</span>
                  </div>
                  <button className="store-enter-btn">
                    Browse Tickets →
                  </button>
                </div>
              ) : (
                <div className="store-locked-info">
                  <div className="lock-icon">🔒</div>
                  <div className="unlock-requirement">
                    <span className="requirement-label">Requires:</span>
                    <span className="requirement-value">
                      {store.unlockRequirement} total gold earned
                    </span>
                  </div>
                  <div className="unlock-progress">
                    <span className="progress-label">Your progress:</span>
                    <span className="progress-value">
                      {totalGoldEarned} / {store.unlockRequirement}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
