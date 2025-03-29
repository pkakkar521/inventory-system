import { useState } from "react";
import axios from "axios";

const EditItem = ({ item, setActiveComponent }) => {
  const [updatedItem, setUpdatedItem] = useState(item.item);
  const [updatedQuantity, setUpdatedQuantity] = useState(item.quantity);

  const handleUpdate = async () => {
    await axios.put(`http://localhost:5000/updateStock/${item._id}`, {
      item: updatedItem,
      quantity: updatedQuantity,
    });
    setActiveComponent("list");
  };

  return (
    <div>
      <h3>Edit Item</h3>
      <input type="text" value={updatedItem} onChange={(e) => setUpdatedItem(e.target.value)} />
      <input type="number" value={updatedQuantity} onChange={(e) => setUpdatedQuantity(e.target.value)} />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={() => setActiveComponent("list")}>Cancel</button>
    </div>
  );
};

export default EditItem;
