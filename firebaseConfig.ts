import { initializeApp } from 'firebase/app';
import { getStorage } from "firebase/storage";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAa-gppXXirLMWhY2nA-MIpMkllVUxmwMQ',
  authDomain: 'heatmap-d9586.firebaseapp.com',
  projectId: 'heatmap-d9586',
  storageBucket: 'heatmap-d9586.firebasestorage.app',
  messagingSenderId: '950472944848',
  appId: '1:950472944848:web:05017c7b519178ae61c2d5',
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore();
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export const storage = getStorage(app);

