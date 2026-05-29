import { NavLink } from 'react-router-dom';
import { useUI }   from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { sidebarOpen } = useUI();
  const { user } = useAuth();

  if (!sidebarOpen) return null;

  return (
    <aside className="sidebar">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Projects</NavLink>
      <NavLink to="/profile"  className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
      {user?.role === 'admin' && (
        <span className="sidebar-badge">Admin</span>
      )}
    </aside>
  );
};

export default Sidebar;
