import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const ProfilePage = () => {
  const { user, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);

  // FileReader API — convert uploaded image to base64 string
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      // Save to db.json
      await api.patch(`/users/${user.id}`, { avatar: base64 });
      // Update auth context so Navbar re-renders immediately
      updateAvatar(base64);
    };
    reader.readAsDataURL(file); // triggers onload with base64 result
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 400 }}>
      <h2>Profile</h2>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {user?.avatar
          ? <img src={user.avatar} alt="avatar" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
        }
        <br />
        <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => fileInputRef.current.click()}>
          Upload Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Role:</strong> {user?.role}</p>
    </div>
  );
};

export default ProfilePage;
