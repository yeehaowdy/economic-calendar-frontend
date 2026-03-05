import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './Components/Navbar/Navbar';
import Login from './Components/Auth/Login';
import Calendar from './Components/Calendar/Calendar';
import Register from './Components/Auth/Register';
import Profile from './Components/Profile/Profile';
import AdminPanel from './Components/AdminPanel/AdminPanel';
import News from './Components/News/News';
import Markets from './Components/Markets/Markets';
import AdminRoute from './Components/AdminPanel/AdminRoute';
import Home from './Components/Home/Home';
import './App.css';


function App() {

  return (
    <>
       <nav>
          <Router>
              <NavBar />
              <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/news" element={<News/>}/>
                <Route path="/markets" element={<Markets/>}/>
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin_panel" element={<AdminRoute><AdminPanel/></AdminRoute>}/>
              </Routes>
          </Router>
      </nav>
    </>
  )
}

export default App
