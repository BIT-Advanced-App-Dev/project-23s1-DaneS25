import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import deck from './Assets/deck.json';

const GameInstance = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = location.pathname.split('/game/')[1];
  const players = JSON.parse(decodeURIComponent(searchParams.get('players')));

  const [dealtCards, setDealtCards] = useState([]);

  const dealCards = () => {
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    const newDealtCards = [];

    players.forEach(player => {
      const cards = shuffledDeck.splice(0, 5);
      newDealtCards.push({ player, cards });
    });

    setDealtCards(newDealtCards);
  };

  const handleDealClick = () => {
    dealCards();
  };

  return (
    <div>
      <h2>Game Instance:</h2>
      <p>{gameId}</p>
      <h3>Players:</h3>
      {players.map((player, index) => (
        <div key={index}>
          <p>{player}</p>
          {dealtCards.length > 0 && (
            <p>
              Cards:
              {dealtCards[index].cards.map((card, cardIndex) => (
                <span key={cardIndex}>
                  {card.name} of {card.suit}
                  {cardIndex !== dealtCards[index].cards.length - 1 && ', '}
                </span>
              ))}
            </p>
          )}
        </div>
      ))}
      <button onClick={handleDealClick}>Deal</button>
    </div>
  );
};

export default GameInstance;
