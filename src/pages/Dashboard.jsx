import React from 'react';
import { useGym } from '../context/GymContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Download, Upload, Shield } from 'lucide-react';
import { useRef } from 'react';

const data = [
    { name: 'Mon', visits: 400, revenue: 2400 },
    { name: 'Tue', visits: 300, revenue: 1398 },
    { name: 'Wed', visits: 200, revenue: 9800 },
    { name: 'Thu', visits: 278, revenue: 3908 },
    { name: 'Fri', visits: 189, revenue: 4800 },
    { name: 'Sat', visits: 239, revenue: 3800 },
    { name: 'Sun', visits: 349, revenue: 4300 },
];

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20 transition-colors`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className="text-gym-neon flex items-center gap-1">
                <TrendingUp size={16} />
                {change}
            </span>
            <span className="text-gray-500">vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const { members, attendance, payments, onlineActiveMembers, backupData, restoreData } = useGym();
    const fileInputRef = useRef(null);

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm("Importing data will overwrite your current local data. Continue?")) {
            const res = await restoreData(file);
            if (res.success) {
                alert("Data imported successfully!");
                window.location.reload();
            } else {
                alert("Failed: " + res.message);
            }
        }
    };

    const totalMembers = members.length;
    const activeMembers = onlineActiveMembers.length > 0 ? onlineActiveMembers.length : members.filter(m => m.status === 'Active').length;

    // Calculate Revenue for Current Month from Payments Table
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // Local YYYY-MM
    const totalRevenue = payments
        .filter(p => p.month_year === currentMonth && p.status === 'Paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalAttendance = Object.values(attendance).flat().length;

    // Calculate weekly visits for chart (last 7 days)
    const getLast7Days = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);

            // Format as YYYY-MM-DD to match context/DB
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const visits = Object.values(attendance).filter(dates => dates.includes(dateStr)).length;
            result.push({ name: days[d.getDay()], visits, revenue: 0 });
        }
        return result;
    };

    const chartData = getLast7Days();

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Dashboard</h2>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">Welcome back, Admin</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        className="hidden"
                        accept=".json"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 sm:flex-none bg-white/5 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2 group"
                    >
                        <Upload size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        Import
                    </button>
                    <button
                        onClick={backupData}
                        className="flex-1 sm:flex-none bg-gym-neon text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2ecc11] transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 group"
                    >
                        <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                        Backup
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Members" value={totalMembers} change="0%" icon={Users} color="blue" />
                <StatCard title="Active Members" value={activeMembers} change="0%" icon={Activity} color="green" />
                <StatCard title="Fees Collected" value={`Rs. ${totalRevenue}`} change="0%" icon={DollarSign} color="yellow" />
                <StatCard title="Total Attendance" value={totalAttendance} change="0%" icon={Users} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6">Weekly Visits</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="visits" stroke="#39ff14" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6">Visits Bar</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="visits" fill="#00ffff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
