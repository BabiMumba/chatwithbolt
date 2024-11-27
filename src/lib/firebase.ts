import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhYe37GCrjl9nQvrEfnn-8OeN5OvSifNA",
  authDomain: "mychatpp-63d89.firebaseapp.com",
  databaseURL: "https://mychatpp-63d89-default-rtdb.firebaseio.com",
  projectId: "mychatpp-63d89",
  storageBucket: "mychatpp-63d89.firebasestorage.app",
  messagingSenderId: "766601267330",
  appId: "1:766601267330:web:a2036da376148b994e0c9b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);