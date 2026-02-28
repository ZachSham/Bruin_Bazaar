import express from "express";
import Listing from "../models/listings.js";
import mongoose from "mongoose";

const router = express.Router();


///// Create Listing /////

router.post("/", authMiddleware, async(req, res)=> {
    try{
        const {title, description, price} = req.body;
        const seller = req.user._id;

    //Empty title, description, or price fields
        if (!title || !description || !price) {
            return res.status(400).json({ message: "All fields required" });
        }
    // Negative Price
        if (price < 0){
            return res.status(400).json({message: "Price cannot be negative."});
        }
    //Create new Listing Object
        const newListing = new Listing({
            title,
            description,
            price,
            seller,
        });
    //Save Listing object to DB
        const savedListing = await newListing.save();
        res.status(201).json(savedListing);
    }

    catch(err){
        res.status(500).json({"message": err.message})
    }

});

///// Get all Listings /////

router.get("/", async(req, res) => {
    try{
        const listings = await Listing.find().sort({createdAt: -1});
        res.json(listings)
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});


///// Get specific user's listings /////
router.get("/seller/:sellerId", async(req, res) => {
    try{
        const seller = req.params.sellerId;
        const listings = await Listing.find({seller: seller}).sort({createdAt: -1});
        res.json(listings)
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});


///// Delete Listing /////

//id comes from url, so has to be included in url sent by frontend
router.delete("/:listingId", authMiddleware, async(req,res) =>{

    try {
        const id = req.params.listingId;
        const userId = req.user._id;

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }
        const listing = await Listing.findById(id);
        
        // ID doesnt match a Listing
        if (!listing){
            return (res.status(404).json({message: "Listing not found"}));
        }

        // Can't Delete someone else's listing

        if (listing.seller.toString() != userId.toString()){
            return (res.status(403).json({message: "Permission Denied"}));
        }

        await listing.deleteOne();

        res.json({message: "Listed deleted successfully"});
    }

    catch(err){
        res.status(500).json({message: err.message});
    }
});


///// Edit Listing /////

//Also requires id from url
router.patch("/:listingId", async(req, res) => {
    
    try {
        const id = req.params.listingId

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

        // Searches for listing, updates with request body if found
        await Listing.findByIdAndUpdate(id, 
            {$set: req.body},
            {new: true, runValidators: true},
        );

        return res.status(200).json({message: "Listing updated"});
    }

    catch(err) {
        return res.status(500).json({message: err.message});
    }
});