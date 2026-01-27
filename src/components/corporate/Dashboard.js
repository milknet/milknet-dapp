import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function CorporateDashboard() {
    const { user } = useAuth();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [productionLogs, setProductionLogs] = useState([]);
    const [view, setView] = useState('list'); // 'list' or 'farmer_detail'

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const { data, error } = await supabase
                .from('farm_profiles')
                .select('*');

            if (error) throw error;
            setFarmers(data || []);
        } catch (error) {
            console.error('Error fetching farmers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFarmerLogs = async (farmId) => {
        try {
            const { data, error } = await supabase
                .from('production_logs')
                .select('*')
                .eq('farm_id', farmId)
                .order('date', { ascending: false });

            if (error) throw error;
            setProductionLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const handleCreatePayment = async (farmer) => {
        // This would typically involve calculating amount owed from un-paid production logs
        // and interacting with the smart contract to pay the 'wallet_address'
        // For now, we'll placeholder this flow
        alert(`Initiating payment to ${farmer.farm_name} (${farmer.wallet_address})\n\nThis feature requires smart contract integration for bulk payments.`);
    };

    const viewFarmerDetails = async (farmer) => {
        setSelectedFarmer(farmer);
        await fetchFarmerLogs(farmer.id);
        setView('farmer_detail');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl shadow-lg mb-8 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Corporate Dashboard</h1>
                <p className="opacity-80">Welcome, {user?.name || 'Corporate User'}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold">Total Farmers</h3>
                        <p className="text-3xl font-bold">{farmers.length}</p>
                    </div>
                    {/* Placeholders for aggregate stats */}
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold">Total Output</h3>
                        <p className="text-3xl font-bold">-- L</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold">Pending Payments</h3>
                        <p className="text-3xl font-bold">-- KES</p>
                    </div>
                </div>
            </div>

            {view === 'list' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white shadow-md rounded-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Registered Farmers</h2>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Export Data</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animals</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {farmers.map(farmer => (
                                    <tr key={farmer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{farmer.farm_name}</div>
                                            <div className="text-sm text-gray-500">{farmer.registration_number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Location is not in supabase table yet, mock or fetch from contract if needed */}
                                            Kenya
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{farmer.farm_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farmer.num_animals}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => viewFarmerDetails(farmer)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleCreatePayment(farmer)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Pay
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {farmers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No farmers registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {view === 'farmer_detail' && selectedFarmer && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <button
                        onClick={() => setView('list')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Farmer List
                    </button>

                    <div className="bg-white shadow-md rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedFarmer.farm_name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <p><strong>Wallet:</strong> {selectedFarmer.wallet_address}</p>
                            <p><strong>Registration:</strong> {selectedFarmer.registration_number}</p>
                            <p><strong>Phone:</strong> {selectedFarmer.phone}</p>
                            <p><strong>Email:</strong> {selectedFarmer.email}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800">Production History</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Yield (L)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality (F/P)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {productionLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{log.total_yield}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.fat_percentage}% / {log.protein_percentage}%</td>
                                    </tr>
                                ))}
                                {productionLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No production logs available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
