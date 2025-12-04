import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { Dashboard } from './components/Dashboard';
import { AuthView } from './types';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>(AuthView.LOGIN);

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

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
    >
      {currentView === AuthView.LOGIN && <LoginForm onViewChange={setCurrentView} />}
      {currentView === AuthView.REGISTER && <RegisterForm onViewChange={setCurrentView} />}
      {currentView === AuthView.FORGOT_PASSWORD && <ForgotPasswordForm onViewChange={setCurrentView} />}
    </AuthLayout>
  );
};

export default App;