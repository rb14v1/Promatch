import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";
import "./Header.css";

function Header() {
  return (
    <header 
      className="header"
      style={{
        borderTopLeftRadius: "18px",
        borderTopRightRadius: "18px",
        backgroundColor: "#ffffff",
        overflow: "hidden"
      }}
    >
      <div className="header-container">
        
        {/* Logo + Brand */}
        <div className="logo-section">
          <img src={logo} alt="Company Logo" className="logo" />
          <span className="brand-name">ProMatch</span>
        </div>

        {/* Navigation */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/upload" className="nav-link">Upload</Link>
          <Link to="/retrieve" className="nav-link">Retrieve</Link>
        </nav>

      </div>
    </header>
  );
}

export default Header;
