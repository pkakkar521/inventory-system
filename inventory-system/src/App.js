import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default landing page set to Register */}
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Private route for Inventory */}
          <Route element={<PrivateRoute />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>

          {/* Redirect any unknown route to Register */}
          <Route path="*" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
