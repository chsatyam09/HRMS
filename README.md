# HRMS Lite

A lightweight Human Resource Management System built with React, Node.js, Express, and PostgreSQL.

## Features
- **Employee Management**: Add, view, and delete employees.
- **Attendance Management**: Mark and view daily attendance.
- **Modern UI**: Clean, responsive interface using Tailwind CSS.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express, Sequelize.
- **Database**: PostgreSQL.

## Prerequisites
- Node.js (v18+)
- PostgreSQL

## Local Setup

### 1. Database Setup
Create a PostgreSQL database named `hrms_lite`.
```sql
CREATE DATABASE hrms_lite;
```

### 2. Backend Setup
1. Navigate to `server` directory:
   ```bash
   cd hrms-lite/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   Open `.env` and update `DATABASE_URL` with your credentials:
   ```
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/hrms_lite
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on port 5000 and automatically sync the database schema.

### 3. Frontend Setup
1. Navigate to `client` directory:
   ```bash
   cd hrms-lite/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/:employeeId` - Get attendance history

## Deployment

### Frontend (Vercel/Netlify)
- Build the project: `npm run build`
- Deploy the `dist` folder.

### Backend (Render/Railway)
- Set `NODE_ENV=production`
- Configure `DATABASE_URL` environment variable.
- Start command: `node src/index.js`
