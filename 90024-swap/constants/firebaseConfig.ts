import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

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
// React Native / Expo can't reliably use Firestore's default WebChannel
// transport, which makes realtime onSnapshot listeners hang forever (one-time
// getDocs/addDoc still work). Forcing long-polling makes realtime
// subscriptions — e.g. the Agreements tab — actually receive data.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  // Optional Agreement fields (listingId, conversationId) are often undefined
  // when an agreement is started from a listing card. Firestore rejects
  // undefined values by default, which silently failed writes; drop them.
  ignoreUndefinedProperties: true,
});