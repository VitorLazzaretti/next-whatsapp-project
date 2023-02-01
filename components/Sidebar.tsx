import { uuidv4 } from '@firebase/util';
import { Chat, MoreVert, Search } from '@mui/icons-material';
import { Avatar, Button, IconButton } from '@mui/material';
import * as EmailValidator from 'email-validator';
import { signOut } from 'firebase/auth';
import { addDoc, collection, getDocs, onSnapshot, query, QuerySnapshot, where } from 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import ChatItem from './ChatItem';
import Loading from './Loading';

const Sidebar = () => {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<ChatProps[]>([]);
  const chatsCollection = collection(db, "chats");
  const [loading, setLoading] = useState(true);

  console.log(chats);

  useEffect(() => {
    setLoading(true);
    getChatsSnapshot()
      .then((snapshot: QuerySnapshot<ChatProps>) => {
        setChats(snapshot.docs.map((doc) => ({ id: doc.id, users: doc.data().users })));
        setLoading(false);
      })
      .catch(alert)
  }, []);

  useEffect(() => {
    const q = query(collection(db, "chats"), where("users", "array-contains", user?.email));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setChats([...querySnapshot.docs.map(
        (snaps) => {
          return {
            id: snaps.id,
            ...snaps.data(),           
          }
        })]);
    });

    return () => {
      unsubscribe();
    };
  }, []);







  const createNewChat = async () => {
    const input = prompt('Please enter a email for the user you want to chat');

    if (!input || !user) return null;

    if (!EmailValidator.validate(input) || input === user.email) return null;

    const exists = await chatAlreadyExists(input);

    if (exists) return null;

    await addDoc(chatsCollection, {
      users: [user.email, input]
    });
  };

  const getChatsSnapshot = async () => {
    const q = query(chatsCollection, where("users", "array-contains", user?.email));
    const chatsSnapshot = await getDocs(q);
    return chatsSnapshot;
  }

  const chatAlreadyExists = async (input: string) => {
    if (chats.length === 0) return false;
    return !!chats.find((chat) => chat.users!.includes(input));
  };

  return (
    <div className='w-96 border-r border-solid h-screen overflow-y-scroll'>
      <div className='sticky top-0 bg-white z-20 shadow-sm flex-[0.45]'>
        <header
          className='flex items-center justify-between z-10 p-4 border-b border-gray-200 h-20 bg-white'
        >
          <Avatar
            onClick={() => signOut(auth)}
            className='m-3 cursor-pointer hover:opacity-80'
            src={user?.photoURL || ""}
            imgProps={{ referrerPolicy: 'no-referrer' }}
          />
          <div
            id='icons-container'
            className=''
          >
            <IconButton>
              <Chat />
            </IconButton>

            <IconButton>
              <MoreVert />
            </IconButton>
          </div>
        </header>
        <div
          id='search-container'
          className='flex items-center p-5 rounded-sm'
        >
          <Search />
          <input
            type="text"
            className='outline-none flex-1'
            placeholder="Search in chats..."
          />
        </div>

        <Button
          onClick={createNewChat}
          className='w-full text-black border-solid border-b border-t border-gray-50'
        > Start a new chat </Button>
      </div>

      <div className='overflow-auto'>
        {!loading && chats && chats.length === 0 && <p className='text-gray-500 font-bold text-center p-3 mt-3'>Sem Chats Ainda</p>}

        {user && chats && chats.map((chat) => (
          <div key={uuidv4()}>
            {chat?.id && chat?.users &&
              <ChatItem
                id={chat.id}
                users={chat.users}
                loggedUser={user}
              />
            }
          </div>
        ))}
      </div>

      {loading &&
        <Loading />
      }
    </div>
  );
};

export default Sidebar;