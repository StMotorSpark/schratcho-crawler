import { useEffect, useState } from 'react';
import { detectCapabilities, getCapabilityStatus, type BrowserCapabilities } from '../../core/mechanics/capabilities';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);

  useEffect(() => {
    // Detect capabilities when component mounts
    const caps = detectCapabilities();
    setCapabilities(caps);
  }, []);

  if (!capabilities) {
    return null;
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Browser Capabilities</h3>
            <p className="settings-description">
              Your browser's support for game features:
            </p>

            <div className="capability-list">
              <div className="capability-item">
                <div className="capability-name">
                  <span className="capability-icon">📳</span>
                  <span>Haptic Feedback</span>
                </div>
                <div className="capability-status">
                  {getCapabilityStatus(capabilities.hapticFeedback)}
                </div>
              </div>
              {!capabilities.hapticFeedback && (
                <p className="capability-note">
                  Note: iOS devices do not support the Vibration API. Haptic feedback is not available on iPhone/iPad.
                </p>
              )}

              <div className="capability-item">
                <div className="capability-name">
                  <span className="capability-icon">🔊</span>
                  <span>Sound Effects</span>
                </div>
                <div className="capability-status">
                  {getCapabilityStatus(capabilities.soundEffects)}
                </div>
              </div>
              {capabilities.soundEffects && (
                <p className="capability-note">
                  Note: Sound effects require user interaction to start. Tap the screen to enable audio.
                </p>
              )}
            </div>
          </section>

          <section className="settings-section">
            <h3>About</h3>
            <p className="settings-description">
              Schratcho Crawler combines scratch-off tickets with rogue-like progression and dungeon crawler mechanics.
            </p>
            <p className="settings-version">Version 1.0.0</p>
          </section>
        </div>
      </div>
    </div>
  );
}
