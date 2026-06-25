import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component to shield authenticated views.
 * Checks for a JWT token in localStorage. If the token exists,
 * it renders the nested child routes (via Outlet) or children components.
 * If not, it redirects the user to /login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
