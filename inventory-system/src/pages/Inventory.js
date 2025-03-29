import { useState } from "react";
import Sidebar from "../components/Sidebar";
import InventoryList from "../components/InventoryList";
import AddItem from "../components/AddItem";
import EditItem from "../components/EditItem";
import "../style/inventory.css";

const Inventory = () => {
  const [activeComponent, setActiveComponent] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (item) => {
    setEditingItem(item);
    setActiveComponent("edit");
  };

  return (
    <div className="inventory-layout">
      <Sidebar setActiveComponent={setActiveComponent} />
      <div className="content">
        {activeComponent === "list" && <InventoryList onEdit={handleEdit} />}
        {activeComponent === "add" && <AddItem setActiveComponent={setActiveComponent} />}
        {activeComponent === "edit" && <EditItem item={editingItem} setActiveComponent={setActiveComponent} />}
      </div>
    </div>
  );
};

export default Inventory;
