export interface Message {
  messageId: number;
  senderId: string;
  senderName: string;
  roomId: string;
  content: string;
  createdAt: Date;
  isRead: { [userId: string]: boolean };
}
