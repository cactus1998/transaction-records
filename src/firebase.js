// src/firebase/index.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANeki0jCENVS3vx9oGdx8w8r5Tw6QgDgU",
  authDomain: "transaction-records.firebaseapp.com",
  projectId: "transaction-records",
  storageBucket: "transaction-records.firebasestorage.app",
  messagingSenderId: "670994662839",
  appId: "1:670994662839:web:1878cd7adfd6b213e45432",
  measurementId: "G-FMNPM77FK2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
