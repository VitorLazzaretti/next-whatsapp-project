import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ChatScreen from "../../components/ChatScreen";
import Loading from "../../components/Loading";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../firebase";
import getRecipientEmail from "../../utils/getRecipientEmail";

type Props = {
  chat?: ChatProps;
  usersData?: UsersData;
}

type UsersData = {
  users?: UserProps[];
}

type FirebaseChat = {
  id?: string;
  users?: string[];
}


const ChatPage: NextPage = ({ usersData, chat }: Props) => {
  const users = usersData?.users;
  const [user] = useAuthState(auth);
  const [pageTitle, setPageTitle] = useState('Loading...');
  const router = useRouter();

  if (!chat) {
    router.replace('/');
    return <Loading />;
  };

  if (!chat?.users) {
    router.replace('/login');
    return <Loading />;
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    };

    if (chat?.users && user?.email) {
      setPageTitle(`Chat with ${getRecipientEmail(chat.users, user)}`);
    }
  }, [chat.id, user]);

  if (!user) {
    router.replace('/login');
    return <Loading />;
  };

  const recipientEmail = getRecipientEmail(chat?.users, user);
  const recipientUser = users?.find(u => u?.email === recipientEmail);

  return (
    <div className="flex">
      <Head>
        <title> {pageTitle} </title>
      </Head>
      <Sidebar />
      <div id="chat-container" className="flex-1">
        {chat ?
          <ChatScreen chat={chat} recipientUser={recipientUser} />
          :
          <h1>Without Chat</h1>
        }
      </div>
    </div>
  )
}

export default ChatPage;

type FirebaseUserProps = {
  id?: string;
  email?: string;
  lastSeen?: Timestamp;
  photoUrl?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.query?.id) return { props: {} };
  if (typeof context.query.id !== 'string') return { props: {} };

  try {
    const chatsRef = doc(db, "chats", context.query.id);
    const chatSnapshot = await getDoc<FirebaseChat>(chatsRef);

    if (!chatSnapshot.id || !chatSnapshot.exists()) return { props: {} };

    const chat: ChatProps = {
      id: chatSnapshot.id,
      users: chatSnapshot?.data().users
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

    return {
      props: {
        chat: chat,
        usersData: { users: users },
      },
    }

  } catch (error) {
    console.log(error);
    return { props: {} };
  }
}