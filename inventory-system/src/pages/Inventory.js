import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../style/inventory.css"

const Inventory = () => {
  const { token, logout } = useContext(AuthContext);
  const [stocks, setStocks] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    if (token) fetchStocks();
  }, [token]);

  const fetchStocks = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:5000/getStock", {
        headers: { Authorization: token },
      });
      setStocks(response.data);
      setError("");
    } catch (error) {
      setError("Failed to fetch stocks. Please try again.");
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
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
      fetchStocks();
      setError("");
    } catch (error) {
      setError("Failed to add stock. Please try again.");
      console.error("Error adding stock:", error);
    }
  };

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setItem(stock.item);
    setQuantity(stock.quantity);
  };

  const handleUpdateStock = async () => {
    if (!editingStock) return;
    if (!item || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError("Please enter a valid item and quantity.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/updateStock/${editingStock._id}`,
        { item, quantity: Number(quantity) },
        { headers: { Authorization: token } }
      );
      setEditingStock(null);
      setItem("");
      setQuantity("");
      fetchStocks();
      setError("");
    } catch (error) {
      setError("Failed to update stock. Please try again.");
      console.error("Error updating stock:", error);
    }
  };

  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/deleteStock/${id}`, {
        headers: { Authorization: token },
      });
      fetchStocks();
    } catch (error) {
      setError("Failed to delete stock. Please try again.");
      console.error("Error deleting stock:", error);
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
        {editingStock ? (
          <button onClick={handleUpdateStock}>Update Stock</button>
        ) : (
          <button onClick={handleAddStock}>Add Stock</button>
        )}
      </div>

      <h3>Stock List</h3>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {stocks.map((stock) => (
            <li key={stock._id}>
              {stock.item} - {stock.quantity}
              <button onClick={() => handleEditStock(stock)}>Edit</button>
              <button onClick={() => handleDeleteStock(stock._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inventory;