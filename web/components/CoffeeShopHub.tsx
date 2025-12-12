import './CoffeeShopHub.css';

interface CoffeeShopHubProps {
    onNavigate: (page: 'store' | 'inventory' | 'store-selection') => void;
}

export default function CoffeeShopHub({ onNavigate }: CoffeeShopHubProps) {
    return (
        <div className="coffee-shop-hub">
            <div className="hub-title">
                <h1>Cozy Corner Scratchers</h1>
                <span>&mdash; Est. 2024 &mdash;</span>
            </div>

            <div
                className="hub-interactive-zone zone-counter"
                onClick={() => onNavigate('store-selection')}
                role="button"
                tabIndex={0}
            >
                <div className="zone-icon">🏪</div>
                <div className="zone-label">The Markets</div>
            </div>

            <div
                className="hub-interactive-zone zone-table"
                onClick={() => onNavigate('inventory')}
                role="button"
                tabIndex={0}
            >
                <div className="zone-icon">🎒</div>
                <div className="zone-label">Your Bag</div>
            </div>
        </div>
    );
}
