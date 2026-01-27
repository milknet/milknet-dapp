import React, { useState, useEffect } from 'react';
import { updateInventory, getInventory, getFarmProfile } from '../../utils/supabaseService';
import { motion } from 'framer-motion';

export default function Inventory({ walletAddress }) {
    const [items, setItems] = useState([]);
    const [farmId, setFarmId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({
        item_name: '',
        category: 'feed',
        quantity: '',
        unit: 'kg',
        cost: ''
    });

    useEffect(() => {
        const init = async () => {
            if (walletAddress) {
                try {
                    const profile = await getFarmProfile(walletAddress);
                    if (profile && profile.id) {
                        setFarmId(profile.id);
                        loadInventory(profile.id);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error initializing inventory:", error);
                    setLoading(false);
                }
            }
        };
        init();
    }, [walletAddress]);

    const loadInventory = async (id) => {
        try {
            const data = await getInventory(id);
            setItems(data || []);
        } catch (error) {
            console.error("Error loading inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!farmId) return;

        try {
            await updateInventory(farmId, newItem);
            setNewItem({
                item_name: '',
                category: 'feed',
                quantity: '',
                unit: 'kg',
                cost: ''
            });
            setShowForm(false);
            loadInventory(farmId);
        } catch (error) {
            alert("Error adding item: " + error.message);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading inventory...</div>;

    if (!farmId) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <p className="text-sm text-yellow-700">Please complete your Farm Profile first.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    {showForm ? 'Cancel' : 'Add Stock Item'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input type="text" required value={newItem.item_name} onChange={e => setNewItem({ ...newItem, item_name: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="e.g. Dairy Meal" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full p-2 border rounded-lg">
                                <option value="feed">Feed</option>
                                <option value="medicine">Medicine</option>
                                <option value="supplies">Supplies</option>
                                <option value="equipment">Equipment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" required value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} className="w-full p-2 border rounded-lg">
                                <option value="kg">kg</option>
                                <option value="liters">liters</option>
                                <option value="bags">bags</option>
                                <option value="units">units</option>
                                <option value="doses">doses</option>
                            </select>
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Optional)</label>
                            <input type="number" value={newItem.cost} onChange={e => setNewItem({ ...newItem, cost: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Cost per unit" />
                        </div>

                        <div className="lg:col-span-5 pt-2">
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Update Inventory</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                                    {item.quantity} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.last_updated).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                                    Inventory is empty. Add your feed, medicines, and supplies.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
