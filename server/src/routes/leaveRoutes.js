const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.post('/', leaveController.applyLeave);
router.get('/', leaveController.getLeaves);
router.patch('/:id', leaveController.updateLeaveStatus);

module.exports = router;
