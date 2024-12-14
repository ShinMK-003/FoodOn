// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: 'AIzaSyBYEeLu7n66iuLeeDE59fJVGDaQP1DHhDY',
  authDomain: 'demologin-523fa.firebaseapp.com',
  projectId: 'demologin-523fa',
  storageBucket: 'demologin-523fa.appspot.com',
  messagingSenderId: '38708519546',
  appId: '1:38708519546:web:ace5a82864b272b59391c3',
  measurementId: 'G-E9DP89F8LH',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
export { firestore };
export { auth };
export { firebaseConfig };
export { storage };