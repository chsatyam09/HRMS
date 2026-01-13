const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent'),
        allowNull: false,
    },
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['EmployeeId', 'date'], // Composite unique constraint
        },
    ],
});

// Relationships
Employee.hasMany(Attendance, { onDelete: 'CASCADE' });
Attendance.belongsTo(Employee);

module.exports = Attendance;
