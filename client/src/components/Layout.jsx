import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Clock, LogOut, TrendingUp, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './SplashScreen';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active
                    ? 'bg-white shadow-lg text-blue-600'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
        >
            <Icon size={22} strokeWidth={active ? 3 : 2} />
            <span className="font-bold text-lg">{label}</span>
        </motion.div>
    </Link>
);

const Layout = ({ children }) => {
    const location = useLocation();
    const [showSplash, setShowSplash] = useState(true);

    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-screen bg-[#f1f5f9]"
        >
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: '16px',
                        background: '#333',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold',
                    },
                }}
            />

            {/* Dynamic Sidebar */}
            <aside className="w-80 bg-[#1e293b] text-white flex flex-col m-4 rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-800/50">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center space-x-3"
                    >
                        <div className="h-12 w-12 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-black">E</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">ETHARA<span className="text-blue-400">.AI</span></h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">HRMS Lite</p>
                        </div>
                    </motion.div>
                </div>

                <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
                    <SidebarItem
                        to="/"
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={location.pathname === '/' || location.pathname === '/dashboard'}
                    />
                    <SidebarItem
                        to="/employees"
                        icon={Users}
                        label="Employees"
                        active={location.pathname === '/employees'}
                    />
                    <SidebarItem
                        to="/attendance"
                        icon={CalendarCheck}
                        label="Attendance"
                        active={location.pathname === '/attendance'}
                    />
                    <SidebarItem
                        to="/leaves"
                        icon={Clock}
                        label="Leaves"
                        active={location.pathname === '/leaves'}
                    />
                    <SidebarItem
                        to="/reports"
                        icon={TrendingUp}
                        label="Reports"
                        active={location.pathname === '/reports'}
                    />
                    <SidebarItem
                        to="/settings"
                        icon={Settings}
                        label="Settings"
                        active={location.pathname === '/settings'}
                    />
                </nav>

                <div className="p-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors w-full px-6 py-4 bg-slate-800/50 rounded-2xl"
                    >
                        <LogOut size={20} />
                        <span className="font-bold">Logout</span>
                    </motion.button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-4 pl-0">
                <div className="h-full rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden flex flex-col">
                    <header className="px-10 py-8">
                        <div className="flex justify-between items-center">
                            <motion.h2
                                key={location.pathname}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-black text-slate-800 tracking-tight"
                            >
                                {location.pathname === '/' ? 'Dashboard' :
                                    location.pathname === '/employees' ? 'Team Members' :
                                        location.pathname === '/attendance' ? 'Daily Attendance' :
                                            location.pathname === '/leaves' ? 'Leave Management' :
                                                location.pathname === '/reports' ? 'Analytics & Reports' :
                                                    location.pathname === '/settings' ? 'Settings' :
                                                        'Dashboard'}
                            </motion.h2>
                            <div className="flex items-center space-x-6">
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-slate-800">Admin User</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Super Admin</span>
                                </div>
                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto px-10 pb-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default Layout;
