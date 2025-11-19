import { useAuth } from "../../state/AuthContext";

import { ChatSummary } from "../../types/chat";
import Avatar from "../ui/Avatar";
import Tag from "../ui/Tag";

interface Props {
  chats: ChatSummary[];
  selectedChatId: string | null;
  onSelect: (chat: ChatSummary) => void;
}

const ChatList = ({ chats, selectedChatId, onSelect }: Props) => {
  const { user } = useAuth();
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "4px 4px 10px",
      }}
    >
      {chats.map((chat) => {
// Para chats individuales, buscamos al OTRO usuario
let other =
  chat.isGroup || !user
    ? null
    : chat.participants.find((p) => p._id !== user.id) || chat.participants[0];

const title = chat.isGroup
  ? chat.name || "Grupo"
  : other?.username || "Chat";


        const isSelected = selectedChatId === chat._id;

        return (
          <div
            key={chat._id}
            onClick={() => onSelect(chat)}
            style={{
              display: "flex",
              gap: 10,
              padding: "8px 10px",
              margin: "0 4px 4px",
              borderRadius: 10,
              backgroundColor: isSelected
                ? "rgba(15,118,255,0.25)"
                : "transparent",
              cursor: "pointer",
              transition: "background 0.12s ease",
            }}
          >
            <Avatar
              name={title}
              size={32}
              status={chat.isGroup ? undefined : (other?.status as any)}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </span>
                {chat.isGroup && <Tag>Grupo</Tag>}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {chat.lastMessage
                  ? chat.lastMessage.type === "media"
                    ? "📎 Archivo adjunto"
                    : chat.lastMessage.text
                  : "Sin mensajes aún"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
