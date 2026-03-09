import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.js";
import Listing from "../models/listings.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


///// Create Listing /////

router.post("/", authenticateToken, upload.array("images", 5), async (req, res) => {
    try {
        const { title, description, price, condition } = req.body;
        const seller = req.user._id;
        const files = req.files || [];

        // Empty title, description, price, or condition fields
        if (!title || !description || !price || !condition) {
            return res.status(400).json({ message: "All fields required" });
        }
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ message: "Price cannot be negative." });
        }

        // Upload images to Cloudinary
        const imageUrls = [];
        for (const file of files) {
            const b64 = file.buffer.toString("base64");
            const dataUri = `data:${file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataUri, {
                folder: "bruin-bazaar",
            });
            imageUrls.push(result.secure_url);
        }

        const newListing = new Listing({
            title,
            description,
            price: parsedPrice,
            condition,
            seller,
            images: imageUrls,
        });
        const savedListing = await newListing.save();
        res.status(201).json(savedListing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

///// Get all Listings /////

router.get("/", async(req, res) => {
    try{
        const listings = await Listing.find()
            .populate("seller", "username email")
            .sort({createdAt: -1});
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
        const listings = await Listing.find({seller: seller})
            .populate("seller", "username email")
            .sort({createdAt: -1});
        res.json(listings)
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});


///// Delete Listing /////

//id comes from url, so has to be included in url sent by frontend
router.delete("/:listingId", authenticateToken, async(req,res) =>{

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

        res.json({message: "Listing deleted successfully"});
    }

    catch(err){
        res.status(500).json({message: err.message});
    }
});


///// Edit Listing /////

//Also requires id from url
router.patch("/:listingId", authenticateToken, async(req, res) => {
    
    try {
        const id = req.params.listingId
        const userId = req.user._id

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

         const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Auth check
        if (listing.seller.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Only extract the fields users are allowed to change
        const { title, description, price, condition } = req.body;

        //Only assigns provided fields
        Object.assign(listing, {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price }),
            ...(condition !== undefined && { condition }),
        });
        await listing.save();


        return res.status(200).json({message: "Listing updated"});
    }

    catch(err) {
        return res.status(500).json({message: err.message});
    }
});


//// Like /////

router.post("/:listingId/like", authenticateToken, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.listingId);
        const userId = req.user._id;

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Check if already liked
        if (listing.likes.includes(userId)) {
            return res.status(400).json({ message: "Already liked" });
        }

        listing.likes.push(userId);
        await listing.save();

        return res.status(200).json({ likes: listing.likes.length });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


///// unlike /////

router.delete("/:listingId/like", authenticateToken, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.listingId);
        const userId = req.user._id;

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Check if already liked
        if (!listing.likes.includes(userId)) {
            return res.status(400).json({ message: "Not yet liked" });
        }

        listing.likes.pull(userId);
        await listing.save();

        return res.status(200).json({ likes: listing.likes.length });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


///// Get Single Listing /////

router.get("/:listingId", async (req, res) => {
    try {
        const id = req.params.listingId;

        // Invalid ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

        const listing = await Listing.findById(id).populate("seller", "username email");

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        return res.status(200).json(listing);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;