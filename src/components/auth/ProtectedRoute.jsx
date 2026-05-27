import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from './AuthService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  
  // Verificar autenticación y obtener datos actualizados
  const checkAuth = () => {
    const token = AuthService.getToken();
    
    if (!token) {
      return { authenticated: false, userRole: null };
    }

    const user = AuthService.getUserInfo();
    
    if (!user) {
      return { authenticated: false, userRole: null };
    }

    return { 
      authenticated: true, 
      userRole: user.role 
    };
  };

  const { authenticated, userRole } = checkAuth();

  if (!authenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirigir al dashboard correspondiente si no tiene el rol requerido
    const roleRoutes = {
      docente: '/dashboard/docente',
      estudiante: '/dashboard/estudiante',
      psicoorientador: '/dashboard/psicoorientador'
    };
    
    return <Navigate to={roleRoutes[userRole] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
