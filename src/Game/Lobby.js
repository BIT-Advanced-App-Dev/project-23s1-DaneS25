import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from '../firebase'
import { query, collection, where, getDocs } from 'firebase/firestore'
import GameManager from './GameManager'

function Lobby() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
  }, [user, loading, navigate]);

  const logout = async () => {
    console.log("Before sign out");
    await auth.signOut();
    console.log("After sign out");
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
          console.log('User Data:', userData); // Debug statement
          setUserName(userData.name);
        } else {
          console.log('User document does not exist'); // Debug statement
        }
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
      <header>Lobby</header>
      <button className="logout_btn" onClick={logout}>
        Logout
      </button>
      <div className="userDetails">
        Logged in as
        <div>{userName}</div>
      </div>
      <GameManager />
    </div>
  )  
}

export default Lobby