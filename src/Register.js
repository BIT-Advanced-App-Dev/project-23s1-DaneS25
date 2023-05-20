import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { RingLoader } from 'react-spinners';
import { registerWithEmailAndPassword } from "./firebaseutils";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [loadingRegister, setLoadingRegister] = useState(false);

  const register = async () => {
    if (!name) {
      alert("Please enter a name");
      return; // Exit the function if name is not provided
    }
  
    setLoadingRegister(true);
    await registerWithEmailAndPassword(name, email, password);
    setLoadingRegister(false);
  };
  
  useEffect(() => {
    if (user) {
      navigate("/lobby");
    }
  }, [user, loading, navigate]);

  return (
    <div className="register">
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
        />
        <input
          type="text"
          className="register__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="register__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="register__btn" onClick={register}>
          Register
        </button>
      </div>
    )}
    </div>
  );
}
export default Register;