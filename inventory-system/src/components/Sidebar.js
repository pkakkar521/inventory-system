const Sidebar = ({ setActiveComponent }) => {
    return (
      <div className="sidebar">
        <button onClick={() => setActiveComponent("list")}>Inventory</button>
        <button onClick={() => setActiveComponent("sales")}>Sales</button>
        <button onClick={() => setActiveComponent("customer")}>Customer</button>
        <button onClick={() => setActiveComponent("report")}>Report</button>
      </div>
    );
  };
  
  export default Sidebar;
  