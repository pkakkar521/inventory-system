import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AuthContext from "../context/AuthContext";
import "../style/inventory.css";

const ITEMS_PER_PAGE = 10;

const Inventory = ({ apiUrl }) => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const { token } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      console.error("No token found, cannot fetch inventory.");
      setError("Authentication required.");
      return;
    }
    setLoading(true);
    setError('');

    axios.get(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((response) => {
        const fetchedItems = response.data.items || [];
        const sortedItems = fetchedItems.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        setAllItems(sortedItems);

        const value = sortedItems.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);
        setTotalValue(value);
        setLoading(false);
      })
      .catch((err) => {
          console.error("Error fetching items:", err);
          setError("Failed to fetch inventory items.");
          if (err.response && err.response.status === 401) {
              console.error("Unauthorized access. Redirecting to login might be needed.");
          }
          setLoading(false);
      });
  }, [apiUrl, token]);

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = allItems.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Invalid Date';
      return `${day}-${month}-${year}`;
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <h2>Inventory Dashboard</h2>

        <div className="button-group mb-4">
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

        <h3>Bill Summary</h3>
        <div className="card-container">
          <div className="card">
            <h4>Total Items</h4>
            <p>{allItems.length}</p>
          </div>
          <div className="card">
            <h4>Total Value</h4>
            <p>₹{totalValue.toFixed(2)}</p>
          </div>
        </div>

        <h3>Inventory List</h3>
        {loading && <p>Loading inventory...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price (₹)</th>
                    <th>Added Date</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item._id}>
                        <td data-label="Name"><span className="td-value">{item.name}</span></td>
                        <td data-label="Quantity"><span className="td-value">{item.quantity}</span></td>
                        <td data-label="Price (₹)"><span className="td-value">{Number(item.price).toFixed(2)}</span></td>
                        <td data-label="Added Date"><span className="td-value">{formatDate(item.createdAt)}</span></td>
                        <td data-label="Expiry Date"><span className="td-value">{formatDate(item.expiry_date)}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No items in inventory yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  style={{ marginRight: '10px' }}
                >
                  {'<'} Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button
                  className="btn btn-secondary"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{ marginLeft: '10px' }}
                >
                  Next {'>'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
