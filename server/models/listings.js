import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({

    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    datePosted: {type: Date, required: true},
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
    
});

