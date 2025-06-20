import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const usersPath = path.join(process.cwd(), "data/users.json");
const blockedPath = path.join(process.cwd(), "data/blockusername.json");

export async function POST(req: Request) {
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

  // Engellenen kullanıcı adları kontrolü
  const blockedList = fs.existsSync(blockedPath)
    ? JSON.parse(fs.readFileSync(blockedPath, "utf-8"))
    : [];

  if (blockedList.includes(username.toLowerCase())) {
    return NextResponse.json({
      success: false,
      message: "Bu kullanıcı adı kullanılamaz.",
    });
  }

  // Var olan kullanıcılar kontrolü
  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, "utf-8"))
    : [];

  type User = {
    id: string;
    username: string;
    password: string;
    createTime: string;
  };

  const exists = (users as User[]).find((u) => u.username === username);
  if (exists) {
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

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  return NextResponse.json({ success: true });
}
