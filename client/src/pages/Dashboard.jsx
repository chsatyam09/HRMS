import React, { useEffect, useState } from 'react';
import { getDashboardStats, getEmployees } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CalendarCheck, Clock, CheckCircle, TrendingUp, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, delay = 0, isLoading = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.5, type: "spring" }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`bg-white p-6 rounded-2xl shadow-xl border-b-4 ${color} relative overflow-hidden group`}
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className={`p-4 rounded-2xl ${color.replace('border-', 'bg-').replace('500', '100')} text-slate-700 shadow-lg`}
                >
                    <Icon size={32} />
                </motion.div>
                <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</h4>
                    {isLoading ? (
                        <div className="h-10 w-20 bg-slate-200 rounded-lg animate-pulse"></div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: delay + 0.2, type: "spring" }}
                            className="text-4xl font-black text-slate-800"
                        >
                            {value}
                        </motion.div>
                    )}
                </div>
            </div>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="opacity-10"
            >
                <Icon size={60} />
            </motion.div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, pendingLeaves: 0 });
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [departmentStats, setDepartmentStats] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, employeesRes] = await Promise.all([
                getDashboardStats(),
                getEmployees()
            ]);
            setStats(statsRes.data);
            setEmployees(employeesRes.data);
            
            // Calculate department stats
            const deptMap = {};
            employeesRes.data.forEach(emp => {
                deptMap[emp.department] = (deptMap[emp.department] || 0) + 1;
            });
            setDepartmentStats(Object.entries(deptMap).map(([name, value]) => ({ name, value })));
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const attendanceData = [
        { name: 'Present', value: 10 },
        { name: 'Absent', value: 5 },
    ];

    const COLORS = ['#22c55e', '#ef4444'];
    const totalAttendance = attendanceData[0].value + attendanceData[1].value;
    const attendanceRate = totalAttendance > 0 
        ? ((attendanceData[0].value / totalAttendance) * 100).toFixed(1) 
        : 0;

    return (
        <div className="space-y-8">
            {/* Header with Refresh */}
            <div className="flex justify-between items-center">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black text-slate-800"
                >
                    Dashboard Overview
                </motion.h2>
                <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    <span className="font-bold text-slate-700">Refresh</span>
                </motion.button>
            </div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <StatCard
                    icon={Users}
                    label="Total Employees"
                    value={stats.totalEmployees}
                    color="border-blue-500"
                    delay={0}
                    isLoading={loading}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Present Today"
                    value={stats.presentToday}
                    color="border-green-500"
                    delay={0.1}
                    isLoading={loading}
                />
                <StatCard
                    icon={Clock}
                    label="Pending Leaves"
                    value={stats.pendingLeaves}
                    color="border-orange-500"
                    delay={0.2}
                    isLoading={loading}
                />
            </motion.div>

            {/* Charts and Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-800 flex items-center space-x-2">
                                <Activity size={24} className="text-blue-600" />
                                <span>Attendance Overview</span>
                            </h3>
                            <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                                <span className="text-sm font-bold text-green-700">{attendanceRate}% Present</span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : stats.totalEmployees === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                <AlertCircle size={48} className="mb-4" />
                                <p className="font-bold">No employees yet</p>
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={attendanceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1000}
                                        >
                                            {attendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        <div className="flex justify-center space-x-8 mt-4">
                            {attendanceData.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-center space-x-2"
                                >
                                    <div className={`w-4 h-4 rounded-full ${COLORS[index]}`}></div>
                                    <span className="text-sm font-bold text-slate-600">{item.name}: {item.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Department Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2 flex items-center space-x-2">
                            <TrendingUp size={28} />
                            <span>Department Stats</span>
                        </h3>
                        <p className="opacity-80 mb-6 text-sm">Employee distribution</p>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-8 bg-white/20 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : departmentStats.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="opacity-70">No departments yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {departmentStats.map((dept, index) => (
                                    <motion.div
                                        key={dept.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">{dept.name}</span>
                                            <span className="text-2xl font-black">{dept.value}</span>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(dept.value / stats.totalEmployees) * 100}%` }}
                                                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                                                className="bg-white h-2 rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-xl"
            >
                <h3 className="text-lg font-black text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: Users, label: 'View All Employees', color: 'bg-blue-500', path: '/employees' },
                        { icon: CalendarCheck, label: 'Mark Attendance', color: 'bg-green-500', path: '/attendance' },
                        { icon: Clock, label: 'Manage Leaves', color: 'bg-purple-500', path: '/leaves' },
                    ].map((action, index) => (
                        <motion.a
                            key={action.label}
                            href={action.path}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${action.color} text-white p-4 rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all`}
                        >
                            <action.icon size={24} />
                            <span className="font-bold">{action.label}</span>
                        </motion.a>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
