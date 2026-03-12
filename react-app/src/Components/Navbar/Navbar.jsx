import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname === '/admin_panel';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
        } catch (error) {
          console.error("Error fetching role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className={`mo-navbar ${isAdminPage ? 'admin-mode' : ''}`}>
      <div className="mo-nav-container">

        <Link to="/" className="mo-nav-logo" onClick={() => setIsOpen(false)}>
          IN<span>SIGHT</span>
        </Link>

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

      <div className={`mo-nav-overlay ${isOpen ? 'visible' : ''}`} onClick={toggleMenu}></div>

      <div className={`mo-nav-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="mo-sidebar-header">
          <span className="mo-sidebar-title">
            {user ? (user.displayName || user.email.split('@')[0]) : 'Menu'}
          </span>
          {user && <div className="mo-user-badge">{user.email}</div>}
        </div>
        
        <div className="mo-sidebar-links">
          <Link to="/" className="mo-nav-link" onClick={toggleMenu}>Home</Link>
          <Link to="/news" className="mo-nav-link" onClick={toggleMenu}>News</Link>
          <Link to="/markets" className="mo-nav-link" onClick={toggleMenu}>Markets</Link>
          <Link to="/calendar" className="mo-nav-link" onClick={toggleMenu}>Calendar</Link>
          
          {user && (
            <>
              <Link to="/profile" className="mo-nav-link" onClick={toggleMenu}>Profile</Link>
              {isAdmin && (
                <Link to="/admin_panel" className="mo-nav-link" onClick={toggleMenu}>
                  Admin Panel
                </Link>
              )}
            </>
          )}

          <div className="mo-nav-divider"></div>

          {user ? (
            <button className="mo-nav-link mo-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="mo-nav-link mo-nav-auth" onClick={toggleMenu}>Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;