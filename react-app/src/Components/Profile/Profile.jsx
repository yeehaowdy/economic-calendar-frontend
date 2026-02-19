import React, { useState, useEffect } from 'react';

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Itt hívd meg a saját API végpontodat, ami a backend profile.js-t használja
        const response = await fetch(`/api/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('Nem sikerült lekérni a profiladatokat.');
        }

        const result = await response.json();
        
        if (result.success) {
          setUser(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) return <div>Betöltés...</div>;
  if (error) return <div>Hiba: {error}</div>;
  if (!user) return <div>Nincs megjeleníthető profil.</div>;

  return (
    <div className="profile-container">
      <header>
        <img 
          src={user.photoURL || 'https://via.placeholder.com/150'} 
          alt={`${user.displayName} profilképe`} 
        />
        <h1>{user.displayName}</h1>
        {user.admin && <span className="admin-badge">Adminisztrátor</span>}
      </header>

      <section className="profile-details">
        <div>
          <label>Rendszer ID:</label>
          <span>{user.id}</span>
        </div>
        
        <div>
          <label>E-mail cím:</label>
          <span>{user.email}</span>
        </div>

        <div>
          <label>Megjelenítendő név:</label>
          <span>{user.displayName}</span>
        </div>
      </section>
    </div>
  );
};

export default Profile;