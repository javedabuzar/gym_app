import React, { useState, useRef } from 'react';
import { Search, Plus, MoreVertical, Trash2, CheckCircle, FileText, Download, QrCode, X, Camera, User, Phone, Activity, CreditCard, SwitchCamera, Calendar } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

const Members = () => {
    const navigate = useNavigate();
    try {
        const { members, plans, attendance, addMember, removeMember, markAttendance, unmarkAttendance, updateMember, getMemberAttendance, payments, togglePaymentStatus, updatePaymentStatus } = useGym();

        console.log('✅ Members component loaded!', { members });

        const [searchTerm, setSearchTerm] = useState('');
        const [showAddForm, setShowAddForm] = useState(false);
        const [selectedMemberReport, setSelectedMemberReport] = useState(null); // NEW: Report Modal Logic
        const [reportYear, setReportYear] = useState(new Date().getFullYear()); // NEW: Year Navigation
        const [isUnlockMode, setIsUnlockMode] = useState(false); // NEW: Manual Override
        const [isEditing, setIsEditing] = useState(false);
        const [currentMemberId, setCurrentMemberId] = useState(null);

        const [newMember, setNewMember] = useState({ name: '', contact: '', fee: '', plan: '', status: 'Active', payment: 'Unpaid', profile: '' });
        const [selectedMemberQR, setSelectedMemberQR] = useState(null);
        const [isCameraOpen, setIsCameraOpen] = useState(false);
        const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
        const videoRef = useRef(null);
        const canvasRef = useRef(null);

        const handleSaveMember = async () => {
            if (!newMember.name || !newMember.fee) return alert('Please fill all fields');

            if (isEditing && currentMemberId) {
                await updateMember(currentMemberId, newMember);
                setIsEditing(false);
                setCurrentMemberId(null);
            } else {
                const res = await addMember(newMember);
                if (!res) return alert('Failed to add member');
            }

            setNewMember({ name: '', contact: '', fee: '', plan: '', status: 'Active', payment: 'Unpaid', profile: '' });
            setShowAddForm(false);
        };

        const openEditForm = (member) => {
            setNewMember({
                name: member.name,
                contact: member.contact || '',

                fee: member.fee,
                plan: member.plan || '',
                status: member.status,
                profile: member.profile || ''
            });
            setCurrentMemberId(member.id);
            setIsEditing(true);
            setShowAddForm(true);
        };

        const handleMarkAttendance = async (id) => {
            // Use local date for consistency
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const attendance = getMemberAttendance(id);
            const isPresent = attendance.includes(today);

            if (isPresent) {
                if (window.confirm("Unmark attendance for today?")) {
                    const result = await unmarkAttendance(id);
                    alert(result.message);
                }
            } else {
                const result = await markAttendance(id);
                alert(result.message);
            }
        };

        const exportCSV = () => {
            if (!members || members.length === 0) return alert("No members");
            let csv = 'Name,Contact,Fee (Rs),Payment,Status\n';
            members.forEach(m => { csv += `${m.name},${m.contact || ''},${m.fee},${m.payment},${m.status}\n`; });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'members.csv';
            a.click();
            URL.revokeObjectURL(url);
        };

        const exportPDF = () => {
            if (!members || members.length === 0) return alert("No members");
            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.text("Gym Members", 14, 20);
            let y = 30;
            members.forEach(m => {
                doc.text(`${m.name} | ${m.contact || 'No Contact'} | Rs. ${m.fee} | ${m.status}`, 14, y);
                y += 10;
            });
            doc.save('members.pdf');
        };

        const filteredMembers = (members || []).filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const startCamera = async (mode = facingMode) => {
            setIsCameraOpen(true);
            // Stop any existing tracks before starting new ones
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: mode }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera");
                setIsCameraOpen(false);
            }
        };

        const switchCamera = async () => {
            const newMode = facingMode === 'user' ? 'environment' : 'user';
            setFacingMode(newMode);
            await startCamera(newMode);
        };

        const stopCamera = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            setIsCameraOpen(false);
        };

        const capturePhoto = () => {
            if (videoRef.current && canvasRef.current) {
                const context = canvasRef.current.getContext('2d');

                // Set a reasonable size for the profile picture (e.g., 400x400)
                const size = 400;
                canvasRef.current.width = size;
                canvasRef.current.height = size;

                // Center crop logic
                const videoWidth = videoRef.current.videoWidth;
                const videoHeight = videoRef.current.videoHeight;
                const videoRatio = videoWidth / videoHeight;

                let sx = 0, sy = 0, sWidth = videoWidth, sHeight = videoHeight;

                if (videoRatio > 1) {
                    // Video is wider than square
                    sWidth = videoHeight;
                    sx = (videoWidth - sWidth) / 2;
                } else {
                    // Video is taller than square
                    sHeight = videoWidth;
                    sy = (videoHeight - sHeight) / 2;
                }

                context.drawImage(videoRef.current, sx, sy, sWidth, sHeight, 0, 0, size, size);

                // Use slightly lower quality to ensure small payload
                const imageDateUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
                setNewMember({ ...newMember, profile: imageDateUrl });
                stopCamera();
            }
        };

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="w-full lg:w-auto text-center lg:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">Members</h2>
                        <p className="text-gray-400 mt-1 text-sm md:text-base">Manage gym members and subscriptions</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto bg-black/20 p-2 lg:p-0 rounded-2xl lg:bg-transparent">
                        <div className="flex gap-1 w-full sm:w-auto">
                            <button onClick={() => navigate('/status')} className="flex-1 sm:flex-none bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-2 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                <Activity size={16} /> Status
                            </button>
                            <button onClick={() => navigate('/payment')} className="flex-1 sm:flex-none bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                <CreditCard size={16} /> Pay
                            </button>
                        </div>

                        
                        <div className="hidden sm:block w-px h-6 bg-white/10 mx-1"></div>
                        
                        <div className="flex gap-1 w-full sm:w-auto">
                            <button onClick={exportCSV} className="flex-1 sm:flex-none bg-white/5 text-blue-400 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                <FileText size={16} /> CSV
                            </button>
                            <button onClick={exportPDF} className="flex-1 sm:flex-none bg-white/5 text-red-400 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                <Download size={16} /> PDF
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setShowAddForm(!showAddForm);
                                setIsEditing(false);
                                setNewMember({ name: '', contact: '', fee: '', plan: '', status: 'Active', payment: 'Unpaid', profile: '' });
                                stopCamera();
                            }}
                            className="w-full sm:w-auto bg-gym-neon text-black px-6 py-2.5 rounded-xl font-bold hover:bg-[#2ecc11] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)] flex items-center justify-center gap-2 mt-2 sm:mt-0"
                        >
                            <Plus size={20} />
                            Add Member
                        </button>
                    </div>
                </div>


                {/* Add Member Form */}
                {showAddForm && (
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Member' : 'Add New Member'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Camera Section */}
                            <div className="md:col-span-2 flex flex-col items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                {isCameraOpen ? (
                                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border-2 border-gym-neon">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 items-center">
                                            <button
                                                onClick={stopCamera}
                                                className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600"
                                                title="Cancel"
                                            >
                                                <X size={24} />
                                            </button>
                                            <button
                                                onClick={capturePhoto}
                                                className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 border-4 border-gray-300"
                                                title="Take Photo"
                                            >
                                                <div className="w-6 h-6 bg-black rounded-full" />
                                            </button>
                                            <button
                                                onClick={switchCamera}
                                                className="bg-gray-800/80 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 backdrop-blur-sm"
                                                title="Switch Camera"
                                            >
                                                <SwitchCamera size={24} />
                                            </button>
                                        </div>
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-black/50 border-2 border-dashed border-gray-500 flex items-center justify-center relative group">
                                            {newMember.profile ? (
                                                <img src={newMember.profile} alt="Profile Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-gray-500" />
                                            )}
                                        </div>
                                        <button
                                            onClick={startCamera}
                                            className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 flex items-center gap-2 transition-colors"
                                        >
                                            <Camera size={20} />
                                            {newMember.profile ? 'Retake Photo' : 'Take Photo'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <input
                                type="text"
                                placeholder="Member Name"
                                value={newMember.name}
                                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <input
                                type="text"
                                placeholder="Contact Number"
                                value={newMember.contact}
                                onChange={e => setNewMember({ ...newMember, contact: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            />
                            <input
                                type="number"
                                placeholder="Fee Amount"
                                value={newMember.fee}
                                onChange={e => setNewMember({ ...newMember, fee: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            />

                            <select
                                value={newMember.plan}
                                onChange={e => {
                                    const selectedPlan = plans.find(p => p.name === e.target.value);
                                    if (selectedPlan) {
                                        setNewMember({ ...newMember, plan: selectedPlan.name, fee: selectedPlan.fee });
                                    } else {
                                        setNewMember({ ...newMember, plan: e.target.value });
                                    }
                                }}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            >
                                <option value="" className="bg-gray-800">Select Plan</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.name} className="bg-gray-800">{plan.name} (Rs. {plan.fee})</option>
                                ))}
                                <option value="Custom" className="bg-gray-800">Custom</option>
                            </select>

                            <select
                                value={newMember.status}
                                onChange={e => setNewMember({ ...newMember, status: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-neon"
                            >
                                <option value="Active" className="bg-gray-800">Active</option>
                                <option value="Inactive" className="bg-gray-800">Inactive</option>
                            </select>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setShowAddForm(false); stopCamera(); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleSaveMember} className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11]">{isEditing ? 'Update Member' : 'Save Member'}</button>
                        </div>
                    </div>
                )}

                {/* Members Table */}
                <div className="bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-gym-neon/50 focus:ring-1 focus:ring-gym-neon/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-sm">
                                    <th className="px-6 py-4 font-medium">Member</th>

                                    <th className="px-6 py-4 font-medium">Fee</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Joined Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredMembers && filteredMembers.length > 0 ? (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { setReportYear(new Date().getFullYear()); setIsUnlockMode(false); setSelectedMemberReport(member); }}>
                                                <div className="flex items-center gap-3">
                                                    <img src={member.profile || `https://i.pravatar.cc/150?u=${member.name}`} alt={member.name} className="w-10 h-10 rounded-full bg-white/10 object-cover" />
                                                    <div>
                                                        <h4 className="text-white font-medium hover:text-gym-neon transition-colors">{member.name}</h4>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Phone size={12} />
                                                            <span>{member.contact || 'No Contact'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="font-medium text-gym-neon">Rs. {member.fee}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{member.plan || 'Custom Plan'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${member.status === 'Active' ? 'text-gym-neon' : 'text-gray-400'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(member.join_date || Date.now()).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setReportYear(new Date().getFullYear()); setIsUnlockMode(false); setSelectedMemberReport(member); }} className="p-2 bg-gym-neon/10 text-gym-neon rounded-lg hover:bg-gym-neon/20 transition-colors" title="View Report">
                                                    <FileText size={20} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); openEditForm(member); }} className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Edit Member">
                                                    <MoreVertical size={20} />
                                                </button>
                                                <button onClick={() => setSelectedMemberQR(member)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Show QR">
                                                    <QrCode size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(member.id)}
                                                    className={`p-2 rounded-lg transition-colors ${getMemberAttendance(member.id).includes(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
                                                        ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
                                                        : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                                                        }`}
                                                    title={getMemberAttendance(member.id).includes(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`) ? "Unmark Attendance" : "Mark Attendance"}
                                                >
                                                    {getMemberAttendance(member.id).includes(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`) ? <CheckCircle size={20} fill="currentColor" className="text-green-500" /> : <CheckCircle size={20} />}
                                                </button>
                                                <button onClick={() => removeMember(member.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove Member">
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            {members === undefined || members === null ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gym-neon"></div>
                                                    <p>Loading members...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <User size={48} className="text-gray-600" />
                                                    <p>No members found</p>
                                                    <p className="text-sm">Click "Add Member" to get started</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>



                {/* Member Report Modal */}
                {
                    selectedMemberReport && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => setSelectedMemberReport(null)}>
                            <div className="bg-gym-card border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gym-neon">
                                            <img src={selectedMemberReport.profile || `https://i.pravatar.cc/150?u=${selectedMemberReport.name}`} alt={selectedMemberReport.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedMemberReport.name}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => setReportYear(prev => prev - 1)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Calendar size={14} className="rotate-180" /></button>
                                                <div className="flex items-center gap-1 text-gym-neon text-sm font-bold">
                                                    <span>Annual Fee Report (</span>
                                                    <input
                                                        type="number"
                                                        value={reportYear}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) setReportYear(val);
                                                        }}
                                                        className="w-12 bg-transparent text-center focus:outline-none border-b border-white/20 focus:border-gym-neon transition-colors"
                                                    />
                                                    <span>)</span>
                                                </div>
                                                <button onClick={() => setReportYear(prev => prev + 1)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Calendar size={14} /></button>
                                            </div>
                                            <div className="flex gap-4 mt-2 items-center">
                                                <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                                    Paid: {payments?.filter(p => p.member_id === selectedMemberReport.id && p.status === 'Paid' && p.month_year.startsWith(String(reportYear))).length || 0}
                                                </span>
                                                <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                                    Unpaid: {12 - (payments?.filter(p => p.member_id === selectedMemberReport.id && p.status === 'Paid' && p.month_year.startsWith(String(reportYear))).length || 0)}
                                                </span>
                                                {/* Manual Override Toggle */}
                                                <button
                                                    onClick={() => setIsUnlockMode(!isUnlockMode)}
                                                    className={`ml-2 text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors ${isUnlockMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}
                                                >
                                                    {isUnlockMode ? (
                                                        <><span>🔓</span> Unlocked</>
                                                    ) : (
                                                        <><span>🔒</span> Locked</>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {isUnlockMode ? "Manual Override Active: Edit Any Month" : "Click any month to toggle payment status"}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedMemberReport(null)} className="text-gray-400 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-4 md:p-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                        {Array.from({ length: 12 }).map((_, i) => {
                                            const date = new Date(reportYear, i, 1);
                                            const monthName = date.toLocaleString('default', { month: 'short' });
                                            const monthKey = `${date.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
                                            
                                            const paymentRecord = payments?.find(p => p.member_id == selectedMemberReport.id && p.month_year === monthKey);
                                            const isPaid = paymentRecord?.status === 'Paid';
                                            const isExplicitUnpaid = paymentRecord?.status === 'Unpaid';
                                            const currentMonthKey = new Date().toISOString().slice(0, 7);
                                            const isPast = monthKey < currentMonthKey;
                                            const canEdit = monthKey === currentMonthKey || isUnlockMode;

                                            let statusColor = "bg-white/5 border-white/10 text-gray-500";
                                            let statusIcon = null;
                                            let statusText = "Future";

                                            if (isPaid) {
                                                statusColor = "bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
                                                statusIcon = <CheckCircle size={14} />;
                                                statusText = "Paid";
                                            } else if (isExplicitUnpaid || (isPast && !isPaid)) {
                                                statusColor = "bg-red-500/10 border-red-500/30 text-red-500";
                                                statusIcon = <X size={14} />;
                                                statusText = "Unpaid";
                                            } else if (monthKey === currentMonthKey) {
                                                statusColor = "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 animate-pulse";
                                                statusIcon = <Activity size={14} />;
                                                statusText = "Pending";
                                            }

                                            const memberAttendance = attendance[selectedMemberReport.id] || [];
                                            const daysPresent = memberAttendance.filter(dateStr => dateStr.startsWith(monthKey)).length;

                                            return (
                                                <div key={i} onClick={async () => {
                                                    if (!canEdit) return;
                                                    await togglePaymentStatus(selectedMemberReport.id, monthKey);
                                                }} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${canEdit ? 'hover:scale-105 cursor-pointer active:scale-95' : 'opacity-60 cursor-not-allowed'} ${statusColor}`}>
                                                    <span className="text-xs font-black uppercase tracking-widest">{monthName}</span>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold">
                                                        {statusIcon}
                                                        <span>{statusText}</span>
                                                    </div>
                                                    <div className="mt-1 text-[9px] text-center border-t border-white/5 pt-1 w-full opacity-60">
                                                        {daysPresent} Days
                                                    </div>
                                                    <div className="flex gap-1 mt-1 w-full scale-90 sm:scale-100 origin-center">
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (canEdit) await updatePaymentStatus(selectedMemberReport.id, monthKey, 'Paid');
                                                            }}
                                                            className={`flex-1 py-0.5 text-[8px] font-black rounded ${isPaid ? 'bg-green-500 text-black' : 'bg-white/5'}`}
                                                            disabled={isPaid || !canEdit}
                                                        >
                                                            PAID
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (canEdit) await updatePaymentStatus(selectedMemberReport.id, monthKey, 'Unpaid');
                                                            }}
                                                            className={`flex-1 py-0.5 text-[8px] font-black rounded ${isExplicitUnpaid ? 'bg-red-500 text-white' : 'bg-white/5'}`}
                                                            disabled={isExplicitUnpaid || !canEdit}
                                                        >
                                                            FAIL
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-6 bg-black/40 border-t border-white/10 flex justify-end">
                                    <button onClick={() => setSelectedMemberReport(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                                        Close Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* QR Modal */}
                {
                    selectedMemberQR && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMemberQR(null)}>
                            <div className="bg-white p-8 rounded-2xl text-center relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setSelectedMemberQR(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                                    <X size={24} />
                                </button>
                                <h3 className="text-2xl font-bold text-black mb-2">{selectedMemberQR.name}</h3>
                                <p className="text-gray-500 mb-6">Scan to mark attendance</p>
                                <div className="flex justify-center mb-6">
                                    <QRCodeCanvas value={String(selectedMemberQR.id)} size={200} />
                                </div>
                                <p className="text-xs text-gray-400">ID: {selectedMemberQR.id}</p>
                            </div>
                        </div>
                    )
                }
            </div >
        );
    } catch (error) {
        console.error('❌ Members component error:', error);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Members</h2>
                    <p className="text-gray-400 mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
};

export default Members;