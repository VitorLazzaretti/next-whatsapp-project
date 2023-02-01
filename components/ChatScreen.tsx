import React, { useEffect, useRef, useState } from 'react';
import { AttachFile, InsertEmoticon, Mic, MoreVert, Send } from '@mui/icons-material';
import { Avatar, IconButton } from '@mui/material';
import { addDoc, collection, doc, limit, onSnapshot, orderBy, query, QuerySnapshot, setDoc, Timestamp, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import getRecipientEmail from '../utils/getRecipientEmail';
import Message from './Message';
import TimeAgo from 'timeago-react';

type Props = {
  messages: MessageProps[] | []
  chat: ChatProps;
  recipientUser?: UserProps;
}

type FirebaseMessageProps = {
  chatId: string;
  body: string;
  createdAt: Timestamp;
  sender: string;
};

const ChatScreen = ({ chat, messages, recipientUser }: Props) => {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState('');
  const router = useRouter();
  const referenceEnd = useRef<HTMLDivElement>(null);
  const [allMessages, setAllMessages] = useState<typeof messages>(() => messages);

  if (!user || !chat?.users) {
    router.push('/');
    return <></>;
  }

  useEffect(() => {
    if (!chat?.id) return;
    const q = query(collection(db, "messages"), where("chatId", "==", chat?.id), orderBy('createdAt', "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(querySnapshot.docChanges().map(doc => console.log(doc.doc.data())));

      setAllMessages(prev => [...prev, ...querySnapshot.docChanges().map(
        (snaps) => {
          if (!snaps.doc) return {};
          return {
            ...snaps.doc.data(),
            createdAt: snaps.doc.data().createdAt.toDate().getTime(),
            id: snaps.doc.id,
          }
        })]);
    });

    return () => {
      if (messages.length) setAllMessages([]);
      unsubscribe();
    };
  }, [messages]);

  const recipientEmail = getRecipientEmail(chat.users, user);

  const sendMessage = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setDoc(doc(db, 'users', user.uid), {
      lastSeen: Timestamp.now(),
    }, { merge: true });

    if (!input && !input.trim()) {
      return;
    }

    const messageBody = input.trim();
    setInput('');
    scrollToBottom();

    if (!chat.id || typeof chat.id !== 'string') {
      router.push('/chat');
      return;
    }

    const newMessage: FirebaseMessageProps = {
      body: messageBody,
      createdAt: Timestamp.now(),
      sender: user.email!,
      chatId: chat?.id,
    }

    await addDoc(collection(db, "messages"), newMessage).catch(console.error);
  }

  const scrollToBottom = () => {
    if (referenceEnd.current) {
      referenceEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  useEffect(() => {
    setTimeout(scrollToBottom, 0);
  }, [allMessages]);


  return (
    <div id='containter-chat-screen' className='h-screen overflow-y-scroll flex flex-col'>
      <div className='sticky bg-white top-0 z-50 flex items-center p-3 border-b border-solid border-gray-200 h-20'>
        <Avatar
          className='m-1 mr-4'
          src={recipientUser?.photoUrl || ""}
          imgProps={{ referrerPolicy: 'no-referrer' }}
        />

        <div className='flex-1'>
          <h3 className='font-bold text-xl'>{recipientEmail}</h3>

          {recipientUser ?
            <p className='text-xs text-gray-500'> Last Seen{' '}
              {recipientUser?.lastSeen ? (<TimeAgo datetime={new Date(recipientUser.lastSeen)} />) : 'Unavaliable'}
            </p>
            : <p className='text-xs text-gray-500'> Last Seen Unavaliable </p>
          }


        </div>
        <div>
          <IconButton>
            <MoreVert />
          </IconButton>

          <IconButton>
            <AttachFile />
          </IconButton>
        </div>
      </div>

      <div
        className='p-8 bg-[#e5ded8] flex-1'
      >
        {allMessages.map((message) => (
          <Message
            key={message.id}
            sender={message.sender}
            createdAt={message.createdAt}
            body={message.body}
            id={message.id}
          />
        ))}
        <div id='end' ref={referenceEnd}></div>
      </div>

      <form className='flex items-center p-3 sticky bottom-0 z-50 bg-white'>
        <IconButton>
          <InsertEmoticon />
        </IconButton>
        <input
          className='flex-1 items-center border border-neutral-300 bg-gray-100 rounded-3xl ml-4 mr-4 p-5'
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button hidden disabled={!input.trim()} type="submit" onClick={e => sendMessage(e)}> Send Message </button>

        {!input.trim() ?
          <IconButton>
            <Mic />
          </IconButton>
          :
          <IconButton onClick={e => sendMessage(e)}>
            <Send />
          </IconButton>
        }

      </form>
    </div>
  )
}

export default ChatScreen;