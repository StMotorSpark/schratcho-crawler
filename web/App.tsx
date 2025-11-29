import { useState, useEffect, useCallback } from 'react';
import Header, { type PageType } from './components/Header';
import StorePage from './components/StorePage';
import InventoryPage from './components/InventoryPage';
import ScratchPage from './components/ScratchPage';
import Settings from './components/Settings';
import {
  initializeUserState,
  getUserState,
  subscribeToUserState,
  type UserState,
} from '../core/user-state';
import './App.css';
import './components/Header.css';
import './components/StorePage.css';
import './components/InventoryPage.css';
import './components/ScratchPage.css';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('store');
  const [showSettings, setShowSettings] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [hasPendingPrizes, setHasPendingPrizes] = useState(false);

  // Initialize user state on mount and subscribe to changes
  useEffect(() => {
    initializeUserState();
    setUserState(getUserState());
    
    // Subscribe to state changes
    const unsubscribe = subscribeToUserState((newState) => {
      setUserState(newState);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleNavigate = useCallback((page: PageType) => {
    setCurrentPage(page);
    // Reset scratch-related state when leaving scratch page
    if (page !== 'scratch') {
      setSelectedLayoutId(null);
      setHasPendingPrizes(false);
    }
  }, []);

  const handleSelectTicket = useCallback((layoutId: string) => {
    setSelectedLayoutId(layoutId);
    setCurrentPage('scratch');
  }, []);

  const handleScratchComplete = useCallback(() => {
    setSelectedLayoutId(null);
    setHasPendingPrizes(false);
    setCurrentPage('inventory');
  }, []);

  const handleScratchCancel = useCallback(() => {
    setSelectedLayoutId(null);
    setHasPendingPrizes(false);
    setCurrentPage('inventory');
  }, []);

  const handlePendingPrizesChange = useCallback((hasPending: boolean) => {
    setHasPendingPrizes(hasPending);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'store':
        return (
          <StorePage
            userState={userState}
            onNavigateToInventory={() => handleNavigate('inventory')}
          />
        );
      case 'inventory':
        return (
          <InventoryPage
            userState={userState}
            onNavigateToStore={() => handleNavigate('store')}
            onSelectTicket={handleSelectTicket}
          />
        );
      case 'scratch':
        if (!selectedLayoutId) {
          // If no layout selected, go back to inventory
          handleNavigate('inventory');
          return null;
        }
        return (
          <ScratchPage
            layoutId={selectedLayoutId}
            onComplete={handleScratchComplete}
            onCancel={handleScratchCancel}
            onHasPendingPrizesChange={handlePendingPrizesChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Hide header on scratch page for more vertical space */}
        {currentPage !== 'scratch' && (
          <Header
            userState={userState}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onOpenSettings={() => setShowSettings(true)}
            hasPendingPrizes={hasPendingPrizes}
          />
        )}
        
        {renderPage()}
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
