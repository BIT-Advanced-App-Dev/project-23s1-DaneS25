import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, setDoc, writeBatch, updateDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import deck from './Assets/deck.json';
import "./gameInstance.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RingLoader } from 'react-spinners';

const GameInstance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const gameId = location.pathname.split('/game/')[1];
  const playerId = searchParams.get('playerId');
  const players = JSON.parse(decodeURIComponent(searchParams.get('players')));

  const [dealtCards, setDealtCards] = useState([]);
  const currentPlayer = players.find((player) => player.id === playerId);
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dealButtonDisabled, setDealButtonDisabled] = useState(false);

  // Fetch the game creator user
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

  // Fetch the hands collections and update them with new cards from replace cards function
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

  // Deal the initial hands of cards to players
  const dealCards = async () => {
    setIsLoading(true);
    setDealButtonDisabled(true);
    // Shuffle the cards
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { currentTurnPlayerId: players[0].id });
    // Create the hands subcollection
    const handsCollectionRef = collection(gameRef, 'hands');
    await setDoc(doc(handsCollectionRef), {});

    // Use writeBatch to write all the hands collections for all players at once
    const batch = writeBatch(db);

    players.forEach((player) => {
      const cards = shuffledDeck.splice(0, 5);
      const handRef = doc(handsCollectionRef, player.id);
      batch.set(handRef, { playerId: player.id, playerName: player.name, cards });
    });
    // Commit the hands for all the players to the hands collections
    await batch.commit();
    setIsLoading(false);
  };

  // Trigger for dealing the cards
  const handleDealClick = () => {
    dealCards();
  };

  // Handle the cards selected for replacement
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
        toast.error('Error updating card checked status:', error);
      }
    };
  };  

  // Replace selected cards with new cards 
  const handleReplaceClick = async () => {
    const handRef = doc(db, 'games', gameId, 'hands', currentPlayer.id);
    const handSnapshot = await getDoc(handRef);
    const handData = handSnapshot.data();
  
    // Get all the selected cards from the hand that are to be replaced
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
        toast.error('Error updating hand and discarded cards:', error);
      }
    } else {
      toast.error('No valid hand data found.');
    }
    // Update the current turn player ID after replacing cards
    const currentPlayerIndex = players.findIndex((player) => player.id === currentPlayer.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;
  
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { currentTurnPlayerId: nextPlayerId });
    // Give the player 3 seconds after replacing their cards to see the new cards in their hand
    setTimeout(() => {
      setGameEnded(true);
    }, 3000);
  };
  
  // Function to shuffle an array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Skip to the next players turn if the current turn player clicks 'pass' button
  const handlePassClick = async () => {
    const currentPlayerIndex = players.findIndex((player) => player.id === currentPlayer.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;
  
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { currentTurnPlayerId: nextPlayerId });
    setGameEnded(true);
  };  

  // Navigate to the evaluation screen after player takes a turn
  useEffect(() => {
    if (gameEnded) {
      navigate(`/evaluation?gameId=${gameId}&playerId=${playerId}`);
    }
  }, [gameEnded, gameId, playerId, navigate]);

  return (
    <div>
      <ToastContainer position="top-center" theme="dark" />
      <h1 className='head'>Game Instance</h1>
      <p>Game ID: {gameId}</p>
      <p className='playerName'>Current Player: {currentPlayer.name}</p>
      {isGameCreator && (
        <div>
          {isLoading ? (
            <div className="spinner-container">
              <RingLoader color="#123abc" size={30} />
            </div>
          ) : (
            <button
              className="dealButton"
              onClick={handleDealClick}
              disabled={dealButtonDisabled} // Disable the button based on the state
            >
              Deal Cards
            </button>
          )}
        </div>
      )}
      <p className='turn'>Your Cards:</p>
        <div className="cards-container">
        {dealtCards.map((dealt) => {
          if (dealt.player === playerId) {
            return (
              <div key={dealt.player}>
                <ul>
                  {dealt.cards.map((card) => (
                    <span
                      className="cards"
                      key={card.id}
                      style={{
                        backgroundColor: selectedCards.includes(card.id)
                          ? 'hsl(219, 92%, 53%)'
                          : '#5ad9f3',
                      }}
                      onClick={() => handleCardClick(card.id)}
                    >
                      {isLoading ? (
                      <div className="spinner-container">
                        <RingLoader color="#123abc" size={50} />
                      </div>
                      ) : (
                        `${card.name} of ${card.suit}` // Display the players cards
                      )}
                    </span>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
        </div>
      {currentPlayer.id === currentTurnPlayerId && (
        <div>
          <p className='turn'>It is now your turn!</p>
          {selectedCards.length > 0 ? (
            <button className='replaceButton' onClick={handleReplaceClick}>
              Replace Cards
            </button>
          ) : (
            <button className='replaceButton' disabled>
              Replace Cards
            </button>
          )}
          <button className='passButton' onClick={handlePassClick}>Pass</button>
        </div>
      )}
    </div>
  );  
};

export default GameInstance;