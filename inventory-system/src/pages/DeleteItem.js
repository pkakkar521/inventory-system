import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AuthContext from '../context/AuthContext';
import '../style/deleteItem.css';

const DeleteItem = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantityToReduce, setQuantityToReduce] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                console.error("Error fetching items:", err);
                setError("Failed to load items list.");
                setLoading(false);
            });
    }, [apiUrlBase, token]);

    const handleItemSelectionChange = (e) => {
        setSelectedItemId(e.target.value);
    };

    const handleQuantityChange = (e) => {
        setQuantityToReduce(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedItemId || !quantityToReduce) {
            setError("Please select an item and enter quantity to reduce.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        axios.put(`${apiUrlBase}/${selectedItemId}/reduce`, { quantity: Number(quantityToReduce) }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                setSuccess(`Reduced ${quantityToReduce} units from "${response.data.name}" successfully!`);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error reducing quantity:", err);
                setError(err.response?.data?.message || "Failed to update item.");
                setLoading(false);
            });
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content delete-item-content">
                <h2>Reduce Item Quantity</h2>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="item-selector-container">
                    <label htmlFor="item-select">Select Item:</label>
                    <select
                        id="item-select"
                        value={selectedItemId}
                        onChange={handleItemSelectionChange}
                        disabled={loading || items.length === 0}
                    >
                        <option value="">-- Select an Item --</option>
                        {items.map(item => (
                            <option key={item._id} value={item._id}>
                                {item.name} (Available: {item.quantity})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedItemId && (
                    <form onSubmit={handleSubmit} className="delete-item-form">
                        <div className="form-group">
                            <label htmlFor="quantity">Quantity to Reduce:</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={quantityToReduce}
                                onChange={handleQuantityChange}
                                required
                                min="1"
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Reduce Quantity'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventory')} style={{ marginLeft: '10px' }}>
                            Cancel
                        </button>
                    </form>
                )}
                {loading && <p>Loading...</p>}
            </div>
        </div>
    );
};

export default DeleteItem;