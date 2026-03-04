import express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "../middleware/auth.js";
import Message from "../models/messages.js";
import Conversation from "../models/conversations.js";

const router = express.Router();



///// Send a message /////

router.post("/:conversationId", authenticateToken, async(req, res)=> {

    try {

        const {content} = req.body;
        const conversationId = req.params.conversationId;

        //Get sender from middleware (JWT)
        const sender = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({"message": "Invalid Conversation Id"})
        }

        const newMessage = new Message({
            conversation: conversationId,
            sender,
            content,
        })

        const savedMessage = await newMessage.save()


        //Update Conversation's Last Message
        const current_time = Date.now()

        await Conversation.findByIdAndUpdate(conversationId, 
            {$set: {lastMessage: newMessage, lastMessageAt: current_time }},
            {new: true, runValidators: true},
        );

        res.status(201).json(savedMessage)

    }
    
    catch(err){
        res.status(500).json({message: err.message});
    }

});


///// Get all messages in a converation /////

router.get("/:conversationId", async(req, res) => {

    try {

        const conversationId = req.params.conversationId;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({"message": "Invalid Conversation Id"})
        }

        //sort by converation
        const messages = await Message.find({conversation: conversationId}).sort({createdAt: -1});

        res.status(200).json(messages);
    }

    catch(err) {
        res.status(500).json({message: err.message});
    }
});


///// Delete Message /////

router.delete("/:messageId", authenticateToken, async(req,res) =>{

    try {
        const messageId = req.params.messageId;

        const user = req.user._id;

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: "Invalid message ID" });
        }
        const message = await Message.findById(messageId);
        
        // ID doesnt match a message
        if (!message){
            return (res.status(404).json({message: "Message not found"}));
        }

        // can't delete someone else's message
        if (message.sender.toString() != user.toString()) {
            return (res.status(403).json({message: "Permission denied"}));
        }

        await message.deleteOne();

        res.json({message: "Message deleted successfully"});
    }

    catch(err){
        res.status(500).json({message: err.message});
    }
});



