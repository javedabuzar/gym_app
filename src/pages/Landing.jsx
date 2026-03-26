import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, QrCode, ShieldCheck } from 'lucide-react';
import { useGym } from '../context/GymContext';
import InstallPWA from '../components/InstallPWA';

const plans = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 3000,
        description: 'Best for getting started'
    },
    {
        id: 'six_months',
        name: '6 Months',
        price: 15000,
        description: 'Best value for growing gyms'
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 32000,
        description: 'Best for long-term owners'
    }
];

const Landing = () => {
    const navigate = useNavigate();
    const { registerAdmin } = useGym();

    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        fullName: '',
        gymName: '',
        email: '',
        password: ''
    });

    const selectedPlanMeta = plans.find((p) => p.id === selectedPlan);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.gymName || !form.email || !form.password) {
            setMessage('Please fill all fields.');
            return;
        }

        setLoading(true);
        setMessage('');

        const result = await registerAdmin({
            ...form,
            planType: selectedPlan
        });

        if (result.success) {
            setMessage('Signup submitted. Pay using QR and wait for super admin approval.');
            setForm({ fullName: '', gymName: '', email: '', password: '' });
        } else {
            setMessage(result.message || 'Failed to create account.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
            {/* Top Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <img src="/logo.jpg" alt="Logo" className="h-10 w-auto" />
                    <div className="w-48 sm:w-64">
                         <InstallPWA />
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gym-neon/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-gym-neon/5 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">GYM ADMIN</span>
                        <br />
                        <span className="text-gym-neon drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">SOFTWARE</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed mb-10">
                        Elevate your gym management with our state-of-the-art administrative suite.
                        Choose your path below.
                    </p>
                </div>

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`group relative text-left p-8 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${selectedPlan === plan.id
                                ? 'border-gym-neon bg-gym-neon/10 shadow-[0_0_40px_rgba(57,255,20,0.15)]'
                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                                }`}
                        >
                            <div className="relative z-10">
                                <div className={`text-sm font-bold uppercase tracking-widest mb-4 ${selectedPlan === plan.id ? 'text-gym-neon' : 'text-gray-500'
                                    }`}>
                                    {plan.name}
                                </div>
                                <div className="text-4xl font-black mb-4 flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-gray-500">Rs.</span>
                                    <span>{plan.price.toLocaleString()}</span>
                                </div>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                                    {plan.description}
                                </p>
                                <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${selectedPlan === plan.id ? 'bg-gym-neon w-24' : 'bg-white/10'
                                    }`} />
                            </div>

                            {/* Decorative background glow on hover */}
                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gym-neon/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* Enrollment Form */}
                    <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black mb-2 italic">CREATE ACCOUNT</h2>
                            <p className="text-gray-500 font-medium">Power up your gym administration today.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-gym-neon/50 focus:ring-4 focus:ring-gym-neon/5 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Gym Name</label>
                                <input
                                    type="text"
                                    placeholder="Your gym identity"
                                    value={form.gymName}
                                    onChange={(e) => setForm({ ...form, gymName: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-gym-neon/50 focus:ring-4 focus:ring-gym-neon/5 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@gym.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-gym-neon/50 focus:ring-4 focus:ring-gym-neon/5 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter ml-1">Access Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-gym-neon/50 focus:ring-4 focus:ring-gym-neon/5 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-6 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-10 py-4 bg-gym-neon text-black rounded-2xl font-black text-lg hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {loading ? 'PROCESSING...' : 'INITIALIZE SETUP'}
                                </button>
                                <div className="text-sm">
                                    <span className="text-gray-500 uppercase font-bold tracking-tighter">Current Plan:</span>
                                    <span className="text-gym-neon font-black ml-2 text-base">{selectedPlanMeta?.name}</span>
                                </div>
                            </div>
                        </form>

                        {message && (
                            <div className={`mt-8 p-4 rounded-2xl border ${message.includes('success') || message.includes('submitted')
                                ? 'bg-gym-neon/10 border-gym-neon/20 text-gym-neon'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                } text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {message}
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                            <p className="text-gray-500 text-sm font-medium">Been here before?</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-white font-bold hover:text-gym-neon transition-colors flex items-center gap-2 group"
                            >
                                GO TO LOGIN <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Payment Side */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10">
                            <h2 className="text-2xl font-black mb-6 italic flex items-center gap-3">
                                SECURE PAYMENT
                                <span className="text-[10px] not-italic bg-white/10 px-2 py-0.5 rounded-full text-gray-400 align-middle">ENCRYPTED</span>
                            </h2>

                            <div className="relative group mb-8">
                                <div className="absolute -inset-1 bg-gradient-to-r from-gym-neon/20 to-transparent blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative bg-black/40 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-dashed border-gym-neon/20 rounded-2xl flex flex-col items-center justify-center gap-4 group-hover:border-gym-neon/40 transition-colors">
                                        <QrCode size={48} className="text-gym-neon opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[10px] font-black tracking-[0.2em] text-gray-600">SCAN TO PAY</span>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <div className="text-xl font-black mb-1">Rs. {selectedPlanMeta?.price.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Amount Due</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: <CheckCircle size={18} />, text: "Instant Account Creation" },
                                    { icon: <QrCode size={18} />, text: "Direct Merchant Transfer" },
                                    { icon: <ShieldCheck size={18} />, text: "Super Admin Verification" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 text-gray-400 group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gym-neon group-hover:bg-gym-neon/10 transition-colors">
                                            {item.icon}
                                        </div>
                                        <span className="text-sm font-bold">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gym-neon/5 p-6 rounded-3xl border border-gym-neon/10 space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                <span className="text-gym-neon font-black mr-1">NOTE:</span>
                                Your registration will be activated immediately after the super admin verifies the payment transaction.
                                Keep your transfer receipt handy.
                            </p>

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Support & Assistance</p>
                                <a
                                    href="https://wa.me/923278457578"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-gym-neon hover:text-white transition-colors group"
                                >
                                    <span className="text-sm font-black">03278457578</span>
                                    <span className="text-[10px] bg-gym-neon/20 px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-black transition-colors">WHATSAPP / CALL</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
