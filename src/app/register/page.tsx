"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = "/login";
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white font-mono">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 border border-white rounded-xl shadow-lg">
        <h1 className="text-2xl mb-4 text-center">Kayıt Ol</h1>

        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 text-sm bg-black border border-white rounded"
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 text-sm bg-black border border-white rounded"
        />

        <button
          onClick={handleRegister}
          className="w-full p-2 bg-white text-black hover:bg-gray-200 transition rounded"
        >
          Kayıt Ol
        </button>

        {message && <p className="mt-4 text-red-500 text-sm">{message}</p>}

        <p className="mt-4 text-sm text-center">
          Zaten hesabın var mı?{" "}
          <a href="/login" className="underline text-blue-400">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
}
