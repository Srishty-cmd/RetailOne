import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
    setIsLoading(true);

    try {
      const data = await loginUser({ email: formData.email, password: formData.password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

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

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer accent-primary"
              checked={formData.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-text-sec cursor-pointer">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="#" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'} focus:outline-none focus:ring-4 focus:ring-primary-light transition-all duration-200 active:scale-[0.98]`}
        >
          {isLoading ? 'Signing in...' : 'Sign in to your account'}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-text-sec">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
          Register now
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Login;
