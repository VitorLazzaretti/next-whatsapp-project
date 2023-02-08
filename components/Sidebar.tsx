import { Chat, MoreVert, Search, Groups } from '@mui/icons-material';
import { Avatar, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import * as EmailValidator from 'email-validator';
import { signOut } from 'firebase/auth';
import { addDoc, collection, getDocs, onSnapshot, query, QuerySnapshot, Timestamp, where } from 'firebase/firestore';
import { useRouter } from 'next/router';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import ChatItem from './ChatItem';
import Loading from './Loading';

type FirebaseChat = {
  id?: string;
  users?: string[];
  lastSent?: Timestamp;
}

const Sidebar = () => {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<ChatProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserInPage, setIsUserInPage] = useState(true);
  const [shouldColorIcon, setShouldColorIcon] = useState(false);
  const [notificateChats, setNotificateChats] = useState<string[]>([])

  const router = useRouter();
  const chatsCollection = collection(db, "chats");

  useEffect(() => {
    window.addEventListener('blur', () => {
      setIsUserInPage(false);
    });

    window.addEventListener('focus', () => {
      setIsUserInPage(true);
    });

    return () => {
      window.removeEventListener('blur', () => { });
      window.removeEventListener('focus', () => { });
    };
  }, []);

  useEffect(() => {
    setLoading(true);

    getChatsSnapshot()
      .then((snapshot: QuerySnapshot<FirebaseChat>) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          lastSent: doc.data().lastSent?.toDate().getTime(),
          users: doc.data().users
        }));

        const orderedChatList = chatList.sort((a, b) => (b.lastSent || 0) - (a.lastSent || 0));

        setChats(orderedChatList);
        setLoading(false);
      })
      .catch(alert);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "chats"), where("users", "array-contains", user?.email));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatList = [...querySnapshot.docs.map(
        (snaps) => {
          return {
            ...snaps.data(),
            id: snaps.id,
            lastSent: snaps.data().lastSent?.toDate().getTime(),
          }
        })];

      const orderedChatList = chatList.sort((a, b) => (b.lastSent || 0) - (a.lastSent || 0));

      setChats(orderedChatList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const notify = (id: string) => {
      if (notificateChats.includes(id)) {
        return;
      }

      const audio = new Audio('/blip.mp3');

      audio.play();
      setNotificateChats(chats => [...chats, id]);
    };

    const q = query(collection(db, 'messages'), where('sentTo', '==', user?.email), where('createdAt', '>', Timestamp.now()));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().map((docChanges) => {
        const data = docChanges.doc.data();

        console.log(data, isUserInPage);
        if (router.query?.id !== data?.chatId || !isUserInPage) {
          notify(data?.chatId);
        };
      });
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
      users: [user.email, input],
      lastSent: Timestamp.now()
    });
  };

  const getChatsSnapshot = async () => {
    const q = query(chatsCollection, where("users", "array-contains", user?.email));
    const chatsSnapshot = await getDocs(q);
    return chatsSnapshot;
  };

  const chatAlreadyExists = async (input: string) => {
    if (chats.length === 0) return false;
    return !!chats.find((chat) => chat.users!.includes(input));
  };

  const removeNotification = (id: string) => {
    setNotificateChats(chats => chats.filter((chat) => chat !== id));
  };

  return (
    <div className='w-96 h-screen overflow-auto border-r border-zinc-700 bg-zinc-900'>
      <div className='sticky top-0 z-20 w-full flex flex-col items-center flex-[0.45] bg-zinc-900 pb-4 shadow-md shadow-neutral-600'>
        <header
          className='flex items-center justify-between z-10 p-4 w-full border-b border-yellow-500 bg-zinc-800 h-20'
        >
          <Avatar
            onClick={() => { signOut(auth); }}
            className='m-3 cursor-pointer border-black border-2 hover:opacity-80'
            src={user?.photoURL || ""}
            imgProps={{ referrerPolicy: 'no-referrer' }}
          />
          <div
            id='icons-container'
            className='flex items-center justify-center'
          >
            <IconButton sx={{ marginRight: 2 }}>
              <Groups fontSize='large' />
            </IconButton>

            <IconButton sx={{ marginRight: 1 }}>
              <Chat />
            </IconButton>

            <IconButton>
              <MoreVert />
            </IconButton>
          </div>
        </header>
        <div
          id='search-container'
          className='flex w-11/12 my-4 items-center rounded-sm'
        >
          <TextField
            type="text"
            size='small'
            fullWidth
            placeholder={'Search for a chat'}
            onFocus={() => { setShouldColorIcon(true); }}
            onBlur={() => { setShouldColorIcon(false); }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search color={shouldColorIcon ? 'primary' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <Button
          onClick={createNewChat}
          className='w-11/12 text-black border-solid border-b border-t border-gray-50'
          variant='outlined'
        > Start a new chat </Button>
      </div>

      <div className='p-0'>
        {!loading && chats && chats.length === 0 && <p className='text-gray-500 font-bold text-center p-3 mt-3'>Sem Chats Ainda</p>}

        {user && chats && chats.map((chat) => (
          <div className='w-full' key={chat.id}>
            {chat?.id && chat?.users &&
              <ChatItem
                id={chat.id}
                selected={router.query?.id === chat.id}
                users={chat.users}
                loggedUser={user}
                lastSent={chat?.lastSent}
                notify={notificateChats.includes(chat.id)}
                onClick={removeNotification}
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