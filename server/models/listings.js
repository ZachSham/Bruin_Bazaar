import mongoose from 'mongoose';

const CONDITION_OPTIONS = ['Brand new', 'Like new', 'Used - excellent', 'Used - good', 'Used - fair'];

const listingSchema = new mongoose.Schema({

    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    condition: {type: String, enum: CONDITION_OPTIONS, required: true},
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    images: [{ type: String }],
    imagePublicIds: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sold: {type: Boolean, default: false},
    },
    
    {timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;

