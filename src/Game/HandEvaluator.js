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
    return 9;
  }
  if (handType.startsWith('Four of a Kind')) {
    return 8;
  }
  if (handType.startsWith('Full House')) {
    return 7;
  }
  if (handType === 'Flush') {
    return 6;
  }
  if (handType === 'Straight') {
    return 5;
  }
  if (handType.startsWith('Three of a Kind')) {
    return 4;
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
    if (valueCounts[value] === 4) {
      return true;
    }
  }
  return false;
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
  const sortedCards = cards.sort((a, b) => a.value - b.value);
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
    if (valueCounts[value] === 3) {
      return true;
    }
  }
  return false;
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
    if (valueCounts[value] === 2) {
      return true;
    }
  }
  return false;
};

export default evaluateHand;