import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../state/AuthContext";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        phone,
        password,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.message ??
          "Error al registrarse, intenta con otros datos"
      );
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
          width: 380,
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
          Crear cuenta
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
          Elige un nombre de usuario único para chatear.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 4,
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              Nombre de usuario
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 4,
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              Correo (opcional)
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 4,
                display: "block",
                color: "var(--text-muted)",
              }}
            >
              Teléfono (opcional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
          <div style={{ marginBottom: 12 }}>
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
            {loading ? "Creando..." : "Crear cuenta"}
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
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ color: "#60a5fa" }}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
