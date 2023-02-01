import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import 'firebase/firestore';
import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAB_SmMEy00wR-L-zjop9-GS6JF5rLl6gw",
  authDomain: "next-whatsapp-project.firebaseapp.com",
  projectId: "next-whatsapp-project",
  storageBucket: "next-whatsapp-project.appspot.com",
  messagingSenderId: "1050648049603",
  appId: "1:1050648049603:web:99bae9fbda8b59cb71af76"
};

const app =  getApps().length < 1 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };