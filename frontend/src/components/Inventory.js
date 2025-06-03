import React, { useState, useEffect } from 'react';
import { useAuth, useProtectedApi } from '../contexts/AuthContext';

const propertyTypes = ['1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4+ BHK'];
const furnishingTypes = ['unfurnished', 'semifurnished', 'furnished'];
const parkingTypes = ['none', 'open', 'covered'];

const Inventory = () => {
  const { user } = useAuth();
  const api = useProtectedApi();
  const [activeTab, setActiveTab] = useState('resale');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    type: activeTab,
    category: 'residential',
    buildingOrSociety: '',
    roadOrLocation: '',
    station: '',
    subLocation: '',
    propertyType: '',
    isCosmo: false,
    // Resale specific
    expectedPrice: '',
    floorNo: '',
    flatNo: '',
    contactName: '',
    contactNumber: '',
    isDirect: false,
    // Rental specific
    rent: '',
    deposit: '',
    furnishing: 'unfurnished',
    buildingNo: '',
    totalFloors: '',
    wing: '',
    propertyAge: '',
    amenities: '',
    parking: 'none',
    availableFrom: '',
    ownership: '',
    masterBedrooms: '',
    images: [],
    videoUrl: ''
  });

  // Fetch broker's inventory
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/property/my-inventory');
      setProperties(response.data.data);
    } catch (error) {
      setError('Error fetching properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          Array.from(formData.images).forEach(file => {
            formDataToSend.append('images', file);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await api.post('/property', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Property added successfully');
      fetchProperties();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding property');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: activeTab,
      category: 'residential',
      buildingOrSociety: '',
      roadOrLocation: '',
      station: '',
      subLocation: '',
      propertyType: '',
      isCosmo: false,
      expectedPrice: '',
      floorNo: '',
      flatNo: '',
      contactName: '',
      contactNumber: '',
      isDirect: false,
      rent: '',
      deposit: '',
      furnishing: 'unfurnished',
      buildingNo: '',
      totalFloors: '',
      wing: '',
      propertyAge: '',
      amenities: '',
      parking: 'none',
      availableFrom: '',
      ownership: '',
      masterBedrooms: '',
      images: [],
      videoUrl: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yinmn-blue">My Inventory</h2>
        <p className="mt-1 text-gray-600">Manage your property listings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resale')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'resale'
                ? 'border-yinmn-blue text-yinmn-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Resale
          </button>
          <button
            onClick={() => setActiveTab('rental')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'rental'
                ? 'border-yinmn-blue text-yinmn-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Rental
          </button>
        </nav>
      </div>

      {/* Form */}
      <div className="mt-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Building/Society Name
              </label>
              <input
                type="text"
                name="buildingOrSociety"
                value={formData.buildingOrSociety}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Road/Location
              </label>
              <input
                type="text"
                name="roadOrLocation"
                value={formData.roadOrLocation}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
              >
                <option value="">Select Type</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Type-specific Fields */}
            {activeTab === 'resale' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expected Price (₹)
                  </label>
                  <input
                    type="number"
                    name="expectedPrice"
                    value={formData.expectedPrice}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Floor Number
                  </label>
                  <input
                    type="text"
                    name="floorNo"
                    value={formData.floorNo}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Flat Number
                  </label>
                  <input
                    type="text"
                    name="flatNo"
                    value={formData.flatNo}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rent (₹/month)
                  </label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deposit (₹)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Furnishing
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
                  >
                    {furnishingTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Media Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Images
              </label>
              <input
                type="file"
                name="images"
                onChange={handleInputChange}
                multiple
                accept="image/*"
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yinmn-blue focus:border-yinmn-blue sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isCosmo"
              checked={formData.isCosmo}
              onChange={handleInputChange}
              className="h-4 w-4 text-yinmn-blue focus:ring-yinmn-blue border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Is this a Cosmo property?
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yinmn-blue hover:bg-yale-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yinmn-blue"
            >
              {loading ? 'Adding Property...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>

      {/* Property Listings */}
      <div className="mt-12">
        <h3 className="text-lg font-medium text-gray-900">My Properties</h3>
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yinmn-blue mx-auto"></div>
            </div>
          ) : properties.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No properties added yet</p>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {properties.map(property => (
                  <li key={property._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-yinmn-blue">
                            {property.buildingOrSociety}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {property.roadOrLocation}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Status: 
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${property.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : property.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {property.propertyType}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {property.type === 'rental' 
                              ? `₹${property.rent}/month`
                              : `₹${property.expectedPrice}`
                            }
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          Added on {new Date(property.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
