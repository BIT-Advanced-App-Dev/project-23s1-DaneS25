import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import evaluateHand from './HandEvaluator';
import "./evaluation.css"

const Evaluation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = searchParams.get('gameId');
  const playerId = searchParams.get('playerId');

  const [dealtCards, setDealtCards] = useState([]);

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

  return (
    <div>
      <h1 className='head'>Evaluation</h1>
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
        </div>
      ))}
    </div>
  );
};

export default Evaluation;