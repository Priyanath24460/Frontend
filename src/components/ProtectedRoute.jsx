import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
          <p className="mt-4 text-stone-300">Loading...</p>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
