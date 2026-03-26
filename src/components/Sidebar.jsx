import React from 'react';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, FileText, QrCode, FlaskConical, Bike, Dumbbell, Notebook, Activity, CreditCard, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import InstallPWA from './InstallPWA';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useGym();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
        { icon: Users, label: 'Members', path: '/app/members' },
        { icon: Dumbbell, label: 'Training', path: '/app/training' },
        { icon: Calendar, label: 'Schedule', path: '/app/schedule' },
        { icon: FileText, label: 'Reports', path: '/app/reports' },
        { icon: QrCode, label: 'QR Scan', path: '/app/scan' },
        { icon: FlaskConical, label: 'Supplements', path: '/app/supplements' },
        { icon: Bike, label: 'Cardio', path: '/app/cardio' },
        { icon: Notebook, label: 'Plans', path: '/app/plans' },
        { icon: FileText, label: 'Slip / Invoice', path: '/app/invoice' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
        <div className={`h-screen w-64 bg-black/60 backdrop-blur-2xl border-r border-white/10 flex flex-col py-6 fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-10 px-6 lg:justify-center">
                <img src="/logo.jpg" alt="PRO FLEX FITNESS GYM" className="h-16 lg:h-20 w-auto object-contain drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-white/50 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar px-4 min-h-0">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-gym-neon/10 text-gym-neon shadow-[0_0_15px_rgba(57,255,20,0.1)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_#39ff14]' : ''} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-2 space-y-2 px-4 pb-4">
                <InstallPWA />
                <Link
                    to="/app/settings"
                    onClick={handleLinkClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </Link>
                <button
                    onClick={() => {
                        handleLogout();
                        handleLinkClick();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};


export default Sidebar;
