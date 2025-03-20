import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const Inventory = () => {
  const { token, logout } = useContext(AuthContext);
  const [stocks, setStocks] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState(""); // State for errors

  useEffect(() => {
    if (token) fetchStocks();
  }, [token]); // Re-run when token updates

  const fetchStocks = async () => {
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:5000/getStock", {
        headers: { Authorization: token },
      });
      setStocks(response.data);
      setError(""); // Clear error if successful
    } catch (error) {
      setError("Failed to fetch stocks. Please try again.");
      console.error("Error fetching stocks:", error);
    }
  };

  const handleAddStock = async () => {
    if (!item || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError("Please enter a valid item and quantity.");
      return;
    }
    if (!token) return;

    try {
      await axios.post(
        "http://localhost:5000/addStock",
        { item, quantity: Number(quantity) },
        { headers: { Authorization: token } }
      );
      setItem("");
      setQuantity("");
      fetchStocks(); // Refresh list
      setError(""); // Clear error on success
    } catch (error) {
      setError("Failed to add stock. Please try again.");
      console.error("Error adding stock:", error);
    }
  };

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      <button onClick={logout} className="logout-button">Logout</button>
      
      <div className="add-stock-form">
        <input
          type="text"
          placeholder="Item Name"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button onClick={handleAddStock}>Add Stock</button>
      </div>

      <h3>Stock List</h3>
      {error && <p className="error-message">{error}</p>} {/* Show errors */}

      <ul>
        {stocks.map((stock) => (
          <li key={stock._id}>
            {stock.item} - {stock.quantity} 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
