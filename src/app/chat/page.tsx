"use client";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-server-1a4z.onrender.com");

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((c) => c.split("="))
    );
    if (!cookies.token) {
      window.location.href = "/login";
    }

    const name = localStorage.getItem("username");
    if (name) setUsername(name);

    socket.on("chatHistory", (data) => {
      setMessages(data);
    });

    socket.on("messageBroadcast", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit("newMessage", { username, mesaj: message });
    setMessage("");
  };

  const handleLogout = () => {
    document.cookie = "token=; max-age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <div className="flex justify-between p-4 border-b border-white">
        <h2 className="text-xl">Sohbet</h2>
        <button onClick={handleLogout} className="text-red-400 hover:underline">
          Çıkış Yap
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2" id="messages-panel">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="bg-white text-black px-3 py-1 rounded max-w break-words"
          >
            <span className="text-gray-700 font-bold">{msg.username}</span>{" "}
            <span className="text-xs text-gray-500">- {msg.time} #</span>{" "}
            <span>{msg.mesaj}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-1 p-2 bg-black border border-white"
        />
        <button
          onClick={handleSend}
          className="bg-white text-black px-4 py-2 hover:bg-gray-200"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
