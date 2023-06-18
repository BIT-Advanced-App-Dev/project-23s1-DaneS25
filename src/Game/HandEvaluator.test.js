const { isRoyalFlush } = require('./HandEvaluator');

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

  // Add more test cases as needed
});
