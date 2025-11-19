export interface ChatSummary {
  _id: string;
  isGroup: boolean;
  name?: string;
  participants: { _id: string; username: string; status?: string }[];
  lastMessage?: {
    _id: string;
    text?: string;
    type: "text" | "media";
    createdAt: string;
  } | null;
}

export interface Message {
  _id?: string;
  chatID: string;
  senderID: string;
  text?: string;
  type: "text" | "media";
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  createdAt?: string;
  timestamp?: number;
}
