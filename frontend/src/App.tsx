import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Users from "./pages/UsersPage";
import Header from "./components/Header";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (!token && location.pathname === "/") {
      navigate("/login"); // Redirect to Login page if no token and trying to access Home
    }
  }, [token, location, navigate]);

  return (
    <div className="app-container">
      {token ? (
        <>
          <Header />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
            <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
            <Route path="/users" element={token ? <Users /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
};

const Root: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default Root;
