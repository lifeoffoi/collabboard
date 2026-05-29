import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI }   from '../context/UIContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <button className="sidebar-toggle" onClick={toggleSidebar}>&#9776;</button>
      <Link to="/" className="navbar-brand">CollabBoard</Link>
      {user && (
        <div className="navbar-right">
          <Link to="/profile" className="navbar-avatar">
            {user.avatar
              ? <img src={user.avatar} alt="avatar" />
              : <span className="avatar-placeholder">{user.name[0].toUpperCase()}</span>
            }
            <span>{user.name}</span>
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
