import { useState } from 'react'
import { NavLink, Link} from "react-router";
import Navbar from './Components/Navbar';
import Login from './Components/Login';


function App() {

  return (
    <>
       <nav>
          <NavBar>
            <NavLink to="/" end></NavLink>
            <NavLink to="/trending" end></NavLink>
            <NavLink to="/concerts">All Concerts</NavLink>
            <NavLink to="/account">Account</NavLink>
          </NavBar>
          
          <Login></Login>

    </nav>
    </>
  )
}

export default App
