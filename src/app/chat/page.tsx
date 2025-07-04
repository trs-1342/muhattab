"use client";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-server-1a4z.onrender.com");

export default function ChatPage() {
  type Message = {
    messageID: string;
    time: string;
    username: string;
    mesaj: string;
  };

  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastSentTime, setLastSentTime] = useState<number>(0);

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
    const now = Date.now();

    // 3 saniye (3000 ms) dolmadıysa engelle
    if (now - lastSentTime < 3000) {
      alert("3 saniyede sadece 1 mesaj gönderebilirsin.");
      return;
    }

    if (!message.trim()) return;

    socket.emit("newMessage", { username, mesaj: message });
    setMessage("");
    setLastSentTime(now);
  };

  const handleLogout = () => {
    document.cookie = "token=; max-age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      {/* Üst bar */}
      <div className="flex justify-between items-center p-4 border-b border-white">
        <h2 className="text-xl sm:text-2xl">Sohbet</h2>
        <button
          onClick={handleLogout}
          className="text-red-400 hover:underline text-sm sm:text-base"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Mesajlar alanı */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="bg-white text-black px-3 py-1 rounded max-w-full sm:max-w-xl break-words"
          >
            <span className="text-gray-700 font-bold">{msg.username}</span>{" "}
            <span className="text-xs text-gray-500">- {msg.time} #</span>{" "}
            <span className="text-sm">{msg.mesaj}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Alt input alanı */}
      <div className="p-4 border-t border-white flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Mesaj yaz..."
          className="w-full p-2 bg-black border border-white rounded text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-white text-black px-4 py-2 hover:bg-gray-200 rounded text-sm"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
