import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects already-logged-in users away from login/register pages
const PublicRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
