import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/register.css"; // Use separate CSS for styling

const Register = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [dbUri, setDbUri] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", {
        userId,
        password,
        role,
        dbUri,
      });

      if (response.data.success) {
        alert(response.data.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        alert(response.data.message || "Registration failed!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed! Try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="register-input"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="register-dropdown"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <input
            type="text"
            placeholder="Your MongoDB Atlas Database URL"
            value={dbUri}
            onChange={(e) => setDbUri(e.target.value)}
            required
            className="register-input"
          />
          <button type="submit" className="register-button">Register</button>
        </form>

        <p className="already-account">Already have an account?</p>
        <button onClick={() => navigate("/login")} className="login-button">
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Register;
