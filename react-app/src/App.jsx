import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Components/Login';
import Calandar from './Components/Calandar';
import Register from './Components/Register';
import Profil from './Components/Profil';
import AdminPanel from './Components/AdminPanel';


function App() {

  return (
    <>
       <nav>
          <Router>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/calandar" element={<Calandar />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/admin_panel" element={<AdminPanel/>}/>
              </Routes>
          </Router>

    </nav>
    </>
  )
}

export default App
