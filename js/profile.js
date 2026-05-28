/* ==========================================================================
   Webtech E-Learning Platform - Profile & Badge System Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Render profile details and stats on load
    loadStudentProfile();
});

function loadStudentProfile() {
    const currentUser = window.WebtechState.getCurrentUser();
    if (!currentUser) {
        // Safe redirect to login if no session
        window.location.href = 'login.html';
        return;
    }

    // 1. Bind Basic User Data
    document.getElementById('profileFullname').innerText = currentUser.fullname;
    
    const initials = currentUser.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    document.getElementById('profileAvatarText').innerText = initials;

    // 2. Query Courses & Progress
    const courses = window.WebtechState.getCourses();
    
    // Count details
    let totalLessonsCompleted = 0;
    let enrolledCoursesCount = 0;
    
    courses.forEach(c => {
        const progress = window.WebtechState.getCourseProgress(c);
        if (progress > 0) {
            enrolledCoursesCount++;
        }
        // 👉 [FIXED] เปลี่ยนมาเช็คสถานะผ่านกลไกส่วนกลางของกลุ่มใน state.js 
        if (c.lessons) {
            c.lessons.forEach(l => {
                // คอร์สหลักจะถูกเช็คสถานะผ่าน property isCompleted ในบทเรียนของแต่ละคอร์ส
                if (l.isCompleted) {
                    totalLessonsCompleted++;
                }
            });
        }
    });

    // 3. Dynamic Rank / Level Calculation
    let rankTitle = "Beginner coder 💻";
    let nextMilestone = 3;
    
    if (totalLessonsCompleted >= 10) {
        rankTitle = "Legendary Fullstack Guru 👑";
        nextMilestone = 15;
    } else if (totalLessonsCompleted >= 6) {
        rankTitle = "JavaScript Apprentice ⚡";
        nextMilestone = 10;
    } else if (totalLessonsCompleted >= 3) {
        rankTitle = "Junior CSS Architect 🎨";
        nextMilestone = 6;
    }

    document.getElementById('profileRankTitle').innerText = rankTitle;
    document.getElementById('statCoursesEnrolled').innerText = enrolledCoursesCount;
    document.getElementById('statStudyHours').innerText = currentUser.studyHours || 0.0;
    
    // 4. Update EXP Bar
    const percentExp = Math.min(Math.round((totalLessonsCompleted / nextMilestone) * 100), 100);
    document.getElementById('rankExpRatio').innerText = `${totalLessonsCompleted} / ${nextMilestone} Lessons`;
    document.getElementById('rankExpProgressBar').style.width = `${percentExp}%`;

    // 5. Render Badge Gallery (Grayscale State Logic via LocalStorage check)
    renderBadgeGallery(currentUser);

    // 6. Render Enrolled Courses List
    renderEnrolledCoursesList(courses);
}

// --- RENDER DYNAMIC BADGES GRID ---
function renderBadgeGallery(currentUser) {
    const badgesContainer = document.getElementById('profileBadgesGrid');
    if (!badgesContainer) return;

    // ดึงค่าคำนิยามเหรียญรางวัลจาก state.js ของกลุ่ม
    const badgeDefs = window.WebtechState.getBadgeDefinitions();
    const unlockedBadges = currentUser.unlockedBadges || [];

    document.getElementById('statUnlockedBadges').innerText = `${unlockedBadges.length}/${badgeDefs.length}`;

    if (badgeDefs.length === 0) {
        badgesContainer.innerHTML = `<p style="color:var(--text-muted);">ไม่มีเหรียญรางวัลในระบบ</p>`;
        return;
    }

    badgesContainer.innerHTML = badgeDefs.map(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        const lockedClass = isUnlocked ? '' : 'locked';
        const svgIcon = window.TechSVGIcons[badge.id] || '';
        const hoverTooltip = isUnlocked ? 'ปลดล็อกเรียบร้อย!' : 'ยังล็อกอยู่: ' + badge.requirement;

        return `
            <div class="badge-item ${lockedClass}" title="${hoverTooltip}">
                <div class="badge-icon-wrapper" style="${isUnlocked ? '' : 'filter: grayscale(1) opacity(0.25);'}">
                    ${svgIcon}
                </div>
                <div class="badge-title" style="${isUnlocked ? 'color:white;' : 'color:var(--text-muted);'}">${badge.title}</div>
                <div class="badge-desc" style="font-size: 0.75rem; color: var(--text-secondary);">${badge.description}</div>
            </div>
        `;
    }).join('');
}

// --- RENDER ENROLLED COURSES LIST ---
function renderEnrolledCoursesList(courses) {
    const container = document.getElementById('profileCoursesContainer');
    if (!container) return;

    const enrolledCourses = courses.filter(c => window.WebtechState.getCourseProgress(c) > 0);

    if (enrolledCourses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.01); border-radius: var(--border-radius-sm); border: 1px dashed var(--border-color);">
                <i class="fa-solid fa-graduation-cap" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
                <p style="color: var(--text-secondary); font-size:0.9rem;">คุณยังไม่ได้เริ่มเรียนคอร์สใดเลย</p>
                <a href="index.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">ไปเลือกคอร์สเรียนกัน!</a>
            </div>
        `;
        return;
    }

    container.innerHTML = enrolledCourses.map(course => {
        const progress = window.WebtechState.getCourseProgress(course);
        const lessonsCount = course.lessons ? course.lessons.length : 0;
        const completedCount = course.lessons ? course.lessons.filter(l => l.isCompleted).length : 0;
        
        let barColor = 'var(--accent-purple)';
        if (progress === 100) barColor = 'var(--accent-green)';

        return `
            <div class="profile-course-item">
                <div style="flex: 1; padding-right: 1.5rem;">
                    <span class="role-tag-mini" style="font-size:0.65rem; margin-bottom:0.25rem; display:inline-block;">${course.category}</span>
                    <h4 style="font-family:var(--font-heading); font-size:1.05rem; margin-bottom:0.5rem;">${course.title}</h4>
                    <div class="progress-container" style="margin-top: 0;">
                        <div class="progress-header" style="margin-bottom:0.2rem;">
                            <span style="font-size:0.75rem;">ความสำเร็จ</span>
                            <span style="font-size:0.75rem; color:${barColor}; font-weight:700;">${progress}% (${completedCount}/${lessonsCount} บทเรียน)</span>
                        </div>
                        <div class="progress-track" style="height:6px;">
                            <div class="progress-bar" style="width: ${progress}%; background:${barColor}; box-shadow:0 0 5px ${barColor};"></div>
                        </div>
                    </div>
                </div>
                <button onclick="window.location.href='classroom.html?courseId=${course.id}'" class="btn btn-secondary btn-sm" style="align-self: center;">
                    <i class="fa-solid fa-circle-play"></i> เข้าห้องเรียน
                </button>
            </div>
        `;
    }).join('');
}