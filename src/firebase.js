import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoDsPbvNKBYGrcLDV7dLCwc-8vt8t2j1Y",
  authDomain: "carservice-91b29.firebaseapp.com",
  projectId: "carservice-91b29",
  storageBucket: "carservice-91b29.firebasestorage.app",
  messagingSenderId: "532747465560",
  appId: "1:532747465560:web:311fc154c2d9f7f3ca2b2d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);