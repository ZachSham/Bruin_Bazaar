import express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "../middleware/auth.js";
import Message from "../models/messages.js";
import Conversation from "../models/conversations.js";

const router = express.Router();

function emitConversationUpsert(req, { conversation, message, recipientId }) {
    const io = req.app.get("io");
    if (!io) return;

    const conversationId = conversation._id.toString();

    io.to(`conv:${conversationId}`).emit("message:new", {
        _id: message._id,
        conversation: conversationId,
        sender: message.sender,
        content: message.content,
        createdAt: message.createdAt,
    });

    const payload = {
        _id: conversationId,
        listing: conversation.listing,
        participants: conversation.participants,
        lastMessageText: conversation.lastMessageText,
        lastMessageAt: conversation.lastMessageAt,
        updatedAt: conversation.updatedAt,
    };

    io.to(`user:${message.sender.toString()}`).emit("conversation:upsert", payload);
    io.to(`user:${recipientId.toString()}`).emit("conversation:upsert", payload);
}

///// Send a message (upsert conversation; supports drafts) /////
router.post("/send", authenticateToken, async (req, res) => {
    try {
        const senderId = req.user._id;
        const { conversationId, recipientId, listingId, content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content is required" });
        }

        let conversation = null;
        let resolvedRecipientId = recipientId;

        if (conversationId) {
            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({ message: "Invalid conversation ID" });
            }

            conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            const isParticipant = conversation.participants.some(
                (p) => p.toString() === senderId.toString()
            );
            if (!isParticipant) {
                return res.status(403).json({ message: "Access denied" });
            }

            const other = conversation.participants.find(
                (p) => p.toString() !== senderId.toString()
            );
            resolvedRecipientId = other?.toString();
        } else {
            if (!resolvedRecipientId || !mongoose.Types.ObjectId.isValid(resolvedRecipientId)) {
                return res.status(400).json({ message: "Valid recipientId is required" });
            }
            if (senderId.toString() === resolvedRecipientId.toString()) {
                return res.status(400).json({ message: "Cannot message yourself" });
            }

            let listingObjectId = null;
            if (listingId !== undefined && listingId !== null && listingId !== "") {
                if (!mongoose.Types.ObjectId.isValid(listingId)) {
                    return res.status(400).json({ message: "Invalid listing ID" });
                }
                listingObjectId = new mongoose.Types.ObjectId(listingId);
            }

            conversation = await Conversation.findOne({
                participants: { $all: [senderId, resolvedRecipientId] },
                listing: listingObjectId,
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, resolvedRecipientId],
                    listing: listingObjectId,
                    lastMessageText: "",
                    lastMessageAt: null,
                });
            }
        }

        const message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            content: content.trim(),
        });

        const now = new Date();
        conversation.lastMessageText = message.content;
        conversation.lastMessageAt = now;
        await conversation.save();

        emitConversationUpsert(req, { conversation, message, recipientId: resolvedRecipientId });

        return res.status(201).json({ conversation, message });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

///// Send a message /////

router.post("/:conversationId", authenticateToken, async (req, res) => {

    try {

        const { content } = req.body;
        const conversationId = req.params.conversationId;

        //Get sender from middleware (JWT)
        const sender = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ "message": "Invalid Conversation Id" })
        }

        const trimmed = (content || "").trim();
        if (!trimmed) {
            return res.status(400).json({ message: "Message content is required" });
        }

        const newMessage = new Message({
            conversation: conversationId,
            sender,
            content: trimmed,
        })

        const savedMessage = await newMessage.save()


        //Update Conversation's Last Message
        const current_time = new Date()

        const updatedConversation = await Conversation.findByIdAndUpdate(conversationId,
            { $set: { lastMessageText: newMessage.content, lastMessageAt: current_time } },
            { new: true, runValidators: true },
        );

        // Emit realtime updates for clients that still use this legacy endpoint.
        if (updatedConversation) {
            const other = updatedConversation.participants.find(
                (p) => p.toString() !== sender.toString()
            );
            if (other) {
                emitConversationUpsert(req, {
                    conversation: updatedConversation,
                    message: savedMessage,
                    recipientId: other.toString(),
                });
            }
        }

        res.status(201).json(savedMessage)

    }

    catch (err) {
        res.status(500).json({ message: err.message });
    }

});


///// Get all messages in a converation /////

router.get("/:conversationId", authenticateToken, async (req, res) => {

    try {

        const conversationId = req.params.conversationId;

        const user = req.user._id;


        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ "message": "Invalid Conversation Id" })
        }

        //validate user
        const conversation = await Conversation.findById(conversationId).populate('participants');
        if (!conversation) {
            return res.status(404).json({ "message": "Conversation not Found" })
        }
        if (!conversation.participants.some(p => p._id.toString() === user.toString())) {
            return res.status(403).json({ "message": "Access Denied" })
        }


        // sort oldest -> newest for UI rendering
        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    }

    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


///// Delete Message /////

router.delete("/:messageId", authenticateToken, async (req, res) => {

    try {
        const messageId = req.params.messageId;

        const user = req.user._id;

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: "Invalid message ID" });
        }
        const message = await Message.findById(messageId);

        // ID doesnt match a message
        if (!message) {
            return (res.status(404).json({ message: "Message not found" }));
        }

        // can't delete someone else's message
        if (message.sender.toString() != user.toString()) {
            return (res.status(403).json({ message: "Permission denied" }));
        }

        await message.deleteOne();

        res.json({ message: "Message deleted successfully" });
    }

    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;