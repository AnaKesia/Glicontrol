// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAf08GEJvgOtiNpe-7s0fbXGkTWJUjODN8",
  authDomain: "glicontrol-59e05.firebaseapp.com",
  projectId: "glicontrol-59e05",
  storageBucket: "glicontrol-59e05.appspot.com",
  messagingSenderId: "424848704977",
  appId: "1:424848704977:web:31a645f1fee20ae31b8cf0",
  measurementId: "G-1MTLPHNNZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
