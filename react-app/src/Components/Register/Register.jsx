import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const URL = process.env.REACT_APP_BACKEND_URL;
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const registerHandler = async () => {
    if (!username || !password || !email) {
      setError("All fields are required!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Ensure the URL matches your folder structure (e.g., /api/auth/register)
      const response = await fetch(`${URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 'felhasznaloNev' stays here to match your current register.js backend code
        body: JSON.stringify({ 
          felhasznaloNev: username, 
          email, 
          jelszo: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/", {
          state: { message: "Registration successful" }
        });
      } else {
        setError(data.message || "An error occurred during registration.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <h2>Create Account</h2>

      {error && <p className="error-message" style={{color: "red", textAlign:"center", fontWeight: "bold"}}>{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Password (min. 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button 
        onClick={registerHandler} 
        style={{marginTop:"10px"}}
        disabled={loading}
      >
        {loading ? "Processing..." : "Register"}
      </button>
      
      <button disabled={loading} className="google-btn">Register with Google</button>
    </div>
  )
}

export default Register;