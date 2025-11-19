import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};

interface Props {
  children: ReactNode;
}

export const SocketProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const s = io(API_BASE_URL, {
      transports: ["websocket"],
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !token) return;
    socket.emit("auth", token);
  }, [socket, token]);

  return (
    <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  );
};
