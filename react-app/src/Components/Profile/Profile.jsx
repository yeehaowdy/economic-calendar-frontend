import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  return (
      <div className="users">
            <h2>Fiók kezelés</h2>
            <button onClick={() => navigate("/login")} style={style1}>Kilépés</button>

      </div>
  )
}

export default Profile
