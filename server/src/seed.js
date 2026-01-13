const { connectDB, sequelize } = require('./config/database');
const Employee = require('./models/Employee');
const Leave = require('./models/Leave');
const Attendance = require('./models/Attendance');

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
    { employee_id: 'EMP011', full_name: 'Christopher Lee', email: 'christopher.lee@ethara.ai', department: 'Engineering' },
    { employee_id: 'EMP012', full_name: 'Michelle White', email: 'michelle.white@ethara.ai', department: 'HR' },
    { employee_id: 'EMP013', full_name: 'Daniel Harris', email: 'daniel.harris@ethara.ai', department: 'Sales' },
    { employee_id: 'EMP014', full_name: 'Jennifer Clark', email: 'jennifer.clark@ethara.ai', department: 'Marketing' },
    { employee_id: 'EMP015', full_name: 'Matthew Lewis', email: 'matthew.lewis@ethara.ai', department: 'Engineering' },
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // Always clear all data first to ensure fresh seed
        console.log('Clearing existing data...');
        try {
            // Use Sequelize queryInterface for proper table management
            const queryInterface = sequelize.getQueryInterface();
            await queryInterface.bulkDelete('Attendances', {});
            await queryInterface.bulkDelete('Leaves', {});
            await queryInterface.bulkDelete('Employees', {});
        } catch (error) {
            // If tables don't exist yet, that's fine
            console.log('Note: Some tables may not exist yet (this is normal on first run)');
        }

        console.log('Seeding database with fake employees...');
        
        const createdEmployees = [];
        // Insert employees one by one to handle unique constraints
        for (const employee of fakeEmployees) {
            try {
                const created = await Employee.create(employee);
                createdEmployees.push(created);
                console.log(`✓ Added: ${employee.full_name} (${employee.employee_id})`);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    // Try to find existing employee
                    const existing = await Employee.findOne({ where: { employee_id: employee.employee_id } });
                    if (existing) {
                        createdEmployees.push(existing);
                        console.log(`⚠ Using existing: ${employee.full_name} (${employee.employee_id})`);
                    }
                } else {
                    console.error(`✗ Error adding ${employee.full_name}:`, error.message);
                }
            }
        }

        const finalCount = await Employee.count();
        console.log(`\n✅ Employees seeded! Total employees: ${finalCount}`);

        // Seed Leave Requests
        console.log('\nSeeding leave requests...');
        const today = new Date();
        const getDateString = (daysOffset) => {
            const date = new Date(today);
            date.setDate(date.getDate() + daysOffset);
            return date.toISOString().split('T')[0];
        };

        const leaveRequests = [
            // Pending leaves
            { employeeIndex: 0, start_date: getDateString(5), end_date: getDateString(7), reason: 'Family vacation', status: 'Pending' },
            { employeeIndex: 2, start_date: getDateString(10), end_date: getDateString(12), reason: 'Personal work', status: 'Pending' },
            { employeeIndex: 5, start_date: getDateString(3), end_date: getDateString(4), reason: 'Medical appointment', status: 'Pending' },
            { employeeIndex: 8, start_date: getDateString(15), end_date: getDateString(17), reason: 'Wedding', status: 'Pending' },
            { employeeIndex: 11, start_date: getDateString(8), end_date: getDateString(9), reason: 'Family emergency', status: 'Pending' },
            
            // Approved leaves
            { employeeIndex: 1, start_date: getDateString(-5), end_date: getDateString(-3), reason: 'Sick leave', status: 'Approved' },
            { employeeIndex: 3, start_date: getDateString(-10), end_date: getDateString(-8), reason: 'Holiday', status: 'Approved' },
            { employeeIndex: 6, start_date: getDateString(-2), end_date: getDateString(-1), reason: 'Personal day', status: 'Approved' },
            { employeeIndex: 9, start_date: getDateString(-7), end_date: getDateString(-6), reason: 'Medical checkup', status: 'Approved' },
            { employeeIndex: 12, start_date: getDateString(-12), end_date: getDateString(-10), reason: 'Family event', status: 'Approved' },
            
            // Rejected leaves
            { employeeIndex: 4, start_date: getDateString(20), end_date: getDateString(25), reason: 'Long vacation', status: 'Rejected' },
            { employeeIndex: 7, start_date: getDateString(6), end_date: getDateString(8), reason: 'Personal', status: 'Rejected' },
            { employeeIndex: 10, start_date: getDateString(4), end_date: getDateString(5), reason: 'Casual leave', status: 'Rejected' },
        ];

        let leaveCount = 0;
        for (const leave of leaveRequests) {
            if (createdEmployees[leave.employeeIndex]) {
                try {
                    await Leave.create({
                        EmployeeId: createdEmployees[leave.employeeIndex].id,
                        start_date: leave.start_date,
                        end_date: leave.end_date,
                        reason: leave.reason,
                        status: leave.status,
                    });
                    leaveCount++;
                    console.log(`✓ Added leave for ${createdEmployees[leave.employeeIndex].full_name} (${leave.status})`);
                } catch (error) {
                    console.error(`✗ Error adding leave:`, error.message);
                }
            }
        }
        console.log(`✅ Leave requests seeded! Total leaves: ${leaveCount}`);

        // Seed Attendance Records
        console.log('\nSeeding attendance records...');
        
        // Generate attendance records for all employees for the last 7 days
        const attendanceRecords = [];
        for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
            const date = getDateString(dayOffset);
            
            // For each day, mark some employees as present and some as absent
            for (let i = 0; i < createdEmployees.length; i++) {
                const employee = createdEmployees[i];
                if (!employee || !employee.id) {
                    continue;
                }
                
                // Deterministic pattern: roughly 70% present, 30% absent
                const patternValue = (i + dayOffset) % 10;
                const isPresent = patternValue < 7; // 7 out of 10 = 70% present
                
                attendanceRecords.push({
                    EmployeeId: employee.id,
                    date: date,
                    status: isPresent ? 'Present' : 'Absent',
                });
            }
        }
        
        // Create records individually to ensure all are processed
        let attendanceCount = 0;
        let skippedCount = 0;
        for (const record of attendanceRecords) {
            try {
                await Attendance.create(record);
                attendanceCount++;
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    skippedCount++;
                } else {
                    // Log unexpected errors
                    if (skippedCount === 0) { // Only log first unexpected error
                        console.error(`✗ Unexpected error:`, error.message);
                    }
                }
            }
        }
        console.log(`✅ Attendance records seeded! Created: ${attendanceCount}${skippedCount > 0 ? `, Skipped (duplicates): ${skippedCount}` : ''}`);

        // Summary
        const todayStr = getDateString(0);
        const presentToday = await Attendance.count({
            where: { date: todayStr, status: 'Present' }
        });
        const absentToday = await Attendance.count({
            where: { date: todayStr, status: 'Absent' }
        });
        const pendingLeaves = await Leave.count({
            where: { status: 'Pending' }
        });

        console.log(`\n📊 Summary:`);
        console.log(`   Total Employees: ${finalCount}`);
        console.log(`   Today's Attendance - Present: ${presentToday}, Absent: ${absentToday}`);
        console.log(`   Pending Leaves: ${pendingLeaves}`);
        console.log(`\n✅ Seeding complete!`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
