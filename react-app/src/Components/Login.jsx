import React from 'react'
import { NavLink, Link, useNavigate, useLocation} from "react-router";

const Login = () => {
  return (
    <div>   
        <input type="text" />
        <input type="text" />
        
        <NavLink to="/profil" end><button>Login</button></NavLink>
    </div>
  )
}

export default Login
