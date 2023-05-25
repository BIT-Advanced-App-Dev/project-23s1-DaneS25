import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../firebase';
import deck from './Assets/deck.json';

const GameInstance = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = location.pathname.split('/game/')[1];
  const playerId = searchParams.get('playerId');
  const players = JSON.parse(decodeURIComponent(searchParams.get('players')));

  const [dealtCards, setDealtCards] = useState([]);
  const currentPlayer = players.find((player) => player.id === playerId);
  const [isGameCreator, setIsGameCreator] = useState(false);

  useEffect(() => {
    const fetchGameCreator = async () => {
      const gameRef = doc(db, 'games', gameId);
      const gameSnapshot = await getDoc(gameRef);
      const gameData = gameSnapshot.data();
      const gameCreatorUid = gameData.creator;
      const currentUser = auth.currentUser;

      setIsGameCreator(currentUser && currentUser.uid === gameCreatorUid);
    };

    fetchGameCreator();
  }, [gameId]);

  useEffect(() => {
    const handsCollectionRef = collection(db, 'games', gameId, 'hands');
    const unsubscribe = onSnapshot(
      query(handsCollectionRef, where('playerId', 'in', players.map((player) => player.id))),
      (snapshot) => {
        const newDealtCards = [];
        snapshot.forEach((doc) => {
          const handData = doc.data();
          newDealtCards.push({ player: handData.playerId, cards: handData.cards });
        });
        setDealtCards(newDealtCards);
      }
    );

    return () => unsubscribe();
  }, [gameId, players]);

  const dealCards = async () => {
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
  
    const gameRef = doc(db, 'games', gameId);
  
    // Create the "hands" subcollection
    const handsCollectionRef = collection(gameRef, 'hands');
    await setDoc(doc(handsCollectionRef), {}); // Create an empty document in the "hands" subcollection
  
    const batch = writeBatch(db); // Create a batch instance using writeBatch()
  
    players.forEach((player) => {
      const cards = shuffledDeck.splice(0, 5);
      const handRef = doc(handsCollectionRef, player.id); // Use the player ID as the document ID in the "hands" subcollection
      batch.set(handRef, { playerId: player.id, cards });
    });
  
    await batch.commit();
  };

  const handleDealClick = () => {
    dealCards();
  };

  // Check if players array is null or undefined
  if (!players) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Game Instance:</h2>
      <p>{gameId}</p>
      <h3>Players:</h3>
      {players.map((player) => (
        <div key={player.id}>
          <p>{player.name}</p>
        </div>
      ))}
      <h3>Your Cards:</h3>
      {dealtCards.length > 0 && (
        <div>
          {dealtCards.find((hand) => hand.player === currentPlayer.id).cards.map((card, cardIndex) => (
            <span key={cardIndex}>
              {card.name} of {card.suit}
              {cardIndex !== dealtCards.find((hand) => hand.player === currentPlayer.id).cards.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}
      {isGameCreator && (
        <button onClick={handleDealClick}>Deal</button>
      )}
    </div>
  );
};

export default GameInstance;