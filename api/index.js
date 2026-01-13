const express = require('express');
const cors = require('cors');
const { connectDB } = require('../server/src/config/database');
const employeeRoutes = require('../server/src/routes/employeeRoutes');
const attendanceRoutes = require('../server/src/routes/attendanceRoutes');

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
    res.json({ message: 'HRMS Lite API is running' });
});

// Initialize database connection (singleton pattern for serverless)
let dbInitialized = false;
let dbInitPromise = null;

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
