import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, setDoc, writeBatch, updateDoc } from 'firebase/firestore';
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
  const [selectedCards, setSelectedCards] = useState([]);

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
      query(handsCollectionRef, where('playerId', '==', playerId)),
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
  }, [gameId, playerId]);

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

  const handleCardClick = async (cardId) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else {
      setSelectedCards([...selectedCards, cardId]);
    }
  
    try {
      const handRef = doc(db, 'games', gameId, 'hands', currentPlayer.id);
      const handSnapshot = await getDoc(handRef);
      const handData = handSnapshot.data();
  
      const updatedCards = handData.cards.map((card) => {
        if (card.id === cardId) {
          return { ...card, checked: !card.checked };
        }
        return card;
      });
  
      await updateDoc(handRef, { cards: updatedCards });
    } catch (error) {
      console.error('Error updating card checked status:', error);
    }
  };  

  const handleReplaceClick = async () => {
    const handRef = doc(db, 'games', gameId, 'hands', currentPlayer.id);
    const handSnapshot = await getDoc(handRef);
    const handData = handSnapshot.data();
    const remainingCards = handData.cards.filter((card) => !selectedCards.includes(card.id));
  
    await updateDoc(handRef, { cards: remainingCards });
  
    const discardedCardsRef = collection(db, 'games', gameId, 'discardedCards');
  
    const batch = writeBatch(db);
  
    selectedCards.forEach((cardId) => {
      const discardedCardRef = doc(discardedCardsRef);
      batch.set(discardedCardRef, { playerId: currentPlayer.id, cardId });
    });
  
    await batch.commit();
  
    setSelectedCards([]);
  
    // Check the number of remaining cards
    if (remainingCards.length < 5) {
      const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
      const newCards = shuffledDeck.splice(0, 5 - remainingCards.length);
  
      // Update the hand document with new cards
      await updateDoc(handRef, {
        cards: [...remainingCards, ...newCards]
      });
    }
  };  

  return (
    <div>
      <h1>Game Instance</h1>
      <h2>Game ID: {gameId}</h2>
      <h3>Player ID: {playerId}</h3>
      <h3>Current Player: {currentPlayer.name}</h3>
      {isGameCreator && (
        <div>
          <button onClick={handleDealClick}>Deal Cards</button>
        </div>
      )}
      <h4>Your Cards:</h4>
      {dealtCards.map((dealt) => {
        if (dealt.player === playerId) {
          return (
            <div key={dealt.player}>
              <ul>
                {dealt.cards.map((card) => (
                  <li
                    key={card.id}
                    style={{ backgroundColor: selectedCards.includes(card.id) ? 'yellow' : 'white' }}
                    onClick={() => handleCardClick(card.id)}
                  >
                    {`${card.name} of ${card.suit}`}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
      <div>
        <button onClick={handleReplaceClick}>Replace Cards</button>
      </div>
    </div>
  );  
};

export default GameInstance;