import { useContext, useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = () => {
  const { token } = useContext(AuthContext);
  
  const isAuthenticated = useMemo(() => !!token, [token]); // Memoize token check
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
