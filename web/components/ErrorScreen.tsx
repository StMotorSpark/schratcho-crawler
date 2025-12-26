/**
 * Error Screen Component
 * 
 * Full-screen error display with retry functionality.
 */
import './ErrorScreen.css';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="error-screen">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Unable to Load Game Data</h2>
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={onRetry}>
          🔄 Try Again
        </button>
        <p className="error-hint">
          Make sure the backend server is running and accessible.
        </p>
      </div>
    </div>
  );
}
