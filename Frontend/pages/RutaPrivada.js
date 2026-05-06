import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './UserContext';

export default function RutaPrivada({ children }) {
  const { usuario } = useContext(UserContext);

  if (!usuario) return <Navigate to="/login" replace />;

  return children || <Outlet />;
}
