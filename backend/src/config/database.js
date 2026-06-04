const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

async function initDatabase() {
    // กำหนด Path ให้ไฟล์ database.sqlite อยู่ที่ root ของโฟลเดอร์ backend
    const dbPath = path.resolve(__dirname, '../../database.sqlite');

    try {
        // เปิด/สร้าง SQLite database
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

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
                description TEXT,
                cover_image TEXT,
                price REAL DEFAULT 0,
                max_capacity INTEGER DEFAULT 10,
                total_lessons INTEGER DEFAULT 10,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                completed_lessons INTEGER DEFAULT 0,
                is_finished INTEGER DEFAULT 0,
                enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (course_id) REFERENCES courses(id),
                UNIQUE(user_id, course_id)
            );

            CREATE TABLE IF NOT EXISTS badges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                badge_name TEXT NOT NULL,
                badge_img TEXT NOT NULL,
                course_id INTEGER NOT NULL,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_badges (
                user_id INTEGER NOT NULL,
                badge_id INTEGER NOT NULL,
                earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, badge_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_course_category ON courses(category);
            CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
            CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
        `);

        // 🔧 Migrate existing course table to include price field if missing
        const courseColumns = await db.all("PRAGMA table_info(courses)");
        if (!courseColumns.some(column => column.name === 'price')) {
            await db.run('ALTER TABLE courses ADD COLUMN price REAL DEFAULT 0');
        }

        const userColumns = await db.all("PRAGMA table_info(users)");
        if (!userColumns.some(column => column.name === 'fullname')) {
            await db.run("ALTER TABLE users ADD COLUMN fullname TEXT DEFAULT 'ไม่ระบุชื่อ'");
            console.log('🔧 Migrated users table: Added fullname column successfully.');
        }

        // 🌟 1. Seeding: บังคับเช็คและเติม User ให้ครบ 30 คนเสมอ! 🌟
        const usersToSeed = [
            // 👨‍🎓 กลุ่มนักเรียน (Student)
            { username: 'student1', email: 'student1@turnpro.com', fullname: 'สมชาย เรียนดี (Student 1)', password: 'student1', role: 'student' },
            { username: 'student2', email: 'student2@turnpro.com', fullname: 'สมหญิง ขยันเรียน (Student 2)', password: 'student2', role: 'student' },
            { username: 'student3', email: 'student3@turnpro.com', fullname: 'นพดล คนเก่ง (Student 3)', password: 'student3', role: 'student' },
            { username: 'student4', email: 'student4@turnpro.com', fullname: 'มาลี สีสวย (Student 4)', password: 'student4', role: 'student' },
            { username: 'student5', email: 'student5@turnpro.com', fullname: 'วิชัย ใจดี (Student 5)', password: 'student5', role: 'student' },
            { username: 'student6', email: 'student6@turnpro.com', fullname: 'อารีย์ มีโชค (Student 6)', password: 'student6', role: 'student' },
            { username: 'student7', email: 'student7@turnpro.com', fullname: 'ประเสริฐ เลิศล้ำ (Student 7)', password: 'student7', role: 'student' },
            { username: 'student8', email: 'student8@turnpro.com', fullname: 'ดวงใจ ใฝ่รู้ (Student 8)', password: 'student8', role: 'student' },
            { username: 'student9', email: 'student9@turnpro.com', fullname: 'ชัยยุทธ ยอดเยี่ยม (Student 9)', password: 'student9', role: 'student' },
            { username: 'student10', email: 'student10@turnpro.com', fullname: 'ศิริพร รุ่งเรือง (Student 10)', password: 'student10', role: 'student' },
            { username: 'student11', email: 'student11@turnpro.com', fullname: 'กิตติ พูนทรัพย์ (Student 11)', password: 'student11', role: 'student' },
            { username: 'student12', email: 'student12@turnpro.com', fullname: 'นงนุช เจริญดี (Student 12)', password: 'student12', role: 'student' },
            { username: 'student13', email: 'student13@turnpro.com', fullname: 'เอกราช ชาติไทย (Student 13)', password: 'student13', role: 'student' },
            { username: 'student14', email: 'student14@turnpro.com', fullname: 'วรุฒ บุญมาก (Student 14)', password: 'student14', role: 'student' },
            { username: 'student15', email: 'student15@turnpro.com', fullname: 'พรทิพย์ ศรีสวัสดิ์ (Student 15)', password: 'student15', role: 'student' },
            { username: 'student16', email: 'student16@turnpro.com', fullname: 'สุชาติ ทองสุก (Student 16)', password: 'student16', role: 'student' },
            { username: 'student17', email: 'student17@turnpro.com', fullname: 'ธนพล รักเรียน (Student 17)', password: 'student17', role: 'student' },
            { username: 'student18', email: 'student18@turnpro.com', fullname: 'วิภา มีสุข (Student 18)', password: 'student18', role: 'student' },
            { username: 'student19', email: 'student19@turnpro.com', fullname: 'อานนท์ มั่นคง (Student 19)', password: 'student19', role: 'student' },
            { username: 'student20', email: 'student20@turnpro.com', fullname: 'ณัฐวุฒิ ใจสู้ (Student 20)', password: 'student20', role: 'student' },
            { username: 'student21', email: 'student21@turnpro.com', fullname: 'กาญจนา รักสงบ (Student 21)', password: 'student21', role: 'student' },
            { username: 'student22', email: 'student22@turnpro.com', fullname: 'นิรมล คนงาม (Student 22)', password: 'student22', role: 'student' },
            { username: 'student23', email: 'student23@turnpro.com', fullname: 'ปิยะ สุดยอด (Student 23)', password: 'student23', role: 'student' },
            { username: 'student24', email: 'student24@turnpro.com', fullname: 'ศักดิ์ชัย ใจกล้า (Student 24)', password: 'student24', role: 'student' },
            { username: 'student25', email: 'student25@turnpro.com', fullname: 'อรทัย ใจดี (Student 25)', password: 'student25', role: 'student' },
            { username: 'student26', email: 'student26@turnpro.com', fullname: 'รุ่งโรจน์ โชติช่วง (Student 26)', password: 'student26', role: 'student' },
            { username: 'student27', email: 'student27@turnpro.com', fullname: 'มยุรี สุขสม (Student 27)', password: 'student27', role: 'student' },

            // 🛡️ กลุ่มผู้ดูแลระบบ (Admin)
            { username: 'admin1', email: 'admin1@turnpro.com', fullname: 'นายระบบ ผู้ดูแล 1 (Admin)', password: 'admin1', role: 'admin' },
            { username: 'admin2', email: 'admin2@turnpro.com', fullname: 'นางสาวแอดมิน ผู้จัดการ 2 (Admin)', password: 'admin2', role: 'admin' },
            { username: 'admin3', email: 'admin3@turnpro.com', fullname: 'คุณหัวหน้า สูงสุด (Admin)', password: 'admin3', role: 'admin' }
        ];

        let addedUsers = 0;
        for (const u of usersToSeed) {
            // เช็คว่ามี username นี้หรือยังแบบเรียงคน 
            const exists = await db.get("SELECT id FROM users WHERE username = ?", [u.username]);
            if (!exists) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await db.run(
                    `INSERT INTO users (username, email, fullname, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
                    [u.username, u.email, u.fullname, hashedPassword, u.role]
                );
                addedUsers++;
            }
        }
        if (addedUsers > 0) {
            console.log(`🌱 Seeded ${addedUsers} new mock users successfully.`);
        }


        // 🌟 2. ตรวจสอบและลงทะเบียนคอร์สเรียนจำลอง (Mock Courses)
        const courseCount = await db.get('SELECT COUNT(*) as count FROM courses');
        if (courseCount.count === 0) {
            const adminUser = await db.get("SELECT id FROM users WHERE role = 'admin'");
            const adminId = adminUser ? adminUser.id : 1;

            const mockCourses = [
                { title: 'HTML5 & CSS3 Responsive Live Workshop', category: 'HTML/CSS', difficulty: 'Beginner', description: 'เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)', cover_image: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', price: 350, max_capacity: 3 },
                { title: 'JavaScript Core & State Management', category: 'JavaScript', difficulty: 'Intermediate', description: 'เจาะลึกกลไกหลักของภาษา JavaScript ฟังก์ชันสมัยใหม่ ES6+, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State', cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', price: 550, max_capacity: 5 },
                { title: 'CSS Animation Immersive Studio', category: 'HTML/CSS', difficulty: 'Intermediate', description: 'สร้างแอนิเมชันสวยงามด้วย CSS keyframes, transitions และ hover effects ที่ตอบโจทย์ UX สมัยใหม่', cover_image: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', price: 420, max_capacity: 8 },
                { title: 'Modern React Hooks & Warp State', category: 'JavaScript', difficulty: 'Intermediate', description: 'เรียนรู้ React Hooks, Context API และ Patterns สำหรับจัดการ state ขนาดใหญ่ในงานจริง', cover_image: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)', price: 880, max_capacity: 10 },
                { title: 'Node.js API Design with Express', category: 'Backend', difficulty: 'Intermediate', description: 'สอนสร้าง API RESTful ด้วย Express, Middleware, validation และการเชื่อมต่อฐานข้อมูลอย่างปลอดภัย', cover_image: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)', price: 720, max_capacity: 12 },
                { title: 'RESTful API & JWT Auth', category: 'Backend', difficulty: 'Advanced', description: 'ระบบยืนยันตัวตน API ด้วย JWT, refresh token และ role-based access control สำหรับแอปจริง', cover_image: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', price: 1100, max_capacity: 10 },
                { title: 'SQL Query Mastery for Developers', category: 'Database', difficulty: 'Beginner', description: 'เข้าใจ SQL SELECT, JOIN, GROUP BY, aggregate functions และการออกแบบ schema ที่อ่านง่าย', cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)', price: 480, max_capacity: 15 },
                { title: 'MongoDB NoSQL Design Patterns', category: 'Database', difficulty: 'Intermediate', description: 'เรียนการออกแบบข้อมูล NoSQL, indexing, aggregation pipeline และวิธีเลือกใช้ MongoDB ในโปรเจกต์จริง', cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)', price: 620, max_capacity: 14 },
                { title: 'Fullstack Vue + Firebase Crash Course', category: 'JavaScript', difficulty: 'Beginner', description: 'สร้างเว็บแอปเต็มรูปแบบด้วย Vue.js และ Firebase Authentication, Firestore พร้อม deploy จริง', cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)', price: 490, max_capacity: 12 },
                { title: 'TypeScript Safety & Architecture', category: 'JavaScript', difficulty: 'Advanced', description: 'เรียน TypeScript ตั้งแต่ type system, generics จนถึง architectural patterns สำหรับทีมใหญ่', cover_image: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', price: 950, max_capacity: 8 },
                { title: 'Python Scripting for Web Automation', category: 'Backend', difficulty: 'Beginner', description: 'ลงมือเขียน Python script สำหรับ web scraping, automation และ data processing เบื้องต้น', cover_image: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)', price: 390, max_capacity: 10 },
                { title: 'Docker Containerization Essentials', category: 'DevOps', difficulty: 'Intermediate', description: 'เข้าใจ Docker containers, Dockerfile, และการ deploy application แบบแยก service อย่างมืออาชีพ', cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)', price: 530, max_capacity: 10 },
                { title: 'Git & GitHub Collaboration Workshop', category: 'DevOps', difficulty: 'Beginner', description: 'เรียน Git workflow, branch strategy, pull request และการทำงานร่วมกันผ่าน GitHub อย่างมืออาชีพ', cover_image: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)', price: 250, max_capacity: 20 },
                { title: 'AWS Cloud Basics for Developers', category: 'DevOps', difficulty: 'Intermediate', description: 'เริ่มต้น AWS services ที่นักพัฒนาควรรู้: Lambda, S3, API Gateway, IAM และการ deploy แบบเบื้องต้น', cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0F766E 100%)', price: 1050, max_capacity: 12 },
                { title: 'Progressive Web App (PWA) Build Lab', category: 'JavaScript', difficulty: 'Advanced', description: 'สร้าง PWA ที่โหลดเร็ว ติดตั้งได้ และรองรับ offline ด้วย service worker และ manifest file', cover_image: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)', price: 1250, max_capacity: 7 },
                { title: 'Accessibility & UX for Modern Web', category: 'HTML/CSS', difficulty: 'Beginner', description: 'เรียนสร้างเว็บที่เข้าถึงได้ง่ายสำหรับทุกคน ด้วยหลักการ UX และมาตรฐาน accessibility ของ W3C', cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', price: 310, max_capacity: 10 },
                { title: 'PostgreSQL Performance Tuning', category: 'Database', difficulty: 'Advanced', description: 'ปรับ query ให้เร็วขึ้น, ใช้ indexes อย่างถูกต้อง และออกแบบตารางให้รองรับงาน Production', cover_image: 'linear-gradient(135deg, #15803D 0%, #166534 100%)', price: 870, max_capacity: 9 },
                { title: 'Testing with Jest and Cypress', category: 'JavaScript', difficulty: 'Intermediate', description: 'ทดสอบฟรอนต์เอนด์และ API ด้วย Jest unit tests, React testing library และ end-to-end tests ด้วย Cypress', cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)', price: 650, max_capacity: 11 },
                { title: 'Serverless Functions on Netlify', category: 'Backend', difficulty: 'Intermediate', description: ' deploy serverless functions บน Netlify, เชื่อมต่อกับ API และจัดการ workflow แบบไร้เซิร์ฟเวอร์', cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', price: 760, max_capacity: 10 },
                { title: 'Cybersecurity Essentials for Web Apps', category: 'Backend', difficulty: 'Advanced', description: 'เรียนรู้การป้องกัน XSS, CSRF, SQL injection และปรับแอปให้ปลอดภัยสำหรับผู้ใช้งานจริง', cover_image: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', price: 980, max_capacity: 8 }
            ];

            for (const course of mockCourses) {
                await db.run(
                    `INSERT INTO courses (title, category, difficulty, description, cover_image, price, max_capacity, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        course.title, course.category, course.difficulty, course.description,
                        course.cover_image, course.price, course.max_capacity, adminId
                    ]
                );
            }
        }

        return db;
    } catch (err) {
        console.error('❌ Database initialization error:', err);
        throw err;
    }
}

module.exports = { initDatabase };