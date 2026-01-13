const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');

// Get comprehensive reports
exports.getReports = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.date = {
                [Sequelize.Op.between]: [startDate, endDate]
            };
        }

        // Build employee filter
        const employeeFilter = {};
        if (department && department !== 'all') {
            employeeFilter.department = department;
        }

        // Calculate statistics
        const totalEmployees = await Employee.count({ where: employeeFilter });
        
        // Get employee IDs for filtering attendance if department filter is applied
        let employeeIds = null;
        if (department && department !== 'all') {
            const employees = await Employee.findAll({
                where: employeeFilter,
                attributes: ['id'],
                raw: true
            });
            employeeIds = employees.map(e => e.id);
        }
        
        // Build attendance query
        let attendanceWhere = { ...dateFilter };
        if (employeeIds !== null) {
            if (employeeIds.length > 0) {
                attendanceWhere.EmployeeId = { [Sequelize.Op.in]: employeeIds };
            } else {
                // No employees in this department, return empty results
                return res.json({
                    totalEmployees: 0,
                    totalAttendance: 0,
                    presentCount: 0,
                    absentCount: 0,
                    attendanceRate: 0,
                    departmentStats: [],
                    monthlyTrend: []
                });
            }
        }
        
        const totalAttendance = await Attendance.count({ where: attendanceWhere });
        const presentCount = await Attendance.count({
            where: {
                ...attendanceWhere,
                status: 'Present'
            }
        });

        // Department-wise stats - fixed query
        const deptStatsRaw = await Employee.findAll({
            attributes: [
                'department',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
            ],
            where: employeeFilter,
            group: ['department'],
            raw: true
        });
        
        // Transform to match frontend format (name instead of department)
        const deptStats = deptStatsRaw.map(stat => ({
            name: stat.department,
            total: parseInt(stat.total) || 0
        }));

        // Monthly attendance trend - fixed query for SQLite
        let trendWhere = { ...dateFilter };
        if (employeeIds !== null && employeeIds.length > 0) {
            trendWhere.EmployeeId = { [Sequelize.Op.in]: employeeIds };
        }
        
        const monthlyTrendRaw = await Attendance.findAll({
            attributes: [
                [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: trendWhere,
            group: [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date'))],
            order: [[Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date')), 'ASC']],
            raw: true
        });

        // Get present count per month separately
        const monthlyPresentRaw = await Attendance.findAll({
            attributes: [
                [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'present']
            ],
            where: {
                ...trendWhere,
                status: 'Present'
            },
            group: [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date'))],
            raw: true
        });

        // Combine monthly data
        const monthlyMap = new Map();
        monthlyTrendRaw.forEach(item => {
            monthlyMap.set(item.month, { month: item.month, count: parseInt(item.count) || 0, present: 0 });
        });
        monthlyPresentRaw.forEach(item => {
            if (monthlyMap.has(item.month)) {
                monthlyMap.get(item.month).present = parseInt(item.present) || 0;
            }
        });
        const monthlyTrend = Array.from(monthlyMap.values());

        res.json({
            totalEmployees: totalEmployees || 0,
            totalAttendance: totalAttendance || 0,
            presentCount: presentCount || 0,
            absentCount: (totalAttendance || 0) - (presentCount || 0),
            attendanceRate: totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : '0.00',
            departmentStats: deptStats || [],
            monthlyTrend: monthlyTrend || []
        });
    } catch (error) {
        console.error('Error in getReports:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get employee performance report
exports.getEmployeeReport = async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query;

        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.date = {
                [Sequelize.Op.between]: [startDate, endDate]
            };
        }

        const attendance = await Attendance.findAll({
            where: {
                EmployeeId: employeeId,
                ...dateFilter
            },
            order: [['date', 'DESC']]
        });

        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const absentCount = attendance.length - presentCount;

        res.json({
            employee: {
                id: employee.id,
                employee_id: employee.employee_id,
                full_name: employee.full_name,
                email: employee.email,
                department: employee.department
            },
            totalDays: attendance.length,
            presentDays: presentCount,
            absentDays: absentCount,
            attendanceRate: attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(2) : 0,
            records: attendance
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
