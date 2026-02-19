import React from 'react'
import { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const [nyitva, setNyitva] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

 if (location.pathname === "/login") {
   return null;
 }

    if (location.pathname === "/users") {
    return null;
  }

  const kilepes = () => {
    localStorage.clear();
    setNyitva(false);
    navigate("/login");
  };

  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="navbar-wrapper">
    <nav className="navbar">
      <button className="menu-gomb" onClick={() => setNyitva(!nyitva)}>
        ☰
      </button>
      {nyitva && (
        <div className="dropdown-menu">
           {isRegisterPage ? (
              <button onClick={() => { navigate("/login"); setNyitva(false); }}>
                Belépés
              </button>
            ) : (
              <>
                <button onClick={() => { navigate("/profil"); setNyitva(false); }}>
                  Fiók kezelés
                </button>
                <button style={{marginBottom:"10px"}} onClick={kilepes}>
                  Kilépés
                </button>
              </>
            )}
        </div>
      )}
    </nav>
  </div>
  )
}

export default Navbar
