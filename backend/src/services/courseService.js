// 📚 Course Service - จัดการติดต่อฐานข้อมูลและ Logic สำหรับคอร์สเรียน

class CourseService {
    // ดึงข้อมูลคอร์สเรียนทั้งหมด
    static async getAllCourses(db, userId = null) {
        let sql = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as current_bookings 
                   ${userId ? `, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.user_id = ${parseInt(userId)}) as is_enrolled,
                                (SELECT enrolled_at FROM enrollments e WHERE e.course_id = c.id AND e.user_id = ${parseInt(userId)} LIMIT 1) as enrolled_at` : ''}
            FROM courses c
        `;
        const courses = await db.all(sql);
        courses.forEach(c => {
            try { c.lessons = JSON.parse(c.lessons || '[]'); } catch (e) { c.lessons = []; }
        });
        return courses;
    }

    // ดึงข้อมูลคอร์สเรียนตาม ID
    static async getCourseById(db, id) {
        const course = await db.get(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as current_bookings 
            FROM courses c WHERE c.id = ?
        `, [id]);
        if (course) {
            try { course.lessons = JSON.parse(course.lessons || '[]'); } catch (e) { course.lessons = []; }
        }
        return course;
    }

    // สร้างคอร์สเรียนใหม่ (Admin only)
    static async createCourse(db, courseData, userId) {
        const { title, category, difficulty, description, cover_image, max_capacity, price, lessons } = courseData;

        const result = await db.run(
            `INSERT INTO courses (title, category, difficulty, description, cover_image, price, max_capacity, lessons, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                category,
                difficulty,
                description,
                cover_image || null,
                price !== undefined ? parseFloat(price) : 0,
                max_capacity !== undefined ? parseInt(max_capacity) : 10,
                JSON.stringify(lessons || []),
                userId
            ]
        );

        return result.lastID;
    }

    // แก้ไขข้อมูลคอร์สเรียน (Admin only)
    static async updateCourse(db, id, courseData) {
        const { title, category, difficulty, description, cover_image, max_capacity, price, lessons } = courseData;

        // ตรวจสอบว่าคอร์สมีตัวตนอยู่ในระบบหรือไม่
        const existingCourse = await db.get('SELECT id, price FROM courses WHERE id = ?', [id]);
        if (!existingCourse) {
            throw new Error('COURSE_NOT_FOUND');
        }

        await db.run(
            `UPDATE courses 
             SET title = ?, category = ?, difficulty = ?, description = ?, cover_image = ?, price = ?, max_capacity = ?, lessons = ? 
             WHERE id = ?`,
            [
                title,
                category,
                difficulty,
                description,
                cover_image !== undefined ? cover_image : null,
                price,
                max_capacity !== undefined ? parseInt(max_capacity) : 10,
                JSON.stringify(lessons || []),
                id
            ]
        );
        return true;
    }

    // ลบคอร์สเรียน (Admin only)
    static async deleteCourse(db, id) {
        const existingCourse = await db.get('SELECT id FROM courses WHERE id = ?', [id]);
        if (!existingCourse) {
            throw new Error('COURSE_NOT_FOUND');
        }

        await db.run('DELETE FROM courses WHERE id = ?', [id]);
        return true;
    }

    // ลงทะเบียน / จองสิทธิ์ห้องเรียนเวิร์กชอป (Student/Admin)
    static async enrollInCourse(db, courseId, userId) {
        // 1. ตรวจสอบว่าคอร์สมีอยู่จริงหรือไม่
        const course = await db.get(`
            SELECT title, max_capacity, 
                   (SELECT COUNT(*) FROM enrollments WHERE course_id = ?) as current_bookings 
            FROM courses WHERE id = ?
        `, [courseId, courseId]);
        if (!course) {
            throw new Error('COURSE_NOT_FOUND');
        }

        // 2. ตรวจสอบว่าเคยลงทะเบียนไปแล้วหรือไม่
        const existingEnrollment = await db.get(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
        if (existingEnrollment) {
            throw new Error('ALREADY_ENROLLED');
        }

        // 3. ตรวจสอบว่าที่นั่งเต็มหรือไม่ (HTTP 409 Conflict Logic)
        if (course.current_bookings >= course.max_capacity) {
            throw new Error('CLASS_FULL');
        }

        // 4. ทำการบันทึกการจองลงฐานข้อมูลอย่างปลอดภัย
        await db.run('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, courseId]);

        return true;
    }

    // ยกเลิกการลงทะเบียนคอร์สเรียน (Student)
    static async unenrollCourse(db, courseId, userId) {
        // 1. ตรวจสอบว่าเคยลงทะเบียนไว้จริงๆ ไหม
        const existingEnrollment = await db.get(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        if (!existingEnrollment) {
            throw new Error('NOT_ENROLLED');
        }

        // 2. ลบข้อมูลการลงทะเบียนออกจากตาราง enrollments
        await db.run(
            'DELETE FROM enrollments WHERE id = ?',
            [existingEnrollment.id]
        );

        return true;
    }
}

module.exports = CourseService;
