import { useState, useEffect } from "react";
import axios from "axios";

const InventoryList = ({ onEdit }) => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getStock");
      setStocks(response.data);
    } catch (error) {
      setError("Failed to fetch stocks.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      axios.delete(`http://localhost:5000/deleteStock/${id}`).then(() => {
        fetchStocks();
      });
    }
  };

  return (
    <div>
      <button onClick={() => onEdit(null)}>Add Item</button>
      <h3>Stock List</h3>
      {error && <p>{error}</p>}
      <ul>
        {stocks.map((stock) => (
          <li key={stock._id}>
            {stock.item} - {stock.quantity}
            <button onClick={() => onEdit(stock)}>Edit</button>
            <button onClick={() => handleDelete(stock._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;
