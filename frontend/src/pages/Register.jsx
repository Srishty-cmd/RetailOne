import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { registerUser } from '../services/authService';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Cashier'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setServerError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await registerUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Start managing your retail business today."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{serverError}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="fullName">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-border-main focus:border-primary focus:ring-primary-light'} rounded-lg text-text-main shadow-sm focus:outline-none focus:ring-4 transition-all duration-200`}
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Email Field */}
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
              className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-border-main focus:border-primary focus:ring-primary-light'} rounded-lg text-text-main shadow-sm focus:outline-none focus:ring-4 transition-all duration-200`}
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.email}
            </p>
          )}
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="role">
            Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Shield className="w-5 h-5" />
            </div>
            <select
              id="role"
              name="role"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border border-border-main focus:border-primary focus:ring-primary-light rounded-lg text-text-main shadow-sm focus:outline-none focus:ring-4 transition-all duration-200 appearance-none`}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Cashier">Cashier</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Password Fields Wrapper - grid on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="password">
              Password
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="confirmPassword">
              Confirm Password
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
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'} focus:outline-none focus:ring-4 focus:ring-primary-light transition-all duration-200 active:scale-[0.98] mt-6`}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-text-sec">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Register;
