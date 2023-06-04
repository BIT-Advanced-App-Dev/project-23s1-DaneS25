import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import evaluateHand from './HandEvaluator';

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
      }
    );

    return () => unsubscribe();
  }, [gameId, playerId]);

  return (
    <div>
      <h1>Evaluation</h1>
      {dealtCards.map((hand, index) => (
        <div key={index}>
          <p>Player: {hand.player}</p>
          <p>
            Cards:
            {hand.cards.map((card, cardIndex) => (
              <span key={cardIndex}>
                {card.name} of {card.suit}
                {cardIndex !== hand.cards.length - 1 && ', '}
              </span>
            ))}
          </p>
          <p>Hand Type: {hand.handType}</p>
          <p>Hand Strength: {hand.handStrength}</p>
        </div>
      ))}
    </div>
  );
};

export default Evaluation;