import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { Dashboard } from './components/Dashboard';
import { AuthView } from './types';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Initialize view based on current URL path or query params
  const [currentView, setCurrentView] = useState<AuthView>(() => {
    if (typeof window !== 'undefined') {
       const path = window.location.pathname;
       const search = window.location.search;
       const params = new URLSearchParams(search);
       
       if (path.startsWith('/register') || params.get('ref')) {
         return AuthView.REGISTER;
       }
    }
    return AuthView.LOGIN;
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
       const path = window.location.pathname;
       if (path.startsWith('/register')) {
         setCurrentView(AuthView.REGISTER);
       } else {
         setCurrentView(AuthView.LOGIN);
       }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-800 font-medium animate-pulse">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  // Determine title and subtitle based on view
  let title = "Welcome Back";
  let subtitle = "Enter your details to access your account";

  if (currentView === AuthView.REGISTER) {
      title = "Create Account";
      subtitle = "Start your journey with Flipkart today";
  } else if (currentView === AuthView.FORGOT_PASSWORD) {
      title = "Reset Password";
      subtitle = "Don't worry, it happens to the best of us.";
  }

  // Helper to update URL history without reload
  const handleViewChange = (view: AuthView) => {
    setCurrentView(view);
    if (view === AuthView.REGISTER) {
      window.history.pushState({}, '', '/register');
    } else if (view === AuthView.LOGIN) {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
    >
      {currentView === AuthView.LOGIN && <LoginForm onViewChange={handleViewChange} />}
      {currentView === AuthView.REGISTER && <RegisterForm onViewChange={handleViewChange} />}
      {currentView === AuthView.FORGOT_PASSWORD && <ForgotPasswordForm onViewChange={handleViewChange} />}
    </AuthLayout>
  );
};

export default App;