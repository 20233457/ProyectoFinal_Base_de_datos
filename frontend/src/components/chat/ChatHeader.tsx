import Avatar from "../ui/Avatar";
import Tag from "../ui/Tag";
import { ChatSummary } from "../../types/chat";
import { useAuth } from "../../state/AuthContext";

interface Props {
  chat: ChatSummary | null;
  typingUsers: string[];
}

const ChatHeader = ({ chat, typingUsers }: Props) => {
  const { user } = useAuth();

  if (!chat) {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Selecciona un chat o crea uno nuevo
        </span>
      </div>
    );
  }

  const others = chat.participants.filter((p) => p.username !== user?.username);
  const title = chat.isGroup
    ? chat.name || "Grupo"
    : others[0]?.username || "Chat";

  const subtitle =
    typingUsers.length > 0
      ? typingUsers.length === 1
        ? `${typingUsers[0]} está escribiendo...`
        : "Varios usuarios están escribiendo..."
      : chat.isGroup
      ? `${chat.participants.length} miembros`
      : others[0]?.status === "online"
      ? "En línea"
      : "Desconectado";

  return (
    <div
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background:
          "linear-gradient(135deg,rgba(15,23,42,0.9),rgba(15,23,42,0.6))",
      }}
    >
      <Avatar
        name={title}
        size={36}
        status={chat.isGroup ? undefined : (others[0]?.status as any)}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          {chat.isGroup && <Tag>Grupo</Tag>}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {subtitle}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
