import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX, Search, Users } from 'lucide-react';

const MemberStatus = () => {
    const { members, updateMember } = useGym();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeMembers = filteredMembers.filter(m => (m.status || 'Active') === 'Active');
    const inactiveMembers = filteredMembers.filter(m => m.status === 'Inactive');

    const MemberList = ({ title, list, icon: Icon, colorClass, emptyMessage }) => (
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
                                    <img src={member.profile || `https://i.pravatar.cc/150?u=${member.name}`} alt={member.name} className="w-10 h-10 rounded-full bg-black/20 object-cover" />
                                    <div>
                                        <h4 className="font-bold text-white">{member.name}</h4>
                                        <p className="text-xs text-gray-400">ID: {member.id}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${colorClass.replace('text-white', '')} bg-black/20`}>
                                    {member.status || 'Active'}
                                </div>
                                {(member.status || 'Active') === 'Active' ? (
                                    <button
                                        onClick={() => updateMember(member.id, { status: 'Inactive' })}
                                        className="ml-4 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-xs font-bold"
                                    >
                                        Mark Inactive
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => updateMember(member.id, { status: 'Active' })}
                                        className="ml-4 p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-xs font-bold"
                                    >
                                        Mark Active
                                    </button>
                                )}
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
                    <h2 className="text-3xl font-bold text-white">Member Status</h2>
                    <p className="text-gray-400 mt-1"> Overview of Active vs Inactive Members</p>
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
                <MemberList
                    title="Active Members"
                    list={activeMembers}
                    icon={UserCheck}
                    colorClass="text-green-400 bg-green-500/10"
                    emptyMessage="No active members found"
                />
                <MemberList
                    title="Inactive Members"
                    list={inactiveMembers}
                    icon={UserX}
                    colorClass="text-red-400 bg-red-500/10"
                    emptyMessage="No inactive members found"
                />
            </div>
        </div>
    );
};

export default MemberStatus;
