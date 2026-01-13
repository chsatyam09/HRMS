import React, { useEffect, useState, useMemo } from 'react';
import { getLeaves, applyLeave, updateLeaveStatus, getEmployees } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Plus, Filter, Loader2, AlertCircle, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: 'bg-orange-100 text-orange-700 border-2 border-orange-200',
        Approved: 'bg-green-100 text-green-700 border-2 border-green-200',
        Rejected: 'bg-red-100 text-red-700 border-2 border-red-200',
    };
    const icons = {
        Pending: Clock,
        Approved: CheckCircle,
        Rejected: XCircle,
    };
    const Icon = icons[status];
    
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${styles[status]} shadow-sm`}
        >
            <Icon size={14} />
            <span>{status}</span>
        </motion.span>
    );
};

const Leaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        employeeId: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const refreshData = async () => {
        try {
            setLoading(true);
            const [leavesRes, empsRes] = await Promise.all([getLeaves(), getEmployees()]);
            setLeaves(leavesRes.data || []);
            setFilteredLeaves(leavesRes.data || []);
            setEmployees(empsRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
            setLeaves([]);
            setFilteredLeaves([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Filter logic
    useEffect(() => {
        let filtered = leaves;

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(leave => leave.status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(leave =>
                leave.Employee?.full_name?.toLowerCase().includes(query) ||
                leave.Employee?.employee_id?.toLowerCase().includes(query) ||
                leave.reason?.toLowerCase().includes(query)
            );
        }

        setFilteredLeaves(filtered);
    }, [searchQuery, statusFilter, leaves]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.employeeId || !formData.start_date || !formData.end_date || !formData.reason.trim()) {
            toast.error('Please fill all fields');
            return;
        }

        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isBefore(endDate, startDate)) {
            toast.error('End date must be after start date');
            return;
        }

        if (isBefore(startDate, today) && !isAfter(startDate, today)) {
            // Allow today but not past dates
            if (startDate.getTime() !== today.getTime()) {
                toast.error('Start date cannot be in the past');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await applyLeave(formData);
            toast.success('Leave request submitted successfully!');
            setIsModalOpen(false);
            setFormData({ employeeId: '', start_date: '', end_date: '', reason: '' });
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id, status, employeeName) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} ${employeeName}'s leave request?`)) {
            return;
        }
        try {
            await updateLeaveStatus(id, status);
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            refreshData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const stats = useMemo(() => {
        const pending = leaves.filter(l => l.status === 'Pending').length;
        const approved = leaves.filter(l => l.status === 'Approved').length;
        const rejected = leaves.filter(l => l.status === 'Rejected').length;
        return { pending, approved, rejected, total: leaves.length };
    }, [leaves]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-purple-600" size={48} />
                <p className="text-slate-400 font-bold">Loading Leave Requests...</p>
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
                        <Calendar size={32} className="text-purple-600" />
                        <span>Leave Management</span>
                    </h2>
                    <p className="text-slate-500 mt-1">Manage employee leave requests</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    disabled={employees.length === 0}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-purple-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={20} />
                    <span>New Request</span>
                </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Requests', value: stats.total, color: 'blue' },
                    { label: 'Pending', value: stats.pending, color: 'orange' },
                    { label: 'Approved', value: stats.approved, color: 'green' },
                    { label: 'Rejected', value: stats.rejected, color: 'red' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={`bg-white p-6 rounded-2xl shadow-xl border-b-4 border-${stat.color}-500`}
                    >
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-800">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
            >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by employee name, ID, or reason..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <XCircle size={18} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold shadow-lg flex items-center space-x-2 hover:bg-slate-200 transition-colors"
                        >
                            <Filter size={20} />
                            <span>Filter</span>
                        </motion.button>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-slate-200 overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-3">
                                {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
                                    <motion.button
                                        key={status}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                                            statusFilter === status
                                                ? 'bg-purple-600 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {status === 'all' ? 'All Status' : status}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-bold text-slate-600">
                        Showing <span className="text-purple-600">{filteredLeaves.length}</span> of{' '}
                        <span className="text-slate-800">{leaves.length}</span> requests
                    </p>
                </div>
            </motion.div>

            {/* Leaves Table */}
            {filteredLeaves.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-12 text-center"
                >
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-6 bg-slate-100 rounded-full">
                            <AlertCircle size={48} className="text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">
                                {leaves.length === 0 ? 'No Leave Requests Yet' : 'No Results Found'}
                            </h3>
                            <p className="text-slate-500">
                                {leaves.length === 0
                                    ? 'Start by submitting a leave request'
                                    : 'Try adjusting your search or filters'}
                            </p>
                        </div>
                        {leaves.length === 0 && employees.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                Create First Request
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-6 font-black text-slate-700 text-sm uppercase tracking-wide">Employee</th>
                                    <th className="p-6 font-black text-slate-700 text-sm uppercase tracking-wide">Duration</th>
                                    <th className="p-6 font-black text-slate-700 text-sm uppercase tracking-wide">Days</th>
                                    <th className="p-6 font-black text-slate-700 text-sm uppercase tracking-wide">Reason</th>
                                    <th className="p-6 font-black text-slate-700 text-sm uppercase tracking-wide">Status</th>
                                    <th className="p-6 font-black text-slate-700 text-sm uppercase tracking-wide text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                                <AnimatePresence>
                                    {filteredLeaves.map((leave, index) => {
                                        const startDate = new Date(leave.start_date);
                                        const endDate = new Date(leave.end_date);
                                        const days = differenceInDays(endDate, startDate) + 1;
                                        
                                        return (
                            <motion.tr
                                key={leave.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="hover:bg-slate-50/80 transition-colors"
                            >
                                <td className="p-6">
                                                    <div className="font-black text-slate-800">{leave.Employee?.full_name || 'N/A'}</div>
                                                    <div className="text-xs text-slate-400 font-mono mt-1">{leave.Employee?.employee_id || 'N/A'}</div>
                                </td>
                                <td className="p-6 text-sm">
                                                    <div className="font-bold text-slate-700">
                                                        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                                    </div>
                                </td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-black text-sm">
                                                        {days} {days === 1 ? 'day' : 'days'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm text-slate-600 max-w-xs truncate" title={leave.reason}>
                                                    {leave.reason}
                                                </td>
                                <td className="p-6">
                                    <StatusBadge status={leave.status} />
                                </td>
                                <td className="p-6 text-right space-x-2">
                                    {leave.status === 'Pending' && (
                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleStatusUpdate(leave.id, 'Approved', leave.Employee?.full_name)}
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                                title="Approve"
                                            >
                                                <CheckCircle size={20} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: -5 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleStatusUpdate(leave.id, 'Rejected', leave.Employee?.full_name)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Reject"
                                            >
                                                <XCircle size={20} />
                                                            </motion.button>
                                        </>
                                    )}
                                                    {leave.status !== 'Pending' && (
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {format(new Date(leave.updated_at || leave.created_at), 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                </td>
                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                    </tbody>
                </table>
            </div>
                </motion.div>
            )}

            {/* Modal */}
            <AnimatePresence>
            {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isSubmitting && setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                                <div className="flex items-center justify-between">
                                    <div>
                            <h3 className="text-2xl font-black text-slate-800">New Leave Request</h3>
                                        <p className="text-slate-500 text-sm mt-1">Submit a new leave request</p>
                                    </div>
                                    {!isSubmitting && (
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <XCircle size={20} className="text-slate-400" />
                                        </button>
                                    )}
                                </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Employee *</label>
                                <select
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-600 outline-none transition-colors font-medium"
                                    required
                                    value={formData.employeeId}
                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                        disabled={isSubmitting || employees.length === 0}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                                    ))}
                                </select>
                                    {employees.length === 0 && (
                                        <p className="text-xs text-red-600 mt-1">No employees available</p>
                                    )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-600 outline-none transition-colors font-medium"
                                        value={formData.start_date}
                                            onChange={e => {
                                                setFormData({ ...formData, start_date: e.target.value });
                                                if (formData.end_date && e.target.value > formData.end_date) {
                                                    setFormData(prev => ({ ...prev, end_date: e.target.value }));
                                                }
                                            }}
                                            disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">End Date *</label>
                                    <input
                                        type="date"
                                        required
                                            min={formData.start_date || new Date().toISOString().split('T')[0]}
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-600 outline-none transition-colors font-medium"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                            disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                                {formData.start_date && formData.end_date && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-3 bg-blue-50 border border-blue-200 rounded-xl"
                                    >
                                        <p className="text-sm font-bold text-blue-700">
                                            Duration: {differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1} days
                                        </p>
                                    </motion.div>
                                )}
                            <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Reason *</label>
                                <textarea
                                    required
                                        rows="4"
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-600 outline-none transition-colors font-medium resize-none"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Enter reason for leave..."
                                        disabled={isSubmitting}
                                    />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                    <motion.button
                                    type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                        className="flex-1 py-3 bg-purple-600 text-white font-black rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <span>Submit Request</span>
                                        )}
                                    </motion.button>
                            </div>
                        </form>
                        </motion.div>
                    </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default Leaves;
