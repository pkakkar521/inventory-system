import { createContext, useState, useEffect } from "react";

// Create a new context for authentication
const AuthContext = createContext();

// AuthProvider component wraps around the app and provides auth-related data/functions
export const AuthProvider = ({ children }) => {
  // Initialize token and dbUri from localStorage (if available), else null
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [dbUri, setDbUri] = useState(localStorage.getItem("dbUri") || null);

  // Sync token and dbUri with localStorage whenever they change
  useEffect(() => {
    // If token is set, store it in localStorage; else remove it
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    // If dbUri is set, store it in localStorage; else remove it
    if (dbUri) {
      localStorage.setItem("dbUri", dbUri);
    } else {
      localStorage.removeItem("dbUri");
    }
  }, [token, dbUri]);

  // Function to handle login — saves token and dbUri in state and localStorage
  const login = (newToken, newDbUri) => {
    setToken(newToken);
    setDbUri(newDbUri);
    localStorage.setItem("token", newToken);
    localStorage.setItem("dbUri", newDbUri);
  };

  // Function to handle logout — clears token and dbUri from state and localStorage
  const logout = () => {
    setToken(null);
    setDbUri(null);
    localStorage.removeItem("token");
    localStorage.removeItem("dbUri");
  };

  // Provide the auth state and actions to all child components
  return (
    <AuthContext.Provider value={{ token, dbUri, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context to be used in other components
export default AuthContext;
