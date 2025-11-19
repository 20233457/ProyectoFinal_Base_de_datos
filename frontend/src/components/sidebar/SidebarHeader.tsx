import Avatar from "../ui/Avatar";
import { useAuth } from "../../state/AuthContext";

const SidebarHeader = () => {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={user?.username ?? "?"} size={32} status="online" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            {user?.username ?? "Invitado"}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Conectado
          </span>
        </div>
      </div>
      <button
        onClick={logout}
        style={{
          backgroundColor: "rgba(239,68,68,0.1)",
          color: "var(--danger)",
          borderRadius: 999,
          padding: "4px 10px",
          fontSize: 11,
        }}
      >
        Salir
      </button>
    </div>
  );
};

export default SidebarHeader;
