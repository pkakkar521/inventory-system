// Inventory routes: Handles inventory-related operations per authenticated user
const express = require("express");
const { connectToUserDB } = require("../middleware/dbConnection");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/inventory
// @desc    Add a new inventory item to the user's personal DB
router.post("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) {
             console.error("Inventory model not attached to request in POST /");
             return res.status(500).json({ message: "Database context not available" });
        }

        const Inventory = req.Inventory;
        const { name, quantity, price, expiry_date } = req.body;

        if (!name || !quantity || !price || !expiry_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log('User object in route handler:', req.user);

        const newItem = new Inventory({
            name,
            quantity,
            price,
            expiry_date,
            user: req.user.id
        });

        await newItem.save();
        res.status(201).json({
            message: "Item added successfully",
            item: newItem
        });

    } catch (error) {
        console.error("Detailed error creating inventory item:", error);
        res.status(500).json({ message: "Error saving inventory item to database" });
    }
});

// @route   GET /api/inventory
// @desc    Fetch all inventory items belonging to the logged-in user
router.get("/", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) {
             console.error("Inventory model not attached to request in GET /");
             return res.status(500).json({ message: "Database context not available" });
        }

        const Inventory = req.Inventory;
        const items = await Inventory.find({ user: req.user.id })
                                    .sort({ expiry_date: 1 });

        res.status(200).json({
            message: "Items fetched successfully",
            items: items
        });

    } catch (error) {
        console.error("Error fetching inventory items:", error);
        res.status(500).json({ message: "Error fetching inventory items" });
    }
});

// @route   GET /api/inventory/:id
// @desc    Fetch a specific inventory item for the authenticated user
router.get("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) {
             console.error("Inventory model not attached to request in GET /:id");
             return res.status(500).json({ message: "Database context not available" });
        }

        const Inventory = req.Inventory;
        const item = await Inventory.findOne({ _id: req.params.id, user: req.user.id });

        if (!item) {
            return res.status(404).json({ message: "Item not found or unauthorized" });
        }

        res.status(200).json(item);

    } catch (error) {
        console.error(`Error fetching inventory item ${req.params.id}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid item ID format" });
        }
        console.error(`Unhandled error fetching item ${req.params.id}:`, error);
        res.status(500).json({ message: "Error fetching inventory item" });
    }
});

// @route   PUT /api/inventory/:id
// @desc    Update a specific inventory item for the user
router.put("/:id", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        if (!req.Inventory) {
             console.error("Inventory model not attached to request in PUT /:id");
             return res.status(500).json({ message: "Database context not available" });
        }

        const Inventory = req.Inventory;
        const { name, quantity, price, expiry_date } = req.body;

        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name, quantity, price, expiry_date },
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

// @route   PUT /api/inventory/:id/reduce
// @desc    Reduce quantity of a specific item (e.g., after sale/usage)
router.put("/:id/reduce", authMiddleware, connectToUserDB, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!req.Inventory) {
            return res.status(500).json({ message: "Database not connected." });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const Inventory = req.Inventory;

        const item = await Inventory.findOne({ _id: id, user: req.user.id });

        if (!item) {
            return res.status(404).json({ message: "Item not found." });
        }

        if (item.quantity < quantity) {
            return res.status(400).json({ message: "Not enough quantity available." });
        }

        item.quantity -= quantity;
        await item.save();

        return res.status(200).json({ message: "Item quantity reduced successfully.", item });

    } catch (error) {
        console.error("Error reducing item quantity:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
