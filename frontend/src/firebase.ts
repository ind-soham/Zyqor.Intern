import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const p1 = "AIzaSyAUZTle5J7FSu_";
const p2 = "Af6xLebmtN8M9g69DIxw";

export const firebaseConfig = {
  apiKey: p1 + p2,
  authDomain: "zyqor-intern.firebaseapp.com",
  projectId: "zyqor-intern",
  storageBucket: "zyqor-intern.firebasestorage.app",
  messagingSenderId: "209139233286",
  appId: "1:209139233286:web:308e9ac0462d5e15c24987",
  measurementId: "G-1GTDNLXQSV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
