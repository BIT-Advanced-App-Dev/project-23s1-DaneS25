import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login';
import RegisterPage from './Register';
import Lobby from "./Game/Lobby";

function App() {
  return (
    <div className="App">
        <Router>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route exact path="/register" element={<RegisterPage />} />
            <Route exact path="/lobby" element={<Lobby />} />
          </Routes>
        </Router>
    </div>
  );
}

export default App;
