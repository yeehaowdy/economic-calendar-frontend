import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Components/Login';
import Calendar from './Components/Calendar';
import Register from './Components/Register';
import Profil from './Components/Profil';
import AdminPanel from './Components/AdminPanel';


function App() {

  return (
    <>
       <nav>
          <Router>
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
