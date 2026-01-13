import axios from 'axios';
import toast from 'react-hot-toast';

// Use relative path in production (same domain), or env variable, or localhost for dev
const API_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout. Please try again.');
        } else if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || 'An error occurred';
            if (error.response.status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            // Request made but no response
            toast.error('Network error. Please check your connection.');
        } else {
            toast.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
    }
);

export const getEmployees = () => api.get('/employees');
export const addEmployee = (data) => api.post('/employees', data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export const markAttendance = (data) => api.post('/attendance', data);
export const getAttendance = (employeeId) => api.get(`/attendance/${employeeId}`);

// Leaves
export const getLeaves = () => api.get('/leaves');
export const applyLeave = (data) => api.post('/leaves', data);
export const updateLeaveStatus = (id, status) => api.patch(`/leaves/${id}`, { status });

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// Reports
export const getReports = (params) => api.get('/reports', { params });
export const getEmployeeReport = (params) => api.get('/reports/employee', { params });

export default api;
