const mongoose = require("mongoose");
const InventorySchema = require("../models/Inventory");

const connections = {}; // Store database connections

const connectToUserDB = async (req, res, next) => {
    try {
        if (!req.user || !req.user.mongoDBUri) {
            return res.status(401).json({ message: "Unauthorized - No database URI" });
        }

        const userDbUri = req.user.mongoDBUri;
        if (!connections[userDbUri]) {
            const conn = await mongoose.createConnection(userDbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            connections[userDbUri] = conn.model("Inventory", InventorySchema);
        }

        req.Inventory = connections[userDbUri]; // Attach model to request
        next();
    } catch (error) {
        console.error("Database Connection Error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
};

module.exports = connectToUserDB;
