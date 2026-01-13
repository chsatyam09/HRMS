const express = require('express');
const cors = require('cors');
const { connectDB } = require('../server/src/config/database');
const employeeRoutes = require('../server/src/routes/employeeRoutes');
const attendanceRoutes = require('../server/src/routes/attendanceRoutes');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/employees', employeeRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/leaves', require('../server/src/routes/leaveRoutes'));
app.use('/dashboard', require('../server/src/routes/dashboardRoutes'));
app.use('/reports', require('../server/src/routes/reportRoutes'));

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'HRMS Lite API is running', environment: process.env.VERCEL ? 'Vercel' : 'Local' });
});

// Initialize database connection (singleton pattern for serverless)
let dbInitialized = false;
let dbInitPromise = null;
let dbSeeded = false;

const seedDatabase = async () => {
    try {
        const Employee = require('../server/src/models/Employee');
        const Attendance = require('../server/src/models/Attendance');
        const Leave = require('../server/src/models/Leave');
        
        // Check if database already has data
        const employeeCount = await Employee.count();
        if (employeeCount > 0) {
            console.log('Database already seeded, skipping...');
            return;
        }
        
        console.log('Seeding database with initial data...');
        const seedScript = require('../server/src/seed');
        // The seed script runs automatically, but we need to wait for it
        // Since seed.js exits the process, we'll seed manually here
        await seedDatabaseData();
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        // Don't throw - allow app to continue even if seeding fails
    }
};

const seedDatabaseData = async () => {
    const Employee = require('../server/src/models/Employee');
    const Attendance = require('../server/src/models/Attendance');
    const Leave = require('../server/src/models/Leave');
    
    const fakeEmployees = [
        { employee_id: 'EMP001', full_name: 'John Smith', email: 'john.smith@ethara.ai', department: 'Engineering' },
        { employee_id: 'EMP002', full_name: 'Sarah Johnson', email: 'sarah.johnson@ethara.ai', department: 'HR' },
        { employee_id: 'EMP003', full_name: 'Michael Chen', email: 'michael.chen@ethara.ai', department: 'Engineering' },
        { employee_id: 'EMP004', full_name: 'Emily Davis', email: 'emily.davis@ethara.ai', department: 'Marketing' },
        { employee_id: 'EMP005', full_name: 'David Wilson', email: 'david.wilson@ethara.ai', department: 'Sales' },
        { employee_id: 'EMP006', full_name: 'Jessica Martinez', email: 'jessica.martinez@ethara.ai', department: 'Engineering' },
        { employee_id: 'EMP007', full_name: 'Robert Taylor', email: 'robert.taylor@ethara.ai', department: 'HR' },
        { employee_id: 'EMP008', full_name: 'Amanda Brown', email: 'amanda.brown@ethara.ai', department: 'Marketing' },
        { employee_id: 'EMP009', full_name: 'James Anderson', email: 'james.anderson@ethara.ai', department: 'Sales' },
        { employee_id: 'EMP010', full_name: 'Lisa Thompson', email: 'lisa.thompson@ethara.ai', department: 'Engineering' },
    ];
    
    const createdEmployees = [];
    for (const employee of fakeEmployees) {
        try {
            const created = await Employee.create(employee);
            createdEmployees.push(created);
        } catch (error) {
            if (error.name !== 'SequelizeUniqueConstraintError') {
                console.error(`Error creating employee ${employee.employee_id}:`, error.message);
            }
        }
    }
    
    // Create some attendance records for the last 7 days
    const today = new Date();
    for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        for (const employee of createdEmployees) {
            if (!employee || !employee.id) continue;
            
            const patternValue = (createdEmployees.indexOf(employee) + dayOffset) % 10;
            const isPresent = patternValue < 7;
            
            try {
                await Attendance.create({
                    EmployeeId: employee.id,
                    date: dateStr,
                    status: isPresent ? 'Present' : 'Absent',
                });
            } catch (error) {
                // Ignore duplicate errors
                if (error.name !== 'SequelizeUniqueConstraintError') {
                    console.error(`Error creating attendance:`, error.message);
                }
            }
        }
    }
};

const initializeDB = async () => {
    if (dbInitialized) {
        return;
    }
    
    if (dbInitPromise) {
        return dbInitPromise;
    }
    
    dbInitPromise = (async () => {
        try {
            await connectDB();
            dbInitialized = true;
            
            // Seed database on first initialization (only in Vercel)
            if (process.env.VERCEL === '1' && !dbSeeded) {
                await seedDatabase();
                dbSeeded = true;
            }
        } catch (error) {
            console.error('Database initialization error:', error);
            dbInitPromise = null; // Reset on error to allow retry
            throw error;
        }
    })();
    
    return dbInitPromise;
};

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        // Initialize DB on first request
        await initializeDB();
        
        // In Vercel, requests to /api/* are handled by this function
        // The req.url might include /api, so we need to strip it for Express routes
        const originalUrl = req.url || req.path || '/';
        if (originalUrl.startsWith('/api')) {
            // Strip /api prefix
            const newPath = originalUrl.replace(/^\/api/, '') || '/';
            req.url = newPath;
            req.path = newPath;
        }
        
        // Handle the request
        return app(req, res);
    } catch (error) {
        console.error('Request handler error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};
