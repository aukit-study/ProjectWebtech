const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// ถ้าแบงค์มี Middleware ป้องกันสิทธิ์แอดมิน (เช่น authenticateToken) ให้เรียกใช้ด้วยนะครับ
// const authMiddleware = require('../middlewares/authMiddleware');

// 🌟 Route สำหรับระบบจัดการสมาชิก (system.html)
// GET: /api/admin/users
router.get('/users', adminController.getUsers);

// GET: /api/admin/users/:id/history
router.get('/users/:id/history', adminController.getUserHistory);

// (ด้านล่างนี้อาจจะมี Route เดิมที่แบงค์ใช้ทำพวก CRUD คอร์สเรียน ให้คงไว้นะครับ ไม่ต้องลบ)

module.exports = router;