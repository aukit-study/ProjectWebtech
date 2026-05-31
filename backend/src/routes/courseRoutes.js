const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// 📚 Public Routes - ไม่ต้อง login
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);

// 🔒 Protected Routes - ต้อง login
// verifyToken: ตรวจสอบ JWT token
router.post('/:id/enroll', verifyToken, CourseController.enrollInCourse);

// 🛡️ Admin Only Routes - ต้อง login และเป็น admin
// requireRole('admin'): ตรวจสอบว่าเป็น admin หรือไม่
router.post('/', verifyToken, requireRole('admin'), CourseController.createCourse);
router.put('/:id', verifyToken, requireRole('admin'), CourseController.updateCourse);
router.delete('/:id', verifyToken, requireRole('admin'), CourseController.deleteCourse);

module.exports = router;
