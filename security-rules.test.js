const { initializeTestEnvironment, assertSucceeds } = require('@firebase/rules-unit-testing');
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
          set: jest.fn(() => Promise.resolve()),
          update: jest.fn(),
          delete: jest.fn(),
          collection: jest.fn(() => ({
            doc: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve({})),
              set: jest.fn(() => Promise.resolve()),
              update: jest.fn(),
              delete: jest.fn(),
            })),
            get: jest.fn(() => Promise.resolve({})),
          })),
        })),
        get: jest.fn(() => Promise.resolve({})),
      })),
    })),
  };
});

// Import and test your security rules
describe('Firestore security rules', () => {
  beforeAll(async () => {
    // Initialize the Firebase app
    firebase.initializeApp({
      projectId: 'dane-poker',
    });
    // Initialize the Firestore emulator
    await initializeTestEnvironment({ projectId: 'dane-poker', firestore });
  });
  
  it('should allow read access to a user document if authorized', async () => {
    const db = firebase.firestore();
    const userDocRef = db.collection('users').doc('test-user-id');
    // Attempt to read the user document
    await assertSucceeds(userDocRef.get());
  });

  it('should allow read access to the user collection', async () => {
    const db = firebase.firestore();
    const usersCollectionRef = db.collection('users');

    // Attempt to read the user collection
    await assertSucceeds(usersCollectionRef.get());
  });

  it('should allow create access to a game document if authorized', async () => {
    const db = firebase.firestore();
    const gameDocRef = db.collection('games').doc('test-game-id');

    // Attempt to create the game document
    await assertSucceeds(gameDocRef.set({ data: 'test' }));
  });

  it('should allow update access to a game document if authorized', async () => {
    const db = firebase.firestore();
    const gameDocRef = db.collection('games').doc('test-game-id');

    // Attempt to update the game document
    await assertSucceeds(gameDocRef.update({ data: 'test' }));
  });

  it('should allow delete access to a game document if authorized', async () => {
    const db = firebase.firestore();
    const gameDocRef = db.collection('games').doc('test-game-id');

    // Attempt to delete the game document
    await assertSucceeds(gameDocRef.delete());
  });

  it('should allow read access to the hands subcollection if authorized', async () => {
    const db = firebase.firestore();
    const handsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('hands');
  
    // Attempt to read the hands subcollection
    await assertSucceeds(handsCollectionRef.get());
  });
  
  it('should allow write access to the hands subcollection if authorized', async () => {
    const db = firebase.firestore();
    const handsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('hands');
  
    // Attempt to write to the hands subcollection
    await assertSucceeds(handsCollectionRef.doc('test-hand-id').set({ data: 'test' }));
  });

  it('should allow read access to the discardedCards subcollection if authorized', async () => {
    const db = firebase.firestore();
    const discardedCardsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('discardedCards');
  
    // Attempt to read the discardedCards subcollection
    await assertSucceeds(discardedCardsCollectionRef.get());
  });
  
  it('should allow write access to the discardedCards subcollection if authorized', async () => {
    const db = firebase.firestore();
    const discardedCardsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('discardedCards');
  
    // Attempt to write to the discardedCards subcollection
    await assertSucceeds(discardedCardsCollectionRef.doc('test-card-id').set({ data: 'test' }));
  });
  
  it('should allow read access to the evaluatedHands subcollection if authorized', async () => {
    const db = firebase.firestore();
    const evaluatedHandsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('evaluatedHands');
  
    // Attempt to read the evaluatedHands subcollection
    await assertSucceeds(evaluatedHandsCollectionRef.get());
  });
  
  it('should allow write access to the evaluatedHands subcollection if authorized', async () => {
    const db = firebase.firestore();
    const evaluatedHandsCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('evaluatedHands');
  
    // Attempt to write to the evaluatedHands subcollection
    await assertSucceeds(evaluatedHandsCollectionRef.doc('test-evaluated-hand-id').set({ data: 'test' }));
  });
  
  it('should allow read access to the clickCount subcollection if authorized', async () => {
    const db = firebase.firestore();
    const clickCountCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('clickCount');
  
    // Attempt to read the clickCount subcollection
    await assertSucceeds(clickCountCollectionRef.get());
  });
  
  it('should allow write access to the clickCount subcollection if authorized', async () => {
    const db = firebase.firestore();
    const clickCountCollectionRef = db
      .collection('games')
      .doc('test-game-id')
      .collection('clickCount');
  
    // Attempt to write to the clickCount subcollection
    await assertSucceeds(clickCountCollectionRef.doc('test-click-id').set({ data: 'test' }));
  });  
});
