import { useEffect, useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import CreateBatch from '../batches/CreateBatch';
import OrderList from '../orders/OrderList';
import { useOrders } from '../../hooks/useOrders';
import { fetchBatches } from '../../utils/contractCalls';
import { motion } from 'framer-motion';
import BatchList from '../batches/BatchList';
import ExpiredBatches from '../batches/ExpiredBatches';

// Add this near the top of the file, after the imports
const BigInt = window.BigInt || global.BigInt;

export default function FarmerDashboard() {
  const { contract, account } = useWeb3();
  const [farmerData, setFarmerData] = useState(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const orders = useOrders(account);
  const [totalBatches, setTotalBatches] = useState(0);
  const [showExpiredBatches, setShowExpiredBatches] = useState(false);

  useEffect(() => {
    const loadFarmerData = async () => {
      setIsLoading(true);
      if (contract && account) {
        try {
          const data = await contract.farmers(account);
          const allBatches = await fetchBatches(contract);
          // Filter batches for current farmer and count only active ones
          const farmerBatches = allBatches.filter(
            batch => 
              batch.farmerAddress.toLowerCase() === account.toLowerCase() && 
              (BigInt(batch.flags) & BigInt(0x1)) === BigInt(0x1) && // Check if batch is active
              (BigInt(batch.flags) & BigInt(0x2)) === BigInt(0) &&    // Check if batch is not deleted
              Number(batch.expiryDate) > Math.floor(Date.now() / 1000) // Check if not expired
          );
          
          console.log('All batches:', allBatches);
          console.log('Farmer batches:', farmerBatches);
          console.log('Current account:', account);
          
          setTotalBatches(farmerBatches.length);
          setFarmerData({ ...data, batches: farmerBatches });
        } catch (error) {
          console.error("Error loading farmer data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadFarmerData();
  }, [contract, account]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-green-700 mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!farmerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 w-full max-w-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">Unable to load farmer data. Please check your connection.</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-xl shadow-lg mb-8">
        <div className="px-6 py-8 sm:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {farmerData.name || 'Farmer'}</h1>
              <p className="text-green-100">Manage your dairy business with real-time insights and secure transactions</p>
            </div>
            <button 
              onClick={() => setShowBatchForm(true)} 
              className="mt-4 md:mt-0 bg-white hover:bg-gray-100 text-green-800 font-semibold py-2 px-6 rounded-lg transition-all flex items-center shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Batch
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {['overview', 'orders', 'batches'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatsCard 
              title="Active Batches" 
              value={totalBatches} 
              description="Your current milk batches available in the marketplace" 
              icon="batch"
              color="green"
            />
            
            <StatsCard 
              title="Total Orders" 
              value={orders.length} 
              description="Orders made by buyers for your milk batches" 
              icon="orders"
              color="blue"
            />
            
            <StatsCard 
              title="Reputation" 
              value={farmerData.rating ? `${farmerData.rating}/5` : 'New'} 
              description="Your rating based on buyer feedback" 
              icon="star"
              color="amber"
              showStars={true}
            />
            
            <StatsCard 
              title="Total Earnings" 
              value="View" 
              description="Check your current earnings from sales" 
              icon="money"
              color="purple"
            />
          </motion.div>
        )}
        
        {activeTab === 'orders' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {orders.length} Orders
              </span>
            </div>
            {orders.length > 0 ? (
              <OrderList orders={orders} userRole="farmer" />
            ) : (
              <div className="text-center py-12">
                <div className="bg-blue-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When buyers purchase your milk batches, their orders will appear here.
                </p>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'batches' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Your Milk Batches</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExpiredBatches(!showExpiredBatches)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    showExpiredBatches 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showExpiredBatches ? 'Hide Expired' : 'Show Expired'}
                </button>
                <button 
                  onClick={() => setShowBatchForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Batch
                </button>
              </div>
            </div>
            
            {farmerData?.batches?.length > 0 ? (
              <BatchList 
                batches={farmerData.batches} 
                userRole="farmer" 
              />
            ) : (
              <div className="bg-white shadow rounded-xl p-6 text-center">
                <div className="bg-green-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Batches</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  You don't have any active milk batches right now. Add a new batch to get started.
                </p>
                <button 
                  onClick={() => setShowBatchForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Register New Batch
                </button>
              </div>
            )}
            
            {showExpiredBatches && <ExpiredBatches />}
          </motion.div>
        )}
        
        {/* Farmer Guide Section */}
        {activeTab === 'overview' && (
          <div className="bg-white shadow-md rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Farmer Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Register Milk Batches</h3>
                <p className="text-gray-600">Register your milk batches with details about quantity, price, and expiry date.</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Manage Orders</h3>
                <p className="text-gray-600">Review and manage incoming orders from buyers interested in your milk batches.</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Track Earnings</h3>
                <p className="text-gray-600">Monitor your earnings from sold milk batches in real-time.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Batch Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Register New Milk Batch</h2>
                <button 
                  onClick={() => setShowBatchForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CreateBatch onClose={() => setShowBatchForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for stats cards
function StatsCard({ title, value, description, icon, color, showStars }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
        color === 'green' ? 'border-green-600' :
        color === 'blue' ? 'border-blue-600' :
        color === 'amber' ? 'border-yellow-600' :
        'border-purple-600'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          {showStars && (
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < parseInt(value) ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
        <div className={`p-3 ${
          color === 'green' ? 'bg-green-100 text-green-600' :
          color === 'blue' ? 'bg-blue-100 text-blue-600' :
          color === 'amber' ? 'bg-yellow-100 text-yellow-600' :
          'bg-purple-100 text-purple-600'
        } rounded-full`}>
          <IconComponent name={icon} color={color} />
        </div>
      </div>
    </motion.div>
  );
}

// Helper for icons
function IconComponent({ name, color }) {
  const iconColor = 
    color === 'green' ? 'text-green-600' :
    color === 'blue' ? 'text-blue-600' :
    color === 'amber' ? 'text-yellow-600' :
    'text-purple-600';
  
  switch(name) {
    case 'batch':
      return (
        <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'orders':
      return (
        <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'star':
      return (
        <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'money':
      return (
        <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}