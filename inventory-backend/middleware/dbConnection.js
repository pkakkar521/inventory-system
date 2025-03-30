const mongoose = require("mongoose");
const User = require("../models/User");
const InventorySchema = require("../models/Inventory").schema;

const tenantConnections = {};

const closeAllTenantConnections = async () => {
    console.log("🔌 Closing all tenant database connections...");
    const promises = Object.keys(tenantConnections).map(async (userId) => {
        try {
            await tenantConnections[userId].close();
            console.log(`   Closed connection for user ${userId}`);
            delete tenantConnections[userId];
        } catch (err) {
            console.error(`   Error closing connection for user ${userId}: ${err}`);
        }
    });
    await Promise.all(promises);
    console.log("✅ All tenant connections closed.");
};

process.on('SIGINT', async () => {
    console.log("SIGINT received. Closing connections...");
    await closeAllTenantConnections();
    await mongoose.disconnect();
    console.log("Central DB connection closed. Exiting.");
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log("SIGTERM received. Closing connections...");
    await closeAllTenantConnections();
    await mongoose.disconnect();
    console.log("Central DB connection closed. Exiting.");
    process.exit(0);
});


const connectToUserDB = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized - User ID missing" });
        }

        const userId = req.user.id;

        if (tenantConnections[userId] && tenantConnections[userId].readyState === 1) {
            if (!tenantConnections[userId].models.Inventory) {
                 tenantConnections[userId].model("Inventory", InventorySchema);
            }
            req.Inventory = tenantConnections[userId].model("Inventory");
            return next();
        }

        let user;
        try {
             user = await User.findById(userId).lean();
        } catch (centralDbError) {
             console.error(`❌ Error fetching user ${userId} from central DB:`, centralDbError);
             return res.status(500).json({ message: "Error accessing user directory" });
        }

        if (!user) {
            return res.status(401).json({ message: "User associated with token not found" });
        }

        if (!user.mongoDBUri) {
             console.error(`❌ Missing mongoDBUri for user ${userId}`);
             return res.status(500).json({ message: "User database configuration missing" });
        }

        const userDbUri = user.mongoDBUri;

        if (tenantConnections[userId]) {
            console.log(`🧹 Cleaning up stale connection reference for user ${userId}`);
            await tenantConnections[userId].close().catch(err => console.error(`Error closing stale connection for ${userId}: ${err}`));
            delete tenantConnections[userId];
        }

        console.log(`🔗 Creating new connection to User Database for user ${userId}: ${userDbUri.substring(0, userDbUri.indexOf('@'))}...`);
        try {
            const tenantConn = await mongoose.createConnection(userDbUri, {
                serverSelectionTimeoutMS: 5000
            }).asPromise();

            console.log(`✅ Successfully connected to User Database for user ${userId}`);

            tenantConnections[userId] = tenantConn;

            tenantConn.model("Inventory", InventorySchema);
            req.Inventory = tenantConn.model("Inventory");

            tenantConn.on('error', (err) => {
                console.error(`❌ MongoDB connection error for user ${userId} (${userDbUri.substring(0, userDbUri.indexOf('@'))}...): ${err}`);
                if (tenantConnections[userId]) {
                    tenantConnections[userId].close().catch(closeErr => console.error(`Error closing connection for ${userId} after error: ${closeErr}`));
                    delete tenantConnections[userId];
                }
            });
            tenantConn.on('disconnected', () => {
                console.log(`🔌 Disconnected from User Database for user ${userId}: ${userDbUri.substring(0, userDbUri.indexOf('@'))}...`);
                delete tenantConnections[userId];
            });

            next();

        } catch (connectionError) {
            console.error(`❌ Failed to connect to User Database for user ${userId} (${userDbUri.substring(0, userDbUri.indexOf('@'))}...):`, connectionError);
            delete tenantConnections[userId];
            return res.status(503).json({ message: "Tenant database unavailable" });
        }

    } catch (error) {
        console.error("❌ Unexpected Error in connectToUserDB Middleware:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { connectToUserDB, closeAllTenantConnections };
