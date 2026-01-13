import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Mail, Briefcase, User, Filter, X, Download, AlertCircle, Loader2 } from 'lucide-react';
import { getEmployees, deleteEmployee, addEmployee } from '../services/api';
import toast from 'react-hot-toast';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        department: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const departments = ['all', 'Engineering', 'HR', 'Sales', 'Marketing'];

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await getEmployees();
            setEmployees(res.data || []);
            setFilteredEmployees(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch employees');
            setEmployees([]);
            setFilteredEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let filtered = employees;

        // Department filter
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(emp => emp.department === selectedDepartment);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.full_name.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query) ||
                emp.employee_id.toLowerCase().includes(query) ||
                emp.department.toLowerCase().includes(query)
            );
        }

        setFilteredEmployees(filtered);
    }, [searchQuery, selectedDepartment, employees]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await deleteEmployee(id);
            toast.success('Employee deleted successfully');
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Validation
            if (!formData.employee_id.trim() || !formData.full_name.trim() || !formData.email.trim() || !formData.department) {
                toast.error('Please fill all fields');
                setIsSubmitting(false);
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error('Please enter a valid email address');
                setIsSubmitting(false);
                return;
            }

            await addEmployee(formData);
            toast.success('Employee added successfully');
            setIsModalOpen(false);
            setFormData({ employee_id: '', full_name: '', email: '', department: '' });
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    const departmentCounts = useMemo(() => {
        const counts = {};
        employees.forEach(emp => {
            counts[emp.department] = (counts[emp.department] || 0) + 1;
        });
        return counts;
    }, [employees]);

    const exportData = () => {
        const csv = [
            ['Employee ID', 'Full Name', 'Email', 'Department'],
            ...filteredEmployees.map(emp => [emp.employee_id, emp.full_name, emp.email, emp.department])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Data exported successfully');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-400 font-bold">Loading Team Members...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with Search and Actions */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
            >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, ID, or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
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
                        {filteredEmployees.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={exportData}
                                className="px-4 py-3 bg-green-100 text-green-700 rounded-xl font-bold shadow-lg flex items-center space-x-2 hover:bg-green-200 transition-colors"
                            >
                                <Download size={20} />
                                <span>Export</span>
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            <span>Add Employee</span>
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
                                {departments.map(dept => (
                                    <motion.button
                                        key={dept}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedDepartment(dept)}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                                            selectedDepartment === dept
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {dept === 'all' ? 'All Departments' : dept}
                                        {dept !== 'all' && departmentCounts[dept] && (
                                            <span className="ml-2 text-xs opacity-80">({departmentCounts[dept]})</span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-bold text-slate-600">
                        Showing <span className="text-blue-600">{filteredEmployees.length}</span> of{' '}
                        <span className="text-slate-800">{employees.length}</span> employees
                    </p>
                </div>
            </motion.div>

            {/* Employee List */}
            {filteredEmployees.length === 0 ? (
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
                                {employees.length === 0 ? 'No Employees Yet' : 'No Results Found'}
                            </h3>
                            <p className="text-slate-500">
                                {employees.length === 0
                                    ? 'Start by adding your first team member'
                                    : 'Try adjusting your search or filters'}
                            </p>
                        </div>
                        {employees.length === 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                Add First Employee
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredEmployees.map((emp, index) => (
                            <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative group overflow-hidden"
                            >
                                {/* Background gradient effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-16 -mt-16"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div
                                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                            transition={{ duration: 0.5 }}
                                            className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                        >
                                            <User size={32} />
                                        </motion.div>
                                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                            {emp.department}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-2">{emp.full_name}</h3>
                                    <div className="flex items-center space-x-2 text-slate-500 text-sm font-medium mb-4">
                                        <Mail size={16} />
                                        <span className="truncate">{emp.email}</span>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="font-mono text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                                            {emp.employee_id}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(emp.id, emp.full_name)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete employee"
                                        >
                                            <Trash2 size={20} />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Employee Modal */}
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
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">Add New Employee</h3>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Enter the details of the new team member.</p>
                                    </div>
                                    {!isSubmitting && (
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <X size={20} className="text-slate-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Employee ID *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.employee_id}
                                        onChange={e => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-colors font-medium"
                                        placeholder="e.g. EMP001"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-colors font-medium"
                                        placeholder="John Doe"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-colors font-medium"
                                        placeholder="john@ethara.ai"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Department *</label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-colors font-medium"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="HR">HR</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 font-bold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <span>Add Employee</span>
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

export default Employees;
