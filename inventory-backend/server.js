const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

dotenv.config();
const app = express();
app.use(express.json());

// Connect to Central User Database
mongoose.connect(process.env.CENTRAL_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to Central Database"))
    .catch((err) => console.log("Central DB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes); // Add inventory routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
