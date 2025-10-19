import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'patrol' | 'admin' | 'superAdmin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roleHierarchy = {
      user: 1,
      patrol: 2,
      admin: 3,
      superAdmin: 4
    };

    const userRoleLevel = roleHierarchy[userProfile.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
