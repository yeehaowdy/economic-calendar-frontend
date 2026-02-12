import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const Profil = () => {
  return (
      <div className="users">
            <h2>Fiók kezelés</h2>
            <button onClick={() => navigate("/login")} style={style1}>Kilépés</button>

      </div>
  )
}

export default Profil
