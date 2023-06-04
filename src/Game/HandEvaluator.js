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
      return `Two Pair (${values[0]} and ${values[1]})`;
    }
    if (isOnePair(cards)) {
      const value = getOnePairValue(cards);
      return `One Pair (${value})`;
    }
  
    return 'High Card';
  };
  
  const determineHandStrength = (handType, cards) => {
    // Assign hand strength based on hand type and card values
    // Adjust the logic based on your desired hand rankings and values
  
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
      return 3;
    }
    if (handType.startsWith('One Pair')) {
      return 2;
    }
    if (handType === 'High Card') {
        return 1;
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
    return values.length === 2 ? values : [];
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
  
  const isRoyalFlush = (cards) => {
    const royalFlushValues = ['A', 'K', 'Q', 'J', '10'];
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