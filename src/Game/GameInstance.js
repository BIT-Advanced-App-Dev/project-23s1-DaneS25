import React from 'react';
import { useLocation } from 'react-router-dom';

const GameInstance = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = location.pathname.split('/game/')[1];
  const players = JSON.parse(decodeURIComponent(searchParams.get('players')));

  return (
    <div>
      <h2>Game Instance: </h2>
        <p>{gameId}</p>
      <h3>Players:</h3>
        {players.map((player, index) => (
          <p key={index}>{player}</p>
        ))}
    </div>
  );
};

export default GameInstance;
