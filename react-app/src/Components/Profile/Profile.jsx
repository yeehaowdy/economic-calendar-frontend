import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../../firebase";
import './Profile.css';
import '../Spinner.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');
      } else {
        navigate('/login');
      }
      setTimeout(() => {
        setLoading(false);
      }, 500);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `avatars/${user.uid}`);
    
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      setPhotoURL(url);
      showToast("Profile picture updated!");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(auth.currentUser, { displayName });
      showToast("Name updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      showToast("Update failed.", "error");
    }
  };

  if (loading) {
    return (
      <div className="mo-sync-container">
        <div className="mo-sync-content">
          <div className="mo-sync-spinner"></div>
          <div className="mo-syncing-text">LOADING</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">

      <div className={`profile-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <div className="profile-card">
        <header className="profile-header">
          <div className="avatar-container" onClick={handleImageClick}>
            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-overlay">UPDATE</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/jpeg, image/png, image/webp, image/heic, image/heif, .heic, .heif, .jpg, .jpeg, .png"
            />
          </div>
          <h1 className="profile-title">{displayName || 'User Profile'}</h1>
          <p className="profile-subtitle">{uploading ? 'UPLOADING...' : 'Account Settings'}</p>
        </header>

        <form className="profile-content" onSubmit={handleUpdateProfile}>
          <div className="profile-info-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="profile-input" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="profile-info-group">
            <label>Email Address</label>
            <div className="profile-value disabled">{user?.email}</div>
          </div>

          <button type="submit" className="profile-save-btn">Update Profile</button>
        </form>

        <footer className="profile-footer">
          <button className="profile-logout-btn" onClick={() => signOut(auth)}>
            Log Out
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Profile;