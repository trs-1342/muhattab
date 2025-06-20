import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const usersPath = path.join(process.cwd(), "data/users.json");

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({
      success: false,
      message: "Tüm alanlar zorunlu",
    });
  }

  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, "utf-8"))
    : [];

  type User = {
    id: string;
    username: string;
    password: string;
    createTime: string;
  };

  const user = (users as User[]).find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return NextResponse.json({ success: false, message: "Geçersiz bilgiler" });
  }

  // Basit token üretimi (gerçek projede JWT önerilir)
  const token = crypto.randomBytes(16).toString("hex");

  return NextResponse.json({ success: true, token });
}
