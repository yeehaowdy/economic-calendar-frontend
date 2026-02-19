import React, { useState, useEffect } from 'react';
import "./Profile.css";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const style1 = {
        padding: "10px 20px",
        cursor: "pointer",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "5px"
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //ellenőrizzük van e bejelentkezett felhasználó
                const user = auth.currentUser;
                if (user) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.log("This document does not exist");
                    }
                } else {
                    //visszairányítjuk a loginra
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error when fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error when signing out:", error);
        }
    };

    if (loading) return <div className="users">Loading...</div>;

    return (
        <div className="users">
            <h2>Manage profile</h2>
            
            {userData ? (
                <div className="profile-info">
                    <img 
                        src={userData.photoURL || "BACKEND!!"} 
                        alt="Profile" 
                        style={{ width: "150px", borderRadius: "50%", marginBottom: "10px" }}
                    />
                    <p><strong>Name:</strong> {userData.displayname}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                </div>
            ) : (
                <p>Could not find user data.</p>
            )}

            <button onClick={handleLogout} style={style1}>Log out</button>
        </div>
    );
};

export default Profile;