import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-3 rounded-full border-2 border-blue-500/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
        <p className="mt-4 text-cyan-400 text-sm tracking-widest font-mono uppercase animate-pulse">Initializing MedAssist Security...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
