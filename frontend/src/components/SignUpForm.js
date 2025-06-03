import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import axios from 'axios';

const SignUpForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    reraNumber: '',
    state: '',
    city: '',
    password: '',
    confirmPassword: '',
    latitude: '',
    longitude: ''
  });

  // Load Google Maps Script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDmzDIeYZ2uxW1L317vDrWJ3zxEP8WB5ps',
    libraries: ['places']
  });

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get('/api/location/states');
        setStates(response.data.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) return;
      try {
        const response = await axios.get(`/api/location/cities/${formData.state}`);
        setCities(response.data.data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, [formData.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
    setFormData(prev => ({
      ...prev,
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!selectedLocation) {
      setError('Please select your location on the map');
      setLoading(false);
      return;
    }

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yinmn-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-yinmn-blue mb-6 text-center">
        Sign Up for EstateX
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                RERA Number
              </label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.iso2} value={state.iso2}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                disabled={!formData.state}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yinmn-blue"
              />
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Pin Your Location
          </label>
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <GoogleMap
              zoom={12}
              center={{ lat: 19.0760, lng: 72.8777 }} // Mumbai coordinates
              mapContainerClassName="w-full h-full"
              onClick={handleMapClick}
            >
              {selectedLocation && (
                <Marker
                  position={{ 
                    lat: selectedLocation.lat, 
                    lng: selectedLocation.lng 
                  }}
                />
              )}
            </GoogleMap>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-yinmn-blue hover:bg-yale-blue text-white font-medium rounded-md transition-colors duration-200 disabled:bg-gray-400"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
