import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getReports, getEmployees } from '../services/api';
import { TrendingUp, Users, Calendar, Download, Filter, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        department: 'all'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reportsRes, employeesRes] = await Promise.all([
                getReports(filters),
                getEmployees()
            ]);
            // Always set reports, even if data is empty/zero
            setReports(reportsRes.data || {
                totalEmployees: 0,
                totalAttendance: 0,
                presentCount: 0,
                absentCount: 0,
                attendanceRate: 0,
                departmentStats: [],
                monthlyTrend: []
            });
            setEmployees(employeesRes.data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Set empty reports structure on error so UI doesn't break
            setReports({
                totalEmployees: 0,
                totalAttendance: 0,
                presentCount: 0,
                absentCount: 0,
                attendanceRate: 0,
                departmentStats: [],
                monthlyTrend: []
            });
            if (error.response) {
                toast.error(error.response.data?.message || 'Failed to load reports');
            } else {
                toast.error('Failed to load reports');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const departments = ['all', ...new Set(employees.map(e => e.department))];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-400 font-bold">Generating Reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center space-x-2">
                        <TrendingUp size={32} className="text-blue-600" />
                        <span>Analytics & Reports</span>
                    </h2>
                    <p className="text-slate-500 mt-1">Comprehensive insights into your workforce</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2"
                >
                    <Filter size={20} />
                    <span>Refresh</span>
                </motion.button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                        <select
                            value={filters.department}
                            onChange={e => setFilters({ ...filters, department: e.target.value })}
                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept === 'all' ? 'All Departments' : dept}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {!reports || (reports.totalAttendance === 0 && reports.totalEmployees === 0) ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No data available for the selected period</p>
                    <p className="text-slate-400 text-sm mt-2">Try adjusting the date range or check if attendance has been marked</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Employees', value: reports.totalEmployees, icon: Users, color: 'blue' },
                            { label: 'Total Attendance', value: reports.totalAttendance, icon: Calendar, color: 'green' },
                            { label: 'Present', value: reports.presentCount, icon: TrendingUp, color: 'green' },
                            { label: 'Absent', value: reports.absentCount, icon: AlertCircle, color: 'red' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`bg-white p-6 rounded-2xl shadow-xl border-b-4 border-${stat.color}-500`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-3xl font-black text-slate-800 mt-2">{stat.value || 0}</p>
                                    </div>
                                    <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                                        <stat.icon size={24} className={`text-${stat.color}-600`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Attendance Rate */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-2xl shadow-xl"
                        >
                            <h3 className="text-xl font-black text-slate-800 mb-6">Attendance Rate</h3>
                            <div className="text-center">
                                <div className="text-6xl font-black text-blue-600 mb-4">
                                    {reports.attendanceRate}%
                                </div>
                                <p className="text-slate-500 font-bold">Overall Attendance</p>
                            </div>
                        </motion.div>

                        {/* Department Distribution */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-2xl shadow-xl"
                        >
                            <h3 className="text-xl font-black text-slate-800 mb-6">Department Distribution</h3>
                            {reports.departmentStats && reports.departmentStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={reports.departmentStats}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="total"
                                        >
                                            {reports.departmentStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-slate-400">
                                    <p>No department data</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Monthly Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl"
                        >
                            <h3 className="text-xl font-black text-slate-800 mb-6">Monthly Attendance Trend</h3>
                            {reports.monthlyTrend && reports.monthlyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={reports.monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="Total" />
                                        <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} name="Present" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-slate-400">
                                    <p>No trend data available</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
