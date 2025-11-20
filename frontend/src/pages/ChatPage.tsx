import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import SidebarHeader from "../components/sidebar/SidebarHeader";
import SearchBar from "../components/sidebar/SearchBar";
import ChatList from "../components/sidebar/ChatList";
import UserSearchResults from "../components/sidebar/UserSearchResults";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import { useAuth, type User } from "../state/AuthContext";
import { useSocket } from "../state/SocketContext";
import api, { API_BASE_URL } from "../api/client";
import type { ChatSummary, Message } from "../types/chat";

const ChatPage = () => {
  const { token } = useAuth();
  const { socket } = useSocket();

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // 1) Cargar lista de chats al entrar
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await api.get("/chats");
        setChats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (token) loadChats();
  }, [token]);

  // 2) Escuchar mensajes nuevos y "typing" del chat actual
  useEffect(() => {
    if (!socket) return;

 const handleNewMessage = (data: any) => {
  if (!selectedChat || data.chatID !== selectedChat._id) return;

  // El backend SIEMPRE envía:
  // senderID = ID real del usuario
  // senderUsername = username real
  const realSenderId = data.senderID;

  const msg: Message = {
    _id: data._id,
    chatID: data.chatID,
    senderID: realSenderId, // <-- CORREGIDO
    text: data.text,
    type: data.type,
    mediaUrl: data.mediaUrl,
    mediaType: data.mediaType,
    mediaSize: data.mediaSize,
    createdAt: data.createdAt,
    senderUsername: data.senderUsername, // <-- Para mostrar nombre
    readBy: data.readBy || [],
  };

  setMessages((prev) => [...prev, msg]);
};


    const handleTyping = (payload: any) => {
      if (!selectedChat || payload.chatID !== selectedChat._id) return;
      const name = String(payload.username ?? "");
      if (!name) return;
      setTypingUsers((prev) => {
        if (payload.isTyping) {
          if (!prev.includes(name)) return [...prev, name];
          return prev;
        } else {
          return prev.filter((u) => u !== name);
        }
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [socket, selectedChat]);

  // 3) Escuchar "chat_updated" para:
  //    - crear chats nuevos en la lista izq
  //    - actualizar último mensaje
  //    - subir contador de no leídos si no está abierto
  useEffect(() => {
    if (!socket) return;

    const handleChatUpdated = ({
      chat,
      fromUserId,
    }: {
      chat: ChatSummary;
      fromUserId: string;
    }) => {
      setChats((prev) => {
        const existing = prev.find((c) => c._id === chat._id);

        // Si ya existe el chat en la lista, actualizamos lastMessage y unreadCount
        if (existing) {
          const isActive = selectedChat?._id === chat._id;

          const updated = prev.map((c) =>
            c._id === chat._id
              ? {
                  ...c,
                  ...chat,
                  unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
                }
              : c
          );

          // ordenar por último mensaje (más reciente arriba)
          return [...updated].sort((a, b) =>
            (b.lastMessage?.createdAt || "").localeCompare(
              a.lastMessage?.createdAt || ""
            )
          );
        }

        // Si es un chat NUEVO para este usuario
        const newChat: ChatSummary = {
          ...chat,
          unreadCount: 1,
        };

        return [newChat, ...prev];
      });
    };

    socket.on("chat_updated", handleChatUpdated);

    return () => {
      socket.off("chat_updated", handleChatUpdated);
    };
  }, [socket, selectedChat]);

  // 4) Abrir un chat:
  //    - seleccionarlo
  //    - limpiar contador de no leídos
  //    - unirse al room socket
  //    - cargar mensajes desde el backend
  const openChat = async (chat: ChatSummary) => {
    setSelectedChat(chat);

    // marcar como leído en la lista
    setChats((prev) =>
      prev.map((c) =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );

    setMessages([]);
    socket?.emit("join_chat", chat._id);

    try {
      const res = await api.get(`/chats/${chat._id}/messages`);
      const msgs: Message[] = res.data.map((m: any) => ({
        _id: m._id,
        chatID: m.chatID,
        senderID: m.senderID.username,
        text: m.text,
        type: m.type,
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType,
        mediaSize: m.mediaSize,
        createdAt: m.createdAt,
      }));
      setMessages(msgs);

          if (socket && msgs.length > 0) {
      const lastMessageId = msgs[msgs.length - 1].  _id;
       socket.emit("messages_read", {
          chatID: chat._id,
          lastMessageId,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 5) Buscar usuarios para iniciar chat
  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(search)}`);
      const mapped: User[] = res.data.map((u: any) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        status: u.status,
      }));
      setSearchResults(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  // 6) Crear o recuperar chat 1 a 1 con un usuario
  const handleStartChat = async (other: User) => {
    try {
      const res = await api.post("/chats/create-or-get", {
        otherUserId: other.id,
      });
      const chat: ChatSummary = res.data;

      setChats((prev) => {
        const exists = prev.find((c) => c._id === chat._id);
        if (exists) return prev;
        return [chat, ...prev];
      });

      setSearch("");
      setSearchResults([]);
      openChat(chat);
    } catch (error) {
      console.error(error);
    }
  };

  // 7) Enviar mensaje de texto
  const handleSendText = (text: string) => {
    if (!selectedChat || !socket) return;
    // Solo enviamos al servidor; el mensaje se agregará cuando llegue "new_message".
    socket.emit("send_message", { chatID: selectedChat._id, text });
  };

  // 8) Enviar archivo (multimedia)
  const handleSendFile = async (file: File) => {
    if (!selectedChat) return;
    if (file.size > 100 * 1024 * 1024) {
      alert("El archivo supera el límite de 100 MB");
      return;
    }
    const formData = new FormData();
    formData.append("chatID", selectedChat._id);
    formData.append("file", file);

    try {
      await fetch(API_BASE_URL + "/api/messages/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        } as any,
        body: formData,
      });
    } catch (error) {
      console.error(error);
      alert("Error al subir archivo");
    }
  };

  // 9) Indicador "escribiendo..."
  const handleTypingChange = (isTyping: boolean) => {
    if (!socket || !selectedChat) return;
    socket.emit("typing", { chatID: selectedChat._id, isTyping });
  };

  const sidebar = (
    <>
      <SidebarHeader />
      <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} />
      <UserSearchResults results={searchResults} onStartChat={handleStartChat} />
      <ChatList
        chats={chats}
        selectedChatId={selectedChat?._id ?? null}
        onSelect={openChat}
      />
    </>
  );

  const content = (
    <>
      <ChatHeader chat={selectedChat} typingUsers={typingUsers} />
      {selectedChat ? (
        <>
          <MessageList messages={messages} />
          <MessageInput
            onSendText={handleSendText}
            onSendFile={handleSendFile}
            onTypingChange={handleTypingChange}
          />
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            Selecciona un chat o busca un usuario para empezar a chatear.
          </p>
        </div>
      )}
    </>
  );

  return <AppLayout sidebar={sidebar} content={content} />;
};

export default ChatPage;
