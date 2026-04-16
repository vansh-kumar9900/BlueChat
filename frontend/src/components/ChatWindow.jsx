import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  me,
  activeChat,
  messages,
  onSend,
  typingText,
  onTypingStart,
  onTypingStop
}) {
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, activeChat?._id]);

  useEffect(() => {
    setText("");
  }, [activeChat?._id]);

  // Build a meaningful title — for DMs show the other person's username
  const title = useMemo(() => {
    if (!activeChat) return "Select a chat";
    if (activeChat.isGroup) return activeChat.name || "Group";
    const other = activeChat.members?.find(
      (m) => String(m._id) !== String(me._id)
    );
    return other?.username || "Direct Chat";
  }, [activeChat, me._id]);

  const handleChange = (v) => {
    setText(v);
    onTypingStart?.();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTypingStop?.(), 800);
  };

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    onTypingStop?.();
  };

  if (!activeChat) {
    return (
      <div className="flex-1 grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Open a chat or group to start messaging
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200 grid place-items-center font-semibold text-sm">
            {activeChat.isGroup ? "👥" : title[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
            {typingText ? (
              <div className="text-xs text-brand-600 dark:text-brand-300">{typingText}</div>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500">
                {activeChat.isGroup
                  ? `${activeChat.members?.length || 0} members`
                  : "Direct message"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-600 text-sm mt-8">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m._id}
              mine={String(m.sender?._id) === String(me._id)}
              msg={m}
              isGroup={Boolean(activeChat?.isGroup)}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? handleSend() : null)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
