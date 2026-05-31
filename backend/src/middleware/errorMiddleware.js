// 🛡️ Global Error Handling Middleware
// ดักจับข้อผิดพลาดที่ไม่คาดคิดทั้งหมดในระบบ และส่ง Response กลับอย่างปลอดภัย

function handleError(err, req, res, next) {
    console.error('❌ Server Error:', err);

    // ป้องกันการแฉข้อมูล SQL Query หรือ System Path สู่ Client
    const isProduction = process.env.NODE_ENV === 'production';
    
    // กำหนดรายละเอียดข้อความ Error ที่จะตอบกลับ
    let status = 500;
    let message = 'An unexpected server error occurred.';

    // คัดกรอง Error เฉพาะเจาะจง
    if (err.message === 'MISSING_FIELDS') {
        status = 400;
        message = 'Please provide all required fields.';
    } else if (err.message === 'USER_ALREADY_EXISTS') {
        status = 409; // Conflict
        message = 'Username or email already exists.';
    } else if (err.message === 'INVALID_CREDENTIALS') {
        status = 401; // Unauthorized
        message = 'Invalid username or password.';
    } else if (err.message === 'COURSE_NOT_FOUND') {
        status = 404;
        message = 'Course not found.';
    } else if (err.message === 'ALREADY_ENROLLED') {
        status = 400;
        message = 'You have already enrolled in this course.';
    } else if (err.message === 'CLASS_FULL') {
        status = 409; // Conflict
        message = 'This workshop class is already full.';
    }

    res.status(status).json({
        success: false,
        message: message,
        // ส่ง stack trace เฉพาะตอน Development เท่านั้น เพื่อช่วยแก้บั๊กได้ง่าย
        error: isProduction ? {} : { details: err.message, stack: err.stack }
    });
}

module.exports = { handleError };
