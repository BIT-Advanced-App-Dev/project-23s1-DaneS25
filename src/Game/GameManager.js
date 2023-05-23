import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, getDoc, getDocs } from 'firebase/firestore';
import { RingLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";

const GameManager = ({ userName }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

    const gameRef = await addDoc(collection(db, 'games'), {
      creator: user.uid,
      status: 'waiting',
    });

    // Retrieve the generated game ID
    const gameId = gameRef.id;
    console.log('Created game with ID:', gameId);
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
    const playersRef = collection(gameRef, 'players');
  
    // Fetch the players' subcollection
    const playersSnapshot = await getDocs(playersRef);
    const playerCount = playersSnapshot.size;
  
    // Check if the number of players is greater than or equal to 2
    if (playerCount < 2) {
      console.log('Minimum 2 players required to start the game.');
      return;
    }
  
    const playerNames = playersSnapshot.docs.map((doc) => doc.data().userName);
  
    // Update the game status to 'started'
    await updateDoc(gameRef, { status: 'started' });
    navigate(`/game/${gameId}?players=${encodeURIComponent(JSON.stringify(playerNames))}`);
  };  

  if (loading) {
    document.body.style.overflow = 'hidden';
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100vw', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RingLoader color="#123abc" loading={loading} />
        </div>
      </div>
    );
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

          {game.status === 'waiting' && game.creator === (auth.currentUser && auth.currentUser.uid) && (
              <>
                {game.players.length >= 2 ? (
                  <button onClick={() => startGame(game.id)}>Start Game</button>
                ) : (
                  <span>Waiting for players...</span>
                )}
              </>
            )}
        </div>
      ))}
    </div>
  );
};

export default GameManager;
