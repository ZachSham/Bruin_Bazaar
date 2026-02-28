import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
}, { timestamps: true })


const Conversation = mongoose.model('Converation', conversationSchema);
export default Conversation;

