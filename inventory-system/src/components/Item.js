import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

// Add Item Component
export const AddItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = location.state?.apiUrl || ""; // Get apiUrl from navigation

  const [newItem, setNewItem] = useState({ name: "", price: "", quantity: "", start_date: "", expiry_date: "" });


  const handleChange = (e) => setNewItem({ ...newItem, [e.target.name]: e.target.value });

  const addItem = async () => {
    if (Object.values(newItem).some(value => !value)) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(apiUrl, newItem);
      navigate(-1); // Go back to inventory page
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <h2>Add Item</h2>
        <div className="add-item-form">
          <input type="text" name="name" placeholder="Item Name" value={newItem.name} onChange={handleChange} className="form-control" />
          <input type="number" name="price" placeholder="Price" value={newItem.price} onChange={handleChange} className="form-control" />
          <input type="number" name="quantity" placeholder="Quantity" value={newItem.quantity} onChange={handleChange} className="form-control" />
          <input type="date" name="start_date" placeholder="Start Date" value={newItem.start_date} onChange={handleChange} className="form-control" />
          <input type="date" name="expiry_date" placeholder="Expiry Date" value={newItem.expiry_date} onChange={handleChange} className="form-control" />
          <button className="btn btn-success" onClick={addItem}>Add Item</button>
        </div>
      </div>
    </div>
  );
};

export const EditItem = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const apiUrl = location.state?.apiUrl || ""; // Get apiUrl from navigation
  
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [updatedItem, setUpdatedItem] = useState({ name: "", price: "", quantity: "", start_date: "", expiry_date: "" });
  
    // Fetch inventory data
    useEffect(() => {
      axios.get(apiUrl)
        .then((response) => setItems(response.data))
        .catch((error) => console.error("Error fetching items:", error));
    }, [apiUrl]);
  
    const handleChange = (e) => {
      setUpdatedItem({ ...updatedItem, [e.target.name]: e.target.value });
    };
  
    // Select an item for editing
    const editItem = (item) => {
      setEditingItem(item);
      setUpdatedItem(item);
    };
  
    // Update item
    const updateItem = async () => {
      try {
        await axios.put(`${apiUrl}/${editingItem.name}`, updatedItem);
        navigate(-1); // Go back to inventory page
      } catch (error) {
        console.error("Error updating item:", error);
      }
    };
  
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="content">
          <h2>Edit Item</h2>
  
          {/* Inventory Table */}
          <table className="table table-bordered table-hover mt-4">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                  <td>{item.start_date}</td>
                  <td>{item.expiry_date}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => editItem(item)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          {/* Edit Form */}
          {editingItem && (
            <div className="add-item-form">
              <input type="text" name="name" value={updatedItem.name} className="form-control" disabled />
              <input type="number" name="price" value={updatedItem.price} onChange={handleChange} className="form-control" />
              <input type="number" name="quantity" value={updatedItem.quantity} onChange={handleChange} className="form-control" />
              <input type="date" name="start_date" value={updatedItem.start_date} onChange={handleChange} className="form-control" />
              <input type="date" name="expiry_date" value={updatedItem.expiry_date} onChange={handleChange} className="form-control" />
              <button className="btn btn-warning" onClick={updateItem}>Update Item</button>
            </div>
          )}
        </div>
      </div>
    );
  };

 

export const DeleteItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = location.state?.apiUrl || "";

  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(apiUrl)
      .then(response => setItems(response.data))
      .catch(error => console.error("Error fetching items:", error));
  }, [apiUrl]);

  const deleteItem = async (index) => {
    const itemToDelete = items[index];

    try {
      await axios.delete(`${apiUrl}/${itemToDelete.name}`);
      setItems(items.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <h2>Delete Item</h2>

        {/* Inventory Table */}
        <table className="table table-bordered table-hover mt-4">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.start_date}</td>
                <td>{item.expiry_date}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => deleteItem(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// Apply same logic for EditItem and DeleteItem