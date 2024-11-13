import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = localStorage.getItem("active") === "true";

  const handleLogout = () => {
    localStorage.removeItem("token");

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    navigate("/login");
  };

  const mainMenuItems = [
    {
      key: 'home',
      label: <Link to="/" className="header-menu-item">Home</Link>,
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

  // Set active key based on current path
  const selectedKey = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  return (
    <Layout.Header className="main-header-custom">
      {/* Menu for navigation links */}
      <Menu
        mode="horizontal"
        className="main-menu"
        selectedKeys={[selectedKey]}
      >
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
