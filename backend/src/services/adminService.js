// backend/src/services/adminService.js

// ฟังก์ชันดึงรายชื่อผู้ใช้ทั้งหมด พร้อมนับจำนวนคอร์สที่ลงเรียนไปแล้ว
async function getAllUsersWithStats(db) {
    const query = `
        SELECT 
            u.id, u.username, u.fullname, u.role, u.created_at,
            COUNT(e.course_id) as total_enrolled
        FROM users u
        LEFT JOIN enrollments e ON u.id = e.user_id
        GROUP BY u.id
        ORDER BY u.role, u.created_at DESC
    `;
    return await db.all(query);
}

// ฟังก์ชันเจาะดูประวัติการเรียนของนักเรียนแต่ละคน (ดึงชื่อคอร์สที่เรียน)
async function getUserEnrollmentHistory(db, userId) {
    const query = `
        SELECT 
            c.id as course_id, c.title, c.category, e.enrolled_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    `;
    return await db.all(query, [userId]);
}

module.exports = {
    getAllUsersWithStats,
    getUserEnrollmentHistory
};