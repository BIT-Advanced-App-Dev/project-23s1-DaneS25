import { evaluateHand } from './HandEvaluator';

const { isRoyalFlush,
   isStraightFlush, 
   isFourOfAKind, 
   isFullHouse, 
   isFlush, 
   isStraight, 
   isThreeOfAKind, 
   isTwoPair, 
   isOnePair 
  } = require('./HandEvaluator');

describe('isRoyalFlush', () => {
  it('should return true for a royal flush hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 11, suit: 'Spades' },
      { value: 12, suit: 'Spades' },
      { value: 13, suit: 'Spades' },
      { value: 14, suit: 'Spades' },
    ];
    const result = isRoyalFlush(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-royal flush hand', () => {
    const hand = [
      { value: 9, suit: 'Spades' },
      { value: 11, suit: 'Spades' },
      { value: 12, suit: 'Spades' },
      { value: 13, suit: 'Spades' },
      { value: 14, suit: 'Spades' },
    ];
    const result = isRoyalFlush(hand);
    expect(result).toBe(false);
  });

  it('should return false for a non-flush hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 11, suit: 'Spades' },
      { value: 12, suit: 'Spades' },
      { value: 13, suit: 'Hearts' },
      { value: 14, suit: 'Spades' },
    ];
    const result = isRoyalFlush(hand);
    expect(result).toBe(false);
  });

  it('should have a hand strength of 10 for a royal flush hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 11, suit: 'Spades' },
      { value: 12, suit: 'Spades' },
      { value: 13, suit: 'Spades' },
      { value: 14, suit: 'Spades' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBe(10);
  });
});

describe('isStraightFlush', () => {
  it('should return true for a straight flush hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 11, suit: 'Hearts' },
      { value: 12, suit: 'Hearts' },
    ];
    const result = isStraightFlush(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-straight flush hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 11, suit: 'Hearts' },
      { value: 13, suit: 'Hearts' },
    ];
    const result = isStraightFlush(hand);
    expect(result).toBe(false);
  });

  it('should return false for a non-flush hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 11, suit: 'Hearts' },
      { value: 12, suit: 'Spades' },
    ];
    const result = isStraightFlush(hand);
    expect(result).toBe(false);
  });

  it('should have a hand strength of 9 for a straight flush hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 11, suit: 'Hearts' },
      { value: 12, suit: 'Hearts' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBeGreaterThan(9);
  });
});

describe('isFourOfAKind', () => {
  it('should return true for a four of a kind hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 10, suit: 'Diamonds' },
      { value: 10, suit: 'Clubs' },
      { value: 5, suit: 'Spades' },
    ];
    const result = isFourOfAKind(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-four of a kind hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 10, suit: 'Diamonds' },
      { value: 9, suit: 'Clubs' },
      { value: 5, suit: 'Spades' },
    ];
    const result = isFourOfAKind(hand);
    expect(result).toBe(false);
  });

  it('should have a hand strength of 8 for a four of a kind hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 10, suit: 'Diamonds' },
      { value: 10, suit: 'Clubs' },
      { value: 5, suit: 'Spades' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBeGreaterThan(8);
  });
});

describe('isFullHouse', () => {
  describe('isFullHouse', () => {
    it('should return true for a full house hand', () => {
      const hand = [
        { value: 10, suit: 'Spades' },
        { value: 10, suit: 'Hearts' },
        { value: 10, suit: 'Diamonds' },
        { value: 7, suit: 'Spades' },
        { value: 7, suit: 'Clubs' },
      ];
      const result = isFullHouse(hand);
      expect(result).toBe(true);
    });
  
    it('should return false for a non-full house hand', () => {
      const hand = [
        { value: 9, suit: 'Spades' },
        { value: 11, suit: 'Spades' },
        { value: 12, suit: 'Spades' },
        { value: 13, suit: 'Spades' },
        { value: 14, suit: 'Spades' },
      ];
      const result = isFullHouse(hand);
      expect(result).toBe(false);
    });
  
    it('should return false for a hand with four of a kind', () => {
      const hand = [
        { value: 10, suit: 'Spades' },
        { value: 10, suit: 'Hearts' },
        { value: 10, suit: 'Diamonds' },
        { value: 10, suit: 'Clubs' },
        { value: 5, suit: 'Spades' },
      ];
      const result = isFullHouse(hand);
      expect(result).toBe(false);
    });
  
    it('should have a hand strength greater than 7 for a full house hand', () => {
      const hand = [
        { value: 10, suit: 'Spades' },
        { value: 10, suit: 'Hearts' },
        { value: 10, suit: 'Diamonds' },
        { value: 7, suit: 'Spades' },
        { value: 7, suit: 'Clubs' },
      ];
      const { handStrength } = evaluateHand(hand);
      expect(handStrength).toBeGreaterThan(7);
    });
  });  
});

describe('isFlush', () => {
  it('should return true for a flush hand', () => {
    const hand = [
      { value: 2, suit: 'Hearts' },
      { value: 5, suit: 'Hearts' },
      { value: 8, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 13, suit: 'Hearts' },
    ];
    const result = isFlush(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-flush hand', () => {
    const hand = [
      { value: 2, suit: 'Hearts' },
      { value: 5, suit: 'Hearts' },
      { value: 8, suit: 'Hearts' },
      { value: 10, suit: 'Spades' },
      { value: 13, suit: 'Hearts' },
    ];
    const result = isFlush(hand);
    expect(result).toBe(false);
  });

  it('should return true for a straight flush hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 11, suit: 'Hearts' },
      { value: 12, suit: 'Hearts' },
    ];
    const result = isFlush(hand);
    expect(result).toBe(true);
  });

  it('should have a hand strength greater than 5 for a flush hand', () => {
    const hand = [
      { value: 2, suit: 'Hearts' },
      { value: 5, suit: 'Hearts' },
      { value: 8, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 13, suit: 'Hearts' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBeGreaterThan(6);
  });
});

describe('isStraight', () => {
  it('should return true for a straight hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Spades' },
      { value: 10, suit: 'Diamonds' },
      { value: 11, suit: 'Clubs' },
      { value: 12, suit: 'Hearts' },
    ];
    const result = isStraight(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-straight hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Spades' },
      { value: 10, suit: 'Diamonds' },
      { value: 11, suit: 'Clubs' },
      { value: 13, suit: 'Hearts' },
    ];
    const result = isStraight(hand);
    expect(result).toBe(false);
  });

  it('should return true for a straight flush hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 9, suit: 'Hearts' },
      { value: 10, suit: 'Hearts' },
      { value: 11, suit: 'Hearts' },
      { value: 12, suit: 'Hearts' },
    ];
    const result = isStraight(hand);
    expect(result).toBe(true);
  });

  it('should have a hand strength greater than 4 for a straight hand', () => {
    const hand = [
      { value: 8, suit: 'Hearts' },
      { value: 8, suit: 'Spades' },
      { value: 8, suit: 'Diamonds' },
      { value: 11, suit: 'Clubs' },
      { value: 12, suit: 'Hearts' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBeGreaterThan(4);
  });
});

describe('isThreeOfAKind', () => {
  it('should return true for a three of a kind hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 10, suit: 'Diamonds' },
      { value: 7, suit: 'Spades' },
      { value: 2, suit: 'Clubs' },
    ];
    const result = isThreeOfAKind(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-three of a kind hand', () => {
    const hand = [
      { value: 9, suit: 'Spades' },
      { value: 11, suit: 'Spades' },
      { value: 12, suit: 'Spades' },
      { value: 13, suit: 'Spades' },
      { value: 14, suit: 'Spades' },
    ];
    const result = isThreeOfAKind(hand);
    expect(result).toBe(false);
  });

  it('should return false for a full house hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 10, suit: 'Diamonds' },
      { value: 7, suit: 'Spades' },
      { value: 7, suit: 'Clubs' },
    ];
    const result = isThreeOfAKind(hand);
    expect(result).toBe(false);
  });

  it('should have a hand strength greater than 4 for three of a kind', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 10, suit: 'Diamonds' },
      { value: 5, suit: 'Clubs' },
      { value: 2, suit: 'Spades' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBeGreaterThan(4);
  });
});

describe('isTwoPair', () => {
  describe('isTwoPair', () => {
    it('should return true for a two pair hand', () => {
      const hand = [
        { value: 10, suit: 'Spades' },
        { value: 10, suit: 'Hearts' },
        { value: 7, suit: 'Diamonds' },
        { value: 7, suit: 'Clubs' },
        { value: 2, suit: 'Spades' },
      ];
      const result = isTwoPair(hand);
      expect(result).toBe(true);
    });
  
    it('should return false for a non-two pair hand', () => {
      const hand = [
        { value: 9, suit: 'Spades' },
        { value: 11, suit: 'Spades' },
        { value: 12, suit: 'Spades' },
        { value: 13, suit: 'Spades' },
        { value: 14, suit: 'Spades' },
      ];
      const result = isTwoPair(hand);
      expect(result).toBe(false);
    });
  
    it('should return false for a hand with three of a kind', () => {
      const hand = [
        { value: 10, suit: 'Spades' },
        { value: 10, suit: 'Hearts' },
        { value: 10, suit: 'Diamonds' },
        { value: 7, suit: 'Spades' },
        { value: 2, suit: 'Clubs' },
      ];
      const result = isTwoPair(hand);
      expect(result).toBe(false);
    });
  
    it('should have a hand strength greater than 2 for a two pair hand', () => {
      const hand = [
        { value: 10, suit: 'Spades' },
        { value: 10, suit: 'Hearts' },
        { value: 7, suit: 'Diamonds' },
        { value: 7, suit: 'Clubs' },
        { value: 2, suit: 'Spades' },
      ];
      const { handStrength } = evaluateHand(hand);
      expect(handStrength).toBeGreaterThan(3);
    });
  });  
});

describe('isOnePair', () => {
  it('should return true for a one pair hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 7, suit: 'Diamonds' },
      { value: 5, suit: 'Clubs' },
      { value: 2, suit: 'Spades' },
    ];
    const result = isOnePair(hand);
    expect(result).toBe(true);
  });

  it('should return false for a non-one pair hand', () => {
    const hand = [
      { value: 9, suit: 'Spades' },
      { value: 11, suit: 'Spades' },
      { value: 12, suit: 'Spades' },
      { value: 13, suit: 'Spades' },
      { value: 14, suit: 'Spades' },
    ];
    const result = isOnePair(hand);
    expect(result).toBe(false);
  });

  it('should return false for a hand with two pairs', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 7, suit: 'Diamonds' },
      { value: 7, suit: 'Clubs' },
      { value: 2, suit: 'Spades' },
    ];
    const result = isOnePair(hand);
    expect(result).toBe(false);
  });

  it('should have a hand strength greater than 2 for a one pair hand', () => {
    const hand = [
      { value: 10, suit: 'Spades' },
      { value: 10, suit: 'Hearts' },
      { value: 7, suit: 'Diamonds' },
      { value: 5, suit: 'Clubs' },
      { value: 2, suit: 'Spades' },
    ];
    const { handStrength } = evaluateHand(hand);
    expect(handStrength).toBeGreaterThan(2);
  });
});
