import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AuthContext from "../context/AuthContext";
import "../style/addItem.css";
import { faker } from "@faker-js/faker";

const AddItem = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !itemName ||
      !quantity ||
      isNaN(quantity) ||
      Number(quantity) < 0 ||
      !price ||
      isNaN(price) ||
      Number(price) < 0 ||
      !expiryDate
    ) {
      setError(
        "Please enter valid item name, quantity (non-negative), price (non-negative), and expiry date."
      );
      return;
    }
    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.post(
        `${API_BASE_URL}/api/inventory`,
        {
          name: itemName,
          quantity: Number(quantity),
          price: Number(price),
          expiry_date: expiryDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItemName("");
      setQuantity("");
      setPrice("");
      setExpiryDate("");
      setSuccess("Item added successfully!");
    } catch (err) {
      setError("Failed to add item. " + (err.response?.data?.message || err.message || "Please try again."));
      console.error("Error adding item:", err);
    }
  };

  const handleGenerateRandomItems = async () => {
    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const promises = [];

      for (let i = 0; i < 100; i++) {
        const randomItem = {
          name: faker.commerce.productName(),
          quantity: faker.number.int({ min: 1, max: 100 }),
          price: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
          expiry_date: faker.date.future().toISOString().split("T")[0],
        };

        promises.push(
          axios.post(`${API_BASE_URL}/api/inventory`, randomItem, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
      }

      await Promise.all(promises);
      setSuccess("100 random items added successfully!");
    } catch (err) {
      setError("Failed to add random items. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <h2>Add New Inventory Item</h2>
        <div className="mb-3">
          <button onClick={() => navigate("/inventory")} className="btn btn-secondary extra me-2">
            Back to Inventory
          </button>
          {/* <button
            onClick={handleGenerateRandomItems}
            className="btn btn-warning"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate 100 Random Items"}
          </button> */}
        </div>

        <form onSubmit={handleAddItem} className="add-stock-form">
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message" style={{ color: "green" }}>{success}</p>}

          <div className="form-group mb-3">
            <label htmlFor="itemName">Item Name</label>
            <input
              id="itemName"
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="0"
              className="form-control"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              className="form-control"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              type="date"
              placeholder="Expiry Date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group-submit">
            <button type="submit" className="btn btn-primary">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
