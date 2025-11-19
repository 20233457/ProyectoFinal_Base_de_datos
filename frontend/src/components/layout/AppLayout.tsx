import { ReactNode } from "react";

interface Props {
  sidebar: ReactNode;
  content: ReactNode;
}

const AppLayout = ({ sidebar, content }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(135deg,#020617,#111827)",
        color: "#e5e7eb",
      }}
    >
      <aside
        style={{
          width: 320,
          borderRight: "1px solid var(--border-subtle)",
          background:
            "radial-gradient(circle at top,#111827,#020617 60%,#020617 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {sidebar}
      </aside>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {content}
      </main>
    </div>
  );
};

export default AppLayout;
