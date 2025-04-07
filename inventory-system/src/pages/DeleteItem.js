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
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantityToSell, setQuantityToSell] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchText, setSearchText] = useState('');

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

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleItemSelection = (item) => {
        setSelectedItemId(item._id);
        setSelectedItem(item);
        setQuantityToSell(1);
        setSearchText('');
        setError('');
        setSuccess('');
    };

    const handleAddToCart = () => {
        if (!selectedItem || quantityToSell < 1) return;

        const alreadyInCart = cart.find(i => i._id === selectedItem._id);
        if (alreadyInCart) {
            setError("Item already in cart. Remove it before adding again.");
            return;
        }

        setCart([...cart, { ...selectedItem, quantity: quantityToSell }]);
        setSelectedItemId('');
        setSelectedItem(null);
        setQuantityToSell(1);
        setSuccess('Item added to cart.');
        setError('');
    };

    const handleSell = async () => {
        if (cart.length === 0) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            for (const item of cart) {
                await axios.put(`${apiUrlBase}/${item._id}/reduce`, { quantity: item.quantity }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            setCart([]);
            setSuccess("Items sold successfully!");
            const response = await axios.get(apiUrlBase, { headers: { 'Authorization': `Bearer ${token}` } });
            setItems(response.data.items || []);
        } catch (err) {
            console.error("Sell error:", err);
            setError("Failed to complete sale.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content delete-item-content">
                <h2>Sell Items</h2>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {/* Updated Search Input for Item Selection */}
                <div className="item-selector-container" style={{ position: 'relative' }}>
                    <label htmlFor="item-search">Search Item:</label>
                    <input
                        type="text"
                        id="item-search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Type item name..."
                        disabled={loading || items.length === 0}
                    />
                    {searchText && filteredItems.length > 0 && (
                        <ul className="search-results">
                            {filteredItems.map(item => (
                                <li
                                    key={item._id}
                                    onClick={() => handleItemSelection(item)}
                                    className="search-result-item"
                                >
                                    {item.name} (Available: {item.quantity})
                                </li>
                            ))}
                        </ul>
                    )}
                    {searchText && filteredItems.length === 0 && (
                        <p className="no-results">No matching items found.</p>
                    )}
                </div>

                <div className="split-section">
                    {/* Left - Item Info + Add to Cart */}
                    <div className="left-panel">
                        {selectedItem && (
                            <>
                                <h3>Item Info</h3>
                                <p><strong>Name:</strong> {selectedItem.name}</p>
                                <p><strong>Available Quantity:</strong> {selectedItem.quantity}</p>
                                <label htmlFor="quantity-sell">Quantity to Sell:</label>
                                <select
                                    id="quantity-sell"
                                    value={quantityToSell}
                                    onChange={(e) => setQuantityToSell(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    {[...Array(selectedItem.quantity).keys()].map(q => (
                                        <option key={q + 1} value={q + 1}>{q + 1}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary" onClick={handleAddToCart} disabled={loading}>
                                    Add to Cart
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right - Cart */}
                    <div className="right-panel">
                        <h3>Cart</h3>
                        {cart.length === 0 ? <p>No items in cart.</p> : (
                            <ul>
                                {cart.map(item => (
                                    <li key={item._id}>
                                        {item.name} — {item.quantity} unit(s)
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="btn btn-success" onClick={handleSell} disabled={cart.length === 0 || loading}>
                            {loading ? 'Selling...' : 'Sell'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteItem;
