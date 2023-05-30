import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, setDoc, writeBatch, updateDoc, getDocs } from 'firebase/firestore';
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
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState(null);

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

  useEffect(() => {
    const gameRef = doc(db, 'games', gameId);
    const unsubscribe = onSnapshot(gameRef, (gameSnapshot) => {
      const gameData = gameSnapshot.data();
      setCurrentTurnPlayerId(gameData.currentTurnPlayerId);
    });

    return () => unsubscribe();
  }, [gameId]);

  const dealCards = async () => {
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { currentTurnPlayerId: players[0].id });
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
    if (currentPlayer.id === currentTurnPlayerId) {
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
  };  

  const handleReplaceClick = async () => {
    const handRef = doc(db, 'games', gameId, 'hands', currentPlayer.id);
    const handSnapshot = await getDoc(handRef);
    const handData = handSnapshot.data();
  
    if (handSnapshot.exists() && handData && handData.cards) {
      const remainingCards = handData.cards.filter((card) => !selectedCards.includes(card.id));
  
      // Get all the existing cards in other players' hands
      const otherPlayersHandsCollectionRef = collection(db, 'games', gameId, 'hands');
      const otherPlayersHandsSnapshot = await getDocs(otherPlayersHandsCollectionRef);
      const existingCardsInHands = [];
      otherPlayersHandsSnapshot.forEach((doc) => {
        if (doc.id !== currentPlayer.id) {
          const otherHandData = doc.data();
          if (otherHandData && otherHandData.cards) {
            const otherHandCards = otherHandData.cards.map((card) => card.id);
            existingCardsInHands.push(...otherHandCards);
          }
        }
      });
  
      // Get the discarded cards
      const discardedCardsCollectionRef = collection(db, 'games', gameId, 'discardedCards');
      const discardedCardsSnapshot = await getDocs(discardedCardsCollectionRef);
      const discardedCards = [];
      discardedCardsSnapshot.forEach((doc) => {
        const discardedCardData = doc.data();
        if (discardedCardData && discardedCardData.cardId) {
          discardedCards.push(discardedCardData.cardId);
        }
      });
  
      // Filter the new cards that satisfy the conditions
      let newCards = remainingCards.length < 5 ? deck.filter((card) => {
        return (
          !existingCardsInHands.includes(card.id) &&
          !discardedCards.includes(card.id) &&
          !selectedCards.includes(card.id) &&
          !handData.cards.some((handCard) => handCard.id === card.id)
        );
      }) : [];
  
      // Randomize the new cards
      newCards = shuffleArray(newCards).slice(0, 5 - remainingCards.length);
  
      // Perform the necessary updates with the new cards
      const updatedHand = {
        cards: [...remainingCards, ...newCards],
      };
  
      try {
        await updateDoc(handRef, updatedHand);
  
        const discardedCardsRef = collection(db, 'games', gameId, 'discardedCards');
        const batch = writeBatch(db);
  
        selectedCards.forEach((cardId) => {
          const discardedCardRef = doc(discardedCardsRef);
          batch.set(discardedCardRef, { playerId: currentPlayer.id, cardId });
        });
  
        await batch.commit();
        setSelectedCards([]);
      } catch (error) {
        console.error('Error updating hand and discarded cards:', error);
      }
    } else {
      console.error('No valid hand data found.');
    }
    // Update the current turn player ID after replacing cards
    const currentPlayerIndex = players.findIndex((player) => player.id === currentPlayer.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;
  
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { currentTurnPlayerId: nextPlayerId });
  };
  
  // Function to shuffle an array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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
                  <div
                    key={card.id}
                    style={{ backgroundColor: selectedCards.includes(card.id) ? 'yellow' : 'white' }}
                    onClick={() => handleCardClick(card.id)}
                  >
                    {`${card.name} of ${card.suit}`}
                  </div>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
      {currentPlayer.id === currentTurnPlayerId && (
        <div>
          <p>It is now your turn!</p>
          <button onClick={handleReplaceClick}>Replace Cards</button>
        </div>
      )}
    </div>
  );  
};

export default GameInstance;