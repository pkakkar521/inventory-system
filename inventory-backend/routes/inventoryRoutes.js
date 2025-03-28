const express = require("express");
const connectToUserDB = require("../middleware/dbConnection");
const authMiddleware = require("../middleware/authMiddleware");
const InventorySchema = require("../models/Inventory");

const router = express.Router();

// CREATE Inventory Item
router.post("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.Inventory.model("Inventory", InventorySchema);
        const { name, quantity, price, description, expiry_date } = req.body;
        
        if (!name || !quantity || !price || !expiry_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newItem = new Inventory({ 
            name, 
            quantity, 
            price, 
            description, 
            expiry_date,
            userId: req.user.id 
        });

        await newItem.save();
        res.status(201).json({
            message: "Item added successfully",
            item: newItem  // Returning response in Flask-like format
        });

    } catch (error) {
        console.error("Error creating inventory item:", error);
        res.status(500).json({ message: "Error creating inventory item" });
    }
});

// READ Inventory Items (Sorted by Expiry Date)
router.get("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.Inventory.model("Inventory", InventorySchema);
        const items = await Inventory.find({ userId: req.user.id }) 
                                    .sort({ expiry_date: 1 }); // Sorting in ascending order

        res.status(200).json({ 
            message: "Items fetched successfully",
            items: items // Keeping response structure consistent with Flask API
        });

    } catch (error) {
        console.error("Error fetching inventory items:", error);
        res.status(500).json({ message: "Error fetching inventory items" });
    }
});

// UPDATE Inventory Item
router.put("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.Inventory.model("Inventory", InventorySchema);
        const { name, quantity, price, description, expiry_date } = req.body;

        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, 
            { name, quantity, price, description, expiry_date }, 
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: "Item not found or unauthorized" });

        res.status(200).json({
            message: "Item updated successfully",
            item: updatedItem
        });

    } catch (error) {
        console.error("Error updating inventory item:", error);
        res.status(500).json({ message: "Error updating inventory item" });
    }
});

// DELETE Inventory Item
router.delete("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.Inventory.model("Inventory", InventorySchema);
        const deletedItem = await Inventory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!deletedItem) return res.status(404).json({ message: "Item not found or unauthorized" });

        res.status(200).json({ message: "Item deleted successfully" });

    } catch (error) {
        console.error("Error deleting inventory item:", error);
        res.status(500).json({ message: "Error deleting inventory item" });
    }
});

module.exports = router;
