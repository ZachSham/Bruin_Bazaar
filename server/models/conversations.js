import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: false, default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
}, { timestamps: true })


// Keep the original collection name ("converations") to preserve any existing data
// created before the model name typo was fixed.
const Conversation = mongoose.model('Conversation', conversationSchema, 'converations');
export default Conversation;

