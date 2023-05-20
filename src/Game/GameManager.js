import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';

function GameManager() {
  const [gameId, setGameId] = useState('');
  const [isPlayer, setIsPlayer] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'games'), (snapshot) => {
      const gamesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesData);
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createGame = async () => {
    const user = auth.currentUser;
    if (!user) {
      // Handle case where user is not authenticated
      return;
    }

    const gameRef = await addDoc(collection(db, 'games'), {
      creator: user.uid,
      status: 'waiting',
    });
    setGameId(gameRef.id);
  };

  const joinGame = async (gameId) => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('You need to log in to join a group.');
      return;
    }

    const gameRef = doc(db, 'games', gameId);
    const playersRef = collection(gameRef, 'players');
    await addDoc(playersRef, { userId: user.uid });

    console.log(`User ${user.uid} joined game ${gameId}`);
    setIsPlayer(true);
  };

  const startGame = async (gameId) => {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { status: 'started' });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error occurred: {errorMessage}</div>;
  }

  return (
    <div>
      <button onClick={createGame}>Create Game</button>

      {games.map((game) => (
        <div key={game.id}>
          <p>Game ID: {game.id}</p>
          <p>Status: {game.status}</p>

          {game.status === 'waiting' && (
            <button onClick={() => joinGame(game.id)}>Join Game</button>
          )}

          {game.status === 'waiting' && game.creator === auth.currentUser?.uid && (
            <button onClick={() => startGame(game.id)}>Start Game</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default GameManager;
