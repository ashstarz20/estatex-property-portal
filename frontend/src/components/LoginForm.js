import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-yinmn-blue">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Log in to access your EstateX account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-gray-700 font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue transition-colors duration-200"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-yinmn-blue focus:ring-yinmn-blue border-gray-300 rounded"
              />
              <label 
                htmlFor="remember" 
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a 
                href="#" 
                className="font-medium text-yinmn-blue hover:text-yale-blue transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-yinmn-blue hover:bg-yale-blue text-white font-medium rounded-md transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Log In'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-yinmn-blue hover:text-yale-blue transition-colors duration-200"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Protected by EstateX
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-center text-gray-500">
            By logging in, you agree to our{' '}
            <a href="#" className="text-yinmn-blue hover:text-yale-blue">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-yinmn-blue hover:text-yale-blue">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
