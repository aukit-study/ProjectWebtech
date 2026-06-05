const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    // ฟังก์ชั่นสำหรับตรวจสอบและสร้างผู้ใช้งานใหม่
    static async registerUser(db, username, email, fullname, password) {
        if (!username || !email || !password) {
            throw new Error('MISSING_FIELDS');
        }

        // 2. The Gatekeeper Pattern: ตรวจสอบว่ามี Username หรือ Email นี้ในระบบแล้วหรือยัง
        const existingUser = await db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?', // 🔒 Parameterized Query (?) เพื่อป้องกัน SQL Injection
            [username, email]
        );

        if (existingUser) {
            throw new Error('USER_ALREADY_EXISTS');
        }

        // 3. Auth Logic: แปลงรหัสผ่านจาก Plain-text ให้เป็น Salted Hashing (bcrypt) 
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 4. บันทึกข้อมูลผู้ใช้งานใหม่ลงฐานข้อมูล
        // 🔒 บังคับใช้ Parameterized Query (?) สำหรับการ INSERT ข้อมูล
        const result = await db.run(
            'INSERT INTO users (username, email, fullname, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, fullname || username, passwordHash, 'student']
        );

        return { id: result.lastID, username, email, fullname: fullname || username, role: 'student' };
    }
    static async loginUser(db, username, password) {
        // 1. Server-Side Validation: ตรวจสอบว่ากรอกข้อมูลครบถ้วนไหม 
        if (!username || !password) {
            throw new Error('MISSING_FIELDS');
        }

        // 2. The Gatekeeper Pattern: ค้นหา User ในฐานข้อมูลด้วย Parameterized Query
        const user = await db.get(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        // 3. ตรวจสอบความถูกต้อง (ถ้าไม่เจอ User หรือรหัสผ่านไม่ตรง)
        // 🔒 ใช้ bcrypt.compare เพื่อถอดรหัสและเทียบรหัสผ่านแบบ Salted Hashing 
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // 4. Auth Logic: เมื่อผ่านการตรวจสอบ ให้สร้าง Stateless Identity (JWT Token) 
        // ดึงค่า JWT_SECRET และ JWT_EXPIRES_IN จากไฟล์ .env ที่เราสร้างไว้ 
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
        );

        // ส่งข้อมูลผู้ใช้และตั๋ว JWT กลับไป (ไม่ส่ง password_hash กลับไปเด็ดขาด)
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname || user.username,
                role: user.role
            }
        };
    }
}

module.exports = AuthService;