const { connectDB, sequelize } = require('./config/database');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');

const markAttendanceForPastWeek = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // Get all employees
        const employees = await Employee.findAll();
        if (employees.length === 0) {
            console.log('No employees found. Please seed employees first.');
            process.exit(1);
        }

        console.log(`Found ${employees.length} employees.`);

        // Calculate dates for the past 7 days (excluding today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const getDateString = (daysOffset) => {
            const date = new Date(today);
            date.setDate(date.getDate() + daysOffset);
            return date.toISOString().split('T')[0];
        };
        
        const dates = [];
        for (let i = 7; i >= 1; i--) {
            dates.push(getDateString(-i));
        }

        console.log(`Marking attendance for dates: ${dates.join(', ')}`);

        // First, delete existing attendance records for these dates
        console.log('Clearing existing attendance records for these dates...');
        const { Op } = require('sequelize');
        const deletedCount = await Attendance.destroy({
            where: {
                date: {
                    [Op.in]: dates
                }
            }
        });
        console.log(`Deleted ${deletedCount} existing attendance records.`);

        // Generate attendance records for all employees for the past 7 days
        const attendanceRecords = [];
        for (const date of dates) {
            for (let i = 0; i < employees.length; i++) {
                const employee = employees[i];
                if (!employee || !employee.id) {
                    continue;
                }
                
                // 80% chance of Present, 20% chance of Absent
                const isPresent = Math.random() < 0.8;
                
                attendanceRecords.push({
                    EmployeeId: employee.id,
                    date: date,
                    status: isPresent ? 'Present' : 'Absent',
                });
            }
        }

        console.log(`Creating ${attendanceRecords.length} attendance records...`);
        
        // Log first few records to verify structure
        if (attendanceRecords.length > 0) {
            console.log('Sample records:');
            for (let i = 0; i < Math.min(3, attendanceRecords.length); i++) {
                console.log(`  ${i + 1}. EmployeeId: ${attendanceRecords[i].EmployeeId}, Date: ${attendanceRecords[i].date}, Status: ${attendanceRecords[i].status}`);
            }
        }

        // Use a transaction to ensure all records are saved
        const transaction = await sequelize.transaction();
        
        let attendanceCount = 0;
        let skippedCount = 0;
        
        try {
            for (let i = 0; i < attendanceRecords.length; i++) {
                const record = attendanceRecords[i];
                try {
                    await Attendance.create(record, { transaction });
                    attendanceCount++;
                    if (attendanceCount % 20 === 0) {
                        const employee = employees.find(e => e.id === record.EmployeeId);
                        console.log(`Progress: ${attendanceCount}/${attendanceRecords.length} - ${employee?.full_name || 'Unknown'} - ${record.date}`);
                    }
                } catch (error) {
                    if (error.name === 'SequelizeUniqueConstraintError') {
                        // Try to update instead
                        try {
                            const existing = await Attendance.findOne({
                                where: {
                                    EmployeeId: record.EmployeeId,
                                    date: record.date
                                },
                                transaction
                            });
                            if (existing) {
                                await existing.update({ status: record.status }, { transaction });
                                attendanceCount++;
                            } else {
                                skippedCount++;
                            }
                        } catch (updateError) {
                            skippedCount++;
                        }
                    } else {
                        skippedCount++;
                        if (skippedCount <= 3) {
                            console.error(`✗ Error on record ${i + 1}:`, error.message);
                        }
                    }
                }
            }
            
            // Commit the transaction
            await transaction.commit();
            console.log(`\nTransaction committed. Created/Updated: ${attendanceCount} records`);
            
            if (skippedCount > 0) {
                console.log(`Skipped: ${skippedCount} records`);
            }
        } catch (error) {
            await transaction.rollback();
            console.error('Transaction failed, rolling back:', error);
            throw error;
        }

        console.log(`\n✅ Attendance marking complete!`);
        console.log(`   Created/Updated: ${attendanceCount} records`);
        if (skippedCount > 0) {
            console.log(`   Skipped: ${skippedCount} records`);
        }

        // Summary by date
        console.log(`\n📊 Summary by date:`);
        for (const date of dates) {
            const present = await Attendance.count({
                where: { date: date, status: 'Present' }
            });
            const absent = await Attendance.count({
                where: { date: date, status: 'Absent' }
            });
            console.log(`   ${date}: Present: ${present}, Absent: ${absent} (Total: ${present + absent})`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error marking attendance:', error);
        process.exit(1);
    }
};

markAttendanceForPastWeek();
