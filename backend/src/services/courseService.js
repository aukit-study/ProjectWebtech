// 📚 Course Service - จัดการติดต่อฐานข้อมูลและ Logic สำหรับคอร์สเรียน

class CourseService {
    // ดึงข้อมูลคอร์สเรียนทั้งหมด
    static async getAllCourses(db) {
        return await db.all('SELECT * FROM courses');
    }

    // ดึงข้อมูลคอร์สเรียนตาม ID
    static async getCourseById(db, id) {
        return await db.get('SELECT * FROM courses WHERE id = ?', [id]);
    }

    // สร้างคอร์สเรียนใหม่ (Admin only)
    static async createCourse(db, courseData, userId) {
        const { title, category, difficulty, duration, description, cover_image, max_capacity } = courseData;
        
        const result = await db.run(
            `INSERT INTO courses (title, category, difficulty, duration, description, cover_image, max_capacity, current_bookings, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
                title, 
                category, 
                difficulty, 
                duration, 
                description, 
                cover_image || null, 
                max_capacity !== undefined ? parseInt(max_capacity) : 10, 
                userId
            ]
        );

        return result.lastID;
    }

    // แก้ไขข้อมูลคอร์สเรียน (Admin only)
    static async updateCourse(db, id, courseData) {
        const { title, category, difficulty, duration, description, cover_image, max_capacity } = courseData;

        // ตรวจสอบว่าคอร์สมีตัวตนอยู่ในระบบหรือไม่
        const existingCourse = await db.get('SELECT id FROM courses WHERE id = ?', [id]);
        if (!existingCourse) {
            throw new Error('COURSE_NOT_FOUND');
        }

        await db.run(
            `UPDATE courses 
             SET title = ?, category = ?, difficulty = ?, duration = ?, description = ?, cover_image = ?, max_capacity = ? 
             WHERE id = ?`,
            [
                title, 
                category, 
                difficulty, 
                duration, 
                description, 
                cover_image !== undefined ? cover_image : null, 
                max_capacity !== undefined ? parseInt(max_capacity) : 10, 
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
        const course = await db.get('SELECT max_capacity, current_bookings, title FROM courses WHERE id = ?', [courseId]);
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
        await db.run('UPDATE courses SET current_bookings = current_bookings + 1 WHERE id = ?', [courseId]);

        return true;
    }
}

module.exports = CourseService;
