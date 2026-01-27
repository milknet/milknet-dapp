import React, { useState, useEffect } from 'react';
import { addProductionLog, getProductionLogs, getFarmProfile } from '../../utils/supabaseService';
import { motion } from 'framer-motion';

export default function ProductionLog({ walletAddress }) {
    const [logs, setLogs] = useState([]);
    const [farmId, setFarmId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newLog, setNewLog] = useState({
        date: new Date().toISOString().split('T')[0],
        morning_yield: '',
        evening_yield: '',
        fat_percentage: '',
        protein_percentage: '',
        temperature: '',
        animals_milked: ''
    });

    useEffect(() => {
        const init = async () => {
            if (walletAddress) {
                try {
                    // First get the farm profile ID
                    const profile = await getFarmProfile(walletAddress);
                    if (profile && profile.id) {
                        setFarmId(profile.id);
                        loadLogs(profile.id);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error initializing production logs:", error);
                    setLoading(false);
                }
            }
        };
        init();
    }, [walletAddress]);

    const loadLogs = async (id) => {
        try {
            const data = await getProductionLogs(id);
            setLogs(data || []);
        } catch (error) {
            console.error("Error loading logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!farmId) {
            alert("Please set up your Farm Profile first!");
            return;
        }

        try {
            const total = (parseFloat(newLog.morning_yield || 0) + parseFloat(newLog.evening_yield || 0)).toFixed(2);
            await addProductionLog(farmId, { ...newLog, total_yield: total });

            // Reset form and reload
            setNewLog({
                date: new Date().toISOString().split('T')[0],
                morning_yield: '',
                evening_yield: '',
                fat_percentage: '',
                protein_percentage: '',
                temperature: '',
                animals_milked: ''
            });
            loadLogs(farmId);
        } catch (error) {
            alert("Error adding log: " + error.message);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading production records...</div>;
    }

    if (!farmId) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Please complete your <strong>Farm Profile</strong> before adding production logs.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Input Form */}
            <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Daily Production Entry</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={newLog.date}
                            onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Morning Yield (L)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newLog.morning_yield}
                            onChange={(e) => setNewLog({ ...newLog, morning_yield: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Evening Yield (L)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newLog.evening_yield}
                            onChange={(e) => setNewLog({ ...newLog, evening_yield: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Animals Milked</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={newLog.animals_milked}
                            onChange={(e) => setNewLog({ ...newLog, animals_milked: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fat %</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 3.5"
                            value={newLog.fat_percentage}
                            onChange={(e) => setNewLog({ ...newLog, fat_percentage: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Protein %</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 3.2"
                            value={newLog.protein_percentage}
                            onChange={(e) => setNewLog({ ...newLog, protein_percentage: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 4.0"
                            value={newLog.temperature}
                            onChange={(e) => setNewLog({ ...newLog, temperature: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            Add Record
                        </button>
                    </div>
                </form>
            </div>

            {/* Logs Table */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Recent Production Records</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat / Protein</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.morning_yield} L</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.evening_yield} L</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{log.total_yield} L</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.fat_percentage}% / {log.protein_percentage}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.temperature}°C</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                                        No production records found. Start adding your daily records above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
