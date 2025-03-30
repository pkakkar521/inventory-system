import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><a href="#">Sales</a></li>
        <li><a href="#">Customers</a></li>
        <li><a href="#">Reports</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
