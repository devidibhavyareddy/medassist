import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute restricts access based on user role.
 * Maps user roles: admin, doctor, receptionist, labTechnician, patient
 */
const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const userRole = user?.role;

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to their default dashboard
    const roleRoutes = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/receptionist/dashboard',
      labTechnician: '/lab/dashboard',
      patient: '/patient/dashboard',
    };
    return <Navigate to={roleRoutes[userRole] || '/'} replace />;
  }

  return children;
};

export default RoleRoute;
