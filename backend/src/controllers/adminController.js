const adminService = require('../services/adminService');
// 🌟 เพิ่มบรรทัดนี้: นำเข้าฟังก์ชันเชื่อมต่อฐานข้อมูลโดยตรงจากของเพื่อน
const { initDatabase } = require('../config/database');

// รับ Request ขอรายชื่อสมาชิกทั้งหมด
exports.getUsers = async (req, res) => {
    try {
        // ท่าไม้ตาย: ดึง db จากระบบ หรือถ้าไม่มีให้เปิด Connection ใหม่เลย!
        const db = req.app.locals.db || req.db || await initDatabase();
        
        // เรียกใช้ Service 
        const users = await adminService.getAllUsersWithStats(db);
        
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("❌ Error in getUsers:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// รับ Request ขอประวัติรายบุคคล
exports.getUserHistory = async (req, res) => {
    try {
        const db = req.app.locals.db || req.db || await initDatabase();
        const userId = req.params.id;
        
        const history = await adminService.getUserEnrollmentHistory(db, userId);
        
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error("❌ Error in getUserHistory:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};