import { User } from "../../state/AuthContext";
import Avatar from "../ui/Avatar";

interface Props {
  results: User[];
  onStartChat: (user: User) => void;
}

const UserSearchResults = ({ results, onStartChat }: Props) => {
  if (!results.length) return null;

  return (
    <div
      style={{
        padding: "4px 8px 8px",
        borderTop: "1px solid var(--border-subtle)",
        maxHeight: 180,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        Usuarios
      </div>
      {results.map((u) => (
        <div
          key={u.id}
          onClick={() => onStartChat(u)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 4px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <Avatar name={u.username} size={26} status={u.status as any} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13 }}>{u.username}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {u.status === "online" ? "En línea" : "Desconectado"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSearchResults;
