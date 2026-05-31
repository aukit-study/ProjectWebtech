const AuthService = require('../services/authService');

class AuthController {
    static async register(req, res) {
        // ดึงตัวแปรฐานข้อมูลที่ฝากไว้ใน app.locals มาใช้งาน
        const db = req.app.locals.db; 
        const { username, email, password } = req.body;

        try {
            // ส่งข้อมูลไปประมวลผลที่ Service Layer 
            const newUser = await AuthService.registerUser(db, username, email, password);
            
            // ส่ง Response กลับไปหา Frontend เมื่อสำเร็จ
            return res.status(201).json({
                success: true,
                message: 'User registered successfully.',
                user: newUser
            });
        } catch (error) {
            // Graceful Error Handling: จัดการ Error แต่ละประเภทโดยไม่พ่น Stack Trace ใส่หน้าเว็บ [cite: 52]
            if (error.message === 'MISSING_FIELDS') {
                return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
            }
            if (error.message === 'USER_ALREADY_EXISTS') {
                return res.status(400).json({ success: false, message: 'Username or Email already exists.' });
            }
            
            // Error อื่นๆ ของระบบ
            console.error('Registration Error:', error); // Log ไว้ฝั่ง Developer [cite: 52]
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    }

    static async login(req, res) {
        const db = req.app.locals.db; // ดึงฐานข้อมูลจาก app.locals
        const { username, password } = req.body;

        try {
            // ส่งไปประมวลผลที่ Service Layer 
            const result = await AuthService.loginUser(db, username, password);
            
            // ส่ง Response กลับเมื่อ Login สำเร็จ (พ่น Token กลับไปให้ Frontend) 
            return res.status(200).json({
                success: true,
                message: 'Login successful.',
                token: result.token,
                user: result.user
            });
        } catch (error) {
            // Graceful Error Handling: ซ่อน Stack Trace จัดการส่ง Error Message ที่เหมาะสม [cite: 52]
            if (error.message === 'MISSING_FIELDS') {
                return res.status(400).json({ success: false, message: 'Please enter both username and password.' });
            }
            if (error.message === 'INVALID_CREDENTIALS') {
                return res.status(401).json({ success: false, message: 'Invalid username or password.' });
            }
            
            console.error('Login Error:', error); // Log ให้ผู้พัฒนาเห็นหลังบ้าน [cite: 52]
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    }
}

module.exports = AuthController;