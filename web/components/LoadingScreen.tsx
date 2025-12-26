/**
 * Loading Screen Component
 * 
 * Full-screen loading indicator shown while fetching game data.
 */
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">Loading Schratcho Crawler...</h2>
        <p className="loading-subtitle">Fetching game data</p>
      </div>
    </div>
  );
}
