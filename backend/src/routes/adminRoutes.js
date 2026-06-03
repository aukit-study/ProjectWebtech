const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ดึงข้อมูลสมาชิกทั้งหมด (ใส่ Middleware ดักความปลอดภัยด้วยนะครับ)
router.get('/users', adminController.getDashboardUsers);

// ดึงประวัติการเรียนของสมาชิกรายบุคคล
router.get('/users/:userId/history',  adminController.getUserHistory);

module.exports = router;