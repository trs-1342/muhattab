import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { v4 as uuidv4 } from "uuid";

// Bloklanan kullanıcı adlarını KV'ye manuel eklemen gerekir. Örneğin: blocked:username1, blocked:username2

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: "Tüm alanlar zorunlu",
      });
    }

    // Username kuralları
    const usernameRegex = /^[a-zA-Z0-9._]{3,13}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        success: false,
        message:
          "Kullanıcı adı 3-13 karakter arasında olmalı ve sadece boşluk olmadan ingilizce harf, rakam, . veya _ içerebilir.",
      });
    }

    // Engellenmiş kullanıcı adı kontrolü
    const isBlocked = await kv.get(`blocked:${username.toLowerCase()}`);
    if (isBlocked) {
      return NextResponse.json({
        success: false,
        message: "Bu kullanıcı adı kullanılamaz.",
      });
    }

    // Kullanıcı var mı kontrolü
    const existingUser = await kv.get(`user:${username.toLowerCase()}`);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Kullanıcı adı zaten var",
      });
    }

    // Yeni kullanıcı oluştur
    const newUser = {
      id: uuidv4(),
      username,
      password,
      createTime: new Date().toISOString(),
    };

    await kv.set(`user:${username.toLowerCase()}`, newUser);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}
