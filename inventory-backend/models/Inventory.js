const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  name: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  expiry_date: {
    type: Date,
    required: [true, 'Please add an expiry date']
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model('Inventory', inventorySchema);
