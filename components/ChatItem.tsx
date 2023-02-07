import { Avatar } from '@mui/material';
import { User } from 'firebase/auth';
import { collection, getDocs, query, QuerySnapshot, where } from 'firebase/firestore';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import getRecipientEmail from '../utils/getRecipientEmail';

type Props = {
  id: string;
  users: string[];
  loggedUser: User;
  selected: boolean;
  lastSent?: number;
  notify: boolean;
  onClick: (id: string) => void;
};

type UserInfo = {
  photoUrl?: string;
};

const ChatItem = ({ id, users, loggedUser, lastSent, selected, notify, onClick }: Props) => {
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

  return (
    <Link
      href={`/chat/${id}`}
      passHref
      className='flex items-center cursor-pointer justify-between break-words ml-[1px] h-20 bg-neutral-900 bg shadow-inner shadow-neutral-700 hover:bg-neutral-800'
      onClick={() => onClick(id)}
    >
      <div className='flex items-center h-full'>
        <div className={`${selected ? 'bg-yellow-500' : 'bg-neutral-500'} h-full w-1`}></div>
        <div className='m-4'>
          <Avatar
            className='shadow-2xl shadow-black'
            src={recipientUser?.photoUrl || ""}
            imgProps={{ referrerPolicy: 'no-referrer' }}
          />
        </div>
        <p className='break-all'> {recipientEmail.split('@')[0]} </p>
      </div>
      <div className='mr-5 flex flex-col justify-center items-center'>
        <p className={`text-[12px] mb-2 text-gray-300 ${notify ? 'text-yellow-500' : 'text-gray-300'}`}> {lastSent ? moment(lastSent).format('LT') : 'Unavailable'} </p>
        <div className={`w-5 h-5 ${notify ? 'bg-yellow-500' : 'bg-transparent'} rounded-full`}></div>
      </div>
    </Link>
  )
}

export default ChatItem;