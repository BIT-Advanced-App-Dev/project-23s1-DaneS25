import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { RingLoader } from 'react-spinners';
import { logInWithEmailAndPassword } from "./firebaseutils";

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
    
        navigate("/Lobby");
      }

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="login">
      {loadingAuth ? (
        <div className="spinner-container">
          <RingLoader color="#123abc" loading={loadingAuth} />
        </div>
      ) : (
      <div className="login__container">
        <p className="loginHead">Login</p>
        <input
          type="text"
          className="login__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="login__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="login__btn" onClick={handleLogin}>
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
