// 📚 Courses Controller - จัดการ API สำหรับคอร์สเรียน (ผ่าน Service Layer)
const CourseService = require('../services/courseService');

class CourseController {
    static async getAllCourses(req, res, next) {
        const db = req.app.locals.db;
        const userId = req.user ? req.user.id : null;

        try {
            const courses = await CourseService.getAllCourses(db, userId);
            
            return res.status(200).json({
                success: true,
                message: 'Courses retrieved successfully.',
                courses: courses || []
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/courses/:id - ดึงข้อมูลคอร์สเดียว
    static async getCourseById(req, res, next) {
        const db = req.app.locals.db;
        const { id } = req.params;

        try {
            const course = await CourseService.getCourseById(db, id);
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Course retrieved successfully.',
                course
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/courses - สร้างคอร์สใหม่ (admin only)
    static async createCourse(req, res, next) {
        const db = req.app.locals.db;
        const { title, category, difficulty, duration, description, cover_image, max_capacity, price } = req.body;

        // Validation
        if (!title || !category || !difficulty || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        const numericPrice = price !== undefined ? Number(price) : 0;
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid non-negative number.'
            });
        }

        try {
            const courseId = await CourseService.createCourse(
                db, 
                { title, category, difficulty, duration, description, cover_image, max_capacity, price: numericPrice }, 
                req.user.id
            );

            return res.status(201).json({
                success: true,
                message: 'Course created successfully.',
                courseId
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/courses/:id - แก้ไขคอร์ส (admin only)
    static async updateCourse(req, res, next) {
        const db = req.app.locals.db;
        const { id } = req.params;
        const { title, category, difficulty, duration, description, cover_image, max_capacity, price } = req.body;

        const numericPrice = price !== undefined ? Number(price) : undefined;
        if (numericPrice !== undefined && (Number.isNaN(numericPrice) || numericPrice < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid non-negative number.'
            });
        }

        try {
            await CourseService.updateCourse(
                db, 
                id, 
                { title, category, difficulty, duration, description, cover_image, max_capacity, price: numericPrice }
            );

            return res.status(200).json({
                success: true,
                message: 'Course updated successfully.'
            });
        } catch (error) {
            if (error.message === 'COURSE_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found.'
                });
            }
            next(error);
        }
    }

    // DELETE /api/courses/:id - ลบคอร์ส (admin only)
    static async deleteCourse(req, res, next) {
        const db = req.app.locals.db;
        const { id } = req.params;

        try {
            await CourseService.deleteCourse(db, id);

            return res.status(200).json({
                success: true,
                message: 'Course deleted successfully.'
            });
        } catch (error) {
            if (error.message === 'COURSE_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found.'
                });
            }
            next(error);
        }
    }

    // POST /api/courses/:id/enroll - ลงทะเบียนเรียนคอร์ส (student/admin only)
    static async enrollInCourse(req, res, next) {
        const db = req.app.locals.db;
        const { id } = req.params;
        const userId = req.user.id;

        try {
            await CourseService.enrollInCourse(db, id, userId);

            return res.status(200).json({
                success: true,
                message: 'Enrolled in course successfully.'
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/checkout - สมัครหลายคอร์สพร้อมกันจากตะกร้า
    static async checkoutCart(req, res, next) {
        const db = req.app.locals.db;
        const userId = req.user.id;
        const { courseIds } = req.body;

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'ตะกร้าว่างเปล่า หรือรูปแบบข้อมูลไม่ถูกต้อง'
            });
        }

        const results = [];
        let successCount = 0;

        for (const id of courseIds) {
            try {
                await CourseService.enrollInCourse(db, id, userId);
                results.push({ id, status: 'success' });
                successCount++;
            } catch (error) {
                // If it fails (e.g. ALREADY_ENROLLED, COURSE_FULL), we just record it and continue
                results.push({ id, status: 'failed', reason: error.message });
            }
        }

        if (successCount === 0 && courseIds.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'ไม่สามารถสั่งซื้อคอร์สได้เลย อาจจะเต็มหรือสมัครไปแล้วทั้งหมด',
                results
            });
        }

        return res.status(200).json({
            success: true,
            message: `สั่งซื้อสำเร็จ ${successCount} คอร์ส`,
            results
        });
    }
}

module.exports = CourseController;
