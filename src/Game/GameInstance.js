import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import deck from './Assets/deck.json';

const GameInstance = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = location.pathname.split('/game/')[1];
  const playerId = searchParams.get('playerId');
  const players = JSON.parse(decodeURIComponent(searchParams.get('players')));

  const [dealtCards, setDealtCards] = useState([]);

  useEffect(() => {
    // Verify the players array when the component mounts
    console.log('Players:', players);
  }, [players]);

  const dealCards = () => {
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    const newDealtCards = [];

    players.forEach((player) => {
      const cards = shuffledDeck.splice(0, 5);
      newDealtCards.push({ player, cards });
    });

    setDealtCards(newDealtCards);
  };

  const handleDealClick = () => {
    dealCards();
  };

  // Check if players array is null or undefined
  if (!players) {
    return <div>Loading...</div>;
  }

  const currentPlayer = players.find((player) => player.id === playerId);

  return (
    <div>
      <h2>Game Instance:</h2>
      <p>{gameId}</p>
      <h3>Players:</h3>
      {players.map((player, index) => (
        <div key={index}>
          <p>{player.name}</p>
          {dealtCards.length > 0 && player.id === currentPlayer.id && (
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