import '../styles/globals.css';
import '../styles/styles.css';
import type { AppProps } from 'next/app'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from '../firebase';
import Loading from '../components/Loading';
import { createContext, useEffect } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { yellow } from '@mui/material/colors';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, loading] = useAuthState(auth);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        ...yellow,
        main: '#DDB004',
      },
    }
  });

  useEffect(() => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        lastSeen: Timestamp.now(),
        photoUrl: user.photoURL,
      }, { merge: true }).then().catch(console.error);
    };
  }, [loading, user]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {loading ? <Loading />
        : <Component {...pageProps} />}
    </ThemeProvider>
  );
};

export default MyApp;
