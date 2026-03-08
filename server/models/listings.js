import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({

    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    
    {timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;

