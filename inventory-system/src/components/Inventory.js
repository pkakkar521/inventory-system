import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./Inventory.css";

const Inventory = ({ apiUrl }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  // Fetch inventory data
  useEffect(() => {
    axios.get(apiUrl)
      .then((response) => {
        const sortedItems = response.data.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        setItems(sortedItems);
        // Calculate total value
        const value = sortedItems.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);
        setTotalValue(value);
      })
      .catch((error) => console.error("Error fetching items:", error));
  }, [apiUrl]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <h2>Inventory Dashboard</h2>

        {/* Navigation Buttons */}
        <div className="button-group mb-4"> {/* Added margin for spacing */}
          <button className="btn btn-success me-2" onClick={() => navigate("/add-item", { state: { apiUrl } })}>
            Add Inventory
          </button>
          <button className="btn btn-warning me-2" onClick={() => navigate("/edit-item", { state: { apiUrl } })}>
            Edit Inventory
          </button>
          <button className="btn btn-danger" onClick={() => navigate("/delete-item", { state: { apiUrl } })}>
            Delete Inventory
          </button>
        </div>

        {/* Bill Summary BELOW Buttons */}
        <h3>Bill Summary</h3>
        <div className="card-container">
          <div className="card">
            <h4>Total Items</h4>
            <p>{items.length}</p>
          </div>
          <div className="card">
            <h4>Total Value</h4>
            <p>${totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;