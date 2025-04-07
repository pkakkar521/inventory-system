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
    const [items, setItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [currentItem, setCurrentItem] = useState({ name: '', quantity: '', price: '', expiry_date: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const apiUrlBase = location.state?.apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:5000/api/inventory';

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

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(currentItem.name.toLowerCase())
    );

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedItemId) {
            setError("Please select an item to update.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        const payload = {
            name: currentItem.name,
            quantity: Number(currentItem.quantity),
            price: Number(currentItem.price),
            expiry_date: currentItem.expiry_date
        };

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

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

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
                    {showSearch && currentItem.name && filteredItems.length === 0 && (
                        <p className="no-results">No matching items found.</p>
                    )}
                </div>

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
                {loading && <p>Loading...</p>}
            </div>
        </div>
    );
};

export default EditItem;
