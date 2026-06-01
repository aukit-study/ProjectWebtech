// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// สมมติว่ามี Middleware เช็ค Token และเช็คสิทธิ์ Admin อยู่แล้ว
// const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ดึงข้อมูลสมาชิกทั้งหมด (ใส่ Middleware ดักความปลอดภัยด้วยนะครับ)
router.get('/users', /* verifyToken, isAdmin, */ adminController.getDashboardUsers);

// ดึงประวัติการเรียนของสมาชิกรายบุคคล
router.get('/users/:userId/history', /* verifyToken, isAdmin, */ adminController.getUserHistory);

module.exports = router;