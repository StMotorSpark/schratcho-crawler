import './CoffeeShopHub.css';

interface CoffeeShopHubProps {
    onNavigate: (page: 'store' | 'inventory') => void;
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
                onClick={() => onNavigate('store')}
                role="button"
                tabIndex={0}
            >
                <div className="zone-icon">🏪</div>
                <div className="zone-label">The Market</div>
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
