/* ==========================================================================
   Webtech E-Learning Platform - LocalStorage State Management System
   ========================================================================== */

const STATE_KEYS = {
    COURSES: 'webtech_courses',
    USERS: 'webtech_users',
    CURRENT_USER: 'webtech_current_user'
};

// Local storage wrappers
function getStorage(key, defaultValue) {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}
function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

const WebtechState = {
    init() {
        getStorage(STATE_KEYS.COURSES, []);
    },

    getCourses() { return getStorage(STATE_KEYS.COURSES, []); },
    saveCourses(courses) { setStorage(STATE_KEYS.COURSES, courses); },
    
    syncWithAPI(apiCourses) {
        if (!Array.isArray(apiCourses)) return;
        const localCourses = this.getCourses();
        const mergedCourses = [...localCourses];
        
        apiCourses.forEach(apiC => {
            const strId = `c-${apiC.id}`;
            const existingIndex = mergedCourses.findIndex(c => c.id === strId || c.id === apiC.id);
            
            const formattedCourse = {
                id: strId,
                title: apiC.title,
                category: apiC.category,
                difficulty: apiC.difficulty,
                max_capacity: apiC.max_capacity,
                current_bookings: apiC.current_bookings || 0,
                description: apiC.description,
                coverImage: apiC.cover_image,
                price: apiC.price,
                lessons: apiC.lessons || []
            };

            if (existingIndex > -1) {
                const existingCourse = mergedCourses[existingIndex];
                
                if (formattedCourse.lessons.length === 0 && existingCourse.lessons && existingCourse.lessons.length > 0) {
                    formattedCourse.lessons = existingCourse.lessons;
                } else if (existingCourse.lessons && formattedCourse.lessons.length > 0) {
                    formattedCourse.lessons = formattedCourse.lessons.map(newLesson => {
                        const oldLesson = existingCourse.lessons.find(l => l.title === newLesson.title || l.id === newLesson.id);
                        return {
                            ...newLesson,
                            isCompleted: oldLesson ? oldLesson.isCompleted : false
                        };
                    });
                }
                
                mergedCourses[existingIndex] = formattedCourse;
            } else {
                mergedCourses.push(formattedCourse);
            }
        });
        this.saveCourses(mergedCourses);
    },

    getCourseById(id) { return this.getCourses().find(c => c.id === id); },
    getCurrentUser() { const user = localStorage.getItem(STATE_KEYS.CURRENT_USER); return user ? JSON.parse(user) : null; },
    setCurrentUser(user) { if (user) { setStorage(STATE_KEYS.CURRENT_USER, user); } else { localStorage.removeItem(STATE_KEYS.CURRENT_USER); } },
    logout() { this.setCurrentUser(null); },

    getCourseProgress(course) {
        if (!course.lessons || course.lessons.length === 0) return 0;
        const completedCount = course.lessons.filter(l => l.isCompleted).length;
        return Math.round((completedCount / course.lessons.length) * 100);
    },

    markLessonComplete(courseId, lessonId, isCompleted) {
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return { success: false, message: "Course not found" };

        const lesson = course.lessons ? course.lessons.find(l => l.id === lessonId) : null;
        if (!lesson) return { success: false, message: "Lesson not found" };

        lesson.isCompleted = isCompleted;
        this.saveCourses(courses);

        const currentUser = this.getCurrentUser();
        if (currentUser && isCompleted) {
            // Sync progress to backend database
            const completedLessonsCount = course.lessons.filter(l => l.isCompleted).length;
            const isFinished = completedLessonsCount === course.lessons.length;
            const token = localStorage.getItem('webtech_token');
            const numericCourseId = course.id.replace('c-', '');

            if (token) {
                fetch(`/api/courses/${numericCourseId}/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        completed_lessons: completedLessonsCount,
                        is_finished: isFinished
                    })
                }).catch(err => console.error('Failed to sync progress:', err));
            }
        }

        return { success: true, course };
    }
};

WebtechState.init();
window.WebtechState = WebtechState;

