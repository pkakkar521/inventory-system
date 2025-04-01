import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import DeleteItem from "./pages/DeleteItem"
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./routes/PrivateRoute";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<PrivateRoute />}>
            <Route 
              path="/inventory" 
              element={<Inventory apiUrl={`${API_BASE_URL}/api/inventory`} />}
            />
            <Route 
              path="/add-item"
              element={<AddItem />}
            />
            <Route
              path="/edit-item"
              element={<EditItem />}
            />
            <Route
              path="/delete-item"
              element={<DeleteItem />}
            />
          </Route>
          

          <Route path="*" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
