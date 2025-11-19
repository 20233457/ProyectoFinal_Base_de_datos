interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

const SearchBar = ({ value, onChange, onSearch }: Props) => {
  return (
    <div style={{ padding: "8px 12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(15,23,42,0.9)",
          borderRadius: 999,
          padding: "4px 8px",
          border: "1px solid rgba(148,163,184,0.3)",
        }}
      >
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>🔍</span>
        <input
          placeholder="Buscar chats o usuarios"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#e5e7eb",
            fontSize: 13,
          }}
        />
        <button
          type="button"
          onClick={onSearch}
          style={{
            borderRadius: 999,
            padding: "4px 8px",
            fontSize: 11,
            background:
              "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(129,140,248,0.3))",
            color: "#e5e7eb",
          }}
        >
          Ir
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
