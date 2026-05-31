const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// เส้นทางเดิมที่มีอยู่
router.post('/register', AuthController.register);

// 🛣️ เพิ่มเส้นทาง Login สำหรับโปรเจค
router.post('/login', AuthController.login);

module.exports = router;