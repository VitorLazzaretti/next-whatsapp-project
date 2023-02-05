import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import moment from 'moment';

const Message = ({ body, id, createdAt, sender }: MessageProps) => {
  const [user] = useAuthState(auth);
  const isSender = sender == user?.email;

  return (
    <div id={id}>
      <p
        className={`w-fit p-4 rounded-lg m-2 min-w-[60px] pb-6 relative text-right
        ${isSender ? 'ml-auto bg-yellow-400 text-black' : 'bg-zinc-800 text-left'}`}
      >
        {body}

        <span className={`p-2 ${isSender ? 'text-zinc-700' : 'text-zinc-300'} text-[9px] absolute bottom-0 right-0 text-right`}>
          {moment(createdAt).format('LT')}
        </span>
      </p>
    </div>
  )
}

export default Message;