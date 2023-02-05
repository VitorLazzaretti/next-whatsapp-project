import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import 'firebase/firestore';
import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "AIzaSyAB_SmMEy00wR-L-zjop9-GS6JF5rLl6gw",
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN ||  "next-whatsapp-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ||  "next-whatsapp-project",
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET ||  "next-whatsapp-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGE_SENDER_ID ||  "1050648049603",
  appId: process.env.NEXT_PUBLIC_APP_ID ||  "1:1050648049603:web:99bae9fbda8b59cb71af76"
};

const app =  getApps().length < 1 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };