import { useState } from "react";
import axios from "axios";

const AddItem = ({ setActiveComponent }) => {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = async () => {
    await axios.post("http://localhost:5000/addStock", { item, quantity });
    setActiveComponent("list");
  };

  return (
    <div>
      <h3>Add Item</h3>
      <input type="text" placeholder="Item Name" value={item} onChange={(e) => setItem(e.target.value)} />
      <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <button onClick={handleAdd}>Add</button>
      <button onClick={() => setActiveComponent("list")}>Cancel</button>
    </div>
  );
};

export default AddItem;
