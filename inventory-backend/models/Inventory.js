const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Ensure user ownership
});

module.exports = mongoose.model("Inventory", InventorySchema);