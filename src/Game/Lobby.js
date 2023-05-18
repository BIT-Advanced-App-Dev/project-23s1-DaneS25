import { useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from '../firebase'

function Lobby() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  
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
        <div>{user?.email}</div>
      </div>
    </div>
  )  
}

export default Lobby