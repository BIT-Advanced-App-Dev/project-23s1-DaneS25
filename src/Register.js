import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { RingLoader } from 'react-spinners';
import { registerWithEmailAndPassword } from "./firebaseutils";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [loadingRegister, setLoadingRegister] = useState(false);

  // Registration feilds 
  const register = async () => {
    if (!name) {
      toast.error("Please enter a name");
      return; // Exit the function if name is not provided
    }

    if (!email) {
      toast.error("Please enter an email address");
      return; // Exit the function if email is not provided
    }

    if (!password) {
      toast.error("Please enter a password");
      return; // Exit the function if password is not provided
    }
  
    setLoadingRegister(true);
    await registerWithEmailAndPassword(name, email, password);
    setLoadingRegister(false);
  };
  
  // Logs into user after registration and navigates them to the lobby 
  useEffect(() => {
    if (user) {
      navigate("/lobby");
    }
  }, [user, loading, navigate]);

  return (
    <div className="register">
      <ToastContainer position="top-center" theme="dark" />
      {loadingRegister ? (
        <div className="spinner-container">
          <RingLoader color="#123abc" loading={true} />
        </div>
      ) : (
      <div className="register__container">
      <p className="registerHead">Register</p>
        <input
          type="text"
          className="register__textBox"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          data-testid="name-input"
        />
        <input
          type="text"
          className="register__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
          data-testid="email-input"
        />
        <input
          type="password"
          className="register__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          data-testid="password-input"
        />
        <button className="register__btn" data-testid="register-button" onClick={register}>
          Register
        </button>
      </div>
    )}
    </div>
  );
}
export default Register;