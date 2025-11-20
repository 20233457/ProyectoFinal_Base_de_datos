import { Message } from "../../types/chat";
import { useAuth } from "../../state/AuthContext";
import { API_BASE_URL } from "../../api/client";

interface Props {
  messages: Message[];
  // 👇 NUEVO: id del otro usuario (para saber si él ya leyó tus mensajes)
  otherUserId?: string;
}

const MessageList = ({ messages, otherUserId }: Props) => {
  const { user } = useAuth();

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {messages.map((msg) => {
        const isMe = msg.senderID === user?.username;
        // Tus mensajes a la IZQUIERDA, otros a la DERECHA (como lo tenías)
        const align = isMe ? "flex-start" : "flex-end";
        const bg = isMe ? "rgba(59,130,246,0.25)" : "rgba(15,23,42,0.9)";

        // 👇 "visto": si el mensaje es mío y el otro usuario aparece en readBy
        const isSeenByOther =
          isMe && otherUserId && msg.readBy?.includes(otherUserId);

        return (
          <div
            key={msg._id ?? (msg as any).timestamp}
            style={{
              display: "flex",
              justifyContent: align,
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                backgroundColor: bg,
                borderRadius: 12,
                padding: "6px 10px",
                fontSize: 13,
                border: "1px solid rgba(15,23,42,0.6)",
              }}
            >
              {/* Nombre del remitente si no soy yo */}
              {!isMe && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: 2,
                  }}
                >
                  {msg.senderID}
                </div>
              )}

              {/* Media */}
              {msg.type === "media" && msg.mediaUrl && (
                <div style={{ marginBottom: msg.text ? 4 : 0 }}>
                  {msg.mediaType?.startsWith("image/") ? (
                    <img
                      src={API_BASE_URL + msg.mediaUrl}
                      style={{
                        maxWidth: "100%",
                        borderRadius: 8,
                        border: "1px solid rgba(148,163,184,0.4)",
                      }}
                    />
                  ) : (
                    <a
                      href={API_BASE_URL + msg.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        textDecoration: "underline",
                      }}
                    >
                      📎 Descargar archivo
                    </a>
                  )}
                </div>
              )}

              {/* Texto */}
              {msg.text && <div>{msg.text}</div>}

              {/* 👇 Línea de estado (visto / enviado) solo en mis mensajes */}
              {isMe && (
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 10,
                    textAlign: "right",
                    color: "var(--text-muted)",
                  }}
                >
                  {isSeenByOther ? "✓✓ Visto" : "✓ Enviado"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
