const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const { closeAllTenantConnections } = require("./middleware/dbConnection");
const cors = require("cors");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Connect to the central MongoDB database (used for authentication)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to Central Database"))
    .catch((err) => console.log("Central DB Connection Error:", err));

// Define routes for authentication and inventory
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

// Define the port and start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown logic to clean up resources on termination signals
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Close the HTTP server
    server.close(async () => {
        console.log("HTTP server closed.");

        // Close all tenant-specific MongoDB connections
        await closeAllTenantConnections();

        try {
            // Disconnect from central MongoDB
            await mongoose.disconnect();
            console.log("Central MongoDB connection closed.");
        } catch (err) {
            console.error("Error closing central MongoDB connection:", err);
        }

        console.log("Shutdown complete. Exiting.");
        process.exit(0);
    });

    // Fallback: force exit if cleanup takes too long
    setTimeout(() => {
        console.error("Graceful shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 10000);
};

// Listen for termination signals to trigger graceful shutdown
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
