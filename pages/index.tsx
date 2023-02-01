import type { NextPage } from 'next'
import Head from 'next/head';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';


const Home: NextPage = () => {
  return (
    <div className='flex'>
      <Head>
        <title> Let's Build WhatsApp 2.0 </title>
      </Head>

      <Sidebar />
      <div className='flex-1 flex flex-col h-screen items-center justify-center'>
        <h2
          className='bg-[#def8c6] p-4 m-8 rounded-xl font-bold text-center text-xl'
        > Escolha ou crie um chat ao lado e converse com um amigo </h2>
        
        <Image
          src={'/mobile.png'}
          alt='Mobile'
          width={650}
          height={650}
        />
      </div>
    </div>
  );
}

export default Home;
