import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/register.css"; // Importing CSS for styling

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mongoDBUri, setMongoDBUri] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", {
        name,
        email,
        password,
        mongoDBUri,
      });

      if (response.status === 201) {
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
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <input
            type="text"
            placeholder="Your MongoDB Atlas Database URL"
            value={mongoDBUri}
            onChange={(e) => setMongoDBUri(e.target.value)}
            required
            className="register-input"
          />
          <button type="submit" className="register-button">
            Register
          </button>
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
