// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8SEjPgXrxY6tLefX0bpyc3hKE5CCJ0lk",
  authDomain: "citimaxreq.firebaseapp.com",
  projectId: "citimaxreq",
  storageBucket: "citimaxreq.firebasestorage.app",
  messagingSenderId: "68525198042",
  appId: "1:68525198042:web:0e8f747f8c67b920e733e3",
  measurementId: "G-JGWW8BHHKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Export Firestore for use in your app
export { db };
