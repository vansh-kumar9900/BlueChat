import React from "react";

export default function MessageBubble({ mine, msg, isGroup }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          mine
            ? "bg-brand-600 text-white rounded-br-md"
            : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-800"
        ].join(" ")}
      >
        {isGroup && !mine ? (
          <div className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 mb-1">
            {msg?.sender?.username || "Unknown"}
          </div>
        ) : null}
        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
        <div className={`mt-1 text-[11px] ${mine ? "text-brand-100/90" : "text-slate-500 dark:text-slate-400"}`}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

