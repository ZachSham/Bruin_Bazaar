import express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "../middleware/auth.js";
import Conversation from "../models/conversations.js";
import Listing from "../models/listings.js";

const router = express.Router();

// GET /conversations/user/:userId
// route to get all conversations for a user
router.get("/", authenticateToken, async (req, res) => {
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

  // GET /conversations/:conversationId
  // route to get a specific conversation username
  router.get("/:conversationId", authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;
  
      // 1. Validate ID format
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
  
      // 2. Find the conversation and populate participants + listing if you want
      const conversation = await Conversation
        .findById(conversationId)
        .populate("participants", "username") 
      
        // find the other participant in the conversation
        const other = conversation.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        // return the username of the other participant
        const conversationUsername = other ? other.username : null;
        return res.status(200).json({ conversationUsername });
  

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

// POST /conversations/:listingId
// route to start a new conversation
  router.post("/:listingId", authenticateToken, async (req, res) => {
    const { listingId } = req.params;      // listingId from the URL
    const userId = req.user._id;           // from authenticateToken

    const listing = await Listing.findById(listingId);

    const sellerId = listing.seller;

    if (userId.toString() === sellerId.toString()) {
      return res.status(400).json({ message: "Cannot start a conversation with yourself" });
    }

    
    const newConversation = await Conversation.create({
      listing: listingId,
      participants: [userId, sellerId]
    });

    return res.status(201).json(newConversation);

  });

export default router;