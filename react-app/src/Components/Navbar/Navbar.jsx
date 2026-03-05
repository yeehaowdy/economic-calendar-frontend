import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="mo-navbar">
      <div className="mo-nav-container">
        {/* Bal oldal: Logo */}
        <Link to="/" className="mo-nav-logo" onClick={() => setIsOpen(false)}>
          IN<span>SIGHT</span>
        </Link>

        {/* Jobb oldal: Menü Gomb */}
        <div className="mo-nav-menu-wrapper">
          <button 
            className={`mo-menu-trigger ${isOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <div className="mo-hamburger">
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Sötétítő réteg (Overlay) - Most már sötétebb és animálható */}
      <div className={`mo-nav-overlay ${isOpen ? 'visible' : ''}`} onClick={toggleMenu}></div>

      {/* Becsúszó oldalsáv (Sidebar) */}
      <div className={`mo-nav-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="mo-sidebar-header">
           <span className="mo-sidebar-title">Menu</span>
        </div>
        <div className="mo-sidebar-links">
          <Link to="/calendar" className="mo-nav-link" onClick={toggleMenu}>Calendar</Link>
          <Link to="/profil" className="mo-nav-link" onClick={toggleMenu}>Profile</Link>
          <Link to="/admin_panel" className="mo-nav-link" onClick={toggleMenu}>Admin Panel</Link>
          <div className="mo-nav-divider"></div>
          <Link to="/login" className="mo-nav-link mo-nav-auth" onClick={toggleMenu}>Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;