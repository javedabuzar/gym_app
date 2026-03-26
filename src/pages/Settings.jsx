import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Upload, ShieldAlert, Trash2 } from 'lucide-react';
import { useGym } from '../context/GymContext';

const Settings = () => {
    const { baseGymFee, setBaseGymFee, backupData, restoreData, plans, addPlan, removePlan } = useGym();
    const fileInputRef = useRef(null);

    // Local state
    const [gymName, setGymName] = useState('Ultimate Cyber Blue Gym');
    const [localFee, setLocalFee] = useState(baseGymFee);

    useEffect(() => {
        setLocalFee(baseGymFee);
    }, [baseGymFee]);

    const handleSave = () => {
        setBaseGymFee(parseFloat(localFee));
        alert('Settings Saved!');
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const res = await restoreData(file);
        if (res.success) {
            alert('Data Restored Successfully!');
            window.location.reload(); // Reload to refresh all context data
        } else {
            alert('Restore Failed: ' + (res.error || res.message));
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h2 className="text-3xl font-bold text-white">Settings</h2>
                <p className="text-gray-400 mt-1">Configure your gym settings</p>
            </div>

            {/* General Settings */}
            <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 max-w-2xl">
                <h3 className="text-xl font-bold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Gym Name</label>
                        <input
                            type="text"
                            value={gymName}
                            onChange={(e) => setGymName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Default Member Fee (Rs)</label>
                        <input
                            type="number"
                            value={localFee}
                            onChange={(e) => setLocalFee(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                        />
                    </div>
                    <div className="pt-4">
                        <button onClick={handleSave} className="bg-gym-neon text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors flex items-center gap-2">
                            <Save size={20} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Membership Plans */}
            <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 max-w-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Membership Plans</h3>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                <span className="text-white font-medium">{plan.name}</span>
                                <span className="text-gym-neon text-sm">Rs. {plan.fee}</span>
                                <button 
                                    onClick={() => removePlan(plan.id)}
                                    className="text-red-400 hover:text-red-500 transition-colors ml-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Add New Plan</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Plan Name (e.g. Basic)"
                                id="newPlanName"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <input
                                type="number"
                                placeholder="Fee"
                                id="newPlanFee"
                                className="w-24 bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <button 
                                onClick={() => {
                                    const name = document.getElementById('newPlanName').value;
                                    const fee = document.getElementById('newPlanFee').value;
                                    if (name && fee) {
                                        addPlan({ name, fee: parseFloat(fee) });
                                        document.getElementById('newPlanName').value = '';
                                        document.getElementById('newPlanFee').value = '';
                                    }
                                }}
                                className="bg-gym-neon text-black px-4 py-2 rounded-xl font-bold hover:bg-[#2ecc11]"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Portability */}
            <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="text-yellow-500" size={24} />
                    <h3 className="text-xl font-bold text-white">Data Portability</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                    Mamber data sirf isi phone par save hai. Doosray phone mein data shift karnay ke liye backup download karein.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={backupData}
                        className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                        <Download size={20} className="text-gym-neon" />
                        Backup to File (.json)
                    </button>
                    
                    <button 
                        onClick={handleRestoreClick}
                        className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                        <Upload size={20} className="text-gym-neon" />
                        Restore from File
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            </div>
        </div>
    );
};

export default Settings;
