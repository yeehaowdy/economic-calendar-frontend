import React, { useState, useEffect } from 'react';

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const URL = process.env.REACT_APP_BACKEND_URL

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Itt hívd meg a saját API végpontodat, ami a backend profile.js-t használja
        const response = await fetch(`${URL}/api/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('Could not get profile data.');
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

  if (loading) return <div className="mo-status-container">Loading...</div>;
  if (error) return <div className="mo-status-container mo-error">Error: {error}</div>;

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <div className="profile-pic-container">
          <img 
            className="profile-pic"
            src={user.photoURL || 'https://via.placeholder.com/150'} 
            alt="Profilkép" 
          />
        </div>
        <h1 className="profile-name">{user.displayName}</h1>
        {user.admin && <span className="admin-badge">Admin:</span>}
      </header>

      <div className="profile-info-list">
        <div className="profile-info-item">
          <span className="info-label">System ID</span>
          <span className="info-value">{user.id}</span>
        </div>
        
        <div className="profile-info-item">
          <span className="info-label">E-mail:</span>
          <span className="info-value">{user.email}</span>
        </div>

        <div className="profile-info-item">
          <span className="info-label">Display name:</span>
          <span className="info-value">{user.displayName}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;