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
        const hasPriceColumn = courseColumns.some(column => column.name === 'price');
        if (!hasPriceColumn) {
            await db.run('ALTER TABLE courses ADD COLUMN price REAL DEFAULT 0');
        }

        // 🌟 -----------------------------------------------------------------
        // 🌟 Auto-Migration สำหรับเติมคอลัมน์ fullname ลงในตาราง users ตัวเก่า
        // 🌟 -----------------------------------------------------------------
        const userColumns = await db.all("PRAGMA table_info(users)");
        const hasFullnameColumn = userColumns.some(column => column.name === 'fullname');
        if (!hasFullnameColumn) {
            await db.run("ALTER TABLE users ADD COLUMN fullname TEXT DEFAULT 'ไม่ระบุชื่อ'");
            console.log('🔧 Migrated users table: Added fullname column successfully.');
        }
        // --------------------------------------------------------------------

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

            const mockCourses = [
                {
                    title: 'HTML5 & CSS3 Responsive Live Workshop',
                    category: 'HTML/CSS',
                    difficulty: 'Beginner',
                    duration: '4 Hours',
                    description: 'เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)',
                    cover_image: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    price: 350,
                    max_capacity: 3
                },
                {
                    title: 'JavaScript Core & State Management',
                    category: 'JavaScript',
                    difficulty: 'Intermediate',
                    duration: '6 Hours',
                    description: 'เจาะลึกกลไกหลักของภาษา JavaScript ฟังก์ชันสมัยใหม่ ES6+, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State',
                    cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    price: 550,
                    max_capacity: 5
                },
                {
                    title: 'CSS Animation Immersive Studio',
                    category: 'HTML/CSS',
                    difficulty: 'Intermediate',
                    duration: '5 Hours',
                    description: 'สร้างแอนิเมชันสวยงามด้วย CSS keyframes, transitions และ hover effects ที่ตอบโจทย์ UX สมัยใหม่',
                    cover_image: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    price: 420,
                    max_capacity: 8
                },
                {
                    title: 'Modern React Hooks & Warp State',
                    category: 'JavaScript',
                    difficulty: 'Intermediate',
                    duration: '8 Hours',
                    description: 'เรียนรู้ React Hooks, Context API และ Patterns สำหรับจัดการ state ขนาดใหญ่ในงานจริง',
                    cover_image: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                    price: 880,
                    max_capacity: 10
                },
                {
                    title: 'Node.js API Design with Express',
                    category: 'Backend',
                    difficulty: 'Intermediate',
                    duration: '7 Hours',
                    description: 'สอนสร้าง API RESTful ด้วย Express, Middleware, validation และการเชื่อมต่อฐานข้อมูลอย่างปลอดภัย',
                    cover_image: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
                    price: 720,
                    max_capacity: 12
                },
                {
                    title: 'RESTful API & JWT Auth',
                    category: 'Backend',
                    difficulty: 'Advanced',
                    duration: '9 Hours',
                    description: 'ระบบยืนยันตัวตน API ด้วย JWT, refresh token และ role-based access control สำหรับแอปจริง',
                    cover_image: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    price: 1100,
                    max_capacity: 10
                },
                {
                    title: 'SQL Query Mastery for Developers',
                    category: 'Database',
                    difficulty: 'Beginner',
                    duration: '5 Hours',
                    description: 'เข้าใจ SQL SELECT, JOIN, GROUP BY, aggregate functions และการออกแบบ schema ที่อ่านง่าย',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
                    price: 480,
                    max_capacity: 15
                },
                {
                    title: 'MongoDB NoSQL Design Patterns',
                    category: 'Database',
                    difficulty: 'Intermediate',
                    duration: '6 Hours',
                    description: 'เรียนการออกแบบข้อมูล NoSQL, indexing, aggregation pipeline และวิธีเลือกใช้ MongoDB ในโปรเจกต์จริง',
                    cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
                    price: 620,
                    max_capacity: 14
                },
                {
                    title: 'Fullstack Vue + Firebase Crash Course',
                    category: 'JavaScript',
                    difficulty: 'Beginner',
                    duration: '5 Hours',
                    description: 'สร้างเว็บแอปเต็มรูปแบบด้วย Vue.js และ Firebase Authentication, Firestore พร้อม deploy จริง',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                    price: 490,
                    max_capacity: 12
                },
                {
                    title: 'TypeScript Safety & Architecture',
                    category: 'JavaScript',
                    difficulty: 'Advanced',
                    duration: '6 Hours',
                    description: 'เรียน TypeScript ตั้งแต่ type system, generics จนถึง architectural patterns สำหรับทีมใหญ่',
                    cover_image: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    price: 950,
                    max_capacity: 8
                },
                {
                    title: 'Python Scripting for Web Automation',
                    category: 'Backend',
                    difficulty: 'Beginner',
                    duration: '4 Hours',
                    description: 'ลงมือเขียน Python script สำหรับ web scraping, automation และ data processing เบื้องต้น',
                    cover_image: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                    price: 390,
                    max_capacity: 10
                },
                {
                    title: 'Docker Containerization Essentials',
                    category: 'DevOps',
                    difficulty: 'Intermediate',
                    duration: '4 Hours',
                    description: 'เข้าใจ Docker containers, Dockerfile, และการ deploy application แบบแยก service อย่างมืออาชีพ',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                    price: 530,
                    max_capacity: 10
                },
                {
                    title: 'Git & GitHub Collaboration Workshop',
                    category: 'DevOps',
                    difficulty: 'Beginner',
                    duration: '3 Hours',
                    description: 'เรียน Git workflow, branch strategy, pull request และการทำงานร่วมกันผ่าน GitHub อย่างมืออาชีพ',
                    cover_image: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
                    price: 250,
                    max_capacity: 20
                },
                {
                    title: 'AWS Cloud Basics for Developers',
                    category: 'DevOps',
                    difficulty: 'Intermediate',
                    duration: '7 Hours',
                    description: 'เริ่มต้น AWS services ที่นักพัฒนาควรรู้: Lambda, S3, API Gateway, IAM และการ deploy แบบเบื้องต้น',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0F766E 100%)',
                    price: 1050,
                    max_capacity: 12
                },
                {
                    title: 'Progressive Web App (PWA) Build Lab',
                    category: 'JavaScript',
                    difficulty: 'Advanced',
                    duration: '8 Hours',
                    description: 'สร้าง PWA ที่โหลดเร็ว ติดตั้งได้ และรองรับ offline ด้วย service worker และ manifest file',
                    cover_image: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)',
                    price: 1250,
                    max_capacity: 7
                },
                {
                    title: 'Accessibility & UX for Modern Web',
                    category: 'HTML/CSS',
                    difficulty: 'Beginner',
                    duration: '4 Hours',
                    description: 'เรียนสร้างเว็บที่เข้าถึงได้ง่ายสำหรับทุกคน ด้วยหลักการ UX และมาตรฐาน accessibility ของ W3C',
                    cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                    price: 310,
                    max_capacity: 10
                },
                {
                    title: 'PostgreSQL Performance Tuning',
                    category: 'Database',
                    difficulty: 'Advanced',
                    duration: '6 Hours',
                    description: 'ปรับ query ให้เร็วขึ้น, ใช้ indexes อย่างถูกต้อง และออกแบบตารางให้รองรับงาน Production',
                    cover_image: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                    price: 870,
                    max_capacity: 9
                },
                {
                    title: 'Testing with Jest and Cypress',
                    category: 'JavaScript',
                    difficulty: 'Intermediate',
                    duration: '5 Hours',
                    description: 'ทดสอบฟรอนต์เอนด์และ API ด้วย Jest unit tests, React testing library และ end-to-end tests ด้วย Cypress',
                    cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                    price: 650,
                    max_capacity: 11
                },
                {
                    title: 'Serverless Functions on Netlify',
                    category: 'Backend',
                    difficulty: 'Intermediate',
                    duration: '5 Hours',
                    description: ' deploy serverless functions บน Netlify, เชื่อมต่อกับ API และจัดการ workflow แบบไร้เซิร์ฟเวอร์',
                    cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    price: 760,
                    max_capacity: 10
                },
                {
                    title: 'Cybersecurity Essentials for Web Apps',
                    category: 'Backend',
                    difficulty: 'Advanced',
                    duration: '6 Hours',
                    description: 'เรียนรู้การป้องกัน XSS, CSRF, SQL injection และปรับแอปให้ปลอดภัยสำหรับผู้ใช้งานจริง',
                    cover_image: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                    price: 980,
                    max_capacity: 8
                }
            ];

            for (const course of mockCourses) {
                await db.run(
                    `INSERT INTO courses (title, category, difficulty, duration, description, cover_image, price, max_capacity, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        course.title,
                        course.category,
                        course.difficulty,
                        course.duration,
                        course.description,
                        course.cover_image,
                        course.price,
                        course.max_capacity,
                        adminId
                    ]
                );
            }
            console.log('🌱 Seeded mock courses successfully.');
        }

        const desiredMockCourses = [
            {
                title: 'HTML5 & CSS3 Responsive Live Workshop',
                category: 'HTML/CSS',
                difficulty: 'Beginner',
                duration: '4 Hours',
                description: 'Learn HTML5 structure and modern CSS techniques for responsive layouts.',
                cover_image: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                price: 350,
                max_capacity: 3,
                current_bookings: 2
            },
            {
                title: 'JavaScript Core & State Management',
                category: 'JavaScript',
                difficulty: 'Intermediate',
                duration: '6 Hours',
                description: 'Deep dive into JavaScript fundamentals, DOM manipulation, and app state.',
                cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                price: 550,
                max_capacity: 5,
                current_bookings: 5
            },
            {
                title: 'CSS Animation Immersive Studio',
                category: 'HTML/CSS',
                difficulty: 'Intermediate',
                duration: '5 Hours',
                description: 'Build polished animations with CSS transitions and keyframes.',
                cover_image: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                price: 420,
                max_capacity: 8,
                current_bookings: 6
            },
            {
                title: 'Modern React Hooks & Warp State',
                category: 'JavaScript',
                difficulty: 'Intermediate',
                duration: '8 Hours',
                description: 'Learn React Hooks, Context API, and scalable state patterns.',
                cover_image: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                price: 880,
                max_capacity: 10,
                current_bookings: 7
            },
            {
                title: 'Node.js API Design with Express',
                category: 'Backend',
                difficulty: 'Intermediate',
                duration: '7 Hours',
                description: 'Create RESTful APIs with Express and middleware best practices.',
                cover_image: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
                price: 720,
                max_capacity: 12,
                current_bookings: 9
            },
            {
                title: 'RESTful API & JWT Auth',
                category: 'Backend',
                difficulty: 'Advanced',
                duration: '9 Hours',
                description: 'Implement JWT authentication and role-based API security.',
                cover_image: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                price: 1100,
                max_capacity: 10,
                current_bookings: 4
            },
            {
                title: 'SQL Query Mastery for Developers',
                category: 'Database',
                difficulty: 'Beginner',
                duration: '5 Hours',
                description: 'Understand SQL SELECT, JOIN, GROUP BY, and schema design.',
                cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
                price: 480,
                max_capacity: 15,
                current_bookings: 11
            },
            {
                title: 'MongoDB NoSQL Design Patterns',
                category: 'Database',
                difficulty: 'Intermediate',
                duration: '6 Hours',
                description: 'Learn MongoDB data modeling, indexing, and aggregation.',
                cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
                price: 620,
                max_capacity: 14,
                current_bookings: 12
            },
            {
                title: 'Fullstack Vue + Firebase Crash Course',
                category: 'JavaScript',
                difficulty: 'Beginner',
                duration: '5 Hours',
                description: 'Build a full-stack Vue app with Firebase authentication and Firestore.',
                cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                price: 490,
                max_capacity: 12,
                current_bookings: 10
            },
            {
                title: 'TypeScript Safety & Architecture',
                category: 'JavaScript',
                difficulty: 'Advanced',
                duration: '6 Hours',
                description: 'Master TypeScript types, generics, and architecture patterns.',
                cover_image: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                price: 950,
                max_capacity: 8,
                current_bookings: 5
            },
            {
                title: 'Python Scripting for Web Automation',
                category: 'Backend',
                difficulty: 'Beginner',
                duration: '4 Hours',
                description: 'Write Python scripts for web scraping, automation, and data processing.',
                cover_image: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                price: 390,
                max_capacity: 10,
                current_bookings: 8
            },
            {
                title: 'Docker Containerization Essentials',
                category: 'DevOps',
                difficulty: 'Intermediate',
                duration: '4 Hours',
                description: 'Learn Docker containers, image builds, and container deployment.',
                cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                price: 530,
                max_capacity: 10,
                current_bookings: 3
            },
            {
                title: 'Git & GitHub Collaboration Workshop',
                category: 'DevOps',
                difficulty: 'Beginner',
                duration: '3 Hours',
                description: 'Learn Git workflows, branching strategies, and pull requests.',
                cover_image: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
                price: 250,
                max_capacity: 20,
                current_bookings: 15
            },
            {
                title: 'AWS Cloud Basics for Developers',
                category: 'DevOps',
                difficulty: 'Intermediate',
                duration: '7 Hours',
                description: 'Get started with AWS Lambda, S3, API Gateway, and IAM.',
                cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #0F766E 100%)',
                price: 1050,
                max_capacity: 12,
                current_bookings: 9
            },
            {
                title: 'Progressive Web App (PWA) Build Lab',
                category: 'JavaScript',
                difficulty: 'Advanced',
                duration: '8 Hours',
                description: 'Build a fast PWA with service workers and offline support.',
                cover_image: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)',
                price: 1250,
                max_capacity: 7,
                current_bookings: 6
            },
            {
                title: 'Accessibility & UX for Modern Web',
                category: 'HTML/CSS',
                difficulty: 'Beginner',
                duration: '4 Hours',
                description: 'Design accessible web experiences with UX best practices.',
                cover_image: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                price: 310,
                max_capacity: 10,
                current_bookings: 7
            },
            {
                title: 'PostgreSQL Performance Tuning',
                category: 'Database',
                difficulty: 'Advanced',
                duration: '6 Hours',
                description: 'Tune PostgreSQL queries and optimize database performance.',
                cover_image: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                price: 870,
                max_capacity: 9,
                current_bookings: 5
            },
            {
                title: 'Testing with Jest and Cypress',
                category: 'JavaScript',
                difficulty: 'Intermediate',
                duration: '5 Hours',
                description: 'Test apps with Jest unit tests and Cypress end-to-end tests.',
                cover_image: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                price: 650,
                max_capacity: 11,
                current_bookings: 8
            },
            {
                title: 'Serverless Functions on Netlify',
                category: 'Backend',
                difficulty: 'Intermediate',
                duration: '5 Hours',
                description: 'Deploy serverless functions on Netlify with cloud workflows.',
                cover_image: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                price: 760,
                max_capacity: 10,
                current_bookings: 5
            },
            {
                title: 'Cybersecurity Essentials for Web Apps',
                category: 'Backend',
                difficulty: 'Advanced',
                duration: '6 Hours',
                description: 'Protect web apps from XSS, CSRF, SQL injection, and common threats.',
                cover_image: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                price: 980,
                max_capacity: 8,
                current_bookings: 6
            }
        ];

        if (courseCount.count > 0 && courseCount.count < desiredMockCourses.length) {
            const adminUser = await db.get("SELECT id FROM users WHERE role = 'admin'");
            const adminId = adminUser ? adminUser.id : 1;
            const existingCourses = await db.all('SELECT title, price FROM courses');
            const existingCourseMap = new Map(existingCourses.map(row => [row.title, row.price]));
            let insertedCount = 0;

            for (const course of desiredMockCourses) {
                if (!existingCourseMap.has(course.title)) {
                    await db.run(
                        `INSERT INTO courses (title, category, difficulty, duration, description, cover_image, price, max_capacity, created_by)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            course.title,
                            course.category,
                            course.difficulty,
                            course.duration,
                            course.description,
                            course.cover_image,
                            course.price,
                            course.max_capacity,
                            adminId
                        ]
                    );
                    insertedCount += 1;
                } else if (existingCourseMap.get(course.title) === null || existingCourseMap.get(course.title) === 0) {
                    await db.run('UPDATE courses SET price = ? WHERE title = ?', [course.price, course.title]);
                }
            }

            if (insertedCount > 0) {
                console.log(`Added ${insertedCount} missing mock courses to the database.`);
            }
        }

        const badgeCount = await db.get('SELECT COUNT(*) as count FROM badges');
        if (badgeCount.count === 0) {
            await db.run(`INSERT INTO badges (badge_name, badge_img, course_id) VALUES (?, ?, ?)`, ['HTML5 Web Master', 'badge_html.png', 1]);
            await db.run(`INSERT INTO badges (badge_name, badge_img, course_id) VALUES (?, ?, ?)`, ['JS State Guru', 'badge_js.png', 2]);
        }

        return db;
    } catch (err) {
        console.error('❌ Database initialization error:', err);
        throw err;
    }
}

module.exports = { initDatabase };