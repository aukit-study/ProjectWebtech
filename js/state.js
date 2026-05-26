/* ==========================================================================
   Webtech E-Learning Platform - LocalStorage State Management System
   ========================================================================== */

const STATE_KEYS = {
    COURSES: 'webtech_courses',
    USERS: 'webtech_users',
    CURRENT_USER: 'webtech_current_user'
};

// --- MOCK CORE DATA INITS ---
const DEFAULT_COURSES = [
    {
        id: "c-1",
        title: "HTML5 & CSS3 Responsive Workshop",
        category: "HTML/CSS",
        difficulty: "Beginner",
        duration: "4 Hours",
        description: "เรียนรู้การจัดหน้าโครงสร้างเว็บอย่างถูกต้องด้วย HTML5 และความสวยงามยืดหยุ่นระดับโปรผ่าน CSS Grid, Flexbox และการสร้างสรรค์ลูกเล่นแอนิเมชันสไตล์กระจกโปร่งแสง (Glassmorphism)",
        coverImage: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
        lessons: [
            { id: "l-1-1", title: "Introduction to HTML5 Semantic Tags", isCompleted: false },
            { id: "l-1-2", title: "Advanced CSS Layouts: Flexbox & CSS Grid", isCompleted: false },
            { id: "l-1-3", title: "CSS Variables (Custom Properties) & Themes", isCompleted: false },
            { id: "l-1-4", title: "Building a Premium Responsive Dashboard Page", isCompleted: false }
        ]
    },
    {
        id: "c-2",
        title: "JavaScript Core & DOM Manipulation",
        category: "JavaScript",
        difficulty: "Intermediate",
        duration: "6 Hours",
        description: "เจาะลึกกลไกหลักของภาษา JavaScript ตั้งแต่ฟังก์ชันสมัยใหม่ ES6+, การจัดการเหตุการณ์ Event Handling, การเปลี่ยนแปลง DOM แบบไดนามิก และการทำ LocalStorage State Management",
        coverImage: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        lessons: [
            { id: "l-2-1", title: "Modern ES6+ Features & Block Scopes", isCompleted: false },
            { id: "l-2-2", title: "Asynchronous JS: Promises, Async / Await", isCompleted: false },
            { id: "l-2-3", title: "Dynamic DOM Manipulation & Events", isCompleted: false },
            { id: "l-2-4", title: "Handling State & Data in LocalStorage", isCompleted: false },
            { id: "l-2-5", title: "Project: Dynamic Gamification Systems", isCompleted: false }
        ]
    },
    {
        id: "c-3",
        title: "Node.js Backend & API Development",
        category: "Backend",
        difficulty: "Advanced",
        duration: "8 Hours",
        description: "ปูพื้นฐานการเขียนฝั่งเซิร์ฟเวอร์ด้วย Node.js และ Express.js ทำความเข้าใจสถาปัตยกรรม Non-blocking I/O และเรียนรู้วิธีสร้าง RESTful API แบบสะอาด ปลอดภัย และมีมาตรฐานสูง",
        coverImage: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
        lessons: [
            { id: "l-3-1", title: "Node.js Runtime Architecture & Event Loop", isCompleted: false },
            { id: "l-3-2", title: "Express Server Setup & Semantic Routing", isCompleted: false },
            { id: "l-3-3", title: "Developing Secure RESTful API Endpoints", isCompleted: false },
            { id: "l-3-4", title: "Error Handling & Premium Custom Middleware", isCompleted: false }
        ]
    }
];

const DEFAULT_USERS = [
    {
        username: "student",
        password: "1234",
        role: "student",
        fullname: "อุกฤษฏ์ นักเรียนสายโค้ด",
        studyHours: 12.5,
        unlockedBadges: [] // Stores badge IDs e.g. "b-1", "b-2"
    },
    {
        username: "admin",
        password: "admin",
        role: "admin",
        fullname: "แอดมินระบบสุดหล่อ",
        studyHours: 0,
        unlockedBadges: []
    }
];

const BADGE_DEFINITIONS = [
    {
        id: "b-1",
        title: "First Step",
        description: "เรียนบทเรียนแรกบนระบบสำเร็จ",
        requirement: "เข้าเรียนบทเรียนใดบทหนึ่งอย่างน้อย 1 บทเรียน"
    },
    {
        id: "b-2",
        title: "Style Architect",
        description: "ผู้เชี่ยวชาญการออกแบบสไตล์",
        requirement: "เรียนจบคอร์ส HTML & CSS ครบ 100%"
    },
    {
        id: "b-3",
        title: "Script Wizard",
        description: "จอมเวทย์เขียนสคริปต์ DOM",
        requirement: "เรียนจบคอร์ส JavaScript Core ครบ 100%"
    },
    {
        id: "b-4",
        title: "Fullstack Legend",
        description: "ตำนานนักพัฒนาเว็บไร้ขีดจำกัด",
        requirement: "เรียนจบครบทุกคอร์สที่มีอยู่บนแพลตฟอร์ม"
    }
];

// --- HELPER STORAGE FUNCTIONS ---
function getStorage(key, defaultValue) {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return defaultValue;
    }
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// --- STATE ACTIONS MANAGER ---
const WebtechState = {
    // Initialize Platform Data
    init() {
        getStorage(STATE_KEYS.COURSES, DEFAULT_COURSES);
        getStorage(STATE_KEYS.USERS, DEFAULT_USERS);
        
        // Auto sign-in a default student if no user session exists
        const currentUser = localStorage.getItem(STATE_KEYS.CURRENT_USER);
        if (!currentUser) {
            this.setCurrentUser(DEFAULT_USERS[0]);
        }
    },

    // --- COURSES DATA ---
    getCourses() {
        return getStorage(STATE_KEYS.COURSES, DEFAULT_COURSES);
    },

    saveCourses(courses) {
        setStorage(STATE_KEYS.COURSES, courses);
    },

    getCourseById(id) {
        return this.getCourses().find(c => c.id === id);
    },

    addCourse(title, category, difficulty, duration, description, lessonsListText) {
        const courses = this.getCourses();
        const nextId = "c-" + (courses.length + 1) + "-" + Math.floor(Math.random() * 1000);
        
        // Parse lessons text split by newlines or commas
        let lessonTitles = lessonsListText.split('\n').map(t => t.trim()).filter(t => t !== '');
        if (lessonTitles.length === 0 || (lessonTitles.length === 1 && lessonTitles[0] === "")) {
            lessonTitles = ["Lesson 1: Introduction", "Lesson 2: Core Concept", "Lesson 3: Project Workshop"];
        }
        
        const lessons = lessonTitles.map((titleText, idx) => ({
            id: `l-${nextId.replace('c-', '')}-${idx + 1}`,
            title: titleText,
            isCompleted: false
        }));

        // Assign beautiful colorful linear gradient based on category
        let coverImage = "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)";
        if (category.toUpperCase().includes("CSS") || category.toUpperCase().includes("HTML")) {
            coverImage = "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)";
        } else if (category.toUpperCase().includes("NODE") || category.toUpperCase().includes("BACKEND")) {
            coverImage = "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)";
        } else if (category.toUpperCase().includes("DATABASE") || category.toUpperCase().includes("SQL")) {
            coverImage = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
        }

        const newCourse = {
            id: nextId,
            title,
            category,
            difficulty,
            duration,
            description,
            coverImage,
            lessons
        };

        courses.push(newCourse);
        this.saveCourses(courses);
        return newCourse;
    },

    updateCourse(updatedCourse) {
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
            courses[index] = updatedCourse;
            this.saveCourses(courses);
            
            // Check badges triggers as course content or status might change
            this.checkAndUnlockBadges();
        }
    },

    deleteCourse(courseId) {
        const courses = this.getCourses();
        const filtered = courses.filter(c => c.id !== courseId);
        this.saveCourses(filtered);
        
        // Recalculate Badges in case total courses count drops
        this.checkAndUnlockBadges();
    },

    // --- USER MANAGEMENT ---
    getUsers() {
        return getStorage(STATE_KEYS.USERS, DEFAULT_USERS);
    },

    getCurrentUser() {
        const user = localStorage.getItem(STATE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    setCurrentUser(user) {
        if (user) {
            setStorage(STATE_KEYS.CURRENT_USER, user);
        } else {
            localStorage.removeItem(STATE_KEYS.CURRENT_USER);
        }
    },

    login(username, password) {
        const users = this.getUsers();
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (foundUser) {
            this.setCurrentUser(foundUser);
            return { success: true, user: foundUser };
        }
        return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    },

    register(username, fullname, password, role = 'student') {
        const users = this.getUsers();
        const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (exists) {
            return { success: false, message: "มีชื่อผู้ใช้นี้ในระบบแล้ว" };
        }
        const newUser = {
            username,
            fullname,
            password,
            role,
            studyHours: role === 'student' ? 0 : 0,
            unlockedBadges: []
        };
        users.push(newUser);
        setStorage(STATE_KEYS.USERS, users);
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    },

    logout() {
        this.setCurrentUser(null);
    },

    // --- INTERACTIVE GAMIFICATION ENGINE ---
    markLessonComplete(courseId, lessonId, isCompleted) {
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        lesson.isCompleted = isCompleted;
        this.saveCourses(courses);

        // Update Study hours on user if marked completed (simulate 0.5 hour per lesson completed)
        if (isCompleted) {
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.role === 'student') {
                currentUser.studyHours = parseFloat((currentUser.studyHours + 0.5).toFixed(1));
                this.setCurrentUser(currentUser);
                
                // Update this user inside global users array too
                const users = this.getUsers();
                const uIdx = users.findIndex(u => u.username === currentUser.username);
                if (uIdx !== -1) {
                    users[uIdx].studyHours = currentUser.studyHours;
                    setStorage(STATE_KEYS.USERS, users);
                }
            }
        }

        // Trigger badge checkers
        const unlockedJustNow = this.checkAndUnlockBadges();
        return { success: true, course, unlockedJustNow };
    },

    // Calculate percent progress for a single course
    getCourseProgress(course) {
        if (!course.lessons || course.lessons.length === 0) return 0;
        const completedCount = course.lessons.filter(l => l.isCompleted).length;
        return Math.round((completedCount / course.lessons.length) * 100);
    },

    // Achievement Badge System Engine
    getBadgeDefinitions() {
        return BADGE_DEFINITIONS;
    },

    checkAndUnlockBadges() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'student') return [];

        const courses = this.getCourses();
        const currentlyUnlocked = currentUser.unlockedBadges || [];
        const newlyUnlocked = [];

        // 1. Badge 1: First Step (Marked at least 1 lesson completed in any course)
        if (!currentlyUnlocked.includes("b-1")) {
            const hasCompletedAny = courses.some(c => c.lessons.some(l => l.isCompleted));
            if (hasCompletedAny) {
                newlyUnlocked.push("b-1");
            }
        }

        // 2. Badge 2: Style Architect (HTML5/CSS3 course completed 100%)
        if (!currentlyUnlocked.includes("b-2")) {
            const cssCourse = courses.find(c => c.id === "c-1");
            if (cssCourse && this.getCourseProgress(cssCourse) === 100) {
                newlyUnlocked.push("b-2");
            }
        }

        // 3. Badge 3: Script Wizard (JavaScript Core course completed 100%)
        if (!currentlyUnlocked.includes("b-3")) {
            const jsCourse = courses.find(c => c.id === "c-2");
            if (jsCourse && this.getCourseProgress(jsCourse) === 100) {
                newlyUnlocked.push("b-3");
            }
        }

        // 4. Badge 4: Fullstack Legend (All courses in state completed 100%)
        if (!currentlyUnlocked.includes("b-4")) {
            const allCompleted = courses.length > 0 && courses.every(c => this.getCourseProgress(c) === 100);
            if (allCompleted) {
                newlyUnlocked.push("b-4");
            }
        }

        if (newlyUnlocked.length > 0) {
            currentUser.unlockedBadges = [...currentlyUnlocked, ...newlyUnlocked];
            this.setCurrentUser(currentUser);

            // Sync user changes to the master users list
            const users = this.getUsers();
            const uIdx = users.findIndex(u => u.username === currentUser.username);
            if (uIdx !== -1) {
                users[uIdx].unlockedBadges = currentUser.unlockedBadges;
                setStorage(STATE_KEYS.USERS, users);
            }
        }

        return newlyUnlocked; // Returns array of newly unlocked badge IDs to display popup celebrating them!
    }
};

// Initialize right away
WebtechState.init();
window.WebtechState = WebtechState;
