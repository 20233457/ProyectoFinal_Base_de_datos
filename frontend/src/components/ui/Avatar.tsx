interface Props {
  name: string;
  size?: number;
  status?: "online" | "offline";
}

const colors = [
  "#f97316",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

const Avatar = ({ name, size = 32, status }: Props) => {
  const initials = name
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const color =
    colors[Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
      colors.length];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "999px",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
          fontWeight: 600,
          color: "#0b1120",
        }}
      >
        {initials}
      </div>
      {status && (
        <span
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: "999px",
            border: "2px solid #020617",
            backgroundColor: status === "online" ? "#22c55e" : "#6b7280",
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
