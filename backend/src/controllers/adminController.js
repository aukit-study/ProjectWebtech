const adminService = require('../services/adminService');

exports.getDashboardUsers = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        // เรียก Service ดึงข้อมูล
        const usersStats = await adminService.getAllUsersWithStats(db);
        res.status(200).json({ success: true, data: usersStats });
    } catch (error) {
        next(error); // โยนให้ errorMiddleware จัดการ
    }
};

exports.getUserHistory = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const userId = req.params.userId;
        
        // เรียก Service ดึงประวัติของคนที่เลือก
        const history = await adminService.getUserEnrollmentHistory(db, userId);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};