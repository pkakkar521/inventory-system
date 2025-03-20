import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [dbUri, setDbUri] = useState(localStorage.getItem("dbUri") || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (dbUri) {
      localStorage.setItem("dbUri", dbUri);
    } else {
      localStorage.removeItem("dbUri");
    }
  }, [token, dbUri]);

  const login = (newToken, newDbUri) => {
    setToken(newToken);
    setDbUri(newDbUri);
    localStorage.setItem("token", newToken);
    localStorage.setItem("dbUri", newDbUri);
  };

  const logout = () => {
    setToken(null);
    setDbUri(null);
    localStorage.removeItem("token");
    localStorage.removeItem("dbUri");
  };

  return (
    <AuthContext.Provider value={{ token, dbUri, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
