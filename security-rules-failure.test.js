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
        })),
        get: jest.fn(() => Promise.resolve({})),
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

});
