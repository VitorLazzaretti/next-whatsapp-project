import { User } from "firebase/auth";

const getRecipientEmail = (users: string[], loggedUser: User) => {
  return users?.filter((userToFilter) => userToFilter !== loggedUser.email)[0];
};

export default getRecipientEmail;