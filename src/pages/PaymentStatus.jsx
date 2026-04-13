import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Search, Users } from 'lucide-react';

const PaymentStatus = () => {
    const { members, updateMember } = useGym();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paidMembers = filteredMembers.filter(m => m.payment === 'Paid');
    const unpaidMembers = filteredMembers.filter(m => (m.payment || 'Unpaid') === 'Unpaid');

    const PaymentList = ({ title, list, icon: Icon, colorClass, emptyMessage }) => (
        <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex-1">
            <div className={`p-6 border-b border-white/5 flex items-center justify-between ${colorClass}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/20`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{title}</h2>
                        <p className="text-sm opacity-80">{list.length} Members</p>
                    </div>
                </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[600px]">
                {list.length > 0 ? (
                    <div className="space-y-3">
                        {list.map(member => (
                            <div key={member.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-white">{member.name}</h4>
                                        <span className="text-xs text-gray-400">ID: {member.id}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400">Fee</div>
                                    <div className="font-mono text-white mb-1">Rs. {member.fee}</div>
                                    {member.payment === 'Paid' ? (
                                        <button
                                            onClick={() => updateMember(member.id, { payment: 'Unpaid' })}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-xs font-bold"
                                        >
                                            Mark Unpaid
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateMember(member.id, { payment: 'Paid' })}
                                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-xs font-bold"
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>{emptyMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Payment Status</h2>
                    <p className="text-gray-400 mt-1">Track Paid vs Unpaid Memberships</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/members')}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >

                        <Users size={20} />
                        Members
                    </button>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-gym-neon/50"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <PaymentList
                    title="Paid Members"
                    list={paidMembers}
                    icon={CheckCircle}
                    colorClass="text-green-400 bg-green-500/10"
                    emptyMessage="No paid members found"
                />
                <PaymentList
                    title="Unpaid Members"
                    list={unpaidMembers}
                    icon={AlertCircle}
                    colorClass="text-red-400 bg-red-500/10"
                    emptyMessage="Outstanding payments clear!"
                />
            </div>
        </div>
    );
};

export default PaymentStatus;
