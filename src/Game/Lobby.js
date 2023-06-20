import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from '../firebase'
import { query, collection, where, getDocs } from 'firebase/firestore'
import GameManager from './GameManager'
import "./lobby.css";

function Lobby() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [loadingUserName, setLoadingUserName] = useState(true); 
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
  }, [user, loading, navigate]);

  const logout = async () => {
    await auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    if (user) {
      const getUserData = async () => {
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', user.uid)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserName(userData.name);
        } else {
          console.log('User document does not exist');
        }

        setLoadingUserName(false);
      };

      getUserData();
    }
  }, [user]);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });
  
    return unsubscribe;
  }, [navigate]);

  return (
    <div className='lobby'>
      <h1 className='head'>Lobby</h1>
      <button className="logout_btn" onClick={logout}>
        Logout
      </button>
      <div className="userDetails">
        Logged in as
        <div>{loadingUserName ? "Loading..." : userName}</div>
      </div>
      <GameManager userName={userName} />
    </div>
  )  
}

export default Lobby