import { Message } from './Message';
import { User } from './User';

export interface Room {
  roomId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  isGroup: boolean;
  members: User[];
  messages: Message[];
}
