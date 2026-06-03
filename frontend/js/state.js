/* ==========================================================================
   Webtech E-Learning Platform - LocalStorage State Management System
   ========================================================================== */

const STATE_KEYS = {
    COURSES: 'webtech_courses',
    USERS: 'webtech_users',
    CURRENT_USER: 'webtech_current_user'
};

// --- MOCK CORE DATA INITS (Separation of Content & UI) ---
const DEFAULT_COURSES = [
    {
        id: "c-1",
        title: "HTML5 & CSS3 Responsive Live Workshop",
        category: "HTML/CSS",
        difficulty: "Beginner",
        duration: "4 Hours",
        max_capacity: 3,
        current_bookings: 2,
        description: "เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)",
        coverImage: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
        price: 350,
        lessons: [
            { id: "l-1-1", title: "Introduction to HTML5 Semantic Tags", isCompleted: false },
            { id: "l-1-2", title: "Advanced CSS Layouts: Flexbox & CSS Grid", isCompleted: false }
        ]
    },
    {
        id: "c-2",
        title: "JavaScript Core & State Management",
        category: "JavaScript",
        difficulty: "Intermediate",
        duration: "6 Hours",
        max_capacity: 5,
        current_bookings: 5,
        description: "เจาะลึกกลไกหลักของภาษา JavaScript ฟังก์ชันสมัยใหม่ ES6+, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State",
        coverImage: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        price: 550,
        lessons: [
            { id: "l-2-1", title: "Modern ES6+ Features & Block Scopes", isCompleted: false },
            { id: "l-2-2", title: "Asynchronous JS: Promises, Async / Await", isCompleted: false }
        ]
    },
    {
        id: "c-3",
        title: "CSS Animation Immersive Studio",
        category: "HTML/CSS",
        difficulty: "Intermediate",
        duration: "5 Hours",
        max_capacity: 8,
        current_bookings: 6,
        description: "สร้างแอนิเมชันสวยงามด้วย CSS keyframes, transitions และ hover effects ที่ตอบโจทย์ UX สมัยใหม่",
        coverImage: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        price: 420,
        lessons: [
            { id: "l-3-1", title: "Keyframe Animation Basics", isCompleted: false },
            { id: "l-3-2", title: "Interactive Hover & Focus Effects", isCompleted: false }
        ]
    },
    {
        id: "c-4",
        title: "Modern React Hooks & Warp State",
        category: "JavaScript",
        difficulty: "Intermediate",
        duration: "8 Hours",
        max_capacity: 10,
        current_bookings: 7,
        description: "เรียนรู้ React Hooks, Context API และ Patterns สำหรับจัดการ state ขนาดใหญ่ในงานจริง",
        coverImage: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
        price: 880,
        lessons: [
            { id: "l-4-1", title: "useState, useEffect และ Data Fetching", isCompleted: false },
            { id: "l-4-2", title: "Context API และ Custom Hooks", isCompleted: false }
        ]
    },
    {
        id: "c-5",
        title: "Node.js API Design with Express",
        category: "Backend",
        difficulty: "Intermediate",
        duration: "7 Hours",
        max_capacity: 12,
        current_bookings: 9,
        description: "สอนสร้าง API RESTful ด้วย Express, Middleware, validation และการเชื่อมต่อฐานข้อมูลอย่างปลอดภัย",
        coverImage: "linear-gradient(135deg, #047857 0%, #064E3B 100%)",
        price: 720,
        lessons: [
            { id: "l-5-1", title: "Express Routing & Middleware", isCompleted: false },
            { id: "l-5-2", title: "Validation และ Error Handling", isCompleted: false }
        ]
    },
    {
        id: "c-6",
        title: "RESTful API & JWT Auth",
        category: "Backend",
        difficulty: "Advanced",
        duration: "9 Hours",
        max_capacity: 10,
        current_bookings: 4,
        description: "ระบบยืนยันตัวตน API ด้วย JWT, refresh token และ role-based access control สำหรับแอปจริง",
        coverImage: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
        price: 1100,
        lessons: [
            { id: "l-6-1", title: "JWT Basics และ Token Flow", isCompleted: false },
            { id: "l-6-2", title: "Secure API ด้วย Role Management", isCompleted: false }
        ]
    },
    {
        id: "c-7",
        title: "SQL Query Mastery for Developers",
        category: "Database",
        difficulty: "Beginner",
        duration: "5 Hours",
        max_capacity: 15,
        current_bookings: 11,
        description: "เข้าใจ SQL SELECT, JOIN, GROUP BY, aggregate functions และการออกแบบ schema ที่อ่านง่าย",
        coverImage: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)",
        price: 480,
        lessons: [
            { id: "l-7-1", title: "SELECT, JOIN และ Subqueries", isCompleted: false },
            { id: "l-7-2", title: "GROUP BY และ Aggregate Functions", isCompleted: false }
        ]
    },
    {
        id: "c-8",
        title: "MongoDB NoSQL Design Patterns",
        category: "Database",
        difficulty: "Intermediate",
        duration: "6 Hours",
        max_capacity: 14,
        current_bookings: 12,
        description: "เรียนการออกแบบข้อมูล NoSQL, indexing, aggregation pipeline และวิธีเลือกใช้ MongoDB ในโปรเจกต์จริง",
        coverImage: "linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)",
        price: 620,
        lessons: [
            { id: "l-8-1", title: "Schema Design & Indexing", isCompleted: false },
            { id: "l-8-2", title: "Aggregation Pipeline Basics", isCompleted: false }
        ]
    },
    {
        id: "c-9",
        title: "Fullstack Vue + Firebase Crash Course",
        category: "JavaScript",
        difficulty: "Beginner",
        duration: "5 Hours",
        max_capacity: 12,
        current_bookings: 10,
        description: "สร้างเว็บแอปเต็มรูปแบบด้วย Vue.js และ Firebase Authentication, Firestore พร้อม deploy จริง",
        coverImage: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
        price: 490,
        lessons: [
            { id: "l-9-1", title: "Vue Components & Data Binding", isCompleted: false },
            { id: "l-9-2", title: "Firebase Auth และ Firestore", isCompleted: false }
        ]
    },
    {
        id: "c-10",
        title: "TypeScript Safety & Architecture",
        category: "JavaScript",
        difficulty: "Advanced",
        duration: "6 Hours",
        max_capacity: 8,
        current_bookings: 5,
        description: "เรียน TypeScript ตั้งแต่ type system, generics จนถึง architectural patterns สำหรับทีมใหญ่",
        coverImage: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        price: 950,
        lessons: [
            { id: "l-10-1", title: "TypeScript Types และ Interfaces", isCompleted: false },
            { id: "l-10-2", title: "Generics และ Type Inference", isCompleted: false }
        ]
    },
    {
        id: "c-11",
        title: "Python Scripting for Web Automation",
        category: "Backend",
        difficulty: "Beginner",
        duration: "4 Hours",
        max_capacity: 10,
        current_bookings: 8,
        description: "ลงมือเขียน Python script สำหรับ web scraping, automation และ data processing เบื้องต้น",
        coverImage: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
        price: 390,
        lessons: [
            { id: "l-11-1", title: "Web Scraping with BeautifulSoup", isCompleted: false },
            { id: "l-11-2", title: "Automation Script Basics", isCompleted: false }
        ]
    },
    {
        id: "c-12",
        title: "Docker Containerization Essentials",
        category: "DevOps",
        difficulty: "Intermediate",
        duration: "4 Hours",
        max_capacity: 10,
        current_bookings: 3,
        description: "เข้าใจ Docker containers, Dockerfile, และการ deploy application แบบแยก service อย่างมืออาชีพ",
        coverImage: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
        price: 530,
        lessons: [
            { id: "l-12-1", title: "Docker Basics และ Images", isCompleted: false },
            { id: "l-12-2", title: "Compose และ Multi-Container", isCompleted: false }
        ]
    },
    {
        id: "c-13",
        title: "Git & GitHub Collaboration Workshop",
        category: "DevOps",
        difficulty: "Beginner",
        duration: "3 Hours",
        max_capacity: 20,
        current_bookings: 15,
        description: "เรียน Git workflow, branch strategy, pull request และการทำงานร่วมกันผ่าน GitHub อย่างมืออาชีพ",
        coverImage: "linear-gradient(135deg, #F97316 0%, #C2410C 100%)",
        price: 250,
        lessons: [
            { id: "l-13-1", title: "Git Branching และ Merge", isCompleted: false },
            { id: "l-13-2", title: "Pull Request และ Code Review", isCompleted: false }
        ]
    },
    {
        id: "c-14",
        title: "AWS Cloud Basics for Developers",
        category: "DevOps",
        difficulty: "Intermediate",
        duration: "7 Hours",
        max_capacity: 12,
        current_bookings: 9,
        description: "เริ่มต้น AWS services ที่นักพัฒนาควรรู้: Lambda, S3, API Gateway, IAM และการ deploy แบบเบื้องต้น",
        coverImage: "linear-gradient(135deg, #0EA5E9 0%, #0F766E 100%)",
        price: 1050,
        lessons: [
            { id: "l-14-1", title: "AWS Lambda และ Serverless", isCompleted: false },
            { id: "l-14-2", title: "S3 Storage และ IAM Basics", isCompleted: false }
        ]
    },
    {
        id: "c-15",
        title: "Progressive Web App (PWA) Build Lab",
        category: "JavaScript",
        difficulty: "Advanced",
        duration: "8 Hours",
        max_capacity: 7,
        current_bookings: 6,
        description: "สร้าง PWA ที่โหลดเร็ว ติดตั้งได้ และรองรับ offline ด้วย service worker และ manifest file",
        coverImage: "linear-gradient(135deg, #0F766E 0%, #064E3B 100%)",
        price: 1250,
        lessons: [
            { id: "l-15-1", title: "Service Worker และ Offline Cache", isCompleted: false },
            { id: "l-15-2", title: "Web App Manifest และ Installable App", isCompleted: false }
        ]
    },
    {
        id: "c-16",
        title: "Accessibility & UX for Modern Web",
        category: "HTML/CSS",
        difficulty: "Beginner",
        duration: "4 Hours",
        max_capacity: 10,
        current_bookings: 7,
        description: "เรียนสร้างเว็บที่เข้าถึงได้ง่ายสำหรับทุกคน ด้วยหลักการ UX และมาตรฐาน accessibility ของ W3C",
        coverImage: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
        price: 310,
        lessons: [
            { id: "l-16-1", title: "ARIA Roles และ Semantic HTML", isCompleted: false },
            { id: "l-16-2", title: "UX-friendly Layouts และ Contrast", isCompleted: false }
        ]
    },
    {
        id: "c-17",
        title: "PostgreSQL Performance Tuning",
        category: "Database",
        difficulty: "Advanced",
        duration: "6 Hours",
        max_capacity: 9,
        current_bookings: 5,
        description: "ปรับ query ให้เร็วขึ้น, ใช้ indexes อย่างถูกต้อง และออกแบบตารางให้รองรับงาน Production",
        coverImage: "linear-gradient(135deg, #15803D 0%, #166534 100%)",
        price: 870,
        lessons: [
            { id: "l-17-1", title: "Indexing และ Query Plans", isCompleted: false },
            { id: "l-17-2", title: "Partitioning และ Performance Monitoring", isCompleted: false }
        ]
    },
    {
        id: "c-18",
        title: "Testing with Jest and Cypress",
        category: "JavaScript",
        difficulty: "Intermediate",
        duration: "5 Hours",
        max_capacity: 11,
        current_bookings: 8,
        description: "ทดสอบฟรอนต์เอนด์และ API ด้วย Jest unit tests, React testing library และ end-to-end tests ด้วย Cypress",
        coverImage: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
        price: 650,
        lessons: [
            { id: "l-18-1", title: "Jest Unit Testing Basics", isCompleted: false },
            { id: "l-18-2", title: "Cypress E2E Workflow", isCompleted: false }
        ]
    },
    {
        id: "c-19",
        title: "Serverless Functions on Netlify",
        category: "Backend",
        difficulty: "Intermediate",
        duration: "5 Hours",
        max_capacity: 10,
        current_bookings: 5,
        description: "deploy serverless functions บน Netlify, เชื่อมต่อกับ API และจัดการ workflow แบบไร้เซิร์ฟเวอร์",
        coverImage: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        price: 760,
        lessons: [
            { id: "l-19-1", title: "Netlify Functions Basics", isCompleted: false },
            { id: "l-19-2", title: "API Integration และ Deployment", isCompleted: false }
        ]
    },
    {
        id: "c-20",
        title: "Cybersecurity Essentials for Web Apps",
        category: "Backend",
        difficulty: "Advanced",
        duration: "6 Hours",
        max_capacity: 8,
        current_bookings: 6,
        description: "เรียนรู้การป้องกัน XSS, CSRF, SQL injection และปรับแอปให้ปลอดภัยสำหรับผู้ใช้งานจริง",
        coverImage: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)",
        price: 980,
        lessons: [
            { id: "l-20-1", title: "Web App Security Threats", isCompleted: false },
            { id: "l-20-2", title: "Secure Coding Practices", isCompleted: false }
        ]
    }
];

const DEFAULT_USERS = [
    { username: "student", password: "1234", role: "student", fullname: "อุกฤษฏ์ นักเรียนสายโค้ด", studyHours: 12.5, unlockedBadges: [] },
    { username: "admin", password: "admin123", role: "admin", fullname: "นายระบบ ผู้ดูแลระบบ", studyHours: 50.0, unlockedBadges: ["b-1", "b-2", "b-3", "b-4"] }
];

const BADGE_DEFINITIONS = [
    { id: "b-1", title: "First Step", description: "จองและเริ่มต้นเรียนเวิร์กชอปแรกสำเร็จ", requirement: "เข้าเรียนบทเรียนอย่างน้อย 1 บทเรียน" }
];

function getStorage(key, defaultValue) {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
    try { return JSON.parse(data); } catch (e) { return defaultValue; }
}

function setStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

const WebtechState = {
    init() {
        getStorage(STATE_KEYS.COURSES, DEFAULT_COURSES);
        getStorage(STATE_KEYS.USERS, DEFAULT_USERS);
    },

    getCourses() { return getStorage(STATE_KEYS.COURSES, DEFAULT_COURSES); },
    saveCourses(courses) { setStorage(STATE_KEYS.COURSES, courses); },
    getCourseById(id) { return this.getCourses().find(c => c.id === id); },
    getBadgeDefinitions() { return BADGE_DEFINITIONS; },
    getCurrentUser() { const user = localStorage.getItem(STATE_KEYS.CURRENT_USER); return user ? JSON.parse(user) : null; },
    setCurrentUser(user) { if (user) { setStorage(STATE_KEYS.CURRENT_USER, user); } else { localStorage.removeItem(STATE_KEYS.CURRENT_USER); } },

    login(username, password) {
        const users = getStorage(STATE_KEYS.USERS, DEFAULT_USERS);
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (foundUser) { this.setCurrentUser(foundUser); return { success: true, user: foundUser }; }
        return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    },

    register(username, fullname, password, role = 'student') {
        const users = getStorage(STATE_KEYS.USERS, DEFAULT_USERS);
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) { return { success: false, message: "มีชื่อผู้ใช้นี้ในระบบแล้ว" }; }
        const newUser = { username, fullname, password, role, studyHours: 0, unlockedBadges: [] };
        users.push(newUser);
        setStorage(STATE_KEYS.USERS, users);
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    },

    logout() { this.setCurrentUser(null); },

    getCourseProgress(course) {
        if (!course.lessons || course.lessons.length === 0) return 0;
        const completedCount = course.lessons.filter(l => l.isCompleted).length;
        return Math.round((completedCount / course.lessons.length) * 100);
    },

    // 🌟 [GATEKEEPER PATTERN] บังคับรันสถิติตรวจสอบข้อมูลบนเซิร์ฟเวอร์จำลองหลังบ้าน
    checkoutWorkshopOrder(courseId) {
        const courses = this.getCourses();
        const courseIndex = courses.findIndex(c => c.id === courseId);
        
        if (courseIndex === -1) {
            return { success: false, status: 404, message: "ไม่พบเวิร์กชอปที่ระบุ" };
        }

        const targetCourse = courses[courseIndex];

        // 🛠️ ตรวจสอบเงื่อนไข Capacity & Seat Logic ตามโจทย์บังคับ
        if (targetCourse.current_bookings >= targetCourse.max_capacity) {
            return {
                success: false,
                status: 409, // 👈 [HTTP STATUS CODE 409 CONFLICT]
                message: `ขออภัยครับ! เวิร์กชอป "${targetCourse.title}" เต็มแล้ว (ที่นั่งเต็ม ${targetCourse.max_capacity}/${targetCourse.max_capacity})`
            };
        }

        // กรณีผ่านเกณฑ์: บันทึกข้อมูลและทำระบบ "Bypass Payment" อัตโนมัติ
        courses[courseIndex].current_bookings += 1;
        this.saveCourses(courses);
        
        return {
            success: true,
            status: 200,
            message: "จองเวิร์กชอปสำเร็จ! (ระบบทำการข้ามขั้นตอนชำระเงินให้คุณโดยอัตโนมัติ)",
            course: courses[courseIndex]
        };
    }
};

WebtechState.init();
window.WebtechState = WebtechState;