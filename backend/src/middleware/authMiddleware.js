const jwt = require('jsonwebtoken');

// 🔐 JWT Verification Middleware
// ตรวจสอบ JWT Token ว่าถูกต้องและยังไม่หมดอายุก่อนอนุญาต request ไปยัง protected routes
function verifyToken(req, res, next) {
    // ดึง Token จาก HTTP Header Authorization (format: "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Please login first.'
        });
    }

    // แยก "Bearer" และ token จาก header
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token format. Use "Bearer <token>".'
        });
    }

    const token = parts[1];

    try {
        // ตรวจสอบ JWT ด้วย JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // เก็บข้อมูล user ที่ decode มาไว้ใน req.user เพื่อให้ route handler ใช้ได้
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid or tampered token.'
        });
    }
}

// 🔐 Optional Token Verification
// ตรวจสอบ JWT Token ถ้ามีก็ใส่ลงใน req.user แต่ถ้าไม่มีก็ปล่อยผ่าน
function optionalToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return next();
    }

    try {
        const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
    }
    next();
}

// 🛡️ Role-Based Access Control (RBAC) Middleware
// ตรวจสอบว่า user มี role ที่ต้องการหรือไม่ (เช่น admin only)
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        // ต้องใช้ verifyToken middleware ก่อน
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Token required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access forbidden. Required role: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
}

module.exports = { verifyToken, requireRole, optionalToken };
