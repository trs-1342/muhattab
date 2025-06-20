const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const messagesPath = path.join(__dirname, "data/messages.json");

// Her client bağlandığında
io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlı:", socket.id);

  // İlk girişte eski mesajları gönder
  if (fs.existsSync(messagesPath)) {
    const previousMessages = JSON.parse(fs.readFileSync(messagesPath, "utf-8"));
    socket.emit("chatHistory", previousMessages);
  }

  // Yeni mesaj geldiğinde
  socket.on("newMessage", (data) => {
    const messages = fs.existsSync(messagesPath)
      ? JSON.parse(fs.readFileSync(messagesPath, "utf-8"))
      : [];

    const now = new Date();
    const formattedTime = now.toLocaleTimeString("tr-TR", { hour12: false });
    const messageData = {
      messageID: `${socket.id}-${now.getTime()}`,
      time: formattedTime,
      username: data.username,
      mesaj: data.mesaj,
    };

    messages.push(messageData);
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
    io.emit("messageBroadcast", messageData); // herkese yay
  });

  // Yazıyor bilgisi
  socket.on("typing", (username) => {
    socket.broadcast.emit("userTyping", username);
  });
});

httpServer.listen(3001, () => {
  console.log("Socket.IO sunucusu çalışıyor: http://localhost:3001");
});
