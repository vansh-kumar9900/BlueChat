import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import GroupModal from "../components/GroupModal";
import { useAuth } from "../context/AuthContext";
import { createSocket } from "../socket/socket";

export default function Chat() {
  const { me, http, setMe } = useAuth();
  const socketRef = useRef(null);
  const activeChatIdRef = useRef(null);
  const usersRef = useRef([]);

  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingText, setTypingText] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);

  const activeChatId = activeChat?._id;
  useEffect(() => {
    activeChatIdRef.current = activeChatId || null;
  }, [activeChatId]);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const fetchAll = async () => {
    const [u, c, unread, meRes] = await Promise.all([
      http.get("/users"),
      http.get("/chats"),
      http.get("/messages/unread-counts"),
      http.get("/users/me")
    ]);

    setUsers(u.data);
    setChats(c.data);
    setUnreadCounts(unread.data);
    setMe(meRes.data);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = createSocket();
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("user_connected", { userId: me._id });
    });

    s.on("presence_update", (payload) => {
      setUsers((prev) =>
        prev.map((u) => (String(u._id) === String(payload.userId) ? { ...u, ...payload } : u))
      );
      setChats((prev) =>
        prev.map((c) => ({
          ...c,
          members: c.members?.map((m) =>
            String(m._id) === String(payload.userId) ? { ...m, ...payload } : m
          )
        }))
      );
    });

    s.on("receive_message", (msg) => {
      const currentChatId = activeChatIdRef.current;
      if (String(msg.chatId) === String(currentChatId)) {
        setMessages((prev) => {
          // Remove any matching optimistic (temp) message from this sender with same text,
          // then append the real server message to avoid duplication
          const withoutOptimistic = prev.filter(
            (m) =>
              !(
                m._id?.toString().startsWith("temp-") &&
                String(m.sender?._id) === String(msg.sender?._id) &&
                m.text === msg.text
              )
          );
          // Don't add if already exists (by real _id)
          if (withoutOptimistic.some((m) => String(m._id) === String(msg._id))) {
            return withoutOptimistic;
          }
          return [...withoutOptimistic, msg];
        });
        http.post(`/messages/${currentChatId}/read`).then(() => {
          setUnreadCounts((p) => ({ ...p, [currentChatId]: 0 }));
        });
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.chatId]: (prev[msg.chatId] || 0) + 1
        }));
      }
    });

    s.on("typing", ({ chatId, userId }) => {
      if (String(chatId) !== String(activeChatIdRef.current)) return;
      const u = usersRef.current.find((x) => String(x._id) === String(userId));
      setTypingText(`${u?.username || "User"} is typing...`);
    });

    s.on("stop_typing", ({ chatId }) => {
      if (String(chatId) !== String(activeChatIdRef.current)) return;
      setTypingText("");
    });

    return () => s.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me._id]);

  const openChat = async (chat) => {
    setActiveChat(chat);
    setTypingText("");

    socketRef.current?.emit("join_chat", { chatId: chat._id });

    const res = await http.get(`/messages/${chat._id}`);
    setMessages(res.data);

    await http.post(`/messages/${chat._id}/read`);
    setUnreadCounts((p) => ({ ...p, [chat._id]: 0 }));
  };

  const openDirect = async (user) => {
    const res = await http.post("/chats/direct", { otherUserId: user._id });
    const c = await http.get("/chats");
    setChats(c.data);
    await openChat(res.data);
  };

  const sendMessage = (text) => {
    if (!activeChatId) return;
    // Optimistic UI: show instantly for the sender
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      chatId: activeChatId,
      text,
      createdAt: new Date().toISOString(),
      sender: { _id: me._id, username: me.username, avatarUrl: me.avatarUrl }
    };
    setMessages((prev) => [...prev, optimistic]);

    socketRef.current?.emit("send_message", { chatId: activeChatId, senderId: me._id, text });
  };

  const typingStart = () => {
    if (!activeChatId) return;
    socketRef.current?.emit("typing", { chatId: activeChatId, userId: me._id });
  };

  const typingStop = () => {
    if (!activeChatId) return;
    socketRef.current?.emit("stop_typing", { chatId: activeChatId, userId: me._id });
  };

  const createGroup = async ({ name, memberIds }) => {
    await http.post("/chats/group", { name, memberIds });
    setGroupOpen(false);
    const c = await http.get("/chats");
    setChats(c.data);
  };

  const mySelectableUsers = useMemo(
    () => users.filter((u) => String(u._id) !== String(me._id)),
    [users, me._id]
  );

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          me={me}
          users={users}
          chats={chats}
          unreadCounts={unreadCounts}
          activeChatId={activeChatId}
          onOpenDirect={openDirect}
          onOpenChat={openChat}
          onOpenGroupModal={() => setGroupOpen(true)}
        />
        <ChatWindow
          me={me}
          activeChat={activeChat}
          messages={messages}
          onSend={sendMessage}
          typingText={typingText}
          onTypingStart={typingStart}
          onTypingStop={typingStop}
        />
      </div>

      <GroupModal
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        users={mySelectableUsers}
        onCreate={createGroup}
      />
    </div>
  );
}
