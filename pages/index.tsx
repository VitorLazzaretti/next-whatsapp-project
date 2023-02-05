import type { NextPage } from 'next'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from '../components/Sidebar';
import { auth } from '../firebase';

const Home: NextPage = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  if (!user) {
    router.replace('/login');
    return <></>;
  }


  return (
    <div className='flex'>
      <Head>
        <title> ConnectMe </title>
      </Head>

      <Sidebar />
      <div className='flex-1 flex flex-col h-screen items-center justify-center bg-chat-bg bg-cover bg-center'></div>
    </div>
  );
}

export default Home;
