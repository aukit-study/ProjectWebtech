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
                lessons TEXT DEFAULT '[]',
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



            CREATE INDEX IF NOT EXISTS idx_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_course_category ON courses(category);
            CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
            CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
        `);

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
                {
                    title: 'HTML5 & CSS3 Responsive Live Workshop',
                    category: 'HTML/CSS',
                    difficulty: 'Beginner',
                    description: 'เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)',
                    cover_image: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    price: 350,
                    max_capacity: 3,
                    lessons: [
                        { id: 'l-1-1', title: 'แนะนำการพัฒนาเว็บและโครงสร้าง HTML5', isCompleted: false },
                        { id: 'l-1-2', title: 'ความรู้พื้นฐาน CSS3 และการจัดเลย์เอาต์ด้วย Flexbox', isCompleted: false },
                        { id: 'l-1-3', title: 'การทำ Responsive Web Design ด้วย Media Queries', isCompleted: false },
                        { id: 'l-1-4', title: 'Workshop: ออกแบบและสร้างเว็บเพจ Glassmorphism', isCompleted: false }
                    ]
                },
                {
                    title: 'JavaScript Core & State Management',
                    category: 'JavaScript',
                    difficulty: 'Intermediate',
                    description: 'เจาะลึกกลไกหลักของภาษา JavaScript ฟังก์ชันสมัยใหม่ ES6+, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State',
                    cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    price: 550,
                    max_capacity: 5,
                    lessons: [
                        { id: 'l-2-1', title: 'ทำความรู้จักกลไกของ JavaScript และคำสั่ง ES6+', isCompleted: false },
                        { id: 'l-2-2', title: 'การเข้าถึงและเปลี่ยนแปลง DOM แบบไดนามิก', isCompleted: false },
                        { id: 'l-2-3', title: 'การจัดการ Asynchronous Programming ด้วย Promise และ Async/Await', isCompleted: false },
                        { id: 'l-2-4', title: 'การใช้งาน LocalStorage ในการเก็บข้อมูลและทำ State Management', isCompleted: false }
                    ]
                },
                {
                    title: 'CSS Animation Immersive Studio',
                    category: 'HTML/CSS',
                    difficulty: 'Intermediate',
                    description: 'สร้างแอนิเมชันสวยงามด้วย CSS keyframes, transitions และ hover effects ที่ตอบโจทย์ UX สมัยใหม่',
                    cover_image: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    price: 420,
                    max_capacity: 8,
                    lessons: [
                        { id: 'l-3-1', title: 'พื้นฐานของ CSS Transitions และ Transform', isCompleted: false },
                        { id: 'l-3-2', title: 'การเขียน CSS Keyframe Animations สำหรับแอนิเมชันที่ซับซ้อน', isCompleted: false },
                        { id: 'l-3-3', title: 'การทำ Hover Effects และ Micro-animations', isCompleted: false },
                        { id: 'l-3-4', title: 'การวัดผลและปรับจูนความลื่นไหลด้วย Chrome DevTools', isCompleted: false }
                    ]
                },
                {
                    title: 'Modern React Hooks & Warp State',
                    category: 'JavaScript',
                    difficulty: 'Intermediate',
                    description: 'เรียนรู้ React Hooks, Context API และ Patterns สำหรับจัดการ state ขนาดใหญ่ในงานจริง',
                    cover_image: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                    price: 880,
                    max_capacity: 10,
                    lessons: [
                        { id: 'l-4-1', title: 'เจาะลึก useState และ useEffect สำหรับจัดการ Component Lifecycle', isCompleted: false },
                        { id: 'l-4-2', title: 'การแชร์ State ข้ามคอมโพเนนต์ด้วย Context API', isCompleted: false },
                        { id: 'l-4-3', title: 'การปรับปรุงประสิทธิภาพด้วย useMemo, useCallback และ Custom Hooks', isCompleted: false },
                        { id: 'l-4-4', title: 'การใช้งาน Redux หรือ Zustand เพื่อจัดการ State ขนาดใหญ่', isCompleted: false }
                    ]
                },
                {
                    title: 'Node.js API Design with Express',
                    category: 'Backend',
                    difficulty: 'Intermediate',
                    description: 'สอนสร้าง API RESTful ด้วย Express, Middleware, validation และการเชื่อมต่อฐานข้อมูลอย่างปลอดภัย',
                    cover_image: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
                    price: 720,
                    max_capacity: 12,
                    lessons: [
                        { id: 'l-5-1', title: 'การติดตั้ง Node.js และการสร้างเซิร์ฟเวอร์ Express เบื้องต้น', isCompleted: false },
                        { id: 'l-5-2', title: 'การทำ Routing, Controllers และการจัดโครงสร้างโค้ดแบบ MVC', isCompleted: false },
                        { id: 'l-5-3', title: 'การทำงานร่วมกับ Express Middleware และ Error Handling', isCompleted: false },
                        { id: 'l-5-4', title: 'การเชื่อมต่อฐานข้อมูลและการทำ Data Validation', isCompleted: false }
                    ]
                },
                {
                    title: 'RESTful API & JWT Auth',
                    category: 'Backend',
                    difficulty: 'Advanced',
                    description: 'ระบบยืนยันตัวตน API ด้วย JWT, refresh token และ role-based access control สำหรับแอปจริง',
                    cover_image: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    price: 1100,
                    max_capacity: 10,
                    lessons: [
                        { id: 'l-6-1', title: 'หลักการทำงานของ RESTful API และ HTTP Methods', isCompleted: false },
                        { id: 'l-6-2', title: 'ระบบการทำงานของ Token-based Authentication ด้วย JWT', isCompleted: false },
                        { id: 'l-6-3', title: 'การจัดการ Refresh Token และความปลอดภัยในการเข้าถึงทรัพยากร', isCompleted: false },
                        { id: 'l-6-4', title: 'การควบคุมการเข้าถึงด้วยสิทธิ์ผู้ใช้งาน (Role-Based Access Control)', isCompleted: false }
                    ]
                },
                {
                    title: 'SQL Query Mastery for Developers',
                    category: 'Database',
                    difficulty: 'Beginner',
                    description: 'เข้าใจ SQL SELECT, JOIN, GROUP BY, aggregate functions และการออกแบบ schema ที่อ่านง่าย',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
                    price: 480,
                    max_capacity: 15,
                    lessons: [
                        { id: 'l-7-1', title: 'หลักการออกแบบฐานข้อมูลแบบ Relational และการสร้าง Table', isCompleted: false },
                        { id: 'l-7-2', title: 'การใช้งาน SELECT คำสั่งกรองข้อมูลเบื้องต้น (WHERE, ORDER BY)', isCompleted: false },
                        { id: 'l-7-3', title: 'การเชื่อมโยงตารางข้อมูลด้วย INNER/LEFT/RIGHT JOIN', isCompleted: false },
                        { id: 'l-7-4', title: 'การทำ Grouping และ Aggregate Functions (SUM, AVG, COUNT)', isCompleted: false }
                    ]
                },
                {
                    title: 'MongoDB NoSQL Design Patterns',
                    category: 'Database',
                    difficulty: 'Intermediate',
                    description: 'เรียนการออกแบบข้อมูล NoSQL, indexing, aggregation pipeline และวิธีเลือกใช้ MongoDB ในโปรเจกต์จริง',
                    cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
                    price: 620,
                    max_capacity: 14,
                    lessons: [
                        { id: 'l-8-1', title: 'ความแตกต่างระหว่าง SQL และ NoSQL: แนะนำ MongoDB', isCompleted: false },
                        { id: 'l-8-2', title: 'การจัดการข้อมูล BSON Documents (CRUD Operations)', isCompleted: false },
                        { id: 'l-8-3', title: 'การทำ Indexing เพื่อเพิ่มความเร็วในการดึงข้อมูล', isCompleted: false },
                        { id: 'l-8-4', title: 'การวิเคราะห์ข้อมูลด้วย MongoDB Aggregation Pipeline', isCompleted: false }
                    ]
                },
                {
                    title: 'Fullstack Vue + Firebase Crash Course',
                    category: 'JavaScript',
                    difficulty: 'Beginner',
                    description: 'สร้างเว็บแอปเต็มรูปแบบด้วย Vue.js และ Firebase Authentication, Firestore พร้อม deploy จริง',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                    price: 490,
                    max_capacity: 12,
                    lessons: [
                        { id: 'l-9-1', title: 'การทำความเข้าใจสถาปัตยกรรมของ Vue.js และ Single File Components', isCompleted: false },
                        { id: 'l-9-2', title: 'การเชื่อมต่อระบบสมัครสมาชิกผ่าน Firebase Authentication', isCompleted: false },
                        { id: 'l-9-3', title: 'การจัดการข้อมูลแบบ Real-time ด้วย Firestore Database', isCompleted: false },
                        { id: 'l-9-4', title: 'การตั้งค่า Firebase Hosting และแนวทางการ Deploy ขึ้นระบบจริง', isCompleted: false }
                    ]
                },
                {
                    title: 'TypeScript Safety & Architecture',
                    category: 'JavaScript',
                    difficulty: 'Advanced',
                    description: 'เรียน TypeScript ตั้งแต่ type system, generics จนถึง architectural patterns สำหรับทีมใหญ่',
                    cover_image: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    price: 950,
                    max_capacity: 8,
                    lessons: [
                        { id: 'l-10-1', title: 'ทำไมต้อง TypeScript: พื้นฐาน Static Typing', isCompleted: false },
                        { id: 'l-10-2', title: 'การใช้งาน Interfaces, Types และ Generics ในงานจริง', isCompleted: false },
                        { id: 'l-10-3', title: 'การเขียน Decorators และการกำหนดโมเดลทางสถาปัตยกรรม', isCompleted: false },
                        { id: 'l-10-4', title: 'การตั้งค่า tsconfig และการย้ายระบบจาก JavaScript ไปยัง TypeScript', isCompleted: false }
                    ]
                },
                {
                    title: 'Python Scripting for Web Automation',
                    category: 'Backend',
                    difficulty: 'Beginner',
                    description: 'ลงมือเขียน Python script สำหรับ web scraping, automation และ data processing เบื้องต้น',
                    cover_image: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                    price: 390,
                    max_capacity: 10,
                    lessons: [
                        { id: 'l-11-1', title: 'การเขียนโปรแกรม Python ขั้นพื้นฐานและโครงสร้างข้อมูล', isCompleted: false },
                        { id: 'l-11-2', title: 'การเขียนคำสั่งเพื่อดึงข้อมูลเว็บ (Web Scraping) ด้วย BeautifulSoup', isCompleted: false },
                        { id: 'l-11-3', title: 'การควบคุมเบราว์เซอร์อัตโนมัติด้วย Selenium', isCompleted: false },
                        { id: 'l-11-4', title: 'การประมวลผลข้อมูลและส่งออกผลลัพธ์เป็น CSV/Excel', isCompleted: false }
                    ]
                },
                {
                    title: 'Docker Containerization Essentials',
                    category: 'DevOps',
                    difficulty: 'Intermediate',
                    description: 'เข้าใจ Docker containers, Dockerfile, และการ deploy application แบบแยก service อย่างมืออาชีพ',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                    price: 530,
                    max_capacity: 10,
                    lessons: [
                        { id: 'l-12-1', title: 'ทำความรู้จัก Containerization และสถาปัตยกรรมของ Docker', isCompleted: false },
                        { id: 'l-12-2', title: 'การเขียน Dockerfile เพื่อสร้าง Image สำหรับแอปพลิเคชัน', isCompleted: false },
                        { id: 'l-12-3', title: 'การจัดการ Docker Volume และ Docker Network เบื้องต้น', isCompleted: false },
                        { id: 'l-12-4', title: 'การรันแอปพลิเคชันแบบแยก Service ด้วย Docker Compose', isCompleted: false }
                    ]
                },
                {
                    title: 'Git & GitHub Collaboration Workshop',
                    category: 'DevOps',
                    difficulty: 'Beginner',
                    description: 'เรียน Git workflow, branch strategy, pull request และการทำงานร่วมกันผ่าน GitHub อย่างมืออาชีพ',
                    cover_image: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
                    price: 250,
                    max_capacity: 20,
                    lessons: [
                        { id: 'l-13-1', title: 'แนวคิดการจัดการเวอร์ชัน (Version Control) และคำสั่งพื้นฐาน Git', isCompleted: false },
                        { id: 'l-13-2', title: 'การทำงานกับสาขาแยก (Branching & Merging) และการแก้ไข Conflicts', isCompleted: false },
                        { id: 'l-13-3', title: 'การฝากโค้ดและแชร์งานขึ้นระบบ GitHub Cloud', isCompleted: false },
                        { id: 'l-13-4', title: 'การร่วมมือทำงานในทีมผ่าน Pull Request และ Code Review', isCompleted: false }
                    ]
                },
                {
                    title: 'AWS Cloud Basics for Developers',
                    category: 'DevOps',
                    difficulty: 'Intermediate',
                    description: 'เริ่มต้น AWS services ที่นักพัฒนาควรรู้: Lambda, S3, API Gateway, IAM และการ deploy แบบเบื้องต้น',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0F766E 100%)',
                    price: 1050,
                    max_capacity: 12,
                    lessons: [
                        { id: 'l-14-1', title: 'ภาพรวมระบบ Cloud Computing และบริการหลักของ AWS', isCompleted: false },
                        { id: 'l-14-2', title: 'การสร้างเซิร์ฟเวอร์จำลองด้วย Amazon EC2 และจัดเก็บไฟล์บน S3', isCompleted: false },
                        { id: 'l-14-3', title: 'ความเข้าใจเรื่องความปลอดภัยด้วย AWS IAM และ VPC', isCompleted: false },
                        { id: 'l-14-4', title: 'การพัฒนาฟังก์ชันไร้เซิร์ฟเวอร์ด้วย AWS Lambda และ API Gateway', isCompleted: false }
                    ]
                },
                {
                    title: 'Progressive Web App (PWA) Build Lab',
                    category: 'JavaScript',
                    difficulty: 'Advanced',
                    description: 'สร้าง PWA ที่โหลดเร็ว ติดตั้งได้ และรองรับ offline ด้วย service worker และ manifest file',
                    cover_image: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)',
                    price: 1250,
                    max_capacity: 7,
                    lessons: [
                        { id: 'l-15-1', title: 'แนวคิด Progressive Web App และข้อดีเมื่อเทียบกับ Native App', isCompleted: false },
                        { id: 'l-15-2', title: 'การทำงานกับ Service Worker เพื่อจัดการ Cache และโหลดเว็บแบบออฟไลน์', isCompleted: false },
                        { id: 'l-15-3', title: 'การตั้งค่า Web App Manifest เพื่อรองรับการติดตั้งแอปบนหน้าจอหลัก', isCompleted: false },
                        { id: 'l-15-4', title: 'การทำ Push Notifications บนอุปกรณ์เคลื่อนที่', isCompleted: false }
                    ]
                },
                {
                    title: 'Accessibility & UX for Modern Web',
                    category: 'HTML/CSS',
                    difficulty: 'Beginner',
                    description: 'เรียนสร้างเว็บที่เข้าถึงได้ง่ายสำหรับทุกคน ด้วยหลักการ UX และมาตรฐาน accessibility ของ W3C',
                    cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                    price: 310,
                    max_capacity: 10,
                    lessons: [
                        { id: 'l-16-1', title: 'ทำความเข้าใจความพิการประเภทต่างๆ และความสำคัญของ Accessibility', isCompleted: false },
                        { id: 'l-16-2', title: 'การเลือกใช้ HTML Semantics และแอตทริบิวต์ WAI-ARIA', isCompleted: false },
                        { id: 'l-16-3', title: 'การทดสอบความถูกต้องของสัญกรณ์เว็บและ Contrast Color ด้วย Lighthouse', isCompleted: false },
                        { id: 'l-16-4', title: 'หลักการออกแบบหน้าจอเพื่อให้เข้าถึงได้ด้วยคีย์บอร์ดเพียงอย่างเดียว', isCompleted: false }
                    ]
                },
                {
                    title: 'PostgreSQL Performance Tuning',
                    category: 'Database',
                    difficulty: 'Advanced',
                    description: 'ปรับ query ให้เร็วขึ้น, ใช้ indexes อย่างถูกต้อง และออกแบบตารางให้รองรับงาน Production',
                    cover_image: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                    price: 870,
                    max_capacity: 9,
                    lessons: [
                        { id: 'l-17-1', title: 'การวิเคราะห์แผนการทำงานคิวรี (Query execution plan) ด้วย EXPLAIN ANALYZE', isCompleted: false },
                        { id: 'l-17-2', title: 'การวิเคราะห์โครงสร้าง Indexing และการกู้คืนประสิทธิภาพดัชนี', isCompleted: false },
                        { id: 'l-17-3', title: 'การปรับปรุงโครงสร้างตารางด้วย Partitioning และการเขียน Query ที่เหมาะสม', isCompleted: false },
                        { id: 'l-17-4', title: 'การตั้งค่า PostgreSQL configuration เพื่อจูนหน่วยความจำให้เหมาะสม', isCompleted: false }
                    ]
                },
                {
                    title: 'Testing with Jest and Cypress',
                    category: 'JavaScript',
                    difficulty: 'Intermediate',
                    description: 'ทดสอบฟรอนต์เอนด์และ API ด้วย Jest unit tests, React testing library และ end-to-end tests ด้วย Cypress',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                    price: 650,
                    max_capacity: 11,
                    lessons: [
                        { id: 'l-18-1', title: 'ความสำคัญของการทดสอบ และการเขียน Unit Tests ด้วย Jest', isCompleted: false },
                        { id: 'l-18-2', title: 'การทดสอบคอมโพเนนต์และการทำ Mocking API ด้วย React Testing Library', isCompleted: false },
                        { id: 'l-18-3', title: 'การทดสอบระบบแบบหัวจรดท้าย (End-to-End Testing) ด้วย Cypress', isCompleted: false },
                        { id: 'l-18-4', title: 'การวัดผลทดสอบและการทำ Code Coverage รายงานผล', isCompleted: false }
                    ]
                },
                {
                    title: 'Serverless Functions on Netlify',
                    category: 'Backend',
                    difficulty: 'Intermediate',
                    description: ' deploy serverless functions บน Netlify, เชื่อมต่อกับ API และจัดการ workflow แบบไร้เซิร์ฟเวอร์',
                    cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    price: 760,
                    max_capacity: 10,
                    lessons: [
                        { id: 'l-19-1', title: 'ภาพรวมการพัฒนา Serverless Functions บนบริการ Netlify', isCompleted: false },
                        { id: 'l-19-2', title: 'การเขียนฟังก์ชันสำหรับจัดการ API request และเชื่อมต่อ API ภายนอก', isCompleted: false },
                        { id: 'l-19-3', title: 'การจัดระบบ Environment Variables และความปลอดภัยใน Serverless', isCompleted: false },
                        { id: 'l-19-4', title: 'การเชื่อมโยง Webhook และแนวทางการสร้าง Event-driven functions', isCompleted: false }
                    ]
                },
                {
                    title: 'Cybersecurity Essentials for Web Apps',
                    category: 'Backend',
                    difficulty: 'Advanced',
                    description: 'เรียนรู้การป้องกัน XSS, CSRF, SQL injection และปรับแอปให้ปลอดภัยสำหรับผู้ใช้งานจริง',
                    cover_image: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                    price: 980,
                    max_capacity: 8,
                    lessons: [
                        { id: 'l-20-1', title: 'หลักการทำงานของเว็บเบราว์เซอร์และความปลอดภัยขั้นพื้นฐาน', isCompleted: false },
                        { id: 'l-20-2', title: 'การป้องกันช่องโหว่ Cross-Site Scripting (XSS)', isCompleted: false },
                        { id: 'l-20-3', title: 'การป้องกัน CSRF และ SQL Injection ด้วย ORM', isCompleted: false },
                        { id: 'l-20-4', title: 'การรับมือกับ DoS Attacks และตั้งค่าระบบจำกัดทราฟฟิก (Rate Limiter)', isCompleted: false }
                    ]
                }
            ];

            for (const course of mockCourses) {
                await db.run(
                    `INSERT INTO courses (title, category, difficulty, description, cover_image, price, max_capacity, lessons, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        course.title,
                        course.category,
                        course.difficulty,
                        course.description,
                        course.cover_image,
                        course.price,
                        course.max_capacity,
                        JSON.stringify(course.lessons || []),
                        adminId
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