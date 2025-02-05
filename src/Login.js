import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { RingLoader } from 'react-spinners';
import { logInWithEmailAndPassword } from "./firebaseutils";
import { ToastContainer, toast } from "react-toastify";
import "./login.css";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (user) {
      navigate("/Lobby");
    } else {
      setLoadingAuth(false);
    }
  }, [user, loading, navigate]);

  // Login to existing authenticated user
  const handleLogin = async () => {
    try {
      await logInWithEmailAndPassword(email, password);
  
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
    
        if (!userDoc.exists()) {
          // Create a user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            uid: user.uid,
            name: user.displayName,
            authProvider: "local"
          });
        }
        // Navigate to lobby upon login
        navigate("/Lobby");
      }

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="login">
      <ToastContainer position="top-center" theme="dark" />
      {loadingAuth ? (
        <div className="spinner-container">
          <RingLoader color="#123abc" loading={loadingAuth} />
        </div>
      ) : (
      <div className="login__container">
        <h1 className="loginHead">Login</h1>
        <input
          type="text"
          className="login__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
          data-testid="email-input"
        />
        <input
          type="password"
          className="login__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          data-testid="password-input"
        />
        <button className="login__btn" data-testid="login-button" onClick={handleLogin}>
          Login
        </button>
        <div>
          Don't have an account? <Link to="/register">Register</Link> now.
        </div>
      </div>
    )}
    </div>
  );
}

export default Login;
