import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <ChatPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
