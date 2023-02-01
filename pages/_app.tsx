import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from '../firebase';
import Login from './login';
import Loading from '../components/Loading';
import { useEffect } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        lastSeen: Timestamp.now(),
        photoUrl: user.photoURL,
      }, { merge: true }).then().catch(console.error);
    };

  }, [loading, user]);

  if (loading) return <Loading />;

  if (!user) return <Login />;

  return <Component {...pageProps} />;
};

export default MyApp;
