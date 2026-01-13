const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Apply for Leave
exports.applyLeave = async (req, res) => {
    const { employeeId, start_date, end_date, reason } = req.body;

    try {
        if (!employeeId || !start_date || !end_date || !reason) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const leave = await Leave.create({
            EmployeeId: employeeId,
            start_date,
            end_date,
            reason,
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Leaves (Admin view)
exports.getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({
            include: [{ model: Employee, attributes: ['full_name', 'employee_id'] }],
            order: [['created_at', 'DESC']],
        });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Leave Status
exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        const leave = await Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        leave.status = status;
        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
