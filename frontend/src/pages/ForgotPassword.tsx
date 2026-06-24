import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { forgotPassword } from '../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('A recovery link has been logged to the server console.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset your password" 
      subtitle="Enter your email to receive a password recovery link."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
            <p>{success}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border ${error ? 'border-red-500 focus:ring-red-200' : 'border-border-main focus:border-primary focus:ring-primary-light'} rounded-lg text-text-main shadow-sm focus:outline-none focus:ring-4 transition-all duration-200`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'} focus:outline-none focus:ring-4 focus:ring-primary-light transition-all duration-200 active:scale-[0.98]`}
        >
          {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-text-sec">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
