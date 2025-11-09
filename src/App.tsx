import { useState } from 'react';
import ScratchTicketCanvas from './components/ScratchTicketCanvas';
import ScratchTicketCSS from './components/ScratchTicketCSS';
import { getRandomPrize, type Prize } from './utils/prizes';
import './App.css';

type ImplementationType = 'canvas' | 'css';

function App() {
  const [prize, setPrize] = useState<Prize>(getRandomPrize());
  const [implementation, setImplementation] = useState<ImplementationType>('canvas');
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);

  const handleNewTicket = () => {
    setPrize(getRandomPrize());
    setIsCompleted(false);
    setKey((prev) => prev + 1);
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Schratcho Crawler</h1>
        <p className="subtitle">Scratch-off Demo</p>

        <div className="controls">
          <div className="implementation-selector">
            <button
              className={`impl-button ${implementation === 'canvas' ? 'active' : ''}`}
              onClick={() => {
                setImplementation('canvas');
                handleNewTicket();
              }}
            >
              Canvas API
            </button>
            <button
              className={`impl-button ${implementation === 'css' ? 'active' : ''}`}
              onClick={() => {
                setImplementation('css');
                handleNewTicket();
              }}
            >
              CSS Masking
            </button>
          </div>
        </div>

        <div className="ticket-wrapper">
          {implementation === 'canvas' ? (
            <ScratchTicketCanvas key={key} prize={prize} onComplete={handleComplete} />
          ) : (
            <ScratchTicketCSS key={key} prize={prize} onComplete={handleComplete} />
          )}
        </div>

        {isCompleted && (
          <button className="new-ticket-button" onClick={handleNewTicket}>
            🎫 New Ticket
          </button>
        )}

        <div className="info">
          <p>
            <strong>Current Implementation:</strong>{' '}
            {implementation === 'canvas' ? 'Canvas API' : 'CSS Masking'}
          </p>
          <p className="hint">💡 Try both implementations to compare performance!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
