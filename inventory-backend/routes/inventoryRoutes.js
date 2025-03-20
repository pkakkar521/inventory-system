const express = require("express");
const connectToUserDB = require("../middleware/dbConnection");
const authMiddleware = require("../middleware/authMiddleware"); // Auth middleware



const router = express.Router();

// CREATE Inventory Item
router.post("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        const { name, quantity, price, description } = req.body;
        const newItem = new req.Inventory({ name, quantity, price, description, userId: req.user.id });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Error creating inventory item" });
    }
});

// READ Inventory Items
router.get("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        const items = await req.Inventory.find({ userId: req.user.id });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inventory items" });
    }
});

// UPDATE Inventory Item
router.put("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        const updatedItem = await req.Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: "Error updating inventory item" });
    }
});

// DELETE Inventory Item
router.delete("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        await req.Inventory.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting inventory item" });
    }
});

module.exports = router;
