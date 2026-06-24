import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { resetPassword } from '../services/authService';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!strongPasswordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      setServerError('Reset token is missing from URL.');
      return;
    }

    setErrors({});
    setServerError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await resetPassword(token, formData.password);
      setSuccessMsg('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AuthLayout 
      title="Create new password" 
      subtitle="Enter your new secure password below."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
            <p>{successMsg}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="password">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-border-main focus:border-primary focus:ring-primary-light'} rounded-lg text-text-main shadow-sm focus:outline-none focus:ring-4 transition-all duration-200`}
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.password}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-border-main focus:border-primary focus:ring-primary-light'} rounded-lg text-text-main shadow-sm focus:outline-none focus:ring-4 transition-all duration-200`}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'} focus:outline-none focus:ring-4 focus:ring-primary-light transition-all duration-200 active:scale-[0.98]`}
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
