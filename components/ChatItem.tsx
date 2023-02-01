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
  loggedUser: User
};

type UserInfo = {
  photoUrl?: string;
};

const ChatItem = ({ id, users, loggedUser }: Props) => {
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
    router.push(`/chat/${id}`);
  };

  return (
    <div
      className='flex items-center cursor-pointer p-4 break-words hover:bg-gray-200'
      onClick={openChat}
    >
      <Avatar
        className='m-1 mr-4'
        src={recipientUser?.photoUrl || ""}
        imgProps={{ referrerPolicy: 'no-referrer' }}
      />

      <p className='break-all'> {recipientEmail.split('@')[0]} </p>
    </div>
  )
}

export default ChatItem;