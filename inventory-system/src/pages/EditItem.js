import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AuthContext from '../context/AuthContext';
import '../style/editItem.css';

const EditItem = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useContext(AuthContext);

    // State to hold all inventory items
    const [items, setItems] = useState([]);
    // Selected item ID for updating
    const [selectedItemId, setSelectedItemId] = useState('');
    // State for current item's form fields
    const [currentItem, setCurrentItem] = useState({ name: '', quantity: '', price: '', expiry_date: '' });
    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // API base URL (passed from state or fallback to env/localhost)
    const apiUrlBase = location.state?.apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:5000/api/inventory';

    // Fetch inventory items on component mount
    useEffect(() => {
        if (!token) {
            setError("Authentication required.");
            return;
        }
        setLoading(true);
        axios.get(apiUrlBase, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                setItems(response.data.items || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching items for selection:", err);
                setError("Failed to load items list.");
                setLoading(false);
            });
    }, [apiUrlBase, token]);

    // Filter items based on current name input (for search dropdown)
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(currentItem.name.toLowerCase())
    );

    // Handle selection from search result
    const handleSearchSelect = (item) => {
        setCurrentItem({
            name: item.name || '',
            quantity: item.quantity || '',
            price: item.price || '',
            expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : ''
        });
        setSelectedItemId(item._id);
        setShowSearch(false);
        setError('');
        setSuccess('');
    };

    // Handle input change for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission to update item
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: no item selected
        if (!selectedItemId) {
            setError("Please select an item to update.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Prepare data to send
        const payload = {
            name: currentItem.name,
            quantity: Number(currentItem.quantity),
            price: Number(currentItem.price),
            expiry_date: currentItem.expiry_date
        };

        // Send PUT request to update item
        axios.put(`${apiUrlBase}/${selectedItemId}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                setSuccess(`Item "${response.data.name}" updated successfully!`);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error updating item:", err);
                setError(err.response?.data?.message || "Failed to update item.");
                setLoading(false);
            });
    };

    // Format date to DD-MM-YYYY format
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content edit-item-content">
                <h2>Edit Inventory Item</h2>

                {/* Display messages */}
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {/* Search bar for selecting item */}
                <div className="item-selector-container" style={{ position: 'relative' }}>
                    <label htmlFor="search-item">Search Item to Edit:</label>
                    <input
                        type="text"
                        id="search-item"
                        placeholder="Type item name..."
                        value={currentItem.name}
                        onChange={(e) => {
                            setCurrentItem(prev => ({ ...prev, name: e.target.value }));
                            setShowSearch(true);
                        }}
                        onFocus={() => setShowSearch(true)}
                        autoComplete="off"
                    />

                    {/* Show search results */}
                    {showSearch && filteredItems.length > 0 && (
                        <ul className="search-results">
                            {filteredItems.map(item => (
                                <li
                                    key={item._id}
                                    className="search-result-item"
                                    onClick={() => handleSearchSelect(item)}
                                >
                                    {item.name} (Expires: {formatDateForDisplay(item.expiry_date)})
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Show message if no matches found */}
                    {showSearch && currentItem.name && filteredItems.length === 0 && (
                        <p className="no-results">No matching items found.</p>
                    )}
                </div>

                {/* Form to edit selected item */}
                {selectedItemId && (
                    <form onSubmit={handleSubmit} className="edit-item-form">
                        <div className="form-group">
                            <label htmlFor="name">Item Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={currentItem.name}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="quantity">Quantity:</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={currentItem.quantity}
                                onChange={handleInputChange}
                                required
                                min="0"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price (₹):</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={currentItem.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="expiry_date">Expiry Date:</label>
                            <input
                                type="date"
                                id="expiry_date"
                                name="expiry_date"
                                value={currentItem.expiry_date}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Buttons */}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Item'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/inventory')}
                            style={{ marginLeft: '10px' }}
                        >
                            Cancel
                        </button>
                    </form>
                )}

                {/* Loading message */}
                {loading && <p>Loading...</p>}
            </div>
        </div>
    );
};

export default EditItem;
