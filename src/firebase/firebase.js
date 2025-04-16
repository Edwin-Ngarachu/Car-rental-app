// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYDnydaWPtwix8ptQ7b3chpezz2LgB7gQ",
  authDomain: "car-rental-app-e7190.firebaseapp.com",
  projectId: "car-rental-app-e7190",
  storageBucket: "car-rental-app-e7190.firebasestorage.app",
  messagingSenderId: "166504044321",
  appId: "1:166504044321:web:7a3f369c206c1e0bc65060"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };