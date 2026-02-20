import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./Login.css";


const Login = () => {
const [felhasznaloNev, setFelhasznaloNev] = useState("");
    const [jelszo, setJelszo] = useState("");
    const [hiba, setHiba] = useState("");
    const URL = process.env.BACKEND_URL


    const location = useLocation();
    const navigate = useNavigate();

    const sikerUzenet = location.state?.uzenet;

  useEffect(() => {
    if (sikerUzenet) {
      navigate(location.pathname, { replace: true });
    }
  }, []);

  const login = async () => {
    
  try {
    const response = await fetch(`${URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username: felhasznaloNev, 
        password: jelszo 
      })
    });

    const adat = await response.json();

    if (!response.ok) {
      setHiba(adat.message || "Hiba történt"); 
      return;
    }

    localStorage.setItem("user", JSON.stringify(adat.user));
    navigate("/profil");
  } catch (error) {
    setHiba("Nem sikerült kapcsolódni a szerverhez.");
  }
};

  return (
    <div className='login'>   
        <input type="text" placeholder='username'/>
        <input type="text"  placeholder='password'/>
        <button onClick={login}>Login</button>
        <button onClick={navigate("/register")}>Register</button>
        <button>Google Login</button>
    </div>
  )
}

export default Login
