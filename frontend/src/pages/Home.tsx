import "../css/Home.css"; // Import the new CSS file
import Products from "./Products";

const Home = () => {
  return (
    <div className="home-container">
      {/* Ensure Products is properly included within the return's single parent div */}
      <Products />
    </div>
  );
};

export default Home;
