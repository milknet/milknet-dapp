import React, { useState, useEffect } from 'react';
import { addAnimal, getAnimals, getFarmProfile, uploadFile } from '../../utils/supabaseService';
import { BUCKETS } from '../../utils/supabase';
import { motion } from 'framer-motion';

export default function HerdManagement({ walletAddress }) {
    const [animals, setAnimals] = useState([]);
    const [farmId, setFarmId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newAnimal, setNewAnimal] = useState({
        tag_number: '',
        breed: '',
        birth_date: '',
        gender: 'female',
        status: 'active',
        avg_daily_yield: '',
        photo: null
    });

    useEffect(() => {
        const init = async () => {
            if (walletAddress) {
                try {
                    const profile = await getFarmProfile(walletAddress);
                    if (profile && profile.id) {
                        setFarmId(profile.id);
                        loadAnimals(profile.id);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error initializing herd:", error);
                    setLoading(false);
                }
            }
        };
        init();
    }, [walletAddress]);

    const loadAnimals = async (id) => {
        try {
            const data = await getAnimals(id);
            setAnimals(data || []);
        } catch (error) {
            console.error("Error loading animals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewAnimal({ ...newAnimal, photo: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!farmId) return;

        try {
            let photoUrl = null;
            if (newAnimal.photo) {
                const fileName = `${farmId}/${Date.now()}-${newAnimal.photo.name}`;
                photoUrl = await uploadFile(BUCKETS.ANIMAL_PHOTOS || 'animal-photos', newAnimal.photo, fileName);
            }

            const animalData = {
                tag_number: newAnimal.tag_number,
                breed: newAnimal.breed,
                birth_date: newAnimal.birth_date,
                gender: newAnimal.gender,
                status: newAnimal.status,
                avg_daily_yield: newAnimal.avg_daily_yield,
                photo_url: photoUrl
            };

            await addAnimal(farmId, animalData);

            setNewAnimal({
                tag_number: '',
                breed: '',
                birth_date: '',
                gender: 'female',
                status: 'active',
                avg_daily_yield: '',
                photo: null
            });
            setShowForm(false);
            loadAnimals(farmId);
        } catch (error) {
            alert("Error adding animal: " + error.message);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading herd records...</div>;

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
                <h2 className="text-xl font-bold text-gray-800">Herd Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    {showForm ? 'Cancel' : 'Add New Animal'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Number / ID</label>
                            <input type="text" required value={newAnimal.tag_number} onChange={e => setNewAnimal({ ...newAnimal, tag_number: e.target.value })} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                            <input type="text" value={newAnimal.breed} onChange={e => setNewAnimal({ ...newAnimal, breed: e.target.value })} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                            <input type="date" value={newAnimal.birth_date} onChange={e => setNewAnimal({ ...newAnimal, birth_date: e.target.value })} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select value={newAnimal.gender} onChange={e => setNewAnimal({ ...newAnimal, gender: e.target.value })} className="w-full p-2 border rounded-lg">
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avg Daily Yield (L)</label>
                            <input type="number" step="0.1" value={newAnimal.avg_daily_yield} onChange={e => setNewAnimal({ ...newAnimal, avg_daily_yield: e.target.value })} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2" />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Save Animal Record</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {animals.map(animal => (
                    <div key={animal.id} className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 hover:shadow-md transition">
                        <div className="h-48 bg-gray-200 w-full object-cover flex items-center justify-center text-gray-400">
                            {animal.photo_url ? (
                                <img src={animal.photo_url} alt={animal.tag_number} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900">{animal.tag_number}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${animal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {animal.status}
                                </span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p>Breed: <span className="font-medium">{animal.breed || 'N/A'}</span></p>
                                <p>Age: <span className="font-medium">{animal.birth_date ? new Date().getFullYear() - new Date(animal.birth_date).getFullYear() + ' yrs' : 'N/A'}</span></p>
                                <p>Avg Yield: <span className="font-medium">{animal.avg_daily_yield || '0'} L/day</span></p>
                            </div>
                        </div>
                    </div>
                ))}
                {animals.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        No animals registered yet. Click "Add New Animal" to start.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
