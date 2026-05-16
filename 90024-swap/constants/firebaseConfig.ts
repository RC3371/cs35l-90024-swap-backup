import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDPzLx2nVOnM1a7YzhU7H-vOC6qOfBRBo8",
  authDomain: "swap-3799a.firebaseapp.com",
  projectId: "swap-3799a",
  storageBucket: "swap-3799a.firebasestorage.app",
  messagingSenderId: "798691130524",
  appId: "1:798691130524:web:26200447ab1cd9f06b4159",
  measurementId: "G-648L1REQVC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);