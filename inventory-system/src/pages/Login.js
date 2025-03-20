import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../style/login.css";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState(""); // Error state
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message before new request

    try {
      const response = await axios.post("http://localhost:5000/login", {
        userId, 
        password, 
        role,
      });

      if (!response.data.token || !response.data.dbUri) {
        setError("Invalid credentials or missing data from server!");
        return;
      }

      login(response.data.token, response.data.dbUri);
      navigate("/inventory");
    } catch (error) {
      setError("Login failed! Check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="login-dropdown"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <button type="submit" className="login-button">Login</button>

          {/* Show error message if login fails */}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
