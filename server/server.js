import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './connection.js';
import authRoutes from './routes/auth.js';
import viewRoutes from './routes/view.js';
import conversationRoutes from './routes/conversation.js';
import messagingRoutes from './routes/messaging.js';

import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});
app.use('/auth', authRoutes);
app.use('/listings', viewRoutes);
app.use('/conversations', conversationRoutes);
app.use('/messages', messagingRoutes);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
