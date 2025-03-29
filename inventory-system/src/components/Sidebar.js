import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li><a href="#">Inventory</a></li>
        <li><a href="#">Sales</a></li>
        <li><a href="#">Customers</a></li>
        <li><a href="#">Reports</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;