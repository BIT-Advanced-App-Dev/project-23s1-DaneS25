// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4ATtLCcj0TVq_Rv5z_aN3cc6CX_54kuY",
  authDomain: "dane-poker.firebaseapp.com",
  projectId: "dane-poker",
  storageBucket: "dane-poker.appspot.com",
  messagingSenderId: "26851323007",
  appId: "1:26851323007:web:3283ba42af6837fd52634a",
  measurementId: "G-MP7M14X21P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  collection
}
