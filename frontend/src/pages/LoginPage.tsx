import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../state/AuthContext";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { identifier, password });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top,#1f2937,#020617 60%,#020617 100%)",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.35)",
          background:
            "linear-gradient(135deg,rgba(15,23,42,0.9),rgba(15,23,42,0.9))",
          boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 6,
            fontSize: 22,
            textAlign: "center",
          }}
        >
          RealChat
        </h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 13,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Inicia sesión con tu usuario, correo o teléfono.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 4,
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              Usuario / correo / teléfono
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.35)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 4,
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.35)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              color: "white",
              fontWeight: 500,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div
          style={{
            fontSize: 12,
            textAlign: "center",
            marginTop: 4,
            color: "var(--text-muted)",
          }}
        >
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "#60a5fa" }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
