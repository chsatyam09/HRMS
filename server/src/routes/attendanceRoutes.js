const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/', attendanceController.markAttendance);
router.get('/:employeeId', attendanceController.getAttendance);

module.exports = router;
