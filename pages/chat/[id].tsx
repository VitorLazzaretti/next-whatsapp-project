import { collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ChatScreen from "../../components/ChatScreen";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../firebase";
import getRecipientEmail from "../../utils/getRecipientEmail";

type Props = {
  messages?: MessageProps[]
  chat?: ChatProps;
  users?: UserProps[];
}

const ChatPage: NextPage = ({ messages, chat, users }: Props) => {
  const [user] = useAuthState(auth);
  const [pageTitle, setPageTitle] = useState('Loading...');
  const router = useRouter();

  if (!chat?.users || !user) {
    router.replace('/');
    return <></>;
  }

  const recipientEmail = getRecipientEmail(chat?.users, user);
  const recipientUser = users?.find(u => u?.email === recipientEmail);

  useEffect(() => {
    if (chat?.users && user?.email) {
      setPageTitle(`Chat with ${getRecipientEmail(chat.users, user)}`);
    }
  }, [chat.id, user]);

  return (
    <div className="flex">
      <Head>
        <title> {pageTitle} </title>
      </Head>
      <Sidebar />
      <div id="chat-container" className="w-full">
        {chat && messages ?
          <ChatScreen chat={chat} messages={messages} recipientUser={recipientUser}/>
          :
          <h1>Nigga the cops outside</h1>
        }
      </div>
    </div>
  )
}

export default ChatPage;

type FirebaseMessageProps = {
  chatId?: string;
  body?: string;
  createdAt?: Timestamp;
  sender?: string;
};

type FirebaseUserProps = {
  id?: string;
  email?: string;
  lastSeen?: Timestamp;
  photoUrl?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.query?.id) return { props: {} };
  if (typeof context.query.id !== 'string') return { props: {} };

  const chatsRef = doc(db, "chats", context.query.id);
  const chatSnapshot = await getDoc<ChatProps>(chatsRef);

  if (!chatSnapshot.id || !chatSnapshot.exists()) return { props: {} };

  const chat = {
    id: chatSnapshot.id,
    ...chatSnapshot?.data()
  };

  if (!chat.users) return { props: {} };

  if (chat.users.length < 1) return { props: {} };

  const userCollection = collection(db, "users");

  const firstUsersRef = query(userCollection, where("email", "==", chat.users[0]));
  const firstUserSnapshot = await getDocs<FirebaseUserProps>(firstUsersRef);

  const secondUserRef = query(userCollection, where("email", "==", chat.users[1]));
  const secondUserSnapshot = await getDocs<FirebaseUserProps>(secondUserRef);

  const firstUserArray: UserProps[] = firstUserSnapshot?.docs.map((snapshot) => ({
    ...snapshot?.data(),
    id: snapshot.id,
    lastSeen: snapshot?.data()?.lastSeen?.toDate().getTime(),
  }));

  const secondUserArray: UserProps[] = secondUserSnapshot?.docs.map((snapshot) => ({
    ...snapshot?.data(),
    id: snapshot.id,
    lastSeen: snapshot?.data()?.lastSeen?.toDate().getTime(),
  }));

  const firstUser = firstUserArray[0];
  const secondUser = secondUserArray[0];

  const users = [(firstUser || null), (secondUser || null)];

  const messagesCollection = collection(db, "messages");
  const messagesQuery = query(messagesCollection, where("chatId", "==", chat.id), orderBy("createdAt", "asc"), limit(100));
  const messagesSnapshot = await getDocs<FirebaseMessageProps>(messagesQuery);

  const messages: MessageProps[] = messagesSnapshot?.docs.map((snapshot) => ({
    ...snapshot.data(),
    id: snapshot.id,
    createdAt: snapshot.data()?.createdAt?.toDate().getTime(),
  }));

  return {
    props: {
      messages: messages,
      chat: chat,
      users: users,
    },
  }
}