interface ChatProps {
  id?: string;
  users?: string[];
  lastSent?: number;
};

interface MessageProps {
  id?: string;
  body?: string;
  createdAt?: number;
  sender?: string;
  sentTo?: string;
};

interface UserProps {
  id?: string | null;
  email?: string | null;
  lastSeen?: number | null;
  photoUrl?: string | null;
};
