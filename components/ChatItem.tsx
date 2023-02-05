import { Avatar } from '@mui/material';
import { User } from 'firebase/auth';
import { collection, getDocs, query, QuerySnapshot, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import getRecipientEmail from '../utils/getRecipientEmail';

type Props = {
  id: string;
  users: string[];
  loggedUser: User;
  selected: boolean;
};

type UserInfo = {
  photoUrl?: string;
};

const ChatItem = ({ id, users, loggedUser, selected }: Props) => {
  const router = useRouter();
  const [recipientUser, setRecipientUser] = useState<UserInfo>();

  const recipientEmail = getRecipientEmail(users, loggedUser);
  const recipientUserCollection = collection(db, "users");

  useEffect(() => {
    const recipientUserSnapshot = query(recipientUserCollection, where("email", "==", recipientEmail));
    getDocs(recipientUserSnapshot)
      .then((snapshot: QuerySnapshot<UserInfo>) => {
        setRecipientUser(snapshot.docs[0]?.data());
      });
  }, []);

  const openChat = () => {
    router.replace(`/chat/${id}`);
  };

  return (
    <div
      className='flex items-center cursor-pointer break-words ml-[1px] h-20 bg-neutral-900 bg shadow-inner shadow-neutral-700 hover:bg-neutral-800'
      onClick={openChat}
    >
      <div className={`${selected ? 'bg-yellow-500': 'bg-neutral-500'} h-full w-1`}></div>
      <div className='m-4'>
        <Avatar
          className='shadow-2xl shadow-black'
          src={recipientUser?.photoUrl || ""}
          imgProps={{ referrerPolicy: 'no-referrer' }}
        />
      </div>

      <p className='break-all'> {recipientEmail.split('@')[0]} </p>
    </div>
  )
}

export default ChatItem;