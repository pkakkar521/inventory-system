const express = require("express");
const connectToUserDB = require("../middleware/dbConnection");
const authMiddleware = require("../middleware/authMiddleware");
const InventorySchema = require("../models/Inventory");

const router = express.Router();

// CREATE Inventory Item
router.post("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.db) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.db.model("Inventory", InventorySchema);
        const { name, quantity, price, description } = req.body;
        
        const newItem = new Inventory({ name, quantity, price, description, userId: req.user.id });
        await newItem.save();
        
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error creating inventory item:", error);
        res.status(500).json({ message: "Error creating inventory item" });
    }
});

// READ Inventory Items
router.get("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.db) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.db.model("Inventory", InventorySchema);
        const items = await Inventory.find({ userId: req.user.id }); // Only fetch user's items
        
        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        res.status(500).json({ message: "Error fetching inventory items" });
    }
});

// UPDATE Inventory Item
router.put("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.db) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.db.model("Inventory", InventorySchema);
        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // Ensure user owns the item
            req.body,
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: "Item not found or unauthorized" });

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error("Error updating inventory item:", error);
        res.status(500).json({ message: "Error updating inventory item" });
    }
});

// DELETE Inventory Item
router.delete("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.db) return res.status(500).json({ message: "Database connection error" });

        const Inventory = req.db.model("Inventory", InventorySchema);
        const deletedItem = await Inventory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!deletedItem) return res.status(404).json({ message: "Item not found or unauthorized" });

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting inventory item:", error);
        res.status(500).json({ message: "Error deleting inventory item" });
    }
});

module.exports = router;
