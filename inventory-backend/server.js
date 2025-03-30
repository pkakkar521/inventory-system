const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const { closeAllTenantConnections } = require("./middleware/dbConnection");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to Central Database"))
    .catch((err) => console.log("Central DB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        console.log("HTTP server closed.");

        await closeAllTenantConnections();

        try {
            await mongoose.disconnect();
            console.log("Central MongoDB connection closed.");
        } catch (err) {
            console.error("Error closing central MongoDB connection:", err);
        }

        console.log("Shutdown complete. Exiting.");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("Graceful shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
