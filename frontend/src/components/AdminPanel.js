import React, { useState, useEffect } from 'react';
import { useAuth, useProtectedApi } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const api = useProtectedApi();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState([]);
  const [propertyAnalytics, setPropertyAnalytics] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'brokers':
        fetchBrokers();
        break;
      case 'properties':
        fetchPendingProperties();
        break;
      case 'analytics':
        fetchAnalytics();
        break;
      default:
        break;
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      setError('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/brokers');
      setBrokers(response.data.data);
    } catch (error) {
      setError('Error fetching brokers');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pending-properties');
      setPendingProperties(response.data.data);
    } catch (error) {
      setError('Error fetching pending properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [subscriptionRes, propertyRes] = await Promise.all([
        api.get('/admin/subscription-analytics'),
        api.get('/admin/property-analytics')
      ]);
      setSubscriptionAnalytics(subscriptionRes.data.data);
      setPropertyAnalytics(propertyRes.data.data);
    } catch (error) {
      setError('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyReview = async (propertyId, status, remarks = '') => {
    try {
      await api.patch(`/admin/properties/${propertyId}/review`, {
        status,
        remarks
      });
      fetchPendingProperties();
    } catch (error) {
      setError('Error updating property status');
    }
  };

  const handleBrokerStatus = async (brokerId, status) => {
    try {
      await api.patch(`/admin/brokers/${brokerId}/status`, { status });
      fetchBrokers();
    } catch (error) {
      setError('Error updating broker status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yinmn-blue">Admin Panel</h2>
        <p className="mt-1 text-gray-600">Manage brokers and property listings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'brokers', 'properties', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-yinmn-blue text-yinmn-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Content based on active tab */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yinmn-blue"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            {activeTab === 'dashboard' && stats && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Brokers
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.totalBrokers}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Properties
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.totalProperties}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Pending Properties
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.pendingProperties}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Subscriptions
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.activeSubscriptions}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Brokers List */}
            {activeTab === 'brokers' && (
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Broker
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {brokers.map((broker) => (
                            <tr key={broker._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {broker.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  RERA: {broker.reraNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {broker.email}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {broker.phone}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {broker.city}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {broker.state}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${broker.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {broker.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleBrokerStatus(
                                    broker._id,
                                    broker.status === 'active' ? 'inactive' : 'active'
                                  )}
                                  className="text-yinmn-blue hover:text-yale-blue"
                                >
                                  {broker.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Properties */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                {pendingProperties.map((property) => (
                  <div key={property._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {property.buildingOrSociety}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Added by {property.owner.fullName}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Location
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {property.roadOrLocation}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Property Type
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {property.propertyType}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Category
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {property.category}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Type
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {property.type}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => handlePropertyReview(property._id, 'approved')}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePropertyReview(property._id, 'rejected')}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Subscription Analytics */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Subscription Analytics
                  </h3>
                  <div className="space-y-4">
                    {subscriptionAnalytics.map((item) => (
                      <div key={item._id} className="flex justify-between items-center">
                        <span className="text-gray-600">{item._id}</span>
                        <span className="text-gray-900 font-medium">
                          Count: {item.count} | Revenue: ₹{item.totalRevenue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Analytics */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Property Analytics
                  </h3>
                  <div className="space-y-4">
                    {propertyAnalytics.map((item) => (
                      <div key={`${item._id.category}-${item._id.type}-${item._id.status}`} className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {item._id.category} - {item._id.type} ({item._id.status})
                        </span>
                        <span className="text-gray-900 font-medium">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
