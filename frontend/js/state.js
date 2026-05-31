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
        max_capacity: 3,      // 🌟 [โจทย์ข้อ 4] บังคับกำหนด Capacity
        current_bookings: 2,  // 🌟 จำลองว่าเหลือที่นั่งสุดท้ายพอดี (เต็มที่ 3)
        description: "เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)",
        coverImage: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
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
        current_bookings: 5,  // 🌟 จำลองสถานการณ์ "คลาสเต็ม" (เพื่อเทสระบบดัก 409)
        description: "เจาะลึกกลไกหลักของภาษา JavaScript ฟังก์ชันสมัยใหม่ ES6+, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State",
        coverImage: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        lessons: [
            { id: "l-2-1", title: "Modern ES6+ Features & Block Scopes", isCompleted: false },
            { id: "l-2-2", title: "Asynchronous JS: Promises, Async / Await", isCompleted: false }
        ]
    }
];

const DEFAULT_USERS = [
    { username: "student", password: "1234", role: "student", fullname: "อุกฤษฏ์ นักเรียนสายโค้ด", studyHours: 12.5, unlockedBadges: [] }
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