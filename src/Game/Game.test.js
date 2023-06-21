import { evaluateHand } from './HandEvaluator';

describe('High Card vs One Pair', () => {
    it('should declare the one pair hand as the winner', () => {
      const highCardHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Hearts' },
        { value: 5, suit: 'Diamonds' },
        { value: 9, suit: 'Spades' },
        { value: 12, suit: 'Clubs' },
      ];
      const onePairHand = [
        { value: 4, suit: 'Spades' },
        { value: 4, suit: 'Hearts' },
        { value: 7, suit: 'Diamonds' },
        { value: 10, suit: 'Spades' },
        { value: 13, suit: 'Clubs' },
      ];
  
      const highCardStrength = evaluateHand(highCardHand).handStrength;
      const onePairStrength = evaluateHand(onePairHand).handStrength;
  
      expect(highCardStrength).toBeLessThan(onePairStrength);
    });
  });

  describe('One Pair vs Two Pair', () => {
    it('should declare the two pair hand as the winner', () => {
      const onePairHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Hearts' },
        { value: 3, suit: 'Diamonds' },
        { value: 9, suit: 'Spades' },
        { value: 12, suit: 'Clubs' },
      ];
      const twoPairHand = [
        { value: 4, suit: 'Spades' },
        { value: 4, suit: 'Hearts' },
        { value: 7, suit: 'Diamonds' },
        { value: 7, suit: 'Spades' },
        { value: 13, suit: 'Clubs' },
      ];
      
      const onePairStrength = evaluateHand(onePairHand).handStrength;
      const twoPairStrength = evaluateHand(twoPairHand).handStrength;

      expect(onePairStrength).toBeLessThan(twoPairStrength);
    });
  });

  describe('Two Pair vs Three Of A Kind', () => {
    it('should declare the Three Of A Kind hand as the winner', () => {
      const twoPairHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Hearts' },
        { value: 3, suit: 'Diamonds' },
        { value: 10, suit: 'Spades' },
        { value: 2, suit: 'Clubs' },
      ];
      const threeOfAKindHand = [
        { value: 4, suit: 'Spades' },
        { value: 7, suit: 'Hearts' },
        { value: 7, suit: 'Diamonds' },
        { value: 7, suit: 'Spades' },
        { value: 13, suit: 'Clubs' },
      ];
      
      const twoPairStrength = evaluateHand(twoPairHand).handStrength;
      const threeOfAKindStrength = evaluateHand(threeOfAKindHand).handStrength;

      expect(twoPairStrength).toBeLessThan(threeOfAKindStrength);
    });
  });

  describe('Three Of A Kind vs Straight', () => {
    it('should declare the Straight hand as the winner', () => {
      const threeOfAKindHand = [
        { value: 3, suit: 'Spades' },
        { value: 3, suit: 'Hearts' },
        { value: 3, suit: 'Diamonds' },
        { value: 10, suit: 'Spades' },
        { value: 2, suit: 'Clubs' },
      ];
      const straightHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Hearts' },
        { value: 4, suit: 'Diamonds' },
        { value: 5, suit: 'Spades' },
        { value: 6, suit: 'Clubs' },
      ];
      
      const threeOfAKindStrength = evaluateHand(threeOfAKindHand).handStrength;
      const straightStrength = evaluateHand(straightHand).handStrength;

      expect(threeOfAKindStrength).toBeLessThan(straightStrength);
    });
  });
  
  describe('Straight vs Flush', () => {
    it('should declare the Flush hand as the winner', () => {
      const flushHand = [
        { value: 3, suit: 'Diamonds' },
        { value: 12, suit: 'Diamonds' },
        { value: 13, suit: 'Diamonds' },
        { value: 10, suit: 'Diamonds' },
        { value: 2, suit: 'Diamonds' },
      ];
      const straightHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Hearts' },
        { value: 4, suit: 'Diamonds' },
        { value: 5, suit: 'Spades' },
        { value: 6, suit: 'Clubs' },
      ];
      
      const flushStrength = evaluateHand(flushHand).handStrength;
      const straightStrength = evaluateHand(straightHand).handStrength;

      expect(straightStrength).toBeLessThan(flushStrength);
    });
  });

  describe('Flush vs Full House', () => {
    it('should declare the Full House hand as the winner', () => {
      const flushHand = [
        { value: 3, suit: 'Diamonds' },
        { value: 12, suit: 'Diamonds' },
        { value: 13, suit: 'Diamonds' },
        { value: 10, suit: 'Diamonds' },
        { value: 2, suit: 'Diamonds' },
      ];
      const fullHouseHand = [
        { value: 6, suit: 'Spades' },
        { value: 5, suit: 'Hearts' },
        { value: 5, suit: 'Diamonds' },
        { value: 5, suit: 'Spades' },
        { value: 6, suit: 'Clubs' },
      ];
      
      const flushStrength = evaluateHand(flushHand).handStrength;
      const fullHouseStrength = evaluateHand(fullHouseHand).handStrength;

      expect(flushStrength).toBeLessThan(fullHouseStrength);
    });
  });

  describe('Full House vs Four Of A Kind', () => {
    it('should declare the Four Of A Kind hand as the winner', () => {
      const fourOfAKindHand = [
        { value: 12, suit: 'Spades' },
        { value: 12, suit: 'Clubs' },
        { value: 12, suit: 'Hearts' },
        { value: 12, suit: 'Diamonds' },
        { value: 2, suit: 'Diamonds' },
      ];
      const fullHouseHand = [
        { value: 6, suit: 'Spades' },
        { value: 5, suit: 'Hearts' },
        { value: 5, suit: 'Diamonds' },
        { value: 5, suit: 'Spades' },
        { value: 6, suit: 'Clubs' },
      ];
      
      const fourOfAKindStrength = evaluateHand(fourOfAKindHand).handStrength;
      const fullHouseStrength = evaluateHand(fullHouseHand).handStrength;

      expect(fullHouseStrength).toBeLessThan(fourOfAKindStrength);
    });
  });

  describe('Four Of A Kind vs Straight Flush', () => {
    it('should declare the Straight Flush hand as the winner', () => {
      const fourOfAKindHand = [
        { value: 12, suit: 'Spades' },
        { value: 12, suit: 'Clubs' },
        { value: 12, suit: 'Hearts' },
        { value: 12, suit: 'Diamonds' },
        { value: 2, suit: 'Diamonds' },
      ];
      const straightFlushHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Spades' },
        { value: 4, suit: 'Spades' },
        { value: 5, suit: 'Spades' },
        { value: 6, suit: 'Spades' },
      ];
      
      const fourOfAKindStrength = evaluateHand(fourOfAKindHand).handStrength;
      const straightFlushStrength = evaluateHand(straightFlushHand).handStrength;

      expect(fourOfAKindStrength).toBeLessThan(straightFlushStrength);
    });
  });

  describe('Straight Flush vs Royal Flush', () => {
    it('should declare the Royal Flush hand as the winner', () => {
      const royalFlushHand = [
        { value: 10, suit: 'Diamonds' },
        { value: 11, suit: 'Diamonds' },
        { value: 12, suit: 'Diamonds' },
        { value: 13, suit: 'Diamonds' },
        { value: 14, suit: 'Diamonds' },
      ];
      const straightFlushHand = [
        { value: 2, suit: 'Spades' },
        { value: 3, suit: 'Spades' },
        { value: 4, suit: 'Spades' },
        { value: 5, suit: 'Spades' },
        { value: 6, suit: 'Spades' },
      ];
      
      const royalFlushStrength = evaluateHand(royalFlushHand).handStrength;
      const straightFlushStrength = evaluateHand(straightFlushHand).handStrength;

      expect(straightFlushStrength).toBeLessThan(royalFlushStrength);
    });
  });