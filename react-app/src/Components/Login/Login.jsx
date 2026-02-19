import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const URL = process.env.REACT_APP_BACKEND_URL;
    const location = useLocation();
    const navigate = useNavigate();

    // Catch success message from Register page
    const successMessage = location.state?.message;

    useEffect(() => {
        if (successMessage) {
            // Clear the message from history state after showing it
            const timeout = setTimeout(() => {
                navigate(location.pathname, { replace: true });
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [successMessage, navigate, location.pathname]);

    const loginHandler = async () => {
        if (!username || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Updated URL to match your potential folder structure /api/auth/login
            const response = await fetch(`${URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: username, 
                    password: password 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid credentials"); 
                return;
            }

            // Save user data and redirect
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/profil");
        } catch (error) {
            setError("Could not connect to the server.");
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login'> 
            <h2>Login</h2>
            
            {successMessage && <p className="success-message" style={{color: "green"}}>{successMessage}</p>}
            {error && <p className="error-message" style={{color: "red"}}>{error}</p>}

            <input 
                type="text" 
                placeholder='Username' 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
            />
            <input 
                type="password"  // Changed to password type for security
                placeholder='Password' 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />
            
            <button onClick={loginHandler} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
            
            <button onClick={() => navigate("/register")} disabled={loading}>
                Register
            </button>
            
            <button disabled={loading}>Google Login</button>
        </div>
    );
}

export default Login;