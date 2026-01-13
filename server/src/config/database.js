const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Use SQLite - for serverless (Vercel), use /tmp directory which is writable
// For local development, use ./database.sqlite
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
    ? '/tmp/database.sqlite' 
    : path.join(__dirname, '../../database.sqlite');

// Ensure directory exists
if (!isVercel) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite database connected successfully.');
        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // Don't exit process in serverless - just log the error
        if (!isVercel) {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = { sequelize, connectDB };
