const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            order: [['created_at', 'DESC']],
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Add new employee
exports.addEmployee = async (req, res) => {
    const { employee_id, full_name, email, department } = req.body;

    try {
        // Basic validation
        if (!employee_id || !full_name || !email || !department) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check validation handled by Sequelize (unique constraints)
        const newEmployee = await Employee.create({
            employee_id,
            full_name,
            email,
            department,
        });

        res.status(201).json(newEmployee);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Employee ID or Email already exists.', error: error.errors });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        await employee.destroy(); // Cascade delete handles attendance
        res.json({ message: 'Employee deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
