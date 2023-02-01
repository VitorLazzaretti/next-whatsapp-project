interface ChatProps {
  id?: string;
  users?: string[];
};

interface MessageProps {
  id?: string;
  body?: string;
  createdAt?: number;
  sender?: string;
};

interface UserProps {
  id?: string;
  email?: string;
  lastSeen?: number;
  photoUrl?: string;
};
