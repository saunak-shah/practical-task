import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';
import { saveToLocalStorage } from "../global/common";

const Header = () => {
  const navigate = useNavigate();
  const active = localStorage.getItem("active") === "true";
  
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

  const mainMenuItems = [
    {
      key: 'home',
      label: <Link to="/products" className="header-menu-item">Home</Link>,
    },
    ...(!active
       ? [
          {
            key: "users",
            label: <Link to="/users" className="header-menu-item">Users</Link>,
          },
        ] : []
    )
  ];


  return (
    <Layout.Header className="main-header-custom">
      {/* Menu for navigation links */}
      <Menu mode="horizontal" className="main-menu">
        {mainMenuItems.map(item => (
          <Menu.Item key={item.key}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu>

      {/* Logout Button aligned to the right */}
      <Button type="primary" onClick={handleLogout} className="logout-button">
        Logout
      </Button>
    </Layout.Header>
  );
};

export default Header;
