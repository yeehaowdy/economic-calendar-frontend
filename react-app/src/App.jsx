import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './Components/Navbar/Navbar';
import Login from './Components/Login/Login';
import Calendar from './Components/Calendar/Calendar';
import Register from './Components/Register/Register';
import Profil from './Components/Profile/Profile';
import AdminPanel from './Components/AdminPanel/AdminPanel';


function App() {

  return (
    <>
       <nav>
          <Router>
              {/*<NavBar />*/}
              <Routes>
                <Route path="/" element={<Calendar />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/admin_panel" element={<AdminPanel/>}/>
              </Routes>
          </Router>
      </nav>
    </>
  )
}

export default App
