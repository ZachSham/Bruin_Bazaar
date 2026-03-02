import express from "express";
import mongoose from "mongoose";
import Conversation from "../models/conversations.js";

const router = express.Router();

// GET /conversations/user/:userId
router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user._id;
  
      const conversations = await Conversation
        .find({ participants: userId })
        .sort({ updatedAt: -1 });
  
      return res.status(200).json(conversations);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

  router.post("/:listingId", authMiddleware, async (req, res) => {
    const { listingId } = req.params;      // listingId from the URL
    const userId = req.user._id;           // from authMiddleware
  
    const newConversation = new Conversation({
      listing: listingId,
      participants: userId,
    });
  
    // save and respond...
  });

export default router;