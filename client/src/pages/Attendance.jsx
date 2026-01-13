import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, User, Loader2, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { getEmployees, getAttendance, markAttendance } from '../services/api';
import toast from 'react-hot-toast';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Mark attendance form
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Present');

    useEffect(() => {
        const fetchEmps = async () => {
            try {
                setInitialLoading(true);
                const res = await getEmployees();
                const employeesList = res.data || [];
                setEmployees(employeesList);
                if (employeesList.length > 0) {
                    setSelectedEmployee(employeesList[0].id);
                    setSelectedEmployeeData(employeesList[0]);
                }
            } catch (e) {
                toast.error("Failed to load employees");
                setEmployees([]);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchEmps();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            const emp = employees.find(e => e.id === selectedEmployee);
            setSelectedEmployeeData(emp);
            fetchAttendance(selectedEmployee);
        }
    }, [selectedEmployee, employees]);

    const fetchAttendance = async (empId) => {
        if (!empId) return;
        setLoading(true);
        try {
            const res = await getAttendance(empId);
            setAttendanceRecords(res.data || []);
        } catch (error) {
            toast.error('Failed to load attendance records');
            setAttendanceRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }

        // Validation
        const selectedDate = new Date(date);
        if (isFuture(selectedDate)) {
            toast.error('Cannot mark attendance for future dates');
            return;
        }

        setIsSubmitting(true);
        try {
            await markAttendance({
                employeeId: selectedEmployee,
                date,
                status
            });
            toast.success('Attendance marked successfully');
            setDate(new Date().toISOString().split('T')[0]); // Reset to today
            fetchAttendance(selectedEmployee);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(r => r.status === 'Present').length;
        const absent = total - present;
        const presentRate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
        return { total, present, absent, presentRate };
    }, [attendanceRecords]);

    // Check if date already has attendance
    const hasAttendanceForDate = useMemo(() => {
        return attendanceRecords.some(r => r.date === date);
    }, [attendanceRecords, date]);

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-400 font-bold">Loading Attendance System...</p>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="p-6 bg-slate-100 rounded-full">
                    <AlertCircle size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800">No Employees Found</h3>
                <p className="text-slate-500">Please add employees first to mark attendance</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Controls */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-6"
            >
                {/* Select Employee Card */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center space-x-2">
                            <User size={24} className="text-blue-600" />
                            <span>Select Employee</span>
                        </h3>
                        <div className="relative">
                            <select
                                value={selectedEmployee}
                                onChange={(e) => {
                                    const empId = e.target.value;
                                    setSelectedEmployee(empId);
                                }}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none appearance-none font-bold text-slate-700 transition-colors"
                            >
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name} ({emp.employee_id})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                ▼
                            </div>
                        </div>
                        {selectedEmployeeData && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200"
                            >
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Department</p>
                                <p className="font-bold text-slate-800">{selectedEmployeeData.department}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Stats Card */}
                {selectedEmployee && stats.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-black mb-4 flex items-center space-x-2">
                                <TrendingUp size={20} />
                                <span>Statistics</span>
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-80">Present Rate</span>
                                    <span className="text-2xl font-black">{stats.presentRate}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-80">Total Records</span>
                                    <span className="text-xl font-black">{stats.total}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                                        <div className="text-2xl font-black">{stats.present}</div>
                                        <div className="text-xs opacity-80">Present</div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                                        <div className="text-2xl font-black">{stats.absent}</div>
                                        <div className="text-xs opacity-80">Absent</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Mark Attendance Card */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center space-x-3 relative z-10">
                        <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <span>Mark Attendance</span>
                    </h3>

                    {hasAttendanceForDate && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl relative z-10"
                        >
                            <div className="flex items-center space-x-2">
                                <AlertCircle size={18} className="text-orange-600" />
                                <span className="text-sm font-bold text-orange-700">Attendance already marked for this date</span>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleMarkAttendance} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Select Date
                            </label>
                            <input
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none font-bold text-slate-700 transition-colors"
                            />
                            {isToday(new Date(date)) && (
                                <p className="text-xs text-blue-600 font-bold mt-1 flex items-center space-x-1">
                                    <Clock size={12} />
                                    <span>Today</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Status</label>
                            <div className="grid grid-cols-2 gap-4">
                                <motion.label
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        cursor-pointer p-4 rounded-xl border-2 flex items-center justify-center space-x-2 transition-all font-bold
                                        ${status === 'Present'
                                            ? 'bg-green-50 border-green-500 text-green-700 shadow-lg shadow-green-100'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-green-200 hover:bg-green-50/50'}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Present"
                                        checked={status === 'Present'}
                                        onChange={e => setStatus(e.target.value)}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                    <CheckCircle size={20} />
                                    <span>Present</span>
                                </motion.label>

                                <motion.label
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        cursor-pointer p-4 rounded-xl border-2 flex items-center justify-center space-x-2 transition-all font-bold
                                        ${status === 'Absent'
                                            ? 'bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-100'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50/50'}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Absent"
                                        checked={status === 'Absent'}
                                        onChange={e => setStatus(e.target.value)}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                    <XCircle size={20} />
                                    <span>Absent</span>
                                </motion.label>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            type="submit"
                            disabled={!selectedEmployee || isSubmitting || hasAttendanceForDate}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg shadow-slate-300 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Record</span>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>

            {/* Right Column: Attendance History */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 flex items-center space-x-2">
                                <Calendar size={24} className="text-blue-600" />
                                <span>Attendance History</span>
                            </h3>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                {selectedEmployeeData ? `${selectedEmployeeData.full_name}'s records` : 'Track daily presence marks'}
                            </p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-black text-slate-700">
                            {stats.total} Records
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <span className="font-bold">Loading History...</span>
                            </div>
                        ) : attendanceRecords.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center"
                            >
                                <div className="bg-slate-50 p-6 rounded-full mb-4">
                                    <Calendar size={48} className="text-slate-300" />
                                </div>
                                <h4 className="text-lg font-black text-slate-600 mb-2">No records found</h4>
                                <p className="text-sm">Start marking attendance to see history here.</p>
                            </motion.div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-6 font-black uppercase tracking-wider">Date</th>
                                            <th className="p-6 font-black uppercase tracking-wider">Day</th>
                                            <th className="p-6 font-black uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence>
                                            {attendanceRecords.map((record, index) => {
                                                const recordDate = new Date(record.date);
                                                const isTodayRecord = isToday(recordDate);
                                                return (
                                                    <motion.tr
                                                        key={record.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className={`hover:bg-slate-50/80 transition-colors ${isTodayRecord ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <td className="p-6">
                                                            <div className="font-black text-slate-800 text-lg">
                                                                {format(recordDate, 'MMMM do, yyyy')}
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                                                                {format(recordDate, 'EEEE')}
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-center">
                                                            {record.status === 'Present' ? (
                                                                <motion.span
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black bg-green-100 text-green-700 border-2 border-green-200 shadow-sm"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    <span>Present</span>
                                                                </motion.span>
                                                            ) : (
                                                                <motion.span
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black bg-red-100 text-red-700 border-2 border-red-200 shadow-sm"
                                                                >
                                                                    <XCircle size={16} />
                                                                    <span>Absent</span>
                                                                </motion.span>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Attendance;
