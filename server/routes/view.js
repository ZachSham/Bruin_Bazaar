import express from "express";
import Listing from "../models/listings.js";
import mongoose from "mongoose";

const router = express.Router();


///// Create Listing /////

router.post("/", async(req, res)=> {
    try{
        const {title, description, price} = req.body;

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


///// Delete Listing /////

//id comes from url, so has to be included in url sent by frontend
router.delete("/:id", async(req,res) =>{

    try {
        const id = req.params.id;

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }
        const listing = await Listing.findById(id);
        
        // ID doesnt match a Listing
        if (!listing){
            return (res.status(404).json({message: "Listing not found"}));
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
router.patch("/:id", async(req, res) => {
    
    try {
        const id = req.params.id

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