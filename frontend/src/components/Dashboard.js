import React, { useState, useEffect } from 'react';
import { useAuth, useProtectedApi } from '../contexts/AuthContext';

const propertyTypes = ['1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4+ BHK'];
const categories = [
  { id: 'residential', label: 'Residential', active: true },
  { id: 'commercial', label: 'Commercial', active: false },
  { id: 'shops', label: 'Shops', active: false },
  { id: 'bungalow', label: 'Bungalow', active: false },
  { id: 'rawHouse', label: 'Raw House', active: false },
  { id: 'villa', label: 'Villa', active: false },
  { id: 'pentHouse', label: 'Pent House', active: false },
  { id: 'plot', label: 'Plot', active: false }
];

const Dashboard = () => {
  const { user } = useAuth();
  const api = useProtectedApi();
  
  // States
  const [selectedCategory, setSelectedCategory] = useState('residential');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('new');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [subLocations, setSubLocations] = useState([]);
  const [selectedSubLocation, setSelectedSubLocation] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [isCosmo, setIsCosmo] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/location/stations');
        setStations(response.data.data);
      } catch (error) {
        setError('Error fetching stations');
      }
    };
    fetchStations();
  }, []);

  // Fetch sub-locations when station changes
  useEffect(() => {
    const fetchSubLocations = async () => {
      if (!selectedStation) return;
      try {
        const response = await api.get(`/location/sub-locations/${selectedStation}`);
        setSubLocations(response.data.data);
      } catch (error) {
        setError('Error fetching sub-locations');
      }
    };
    fetchSubLocations();
  }, [selectedStation]);

  // Fetch properties based on filters
  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/property', {
        params: {
          category: selectedCategory,
          type: listingType,
          propertyType,
          station: selectedStation,
          subLocation: selectedSubLocation,
          minBudget,
          maxBudget,
          isCosmo
        }
      });
      setProperties(response.data.data);
    } catch (error) {
      setError('Error fetching properties');
    } finally {
      setLoading(false);
    }
  };

  // Handle property selection for comparison
  const handlePropertySelect = (propertyId) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      return [...prev, propertyId];
    });
  };

  // Generate WhatsApp message for selected properties
  const shareOnWhatsApp = () => {
    const selectedProps = properties.filter(prop => 
      selectedProperties.includes(prop._id)
    );

    let message = `Hello! Mr ${user.fullName}\n`;
    message += `As per your requirement/Budget we have ${selectedProps.length} ${listingType} properties.\n\n`;
    message += `Sending ${selectedProps.length} selected properties:\n\n`;

    selectedProps.forEach(prop => {
      message += `✅ ${prop.buildingOrSociety}\n`;
      message += `* - ${prop.roadOrLocation}, `;
      if (prop.type === 'rental') {
        message += `Rent - ${prop.rent} / ${prop.deposit}\n\n`;
      } else if (prop.type === 'resale') {
        message += `Price - ${prop.expectedPrice}\n\n`;
      } else {
        message += `Package - ${prop.totalPackage}\n\n`;
      }
    });

    message += `\nDeals4Property\n`;
    message += `${user.fullName}\n`;
    message += `${user.phone}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Chrome-style Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => category.active && setSelectedCategory(category.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${category.active 
                  ? selectedCategory === category.id
                    ? 'border-yinmn-blue text-yinmn-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
                }
              `}
              disabled={!category.active}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Child Category Dropdown */}
      <div className="mt-6">
        <select
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm rounded-md"
        >
          <option value="new">New</option>
          <option value="resale">Resale</option>
          <option value="rental">Rental</option>
        </select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left-side Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm rounded-md"
            >
              <option value="">Select Type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Station
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm rounded-md"
            >
              <option value="">Select Station</option>
              {stations.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub Location
            </label>
            <select
              value={selectedSubLocation}
              onChange={(e) => setSelectedSubLocation(e.target.value)}
              disabled={!selectedStation}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm rounded-md"
            >
              <option value="">Select Sub Location</option>
              {subLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Budget Range
            </label>
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min Budget"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm rounded-md"
            />
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max Budget"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm rounded-md"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="cosmo"
              checked={isCosmo}
              onChange={(e) => setIsCosmo(e.target.checked)}
              className="h-4 w-4 text-yinmn-blue focus:ring-yinmn-blue border-gray-300 rounded"
            />
            <label htmlFor="cosmo" className="ml-2 block text-sm text-gray-700">
              Looking for Cosmo?
            </label>
          </div>

          <button
            onClick={fetchProperties}
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yinmn-blue hover:bg-yale-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yinmn-blue"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>

        {/* Property Listings */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {selectedProperties.length > 0 && (
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedProperties.length} properties selected
              </span>
              <button
                onClick={shareOnWhatsApp}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Share on WhatsApp
              </button>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No properties found matching your criteria</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {properties.map(property => (
                  <li key={property._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProperties.includes(property._id)}
                            onChange={() => handlePropertySelect(property._id)}
                            className="h-4 w-4 text-yinmn-blue focus:ring-yinmn-blue border-gray-300 rounded"
                          />
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-yinmn-blue">
                              {property.buildingOrSociety}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {property.roadOrLocation}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {property.type === 'rental' ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{property.rent}/month
                              </p>
                              <p className="text-sm text-gray-500">
                                Deposit: ₹{property.deposit}
                              </p>
                            </div>
                          ) : property.type === 'resale' ? (
                            <p className="text-sm font-medium text-gray-900">
                              ₹{property.expectedPrice}
                            </p>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">
                              ₹{property.totalPackage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {property.propertyType}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {property.station}
                          </p>
                        </div>
                        {property.type === 'new' && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>Possession: {new Date(property.possessionDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
