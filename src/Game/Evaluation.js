import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, setDoc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import evaluateHand from './HandEvaluator';
import "./evaluation.css"

const Evaluation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const gameId = searchParams.get('gameId');
  const playerId = searchParams.get('playerId');
  const [evaluationTriggered, setEvaluationTriggered] = useState(false);
  const [winningHand, setWinningHand] = useState(null);
  const [dealtCards, setDealtCards] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [evaluatedHandsCount, setEvaluatedHandsCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
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

  const createClickCountDocument = async () => {
    const clickCountCollectionRef = collection(db, 'games', gameId, 'clickCount');
    const newClickCountDocRef = doc(clickCountCollectionRef);

    // Create a new document with a count variable
    await setDoc(newClickCountDocRef, {
      count: 1 // Set the initial count to 1
    });

    console.log('New clickCount document created');
  };

  // Function to count the documents in the player subcollection
  const countPlayerDocuments = useCallback(async () => {
    const playerCollectionRef = collection(db, 'games', gameId, 'players');
    const playerSnapshot = await getDocs(playerCollectionRef);
    const count = playerSnapshot.size;
    console.log('Total player documents:', count);
    setPlayerCount(count);
  }, [gameId]);

  // Function to count the documents in the evaluatedHands subcollection
  const countEvaluatedHandsDocuments = useCallback(() => {
    const evaluatedHandsCollectionRef = collection(db, 'games', gameId, 'evaluatedHands');
    const unsubscribe = onSnapshot(evaluatedHandsCollectionRef, (snapshot) => {
      const count = snapshot.size;
      console.log('Total evaluatedHands documents:', count);
      setEvaluatedHandsCount(count);
    });

    return () => unsubscribe();
  }, [gameId]);

  // Function to count the documents in the clickCount subcollection
  const countClickCountDocuments = useCallback(() => {
    const clickCountCollectionRef = collection(db, 'games', gameId, 'clickCount');
    const unsubscribe = onSnapshot(clickCountCollectionRef, (snapshot) => {
      const count = snapshot.size;
      console.log('Total clickCount documents:', count);
      setClickCount(count);
    });

    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    countPlayerDocuments();
    const unsubscribeEvaluatedHands = countEvaluatedHandsDocuments();
    const unsubscribeClickCount = countClickCountDocuments();

    return () => {
      unsubscribeEvaluatedHands();
      unsubscribeClickCount();
    };
  }, [countPlayerDocuments, countEvaluatedHandsDocuments, countClickCountDocuments]);

  useEffect(() => {
    const handsCollectionRef = collection(db, 'games', gameId, 'hands');
    const unsubscribe = onSnapshot(
      query(handsCollectionRef, where('playerId', '==', playerId)),
      (snapshot) => {
        const newDealtCards = [];
        snapshot.forEach((doc) => {
          const handData = doc.data();
          const evaluatedHand = evaluateHand(handData.cards); // Evaluate the hand
          newDealtCards.push({
            playerId: handData.playerId,
            playerName: handData.playerName, // Add playerName to the evaluated hand
            cards: handData.cards,
            ...evaluatedHand, // Attach handType and handStrength
          });
        });
        setDealtCards(newDealtCards);
  
        // Update the evaluatedHands subcollection
        const evaluatedHandsCollectionRef = collection(db, 'games', gameId, 'evaluatedHands');
        const evaluatedHandDocRef = doc(evaluatedHandsCollectionRef, playerId);
  
        setDoc(evaluatedHandDocRef, {
          playerId: playerId,
          playerName: newDealtCards[0].playerName, // Add playerName to the evaluated hand
          evaluatedCards: newDealtCards,
        });
      }
    );
  
    return () => unsubscribe();
  }, [gameId, playerId]);  

  useEffect(() => {
    if (evaluationTriggered && playerCount === evaluatedHandsCount) {
      const evaluateHands = async () => {
        const evaluatedHandsCollectionRef = collection(db, 'games', gameId, 'evaluatedHands');

        // Query all evaluated hands
        const evaluatedHandsSnapshot = await getDocs(evaluatedHandsCollectionRef);

        if (evaluatedHandsSnapshot.empty) {
          console.log('Evaluated hands subcollection is empty');
          return;
        }

        let highestHand = null;

        evaluatedHandsSnapshot.forEach((doc) => {
          const evaluatedHandData = doc.data();
          const evaluatedCards = evaluatedHandData.evaluatedCards;

          if (!evaluatedCards || evaluatedCards.length === 0) {
            console.log('Evaluated cards data is missing for', doc.id);
            return;
          }

          evaluatedCards.forEach((hand) => {
            if (!highestHand || hand.handStrength > highestHand.handStrength) {
              highestHand = hand;
            }
          });
        });

        if (highestHand) {
          setWinningHand(highestHand);
          console.log('Hand with highest handStrength:', highestHand);
        } else {
          console.log('No evaluated hands found');
        }
      };

      evaluateHands();
    }
  }, [evaluationTriggered, gameId, playerCount, evaluatedHandsCount, clickCount]);

  const handleExit = async () => {
    try { 
      const playersCollectionRef = collection(db, 'games', gameId, 'players');
      const playersSnapshot = await getDocs(playersCollectionRef);
  
      const navigationPromises = playersSnapshot.docs.map(async (doc) => {
        const player = doc.data();
        const playerId = player.playerId;
        await navigate(`/lobby?playerId=${playerId}`);
      });
  
      await Promise.all(navigationPromises);
  
      // Delete the game document
      const gameDocRef = doc(collection(db, 'games'), gameId);
      await deleteDoc(gameDocRef);
  
      // Navigate the current player to '/lobby'
      await navigate('/lobby');
    } catch (error) {
      console.log('Error navigating to the lobby:', error);
    }
  }; 

  return (
    <div>
      <h1 className='head'>Evaluation</h1>
      {!evaluationTriggered && playerCount === evaluatedHandsCount && (
        <button className='evaluateButton' onClick={() => {
          setEvaluationTriggered(true);
          createClickCountDocument();
        }}>Evaluate</button>
      )}
      {isGameCreator && playerCount === clickCount && (
        <button className='exitButton' onClick={handleExit}>Exit</button>
      )}
      {!isGameCreator && playerCount === clickCount && (
        <button className='exitButton' onClick={handleExit}>Exit</button>
      )}
      {dealtCards.map((hand, index) => (
        <div key={index}>
          <p className='evaluationText'>
            {hand.cards.map((card, cardIndex) => (
              <p className="cards" key={cardIndex}>
                {card.name} of {card.suit}
                {cardIndex !== hand.cards.length - 1}
              </p>
            ))}
          </p>
          <p className='handText'>Hand Type: {hand.handType}</p>
          <p className='handText'>Hand Strength: {hand.handStrength.toFixed(2)}</p>
          {winningHand && (
            <div className='winningHand'>
              <h2>Winning Hand: {winningHand.playerName}</h2>
              <p className='evaluationText'>
                {winningHand.cards.map((card, cardIndex) => (
                  <p className="cards" key={cardIndex}>
                    {card.name} of {card.suit}
                    {cardIndex !== winningHand.cards.length - 1}
                  </p>
                ))}
              </p>
              <p className='handText'>Hand Type: {winningHand.handType}</p>
              <p className='handText'>Hand Strength: {winningHand.handStrength.toFixed(2)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Evaluation;