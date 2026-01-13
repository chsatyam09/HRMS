const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Mark Attendance
exports.markAttendance = async (req, res) => {
    const { employeeId, date, status } = req.body;

    try {
        if (!employeeId || !date || !status) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // specific check: Validate employee existence
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const newAttendance = await Attendance.create({
            EmployeeId: employeeId,
            date,
            status,
        });

        res.status(201).json(newAttendance);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Attendance for this date already exists.' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get Attendance for specific employee
exports.getAttendance = async (req, res) => {
    const { employeeId } = req.params;

    try {
        // Check if employee exists first (optional, but good for UX)
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const records = await Attendance.findAll({
            where: { EmployeeId: employeeId },
            order: [['date', 'DESC']],
        });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
