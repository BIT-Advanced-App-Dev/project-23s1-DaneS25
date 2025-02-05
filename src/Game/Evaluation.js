import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, setDoc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import evaluateHand from './HandEvaluator';
import "./evaluation.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RingLoader } from 'react-spinners';

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
  const [loading, setLoading] = useState(false);
  const [draw, setDraw] = useState(false);
  const [drawPlayers, setDrawPlayers] = useState([]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // Fetch game creator user  
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

  // Create a subcollection called clickCount to keep track of clicks
  const createClickCountDocument = async () => {
    const clickCountCollectionRef = collection(db, 'games', gameId, 'clickCount');
    const newClickCountDocRef = doc(clickCountCollectionRef);
    await setDoc(newClickCountDocRef, {
      count: 1
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
          const evaluatedHand = evaluateHand(handData.cards);
          newDealtCards.push({
            playerId: handData.playerId,
            playerName: handData.playerName,
            cards: handData.cards,
            ...evaluatedHand,
          });
        });
        setDealtCards(newDealtCards);
  
        const evaluatedHandsCollectionRef = collection(db, 'games', gameId, 'evaluatedHands');
        const evaluatedHandDocRef = doc(evaluatedHandsCollectionRef, playerId);
  
        setDoc(evaluatedHandDocRef, {
          playerId: playerId,
          playerName: newDealtCards[0].playerName,
          evaluatedCards: newDealtCards,
        });
      }
    );
    return () => unsubscribe();
  }, [gameId, playerId]);  

  // useEffect to check the evaluatedHands collections for the winning hand
  useEffect(() => {
    if (evaluationTriggered && playerCount === evaluatedHandsCount) {
      const evaluateHands = async () => {
        const evaluatedHandsCollectionRef = collection(db, 'games', gameId, 'evaluatedHands');
        const evaluatedHandsSnapshot = await getDocs(evaluatedHandsCollectionRef);
  
        if (evaluatedHandsSnapshot.empty) {
          toast.error('Evaluated hands subcollection is empty');
          return;
        }
  
        let highestHand = null;
        let isDraw = false;
        let drawPlayers = [];
        // Check for winning hand or if its a draw
        evaluatedHandsSnapshot.forEach((doc) => {
          const evaluatedHandData = doc.data();
          const evaluatedCards = evaluatedHandData.evaluatedCards;
        
          if (!evaluatedCards || evaluatedCards.length === 0) {
            toast.error('Evaluated cards data is missing for', doc.id);
            return;
          }
          
          evaluatedCards.forEach((hand) => {
            if (!highestHand || hand.handStrength > highestHand.handStrength) {
              highestHand = hand;
              isDraw = false;
              drawPlayers = [hand.playerName];
            } else if (hand.handStrength === highestHand.handStrength) {
              isDraw = true;
              drawPlayers.push(hand.playerName); // Use push to add names to the drawPlayers array
            }
          });
        });
        
        if (isDraw) {
          setWinningHand(null);
          setDraw(true);
          setDrawPlayers(drawPlayers);
          console.log('Draw players:', drawPlayers);
        } else if (highestHand) {
          setWinningHand(highestHand);
          setDraw(false);
          console.log('Hand with highest handStrength:', highestHand);
        } else {
          console.log('No evaluated hands found');
        }
      };
  
      evaluateHands();
    }
  }, [evaluationTriggered, gameId, playerCount, evaluatedHandsCount, clickCount]);  

  // Allow a bit of extra time for the clickCount to update and check the length against player count
  useEffect(() => {
    if (playerCount === clickCount) {
      // Enable the button after a delay of 500 milliseconds
      const timeout = setTimeout(() => {
        setIsButtonEnabled(true);
      }, 500);
  
      return () => clearTimeout(timeout);
    }
  }, [playerCount, clickCount]);

  // Handle the exit button click, delete the games doc to terminate the GameInstance URl 
  const handleExit = async () => {
    try {
      setLoading(true);
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
      toast.error('Error navigating to the lobby:', error);
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div className='evaluationContainer'>
      <ToastContainer position="top-center" theme="dark" />
      <h1 className='head'>Evaluation</h1>
      {!evaluationTriggered && playerCount === evaluatedHandsCount && (
        <button className='evaluateButton' onClick={() => {
          setEvaluationTriggered(true);
          createClickCountDocument();
        }}>Evaluate</button>
      )}
      {loading ? (
      <div className="spinner-container">
        <RingLoader color="#123abc" size={30} />
      </div>
      ) : (
        <>
          {(isGameCreator || !isGameCreator) && isButtonEnabled && (
            <button className='exitButton' onClick={handleExit}>Exit</button>
          )}
        </>
      )}
      {dealtCards.map((hand, index) => (
        <div key={index}>
          <p className='evaluationText'>
            {hand.cards.map((card, cardIndex) => (
              <div className="cards" key={cardIndex}>
                <img 
                  src={require(`./Assets/cards/${card.name.toLowerCase()}_of_${card.suit.toLowerCase()}.png`)} 
                  alt={`${card.name} of ${card.suit}`} 
                  className="card-image"
                />
              </div>
            ))}
          </p>
          <p className='handText'>Hand Type: {hand.handType}</p>
          <p className='handText'>Hand Strength: {hand.handStrength.toFixed(6)}</p>
          {winningHand && (
            <div className='winningHand'>
              <h2>Winning Hand: {winningHand.playerName}</h2>
              <p className='evaluationText'>
                {winningHand.cards.map((card, cardIndex) => (
                  <div className="cards" key={cardIndex}>
                    <img 
                      src={require(`./Assets/cards/${card.name.toLowerCase()}_of_${card.suit.toLowerCase()}.png`)}
                      alt={`${card.name} of ${card.suit}`} 
                      className="card-image"
                    />
                  </div>
                ))}
              </p>
              <p className='handText'>Hand Type: {winningHand.handType}</p>
              <p className='handText'>Hand Strength: {winningHand.handStrength.toFixed(2)}</p>
            </div>
          )}
          {draw && (
            <div>
              <p className="drawMessage">It was a draw between:</p>
              {drawPlayers.map((player, index) => (
                <p key={index}>{player}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Evaluation;