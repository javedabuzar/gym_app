import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useGym } from '../context/GymContext';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

const Schedule = () => {
    const { classes, addClass, removeClass } = useGym();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', instructor: '', time: '06:00', day: 'Mon', duration: '60m', color: 'orange' });

    const handleAddClass = async () => {
        if (!newClass.name || !newClass.instructor) return alert("Fill all fields");
        const res = await addClass(newClass);
        if (res) {
            setShowAddForm(false);
            setNewClass({ name: '', instructor: '', time: '06:00', day: 'Mon', duration: '60m', color: 'orange' });
        } else {
            alert('Failed to add class');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Class Schedule</h2>
                    <p className="text-gray-400 mt-1">Manage weekly class timings and instructors</p>
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-gym-neon text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center gap-2">
                    <Plus size={20} />
                    Add Class
                </button>
            </div>

            {showAddForm && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-white mb-4">Add New Class</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input placeholder="Class Name" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                        <input placeholder="Instructor" value={newClass.instructor} onChange={e => setNewClass({ ...newClass, instructor: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                        <select value={newClass.day} onChange={e => setNewClass({ ...newClass, day: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                            {WEEK_DAYS.map(d => <option key={d} value={d} className="bg-gray-800">{d}</option>)}
                        </select>
                        <select value={newClass.time} onChange={e => setNewClass({ ...newClass, time: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                            {TIME_SLOTS.map(t => <option key={t} value={t} className="bg-gray-800">{t}</option>)}
                        </select>
                        <input placeholder="Duration (e.g. 60m)" value={newClass.duration} onChange={e => setNewClass({ ...newClass, duration: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                        <select value={newClass.color} onChange={e => setNewClass({ ...newClass, color: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                            <option value="orange" className="bg-gray-800">Orange</option>
                            <option value="purple" className="bg-gray-800">Purple</option>
                            <option value="red" className="bg-gray-800">Red</option>
                            <option value="blue" className="bg-gray-800">Blue</option>
                            <option value="green" className="bg-gray-800">Green</option>
                        </select>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={handleAddClass} className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11]">Save Class</button>
                    </div>
                </div>
            )}

            <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-8 border-b border-white/5 bg-black/40">
                            <div className="p-4 border-r border-white/5 text-gray-400 font-bold text-xs uppercase tracking-wider sticky left-0 bg-[#0a0a0a] z-10">Time</div>
                            {WEEK_DAYS.map(day => (
                                <div key={day} className="p-4 border-r border-white/5 text-center last:border-r-0">
                                    <span className="text-white font-black text-sm block tracking-widest uppercase">{day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="max-h-[600px] overflow-y-auto">
                            {TIME_SLOTS.map(time => (
                                <div key={time} className="grid grid-cols-8 border-b border-white/5 last:border-b-0 min-h-[100px]">
                                    <div className="p-4 border-r border-white/5 text-gray-500 text-xs font-bold sticky left-0 bg-[#0a0a0a] z-10 flex items-center justify-center">
                                        {time}
                                    </div>
                                    {WEEK_DAYS.map(day => {
                                        const classItem = classes.find(c => c.day === day && c.time === time);
                                        return (
                                            <div key={`${day}-${time}`} className="p-2 border-r border-white/5 last:border-r-0 relative group min-h-[100px]">
                                                {classItem && (
                                                    <div className={`
                                                        h-full rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg relative
                                                        ${classItem.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]' :
                                                            classItem.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]' :
                                                                classItem.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                                                                    classItem.color === 'pink' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.1)]' :
                                                                        classItem.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' :
                                                                            classItem.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
                                                                                'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]'}
                                                        border
                                                      `}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeClass(classItem.id); }}
                                                            className="absolute top-1 right-1 p-1 text-white/50 hover:text-white hover:bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                        <h4 className="font-bold text-xs mb-1 line-clamp-1">{classItem.name}</h4>
                                                        <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
                                                            <Users size={10} />
                                                            <span className="truncate">{classItem.instructor}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] opacity-70">
                                                            <Clock size={10} />
                                                            <span>{classItem.duration}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Schedule;
