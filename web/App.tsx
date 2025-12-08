import { useState, useEffect, useCallback } from 'react';
import Header, { type PageType } from './components/Header';
import StorePage from './components/StorePage';
import InventoryPage from './components/InventoryPage';
import ScratchPage from './components/ScratchPage';
import CoffeeShopHub from './components/CoffeeShopHub';
import Settings from './components/Settings';
import HandModal from './components/HandModal';
import {
  initializeUserState,
  getUserState,
  subscribeToUserState,
  checkAndUnlockAchievements,
  type UserState,
} from '../core/user-state';
import type { TicketType } from '../core/mechanics/ticketLayouts';
import './App.css';
import './components/Header.css';
import './components/StorePage.css';
import './components/InventoryPage.css';
import './components/ScratchPage.css';
import './components/HandModal.css';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('hub');
  const [showSettings, setShowSettings] = useState(false);
  const [showHandModal, setShowHandModal] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [hasPendingPrizes, setHasPendingPrizes] = useState(false);
  const [inventoryActiveTab, setInventoryActiveTab] = useState<TicketType>('Core');

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
    
    // Scroll to top when navigating between pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectTicket = useCallback((layoutId: string) => {
    setSelectedLayoutId(layoutId);
    setCurrentPage('scratch');
    
    // Preserve the active tab for when user returns from scratching
    // Note: We could detect the ticket type here, but the state is already set by user interaction
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

  const handleOpenHandModal = useCallback(() => {
    setShowHandModal(true);
  }, []);

  const handleCloseHandModal = useCallback(() => {
    setShowHandModal(false);
  }, []);

  const handleHandCashedOut = useCallback((_totalValue: number) => {
    // Check for achievements after cashing out
    checkAndUnlockAchievements();
    // User state will update through subscription
  }, []);

  const handleContinueScratch = useCallback(() => {
    // Navigate to inventory if not already there
    if (currentPage !== 'inventory') {
      handleNavigate('inventory');
    }
  }, [currentPage, handleNavigate]);

  const renderPage = () => {
    switch (currentPage) {
      case 'hub':
        return <CoffeeShopHub onNavigate={handleNavigate} />;
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
            onOpenHandModal={handleOpenHandModal}
            activeTab={inventoryActiveTab}
            onActiveTabChange={setInventoryActiveTab}
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
            onOpenHandModal={handleOpenHandModal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Hide header on scratch page AND hub page for visual fidelity */}
        {currentPage !== 'scratch' && currentPage !== 'hub' && (
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

      {showHandModal && (
        <HandModal
          onClose={handleCloseHandModal}
          onHandCashedOut={handleHandCashedOut}
          onContinueScratch={handleContinueScratch}
        />
      )}
    </div>
  );
}

export default App;
