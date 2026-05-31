/* ==========================================================================
   Webtech E-Learning Platform - Admin Dashboard & CRUD Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
        refreshAdminDashboard();
    }
}

// --- REFRESH STATISTICS AND REGISTRY TABLE ---
async function refreshAdminDashboard() {
    try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        const courses = data.courses || [];

        document.getElementById('statAdminTotalCourses').innerText = courses.length;
        renderAdminCoursesTable(courses);
    } catch (err) {
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
    }
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
        return `
            <tr id="tr-${course.id}">
                <td><code style="color:var(--accent-cyan); font-weight:700;">${course.id}</code></td>
                <td><strong style="color:white;">${course.title}</strong></td>
                <td><span class="role-tag-mini" style="font-size:0.7rem;">${course.category}</span></td>
                <td><span class="role-tag-mini admin" style="font-size:0.7rem; background:rgba(139,92,246,0.1); color:var(--accent-purple); border:1px solid rgba(139,92,246,0.2);">${course.difficulty}</span></td>
                <td><i class="fa-regular fa-clock" style="color:var(--text-muted); margin-right:0.25rem;"></i> ${course.duration}</td>
                <td><i class="fa-solid fa-users" style="color:var(--text-muted); margin-right:0.25rem;"></i> ${course.current_bookings}/${course.max_capacity}</td>
                <td>
                    <div class="table-action-btns">
                        <button onclick="openEditCourseModal(${course.id})" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-edit" style="color:var(--accent-cyan);"></i> แก้ไข
                        </button>
                        <button onclick="handleDeleteCourseClick(${course.id})" class="btn btn-danger btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
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
    document.getElementById('courseCrudForm').reset();
    document.getElementById('crudCourseId').value = '';
    document.getElementById('modalCrudTitle').innerHTML = '<i class="fa-solid fa-circle-plus" style="color:var(--accent-green); margin-right:0.5rem;"></i> เพิ่มข้อมูลคอร์สใหม่';
    document.getElementById('crudSubmitBtn').className = 'btn btn-success btn-sm';
    document.getElementById('crudSubmitBtn').innerHTML = '<i class="fa-solid fa-save"></i> เพิ่มคอร์สเรียน';
    document.getElementById('courseCrudModal').classList.add('active');
}

async function openEditCourseModal(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();
        const course = data.course || data;

        document.getElementById('crudCourseId').value = course.id;
        document.getElementById('crudCourseTitle').value = course.title;
        document.getElementById('crudCourseCategory').value = course.category;
        document.getElementById('crudCourseDifficulty').value = course.difficulty;
        document.getElementById('crudCourseDuration').value = course.duration;
        document.getElementById('crudCourseDescription').value = course.description;
        document.getElementById('crudCourseLessons').value = '';

        document.getElementById('modalCrudTitle').innerHTML = '<i class="fa-solid fa-edit" style="color:var(--accent-cyan); margin-right:0.5rem;"></i> แก้ไขข้อมูลคอร์สเรียน';
        document.getElementById('crudSubmitBtn').className = 'btn btn-accent btn-sm';
        document.getElementById('crudSubmitBtn').innerHTML = '<i class="fa-solid fa-save"></i> ปรับปรุงวิชา';
        document.getElementById('courseCrudModal').classList.add('active');
    } catch (err) {
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลคอร์สได้", "error");
    }
}

function closeCrudModal() {
    document.getElementById('courseCrudModal').classList.remove('active');
}

// --- SUBMIT CREATE / EDIT FORM ---
async function handleCrudFormSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('webtech_token');
    const courseId = document.getElementById('crudCourseId').value;
    const body = {
        title: document.getElementById('crudCourseTitle').value.trim(),
        category: document.getElementById('crudCourseCategory').value,
        difficulty: document.getElementById('crudCourseDifficulty').value,
        duration: document.getElementById('crudCourseDuration').value.trim(),
        description: document.getElementById('crudCourseDescription').value.trim(),
    };

    try {
        let response;
        if (courseId === '') {
            // ADD MODE
            response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
        } else {
            // EDIT MODE
            response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
        }

        const result = await response.json();

        if (response.ok) {
            window.showToast("บันทึกสำเร็จ", result.message || "ดำเนินการเรียบร้อย", "success");
            closeCrudModal();
            refreshAdminDashboard();
        } else {
            window.showToast("เกิดข้อผิดพลาด", result.message || "ไม่สามารถบันทึกได้", "error");
        }
    } catch (err) {
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อ server ได้", "error");
    }
}

// --- DELETE ACTION ---
async function handleDeleteCourseClick(courseId) {
    if (!confirm(`คุณมั่นใจหรือไม่ที่จะลบคอร์สนี้? ข้อมูลจะถูกลบถาวร!`)) return;

    const token = localStorage.getItem('webtech_token');

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok) {
            window.showToast("ลบคอร์สสำเร็จ", "นำหลักสูตรออกจากระบบเรียบร้อย", "error");
            refreshAdminDashboard();
        } else {
            window.showToast("เกิดข้อผิดพลาด", result.message || "ไม่สามารถลบได้", "error");
        }
    } catch (err) {
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อ server ได้", "error");
    }
}