interface Props {
  children: React.ReactNode;
}

const Tag = ({ children }: Props) => (
  <span
    style={{
      padding: "2px 6px",
      borderRadius: "999px",
      fontSize: "11px",
      backgroundColor: "rgba(148,163,184,0.2)",
      color: "#e5e7eb",
    }}
  >
    {children}
  </span>
);

export default Tag;
