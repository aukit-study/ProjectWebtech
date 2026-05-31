/* ==========================================================================
   Webtech E-Learning Platform - Admin Dashboard & CRUD Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Check security permissions on page access
    verifyAdminPermissions();
});

// --- PERMISSIONS GATE ---
function verifyAdminPermissions() {
    const currentUser = window.WebtechState.getCurrentUser();
    const restrictedPanel = document.getElementById('restrictedAccessPanel');
    const dashboardPanel = document.getElementById('adminDashboardPanel');

    if (!currentUser || currentUser.role !== 'admin') {
        if (restrictedPanel) restrictedPanel.style.display = 'block';
        if (dashboardPanel) dashboardPanel.style.display = 'none';
    } else {
        if (restrictedPanel) restrictedPanel.style.display = 'none';
        if (dashboardPanel) dashboardPanel.style.display = 'block';
        
        // Load initial dashboard statistics and course table registry
        refreshAdminDashboard();
    }
}

// --- REFRESH STATISTICS AND REGISTRY TABLE ---
function refreshAdminDashboard() {
    const courses = window.WebtechState.getCourses();
    const users = window.WebtechState.getUsers();

    // 1. Render Stats Metrics
    document.getElementById('statAdminTotalCourses').innerText = courses.length;
    document.getElementById('statAdminTotalUsers').innerText = users.filter(u => u.role === 'student').length;

    // 2. Render Registry Table Row Data
    renderAdminCoursesTable(courses);
}

function renderAdminCoursesTable(courses) {
    const tbody = document.getElementById('adminCoursesTableBody');
    if (!tbody) return;

    if (courses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    <i class="fa-solid fa-clipboard-list" style="font-size: 2rem; margin-bottom: 0.5rem; display:block;"></i>
                    ไม่พบทะเบียนคอร์สเรียนในระบบ กรุณากด "เพิ่มคอร์สเรียนใหม่" ด้านบนเพื่อเริ่มระบบ
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = courses.map(course => {
        const lessonsCount = course.lessons ? course.lessons.length : 0;
        
        return `
            <tr id="tr-${course.id}">
                <td><code style="color:var(--accent-cyan); font-weight:700;">${course.id}</code></td>
                <td><strong style="color:white;">${course.title}</strong></td>
                <td><span class="role-tag-mini" style="font-size:0.7rem;">${course.category}</span></td>
                <td><span class="role-tag-mini admin" style="font-size:0.7rem; background:rgba(139,92,246,0.1); color:var(--accent-purple); border:1px solid rgba(139,92,246,0.2);">${course.difficulty}</span></td>
                <td><i class="fa-regular fa-clock" style="color:var(--text-muted); margin-right:0.25rem;"></i> ${course.duration}</td>
                <td><i class="fa-solid fa-list-ol" style="color:var(--text-muted); margin-right:0.25rem;"></i> ${lessonsCount} บทเรียน</td>
                <td>
                    <div class="table-action-btns">
                        <button onclick="openEditCourseModal('${course.id}')" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-edit" style="color:var(--accent-cyan);"></i> แก้ไข
                        </button>
                        <button onclick="handleDeleteCourseClick('${course.id}')" class="btn btn-danger btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-trash-can"></i> ลบ
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// --- MODAL CRUD TOGGLES ---
function openAddCourseModal() {
    // Reset Form Fields for Addition
    document.getElementById('courseCrudForm').reset();
    document.getElementById('crudCourseId').value = '';
    
    document.getElementById('modalCrudTitle').innerHTML = '<i class="fa-solid fa-circle-plus" style="color:var(--accent-green); margin-right:0.5rem;"></i> เพิ่มข้อมูลคอร์สใหม่';
    document.getElementById('crudSubmitBtn').className = 'btn btn-success btn-sm';
    document.getElementById('crudSubmitBtn').innerHTML = '<i class="fa-solid fa-save"></i> เพิ่มคอร์สเรียน';

    const modal = document.getElementById('courseCrudModal');
    if (modal) modal.classList.add('active');
}

function openEditCourseModal(courseId) {
    const course = window.WebtechState.getCourseById(courseId);
    if (!course) return;

    // Populates fields
    document.getElementById('crudCourseId').value = course.id;
    document.getElementById('crudCourseTitle').value = course.title;
    document.getElementById('crudCourseCategory').value = course.category;
    document.getElementById('crudCourseDifficulty').value = course.difficulty;
    document.getElementById('crudCourseDuration').value = course.duration;
    document.getElementById('crudCourseDescription').value = course.description;
    
    // Parse lessons list array back to newline separated string
    const lessonsText = course.lessons ? course.lessons.map(l => l.title).join('\n') : '';
    document.getElementById('crudCourseLessons').value = lessonsText;

    // Adjust modal headers
    document.getElementById('modalCrudTitle').innerHTML = '<i class="fa-solid fa-edit" style="color:var(--accent-cyan); margin-right:0.5rem;"></i> แก้ไขข้อมูลคอร์สเรียน';
    document.getElementById('crudSubmitBtn').className = 'btn btn-accent btn-sm';
    document.getElementById('crudSubmitBtn').innerHTML = '<i class="fa-solid fa-save"></i> ปรับปรุงวิชา';

    const modal = document.getElementById('courseCrudModal');
    if (modal) modal.classList.add('active');
}

function closeCrudModal() {
    const modal = document.getElementById('courseCrudModal');
    if (modal) modal.classList.remove('active');
}

// --- SUBMIT CREATE / EDIT FORM ---
function handleCrudFormSubmit(e) {
    e.preventDefault();

    const courseId = document.getElementById('crudCourseId').value;
    const title = document.getElementById('crudCourseTitle').value.trim();
    const category = document.getElementById('crudCourseCategory').value;
    const difficulty = document.getElementById('crudCourseDifficulty').value;
    const duration = document.getElementById('crudCourseDuration').value.trim();
    const description = document.getElementById('crudCourseDescription').value.trim();
    const lessonsText = document.getElementById('crudCourseLessons').value.trim();

    if (courseId === '') {
        // --- ADD MODE ---
        const newCourse = window.WebtechState.addCourse(title, category, difficulty, duration, description, lessonsText);
        window.showToast("บันทึกวิชาเรียนสำเร็จ", `เพิ่มคอร์ส "${newCourse.title}" ลงแค็ตตาล็อกแล้ว`, "success");
    } else {
        // --- EDIT MODE ---
        const existing = window.WebtechState.getCourseById(courseId);
        if (existing) {
            existing.title = title;
            existing.category = category;
            existing.difficulty = difficulty;
            existing.duration = duration;
            existing.description = description;

            // Rebuild lessons but try to carry over matching names completion status if any
            const inputTitles = lessonsText.split('\n').map(t => t.trim()).filter(t => t !== '');
            const updatedLessons = inputTitles.map((titleText, idx) => {
                // Match existing lesson with same name to keep completion tick mark
                const match = existing.lessons ? existing.lessons.find(oldL => oldL.title.toLowerCase() === titleText.toLowerCase()) : null;
                return {
                    id: `l-${courseId.replace('c-', '')}-${idx + 1}`,
                    title: titleText,
                    isCompleted: match ? match.isCompleted : false
                };
            });

            existing.lessons = updatedLessons;
            window.WebtechState.updateCourse(existing);
            window.showToast("ปรับปรุงข้อมูลสำเร็จ", `อัปเดตรายละเอียดวิชา "${existing.title}" เรียบร้อย`, "success");
        }
    }

    closeCrudModal();
    refreshAdminDashboard();
}

// --- DELETE ACTION ---
function handleDeleteCourseClick(courseId) {
    const course = window.WebtechState.getCourseById(courseId);
    if (!course) return;

    if (confirm(`คุณมั่นใจหรือไม่ที่จะลบคอร์ส "${course.title}"? ข้อมูลทั้งหมดและเปอร์เซ็นต์เรียนผ่านจะถูกลบถาวร!`)) {
        window.WebtechState.deleteCourse(courseId);
        window.showToast("ลบคอร์สเรียนแล้ว", `นำหลักสูตรออกจากระบบสำเร็จ`, "error");
        refreshAdminDashboard();
    }
}
