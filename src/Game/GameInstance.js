import React from 'react';
import { useLocation } from 'react-router-dom';

const GameInstance = () => {
  const location = useLocation();
  const gameId = location.pathname.split('/game/')[1];

  return (
    <div>
      <h2>Game Instance: {gameId}</h2>
      <h3>Players:</h3>
      <p>This is the game instance</p>
    </div>
  );
};

export default GameInstance;
