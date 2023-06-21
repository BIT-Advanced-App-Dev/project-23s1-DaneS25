import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, getDoc, getDocs } from 'firebase/firestore';
import { RingLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import "./gameManager.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GameManager = ({ userName }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // UseEffect that creates GameInstance URl and navigates all players in the game to it 
  useEffect(() => {
    const navigateToGameInstance = (gameId) => {
      const gameRef = doc(db, 'games', gameId);
      const playersRef = collection(gameRef, 'players');

      getDocs(playersRef).then((playersSnapshot) => {
        const playersData = playersSnapshot.docs.map((doc) => doc.data());
        const players = playersData.map((player) => ({
          name: player.userName,
          id: player.userId,
        }));

        const currentUser = auth.currentUser;
        const currentUserPlayer = players.find((player) => player.id === currentUser.uid);

        if (currentUserPlayer) {
          const gamePlayers = encodeURIComponent(JSON.stringify(players));
          navigate(`/game/${gameId}?playerId=${currentUserPlayer.id}&players=${gamePlayers}`);
        }
      });
    };

    const unsubscribe = onSnapshot(collection(db, 'games'), async (snapshot) => {
      const gamesData = [];

      for (const doc of snapshot.docs) {
        const gameData = doc.data();
        const playersRef = collection(db, 'games', doc.id, 'players');
        const playersSnapshot = await getDocs(playersRef);
        const playersData = playersSnapshot.docs.map((doc) => doc.data());

        const updatedGameData = {
          id: doc.id,
          ...gameData,
          players: playersData,
        };

        gamesData.push(updatedGameData);

        if (updatedGameData.status === 'started') {
          navigateToGameInstance(updatedGameData.id);
        }
      }

      setGames(gamesData);
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Allow create game if user is authenticated
  const createGame = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('User not authenticated.');
      return;
    }

    const gameRef = await addDoc(collection(db, 'games'), {
      creator: user.uid,
      status: 'waiting',
      maxPlayers: 5,
    });

    // Retrieve the generated game ID
    const gameId = gameRef.id;
    console.log('Created game with ID:', gameId);
  };

  // Make sure only authenticated users can join a game
  const joinGame = async (gameId) => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('You need to log in to join a game.');
      return;
    }
  
    const gameRef = doc(db, 'games', gameId);
    const playersRef = collection(gameRef, 'players');
    // Create players subcollection in games doc
    await addDoc(playersRef, { userId: user.uid, userName: userName });
  
    const gameSnapshot = await getDoc(gameRef);
    const gameData = gameSnapshot.data();
  
    // Subscribe to players collection
    onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map((doc) => doc.data());
  
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
      // Check if game has maximum players in it
      if (!updatedGame || updatedGame.players.length >= 5) {
        toast.success('This game is full.');
        return;
      }
    });
  
    console.log(`User ${user.uid} joined game ${gameId}`);
  };     

  const startGame = async (gameId) => {
    const gameRef = doc(db, 'games', gameId);

    // Update the game status to 'started'
    await updateDoc(gameRef, { status: 'started' });
  };

  // If loading set ring loader to wait until loading data is completed
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
      <ToastContainer position="top-center" theme="dark" />
      <button className='createButton' onClick={createGame}>Create Game</button>
      {games.map((game) => (
        <div key={game.id}>
          <p>Game ID: {game.id}</p>
          <p>Status: {game.status}</p>

          {game.status === 'waiting' && (
            <>
              {game.players.length >= 5 ? (
                <button className='joinButton' disabled>Game Full</button>
              ) : (
                <button className='joinButton' onClick={() => joinGame(game.id)}>Join Game</button>
              )}
              <p className='players'>Players: {game.players.map((player) => player.userName).join(', ')}</p>
            </>
          )}

          {game.status === 'waiting' && game.creator === (auth.currentUser && auth.currentUser.uid) && (
            <>
              {game.players.length >= 2 ? (
                <button className='startButton' onClick={() => startGame(game.id)}>Start Game</button>
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
