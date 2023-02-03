import { Button } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import Head from 'next/head'
import { useRouter } from 'next/router';
import React from 'react'
import { auth, provider } from '../firebase';

const Login = () => {
  const router = useRouter();

  const signIn = () => {
    signInWithPopup(auth, provider)
      .then(() => router.replace('/'))
      .catch(alert);
  }

  return (
    <div className='flex items-center justify-center w-full h-screen bg-gray-100'>
      <Head> Login </Head>

      <div
        className='p-24 flex items-center justify-center flex-col bg-white rounded-xl shadow-lg'
      >
        <img
          alt='Logo'
          src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png'
          className='w-52 h-52 mb-10'
        />
        <Button
          onClick={signIn}
          variant='outlined'
          className='text-black border-black hover:bg-black hover:text-white hover:border-black'
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}

export default Login;