const evaluateHand = (cards) => {
  const handType = determineHandType(cards);
  const handStrength = determineHandStrength(handType, cards);

  return { handType, handStrength };
};

const determineHandType = (cards) => {
  if (isRoyalFlush(cards)) {
    return 'Royal Flush';
  }
  if (isStraightFlush(cards)) {
    return 'Straight Flush';
  }
  if (isFourOfAKind(cards)) {
    const value = getFourOfAKindValue(cards);
    return `Four of a Kind (${value})`;
  }
  if (isFullHouse(cards)) {
    const value = getFullHouseValue(cards);
    return `Full House (${value})`;
  }
  if (isFlush(cards)) {
    return 'Flush';
  }
  if (isStraight(cards)) {
    return 'Straight';
  }
  if (isThreeOfAKind(cards)) {
    const value = getThreeOfAKindValue(cards);
    return `Three of a Kind (${value})`;
  }
  if (isTwoPair(cards)) {
    const values = getTwoPairValues(cards);
    const twoPairValue = values.reduce((acc, cur) => acc + cur, 0); // Sum up the two pair values
    return `Two Pair (${twoPairValue})`;
  }
  if (isOnePair(cards)) {
    const value = getOnePairValue(cards);
    return `One Pair (${value})`;
  }
  const value = getHighCardValue(cards);
  return `High Card (${value})`;
};

const determineHandStrength = (handType, cards) => {
  if (handType === 'Royal Flush') {
    return 10;
  }
  if (handType === 'Straight Flush') {
    const sortedValues = cards.map(card => card.value).sort((a, b) => b - a);
    const straightFlushStrength = sortedValues.reduce((acc, cur, index) => acc + cur * Math.pow(10, index), 0);
    return 9 + straightFlushStrength / 1000000;
  }
  if (handType.startsWith('Four of a Kind')) {
    const value = getFourOfAKindValue(cards);
    const fourOfAKindStrength = value * 10000 + value * 1000 + value * 100 + value * 10; // Calculation for four of a kind hand
    const remainingValues = cards
      .map(card => card.value)
      .filter(cardValue => cardValue !== value)
      .sort((a, b) => b - a);
    const remainingStrength = remainingValues.reduce((acc, cur, index) => acc + cur * Math.pow(10, 1 - index), 0);
    return 8 + (fourOfAKindStrength + remainingStrength) / 1000000;
  }
  if (handType.startsWith('Full House')) {
    const value = getFullHouseValue(cards);
    const threeOfAKindValue = value.split(' and ')[0];
    const pairValue = value.split(' and ')[1];
    const fullHouseStrength = threeOfAKindValue * 10000 + threeOfAKindValue * 1000 + threeOfAKindValue * 100 + pairValue * 10 + pairValue * 1;
    return 7 + fullHouseStrength / 1000000;
  }
  if (handType === 'Flush') {
    const sortedValues = cards.map(card => card.value).sort((a, b) => b - a);
    const flushStrength = sortedValues.reduce((acc, cur, index) => acc + cur * Math.pow(10, index), 0);
    return 6 + flushStrength / 1000000;
  }
  if (handType === 'Straight') {
    const sortedValues = cards.map(card => card.value).sort((a, b) => b - a);
    const straightStrength = sortedValues.reduce((acc, cur, index) => acc + cur * Math.pow(10, index), 0);
    return 5 + straightStrength / 1000000;
  }
  if (handType.startsWith('Three of a Kind')) {
    const threeOfAKindValue = getThreeOfAKindValue(cards); // Get the value of the three of a kind

    const threeOfAKindStrength = threeOfAKindValue * 1000 + threeOfAKindValue * 1000 + threeOfAKindValue * 100; // Calculate the three of a kind strength

    const remainingValues = cards
      .map(card => card.value)
      .filter(value => value !== threeOfAKindValue) // Filter out the three of a kind value from the remaining values
      .sort((a, b) => b - a); // Sort the remaining values in descending order

    const remainingStrength = remainingValues
      .reduce((acc, cur, index) => acc + cur * Math.pow(10, 1 - index), 0); // Calculate the remaining card strength

    const handStrength = (threeOfAKindStrength + remainingStrength) / 1000000;
    return 4 + handStrength;
  }
  if (handType.startsWith('Two Pair')) {
    const pairValues = getTwoPairValues(cards); // Get the values of the two pairs
    const remainingValue = cards.find(card => !pairValues.includes(card.value)).value; // Find the value of the remaining card
  
    const highestPair = Math.max(...pairValues);
    const lowestPair = Math.min(...pairValues);
  
    const pairStrength = highestPair * 10000 + highestPair * 1000 + lowestPair * 100 + lowestPair * 10; // Calculate the pair strength
    const remainingStrength = remainingValue * 1; // Calculate the remaining card strength
  
    const handStrength = (pairStrength + remainingStrength) / 1000000;
    return 3 + handStrength;
  }  
  if (handType.startsWith('One Pair')) {
    const pairValue = getOnePairValue(cards); // Get the value of the pair
    const remainingValues = cards
      .map(card => card.value)
      .filter(value => value !== pairValue); // Filter out the pair values from the remaining values
      
    const pairStrength = pairValue * 10000 + pairValue * 1000; // Calculate the pair strength
    
    const remainingStrength = remainingValues
      .sort((a, b) => b - a)
      .reduce((acc, cur, index) => acc + cur * Math.pow(10, 2 - index), 0); // Calculate the remaining card strength
    
    return 2 + (pairStrength + remainingStrength) / 1000000; // Add pair strength and remaining card strength to the hand strength
  }   
  if (handType.startsWith('High Card')) {
    const sortedValues = cards.map(card => card.value).sort((a, b) => b - a); // Sort card values in descending order
    const highStrength = (sortedValues[0] * 10000 + sortedValues[1] * 1000 + sortedValues[2] * 100 + sortedValues[3] * 10 + sortedValues[4]);
    const parseHigh = parseFloat(highStrength) / 1000000
    return 1 + parseHigh; // Format the result to two decimal places
  }
  
  return 0; // Default value for unrecognized hand types
};

// Helper functions

const getFourOfAKindValue = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
    if (valueCounts[value] === 4) {
      return value;
    }
  }
  return '';
};

const getFullHouseValue = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }
  const values = Object.keys(valueCounts);
  return values.length === 2 ? values.join(' and ') : '';
};

const getThreeOfAKindValue = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
    if (valueCounts[value] === 3) {
      return value;
    }
  }
  return '';
};

const getTwoPairValues = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }
  const values = Object.keys(valueCounts).filter((value) => valueCounts[value] === 2);
  return values.length === 2 ? values.map(Number) : [];
};

const getOnePairValue = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
    if (valueCounts[value] === 2) {
      return value;
    }
  }
  return '';
};

const getHighCardValue = (cards) => {
  let highestValue = 0;
  for (let i = 0; i < cards.length; i++) {
    const cardValue = cards[i].value;
    if (cardValue > highestValue) {
      highestValue = cardValue;
    }
  }
  return highestValue;
};

const isRoyalFlush = (cards) => {
  const royalFlushValues = [10, 11, 12, 13, 14];
  const flushCards = cards.filter((card) => card.suit === cards[0].suit);
  if (flushCards.length < 5) {
    return false;
  }
  const flushCardValues = flushCards.map((card) => card.value);
  return royalFlushValues.every((value) => flushCardValues.includes(value));
};

const isStraightFlush = (cards) => {
  const flushCards = cards.filter((card) => card.suit === cards[0].suit);
  if (flushCards.length < 5) {
    return false;
  }
  const sortedFlushCards = flushCards.sort((a, b) => a.value - b.value);
  for (let i = 0; i < sortedFlushCards.length - 1; i++) {
    if (sortedFlushCards[i].value + 1 !== sortedFlushCards[i + 1].value) {
      return false;
    }
  }
  return true;
};

const isFourOfAKind = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }

  const counts = Object.values(valueCounts);
  return counts.includes(4);
};

const isFullHouse = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }
  const values = Object.values(valueCounts);
  return values.includes(3) && values.includes(2);
};

const isFlush = (cards) => {
  const suit = cards[0].suit;
  return cards.every((card) => card.suit === suit);
};

const isStraight = (cards) => {
  const sortedCards = [...cards].sort((a, b) => a.value - b.value);

  for (let i = 0; i < sortedCards.length - 1; i++) {
    if (sortedCards[i].value + 1 !== sortedCards[i + 1].value) {
      return false;
    }
  }

  return true;
};

const isThreeOfAKind = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }
  const counts = Object.values(valueCounts);
  return counts.includes(3) && !counts.includes(2);
};

const isTwoPair = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }
  const pairs = Object.values(valueCounts).filter((count) => count === 2);
  return pairs.length === 2;
};

const isOnePair = (cards) => {
  const valueCounts = {};
  for (let i = 0; i < cards.length; i++) {
    const value = cards[i].value;
    valueCounts[value] = valueCounts[value] ? valueCounts[value] + 1 : 1;
  }

  const pairs = Object.values(valueCounts).filter(count => count === 2);
  return pairs.length === 1;
};

export { evaluateHand,
         isRoyalFlush,
         isThreeOfAKind, 
         isStraightFlush, 
         isFullHouse, 
         isFourOfAKind, 
         isFlush, 
         isStraight, 
         isOnePair, 
         isTwoPair };
export default evaluateHand;