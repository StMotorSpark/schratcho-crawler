import { useState } from 'react';
import ScratchTicketCSS from './components/ScratchTicketCSS';
import { getRandomPrize, type Prize } from './utils/prizes';
import './App.css';

function App() {
  const [prize, setPrize] = useState<Prize>(getRandomPrize());
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
        <h1 className="title">🎮 Schratcho Crawler</h1>
        <p className="subtitle">Scratch to reveal your prize!</p>

        <div className="ticket-wrapper">
          <ScratchTicketCSS key={key} prize={prize} onComplete={handleComplete} />
        </div>

        <button className="new-ticket-button" onClick={handleNewTicket}>
          🎫 New Ticket
        </button>

        {isCompleted && (
          <div className="completion-badge">
            <p>✨ Ticket Completed! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
