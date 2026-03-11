import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { connectDB } from './connection.js';
import authRoutes from './routes/auth.js';
import viewRoutes from './routes/view.js';
import conversationRoutes from './routes/conversation.js';
import messagingRoutes from './routes/messaging.js';

import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: CLIENT_ORIGIN,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});
app.use('/auth', authRoutes);
app.use('/listings', viewRoutes);
app.use('/conversations', conversationRoutes);
app.use('/messages', messagingRoutes);


connectDB().then(() => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId?.toString();
    if (userId) socket.join(`user:${userId}`);

    socket.on("conversation:join", (conversationId) => {
      if (typeof conversationId === "string" && conversationId) {
        socket.join(`conv:${conversationId}`);
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      if (typeof conversationId === "string" && conversationId) {
        socket.leave(`conv:${conversationId}`);
      }
    });
  });

  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
