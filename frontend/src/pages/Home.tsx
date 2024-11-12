import React, { useEffect, useState } from "react";
import { DatePicker, Select } from "antd";
import "../css/Home.css"; // Import the new CSS file
import Products from "./Products";

const Home = () => {
  const active = localStorage.getItem("active") || "";
  return (
    <div className="home-container">
      {/* <div className="main-container">
        <ul className="menu">
          {(active === "false") && (
            <li>
              <span>
                <a href="/users" className="menu-item">
                  Users
                </a>
              </span>
            </li>
          )}
          <li>
            <span>
              <a href="/products" className="menu-item">
                Products
              </a>
            </span>
          </li>
        </ul>
      </div> */}
      
      {/* Ensure Products is properly included within the return's single parent div */}
      <Products />
    </div>
  );
};

export default Home;
