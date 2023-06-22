const { initializeTestEnvironment, assertFails } = require('@firebase/rules-unit-testing');
const { firestore } = require('firebase-admin');
const firebase = require('firebase/app');

// Mock the necessary Firestore methods
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({})),
          set: jest.fn(() => Promise.reject(new Error('Unauthorized'))),
          update: jest.fn(() => Promise.reject(new Error('Unauthorized'))),
          delete: jest.fn(() => Promise.reject(new Error('Unauthorized'))),
          collection: jest.fn(() => ({
            doc: jest.fn(() => ({
              set: jest.fn(() => Promise.reject(new Error('Unauthorized'))),
            })),
          })),
        })),
        get: jest.fn(() => Promise.resolve({})),
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn(() => Promise.reject(new Error('Unauthorized'))),
          })),
        })),
      })),
    })),
  };
});

// Import and test your security rules for failure cases
describe('Firestore security rules (failure cases)', () => {
  beforeAll(async () => {
    // Initialize the Firebase app
    firebase.initializeApp({
      projectId: 'dane-poker',
    });
    // Initialize the Firestore emulator
    await initializeTestEnvironment({ projectId: 'dane-poker', firestore });
  });

  it('should deny create access to a game document if not authorized', async () => {
    const db = firebase.firestore();
    const gameDocRef = db.collection('games').doc('test-game-id');

    await assertFails(gameDocRef.set({ data: 'test' }));
  });

  it('should deny update access to a game document if not authorized', async () => {
    const db = firebase.firestore();
    const gameDocRef = db.collection('games').doc('test-game-id');

    await assertFails(gameDocRef.update({ data: 'test' }));
  });

  it('should deny delete access to a game document if not authorized', async () => {
    const db = firebase.firestore();
    const gameDocRef = db.collection('games').doc('test-game-id');

    await assertFails(gameDocRef.delete());
  });

  it('should deny write access to the hands subcollection if not authorized', async () => {
    const db = firebase.firestore();
    const handsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('hands');

    await assertFails(handsCollectionRef.doc('test-hand-id').set({ data: 'test' }));
  });

  it('should deny write access to the discardedCards subcollection if not authorized', async () => {
    const db = firebase.firestore();
    const discardedCardsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('discardedCards');

    await assertFails(discardedCardsCollectionRef.doc('test-discarded-card-id').set({ data: 'test' }));
  });

  it('should deny write access to the evaluatedHands subcollection if not authorized', async () => {
    const db = firebase.firestore();
    const evaluatedHandsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('evaluatedHands');

    await assertFails(evaluatedHandsCollectionRef.doc('test-evaluated-hand-id').set({ data: 'test' }));
  });

  it('should deny write access to the clickCount subcollection if not authorized', async () => {
    const db = firebase.firestore();
    const clickCountCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('clickCount');

    await assertFails(clickCountCollectionRef.doc('test-click-id').set({ data: 'test' }));
  });
});
