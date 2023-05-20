import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RingLoader from 'react-spinners/RingLoader';
import Login from './Login';
import RegisterPage from './Register';
import Lobby from "./Game/Lobby";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <div className="App">
      {loading ? (
        <div className="spinner-container">
          <RingLoader color="#123abc" loading={loading} />
        </div>
      ) : (
        <Router>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route exact path="/register" element={<RegisterPage />} />
            <Route exact path="/lobby" element={<Lobby />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
