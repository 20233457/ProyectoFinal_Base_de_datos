import { useState } from "react";

interface Props {
  onSendText: (text: string) => void;
  onSendFile: (file: File) => void;
  onTypingChange: (isTyping: boolean) => void;
}

const MessageInput = ({ onSendText, onSendFile, onTypingChange }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText("");
    onTypingChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSendFile(file);
    e.target.value = "";
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTypingChange(e.target.value.trim().length > 0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "8px 12px 10px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <label
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          backgroundColor: "rgba(15,23,42,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "1px solid rgba(148,163,184,0.4)",
          fontSize: 18,
        }}
        title="Adjuntar archivo"
      >
        📎
        <input
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </label>
      <input
        placeholder="Escribe un mensaje"
        value={text}
        onChange={handleTextChange}
        style={{
          flex: 1,
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.4)",
          backgroundColor: "rgba(15,23,42,0.9)",
          padding: "8px 12px",
          color: "#e5e7eb",
          outline: "none",
          fontSize: 13,
        }}
      />
      <button
        type="submit"
        style={{
          borderRadius: 999,
          padding: "8px 14px",
          background: "linear-gradient(135deg,#3b82f6,#6366f1)",
          color: "white",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        Enviar
      </button>
    </form>
  );
};

export default MessageInput;
