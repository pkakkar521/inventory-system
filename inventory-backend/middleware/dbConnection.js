const mongoose = require("mongoose");
const User = require("../models/User"); // Import User model
const InventorySchema = require("../models/Inventory");

const connections = {}; // Store database connections

const connectToUserDB = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized - No user ID" });
        }

        // Fetch user from central database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const userDbUri = user.mongoDBUri;

        // If not already connected, establish a new connection
        if (!connections[userDbUri]) {
            console.log("⚠️ Disconnecting from Central Database...");
            await mongoose.disconnect(); // Disconnect from central DB

            console.log(`🔗 Connecting to User Database: ${userDbUri}`);
            const conn = await mongoose.createConnection(userDbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            connections[userDbUri] = conn.model("Inventory", InventorySchema);
            console.log(`✅ Successfully connected to User Database: ${userDbUri}`);
        }

        req.Inventory = connections[userDbUri]; // Attach Inventory model to request
        next();
    } catch (error) {
        console.error("❌ Database Connection Error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
};

module.exports = connectToUserDB;
