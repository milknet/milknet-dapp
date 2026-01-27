import React, { useState, useEffect } from 'react';
import { getFarmProfile, saveFarmProfile } from '../../utils/supabaseService';
import { motion } from 'framer-motion';

export default function FarmProfile({ walletAddress }) {
    const [profile, setProfile] = useState({
        farm_name: '',
        registration_number: '',
        farm_size: '',
        num_animals: '',
        phone: '',
        email: '',
        farm_type: 'individual'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (walletAddress) {
            loadProfile();
        }
    }, [walletAddress]);

    const loadProfile = async () => {
        try {
            const data = await getFarmProfile(walletAddress);
            if (data) setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await saveFarmProfile(walletAddress, profile);
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving profile: ' + error.message });
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-xl p-6"
        >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Farm Profile</h2>

            {message.text && (
                <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                        <input
                            type="text"
                            value={profile.farm_name}
                            onChange={(e) => setProfile({ ...profile, farm_name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                        <input
                            type="text"
                            value={profile.registration_number}
                            onChange={(e) => setProfile({ ...profile, registration_number: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Acres)</label>
                        <input
                            type="number"
                            value={profile.farm_size}
                            onChange={(e) => setProfile({ ...profile, farm_size: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Animals</label>
                        <input
                            type="number"
                            value={profile.num_animals}
                            onChange={(e) => setProfile({ ...profile, num_animals: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Type</label>
                        <select
                            value={profile.farm_type}
                            onChange={(e) => setProfile({ ...profile, farm_type: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="individual">Individual Farmer</option>
                            <option value="cooperative">Cooperative Member</option>
                            <option value="sacco">SACCO Member</option>
                            <option value="company">Registered Company</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
