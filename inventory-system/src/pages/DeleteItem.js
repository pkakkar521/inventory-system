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

    // State variables
    const [items, setItems] = useState([]);                      // Inventory items fetched from backend
    const [selectedItemId, setSelectedItemId] = useState('');    // Currently selected item ID
    const [selectedItem, setSelectedItem] = useState(null);      // Selected item object
    const [quantityToSell, setQuantityToSell] = useState(1);     // Quantity selected to sell
    const [cart, setCart] = useState([]);                        // Items added to cart for selling
    const [loading, setLoading] = useState(false);               // Loading state
    const [error, setError] = useState('');                      // Error message
    const [success, setSuccess] = useState('');                  // Success message
    const [searchText, setSearchText] = useState('');            // Item search input

    // Set API URL from state, env, or fallback to localhost
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
                console.error("Error fetching items:", err);
                setError("Failed to load items list.");
                setLoading(false);
            });
    }, [apiUrlBase, token]);

    // Filter items based on search input
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Handle item selection from search result
    const handleItemSelection = (item) => {
        setSelectedItemId(item._id);
        setSelectedItem(item);
        setQuantityToSell(1);
        setSearchText('');
        setError('');
        setSuccess('');
    };

    // Add selected item to cart
    const handleAddToCart = () => {
        if (!selectedItem || quantityToSell < 1) return;

        // Check if item is already in cart
        const alreadyInCart = cart.find(i => i._id === selectedItem._id);
        if (alreadyInCart) {
            setError("Item already in cart. Remove it before adding again.");
            return;
        }

        // Add to cart
        setCart([...cart, { ...selectedItem, quantity: quantityToSell }]);
        setSelectedItemId('');
        setSelectedItem(null);
        setQuantityToSell(1);
        setSuccess('Item added to cart.');
        setError('');
    };

    // Handle selling items (PUT request for each item in cart)
    const handleSell = async () => {
        if (cart.length === 0) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update quantity for each item in backend
            for (const item of cart) {
                await axios.put(`${apiUrlBase}/${item._id}/reduce`, { quantity: item.quantity }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            // Clear cart and show success
            setCart([]);
            setSuccess("Items sold successfully!");

            // Refresh item list
            const response = await axios.get(apiUrlBase, { headers: { 'Authorization': `Bearer ${token}` } });
            setItems(response.data.items || []);
        } catch (err) {
            console.error("Sell error:", err);
            setError("Failed to complete sale.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate billing totals
    const totalBeforeDiscount = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const discount = totalBeforeDiscount * 0.15;
    const totalAfterDiscount = totalBeforeDiscount - discount;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content delete-item-content">
                <h2>Sell Items</h2>

                {/* Error / Success messages */}
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {/* Item search input */}
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
                    {/* Display filtered results */}
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
                    {/* No results found */}
                    {searchText && filteredItems.length === 0 && (
                        <p className="no-results">No matching items found.</p>
                    )}
                </div>

                <div className="split-section">
                    {/* Left Panel: Selected item info and add to cart */}
                    <div className="left-panel">
                        {selectedItem && (
                            <>
                                <h3>Item Info</h3>
                                <p><strong>Name:</strong> {selectedItem.name}</p>
                                <p><strong>Available Quantity:</strong> {selectedItem.quantity}</p>
                                <p><strong>Price per Unit:</strong> ₹{selectedItem.price}</p>
                                <p><strong>Total Price:</strong> ₹{(selectedItem.price * quantityToSell).toFixed(2)}</p>

                                {/* Quantity selection dropdown */}
                                <label htmlFor="quantity-sell">Quantity to Sell:</label>
                                <select
                                    id="quantity-sell"
                                    value={quantityToSell}
                                    onChange={(e) => setQuantityToSell(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    {/* Options from 1 to available quantity */}
                                    {[...Array(selectedItem.quantity).keys()].map(q => (
                                        <option key={q + 1} value={q + 1}>{q + 1}</option>
                                    ))}
                                </select>

                                {/* Add item to cart button */}
                                <button className="btn btn-primary" onClick={handleAddToCart} disabled={loading}>
                                    Add to Cart
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right Panel: Cart and total billing */}
                    <div className="right-panel">
                        <h3>Cart</h3>
                        {/* Cart items */}
                        {cart.length === 0 ? <p>No items in cart.</p> : (
                            <ul>
                                {cart.map(item => (
                                    <li key={item._id}>
                                        {item.name} — {item.quantity} unit(s) × ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Total and discount breakdown */}
                        {cart.length > 0 && (
                            <>
                                <p className="total-billing">
                                    <strong>Total Before Discount:</strong> ₹{totalBeforeDiscount.toFixed(2)}
                                </p>
                                <p className="total-billing">
                                    <strong>Discount (15%):</strong> ₹{discount.toFixed(2)}
                                </p>
                                <p className="total-billing">
                                    <strong>Total After Discount:</strong> ₹{totalAfterDiscount.toFixed(2)}
                                </p>
                            </>
                        )}

                        {/* Sell button */}
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
