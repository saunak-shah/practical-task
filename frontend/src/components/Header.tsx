import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Header.css"; // CSS for styling the header

const Header = () => {
  const navigate = useNavigate();

  // Logout function to clear token and cookies
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");

    // Clear all cookies (basic way, adjust as needed)
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="header">
      <h1 className="header-title"></h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default Header;
