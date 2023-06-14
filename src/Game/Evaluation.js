import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import evaluateHand from './HandEvaluator';
import "./evaluation.css"

const Evaluation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = searchParams.get('gameId');
  const playerId = searchParams.get('playerId');
  const [evaluationTriggered, setEvaluationTriggered] = useState(false);
  const [winningHand, setWinningHand] = useState(null);

  const [dealtCards, setDealtCards] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [evaluatedHandsCount, setEvaluatedHandsCount] = useState(0);

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

  useEffect(() => {
    countPlayerDocuments();
    const unsubscribe = countEvaluatedHandsDocuments();

    return () => unsubscribe();
  }, [countPlayerDocuments, countEvaluatedHandsDocuments]);

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
            player: handData.playerId,
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
  }, [evaluationTriggered, gameId, playerCount, evaluatedHandsCount]);

  return (
    <div>
      <h1 className='head'>Evaluation</h1>
      {!evaluationTriggered && playerCount === evaluatedHandsCount && (
        <button className='evaluateButton' onClick={() => setEvaluationTriggered(true)}>Evaluate</button>
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
              <h2>Winning Hand</h2>
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