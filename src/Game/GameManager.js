import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, getDoc, getDocs } from 'firebase/firestore';

const GameManager = ({ userName }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'games'), async (snapshot) => {
      const gamesData = [];
  
      for (const doc of snapshot.docs) {
        const gameData = doc.data();
        const playersRef = collection(db, 'games', doc.id, 'players');
        const playersSnapshot = await getDocs(playersRef);
        const playersData = playersSnapshot.docs.map((doc) => doc.data().userName);
  
        const updatedGameData = {
          id: doc.id,
          ...gameData,
          players: playersData,
        };
  
        gamesData.push(updatedGameData);
      }
  
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

    await addDoc(collection(db, 'games'), {
      creator: user.uid,
      status: 'waiting',
    });
  };

  const joinGame = async (gameId) => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('You need to log in to join a group.');
      return;
    }
  
    const gameRef = doc(db, 'games', gameId);
    const playersRef = collection(gameRef, 'players');
  
    await addDoc(playersRef, { userId: user.uid, userName: userName });
  
    const gameSnapshot = await getDoc(gameRef);
    const gameData = gameSnapshot.data();
  
    const playersSnapshot = await getDocs(playersRef);
    const playersData = playersSnapshot.docs.map((doc) => doc.data().userName);
  
    const updatedGame = {
      id: gameId,
      ...gameData,
      players: playersData,
    };
  
    setGames((prevGames) => {
      const updatedGames = prevGames.map((game) =>
        game.id === updatedGame.id ? updatedGame : game
      );
      return updatedGames;
    });
  
    console.log(`User ${user.uid} joined game ${gameId}`);
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
            <>
              <button onClick={() => joinGame(game.id)}>Join Game</button>
              <p>Players: {game.players.join(', ')}</p>
            </>
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
