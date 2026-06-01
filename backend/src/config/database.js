const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initDatabase() {
    // กำหนด Path ให้ไฟล์ database.sqlite อยู่ที่ root ของโฟลเดอร์ backend
    const dbPath = path.resolve(__dirname, '../../database.sqlite');
    
    try {
        // เปิด/สร้าง SQLite database
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('💾 SQLite Database connected successfully.');
        console.log(`📂 Database path: ${dbPath}`);

        // สร้าง SQL Schema สำหรับตาราง users
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                fullname TEXT,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                difficulty TEXT DEFAULT 'Beginner',
                duration TEXT,
                description TEXT,
                cover_image TEXT,
                max_capacity INTEGER DEFAULT 10,
                current_bookings INTEGER DEFAULT 0,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (course_id) REFERENCES courses(id),
                UNIQUE(user_id, course_id)
            );

            CREATE INDEX IF NOT EXISTS idx_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_course_category ON courses(category);
            CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
            CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
        `);

        console.log('✅ Tables created or already exist.');

        // 🌱 Seeding Mock Data
        // 1. ตรวจสอบและลงทะเบียนผู้ใช้จำลอง (Mock Users)
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            const bcrypt = require('bcrypt');
            const studentPasswordHash = await bcrypt.hash('1234', 10);
            const adminPasswordHash = await bcrypt.hash('admin123', 10);

            await db.run(
                `INSERT INTO users (username, email, fullname, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
                ['student', 'student@turnpro.com', 'อุกฤษฏ์ นักเรียนสายโค้ด', studentPasswordHash, 'student']
            );
            await db.run(
                `INSERT INTO users (username, email, fullname, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
                ['admin', 'admin@turnpro.com', 'นายระบบ ผู้ดูแลระบบ', adminPasswordHash, 'admin']
            );
            console.log('🌱 Seeded mock users successfully.');
        }

        // 2. ตรวจสอบและลงทะเบียนคอร์สเรียนจำลอง (Mock Courses)
        const courseCount = await db.get('SELECT COUNT(*) as count FROM courses');
        if (courseCount.count === 0) {
            // ดึง ID ของ admin มาเป็นผู้สร้างคอร์ส
            const adminUser = await db.get("SELECT id FROM users WHERE role = 'admin'");
            const adminId = adminUser ? adminUser.id : 1;

            await db.run(
                `INSERT INTO courses (title, category, difficulty, duration, description, cover_image, max_capacity, current_bookings, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'HTML5 & CSS3 Responsive Live Workshop',
                    'HTML/CSS',
                    'Beginner',
                    '4 Hours',
                    'เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)',
                    'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    3,
                    2, // 🌟 เหลือที่นั่งว่าง 1 ที่
                    adminId
                ]
            );

            await db.run(
                `INSERT INTO courses (title, category, difficulty, duration, description, cover_image, max_capacity, current_bookings, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'JavaScript Core & State Management',
                    'JavaScript',
                    'Intermediate',
                    '6 Hours',
                    'เจาะลึกกลไกหลักของภาษา JavaScript ฟังก์ชันสมัยใหม่ ES6+, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State',
                    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    5,
                    5, // 🌟 จำลองสถานการณ์ "คลาสเต็ม" (เพื่อเทสระบบดัก 409 Conflict)
                    adminId
                ]
            );
            console.log('🌱 Seeded mock courses successfully.');
        }

        return db;
    } catch (err) {
        console.error('❌ Database initialization error:', err);
        throw err;
    }
}

module.exports = { initDatabase };