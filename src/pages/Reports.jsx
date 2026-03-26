import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Reports = () => {
    const { members, attendance, monthlyReports } = useGym();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const reportData = useMemo(() => {
        if (!selectedMonth) return null;
        const [year, month] = selectedMonth.split('-').map(Number);

        let totalAttendance = 0;
        let feesCollected = 0;
        let feesPending = 0;

        const memberStats = members.map(m => {
            const memberAttendanceDates = attendance[m.id] || [];
            const daysAttended = memberAttendanceDates.filter(d => {
                const date = new Date(d);
                return date.getFullYear() === year && date.getMonth() === month - 1;
            }).length;

            totalAttendance += daysAttended;
            if (m.payment === 'Paid') feesCollected += Number(m.fee);
            else feesPending += Number(m.fee);

            return {
                name: m.name,
                attendance: daysAttended,
                feesPaid: m.payment === 'Paid' ? Number(m.fee) : 0
            };
        });

        const onlineReport = monthlyReports?.find(r => r.month_year === selectedMonth);

        return {
            totalMembers: onlineReport ? onlineReport.member_count : members.length,
            totalAttendance,
            feesCollected: onlineReport ? Number(onlineReport.revenue_collected) : feesCollected,
            feesPending: onlineReport ? Number(onlineReport.revenue_pending) : feesPending,
            memberStats
        };
    }, [selectedMonth, members, attendance, monthlyReports]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Monthly Report</h2>
                    <p className="text-gray-400 mt-1">View stats and charts for a specific month</p>
                </div>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-gym-card text-white border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-gym-neon"
                />
            </div>

            {reportData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-sm">Total Members</p>
                            <h3 className="text-2xl font-bold text-white">{reportData.totalMembers}</h3>
                        </div>
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-sm">Total Attendance</p>
                            <h3 className="text-2xl font-bold text-white">{reportData.totalAttendance}</h3>
                        </div>
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-sm">Fees Collected</p>
                            <h3 className="text-2xl font-bold text-gym-neon">Rs. {reportData.feesCollected}</h3>
                        </div>
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-sm">Fees Pending</p>
                            <h3 className="text-2xl font-bold text-red-400">Rs. {reportData.feesPending}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6">Attendance per Member</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.memberStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#666" axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="attendance" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Days" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6">Fees Paid per Member</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.memberStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#666" axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="feesPaid" fill="#00ff6a" radius={[4, 4, 0, 0]} name="Amount" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
