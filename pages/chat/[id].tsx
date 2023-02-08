import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { NextPage } from "next";
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
  chatData?: ChatData;
  usersData?: UsersData;
}

type UsersData = {
  users?: UserProps[];
}

type ChatData = {
  chat?: ChatProps;
}

type FirebaseChat = {
  id?: string;
  users?: string[];
}

type FirebaseUserProps = {
  id?: string;
  email?: string;
  lastSeen?: Timestamp;
  photoUrl?: string;
}

const ChatPage: NextPage = ({ usersData, chatData }: Props) => {
  const [chat, setChat] = useState<ChatProps>({});
  const [recipientUser, setRecipientUser] = useState<UserProps>({});
  const [user] = useAuthState(auth);
  const [pageTitle, setPageTitle] = useState('Loading...');
  const router = useRouter();

  useEffect(() => {
    const getInfo = async () => {
      if (!router.query.id || typeof router.query.id !== 'string') return router.replace('/');

      const chatsRef = doc(db, "chats", router.query.id);
      const chatSnapshot = await getDoc<FirebaseChat>(chatsRef);

      if (!chatSnapshot.id || !chatSnapshot.exists()) return { props: {} };

      const chat: ChatProps = {
        id: chatSnapshot.id,
        users: chatSnapshot?.data().users
      };

      if (!chat.users) return router.replace('/');

      if (chat.users.length < 1) return router.replace('/');

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

      if (chat?.users && user?.email) {
        const recipientEmail = getRecipientEmail(chat.users, user)
        setPageTitle(`Chat with ${recipientEmail}`);

        if (users?.find(u => u?.email === recipientEmail)) {
          setRecipientUser(users?.find(u => u?.email === recipientEmail)!);
        } else {
          setRecipientUser({});
        };
      };
      setChat(chat);
    };

    getInfo();
  }, [router.query?.id]);

  return (
    <div className="flex">
      <Head>
        <title> {pageTitle || 'Loading...'} </title>
      </Head>
      <Sidebar />
      <div id="chat-container" className="flex-1">
        {chat?.users && recipientUser ?
          <ChatScreen chat={chat} recipientUser={recipientUser} />
          :
          <div>
            <Loading />
          </div>
        }
      </div>
    </div>
  )
}

export default ChatPage;