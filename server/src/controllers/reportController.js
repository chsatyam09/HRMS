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
        
        // Get attendance with employee filter
        let attendanceQuery = {
            where: dateFilter
        };
        
        if (department && department !== 'all') {
            const employeeIds = await Employee.findAll({
                where: employeeFilter,
                attributes: ['id'],
                raw: true
            }).then(emps => emps.map(e => e.id));
            
            if (employeeIds.length > 0) {
                attendanceQuery.where.EmployeeId = { [Sequelize.Op.in]: employeeIds };
            } else {
                attendanceQuery.where.EmployeeId = { [Sequelize.Op.in]: [] };
            }
        }
        
        const totalAttendance = await Attendance.count(attendanceQuery);
        const presentCount = await Attendance.count({
            ...attendanceQuery,
            where: {
                ...attendanceQuery.where,
                status: 'Present'
            }
        });

        // Department-wise stats
        const deptStats = await Employee.findAll({
            attributes: [
                'department',
                [Sequelize.fn('COUNT', Sequelize.col('Employee.id')), 'total']
            ],
            where: employeeFilter,
            group: ['department'],
            raw: true
        });

        // Monthly attendance trend
        let trendQuery = {
            attributes: [
                [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('Attendance.id')), 'count'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'Present' THEN 1 ELSE 0 END")), 'present']
            ],
            where: dateFilter,
            group: [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date'))],
            order: [[Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date')), 'ASC']],
            raw: true
        };
        
        if (department && department !== 'all') {
            const employeeIds = await Employee.findAll({
                where: employeeFilter,
                attributes: ['id'],
                raw: true
            }).then(emps => emps.map(e => e.id));
            
            if (employeeIds.length > 0) {
                trendQuery.where.EmployeeId = { [Sequelize.Op.in]: employeeIds };
            } else {
                trendQuery.where.EmployeeId = { [Sequelize.Op.in]: [] };
            }
        }
        
        const monthlyTrend = await Attendance.findAll(trendQuery);

        res.json({
            totalEmployees,
            totalAttendance,
            presentCount,
            absentCount: totalAttendance - presentCount,
            attendanceRate: totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : 0,
            departmentStats: deptStats,
            monthlyTrend: monthlyTrend
        });
    } catch (error) {
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
