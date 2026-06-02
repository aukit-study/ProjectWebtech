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
function refreshAdminDashboard() {
    const courses = window.WebtechState.getCourses();

    // 1. Render Stats Metrics (จำนวนคอร์สอิงจาก LocalStorage เดิมไปก่อน)
    document.getElementById('statAdminTotalCourses').innerText = courses.length;

    // 2. Render Registry Table Row Data
    renderAdminCoursesTable(courses);
    
    // 🌟 3. [เพิ่มใหม่] สั่งรันฟังก์ชันดึงข้อมูลนักเรียนจาก Backend SQLite
    fetchAndRenderUsers(); 
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

// ==========================================
// 🌟 ส่วนระบบจัดการสมาชิก (API Integration)
// ==========================================

// โหลดรายชื่อผู้ใช้ทั้งหมดจาก Backend ลงตาราง
async function fetchAndRenderUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const result = await response.json();
        
        if (result.success) {
            renderAdminUsersTable(result.data);
            
            // อัปเดตตัวเลขสถิติรวมของนักเรียน
            const studentCount = result.data.filter(u => u.role === 'student').length;
            document.getElementById('statAdminTotalUsers').innerText = studentCount;
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// วาดตารางข้อมูลสมาชิก (รองรับ Data จาก SQLite)
function renderAdminUsersTable(users) {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">ไม่พบข้อมูลสมาชิกในระบบ</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const isStudent = user.role === 'student';
        const roleTagClass = isStudent ? '' : 'admin';
        const roleBg = isStudent ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)';
        const roleColor = isStudent ? 'var(--accent-cyan)' : '#EF4444';
        
        return `
            <tr>
                <td><code style="color:var(--text-secondary);">${user.username}</code></td>
                <td><strong style="color:white;">${user.fullname}</strong></td>
                <td>
                    <span class="role-tag-mini ${roleTagClass}" style="background:${roleBg}; color:${roleColor}; border-color:${roleColor};">
                        ${user.role.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span style="color:var(--accent-cyan); font-weight:bold;">${user.total_enrolled || 0}</span> คอร์ส
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openUserHistoryModal(${user.id}, '${user.fullname}')" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-eye" style="color:var(--accent-cyan);"></i> ดูประวัติ
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// เปิด Modal และดึงประวัติรายบุคคลจาก Backend
async function openUserHistoryModal(userId, fullname) {
    const modal = document.getElementById('userHistoryModal');
    const tbody = document.getElementById('userHistoryTableBody');
    
    document.getElementById('historyModalUserName').innerText = fullname;
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">กำลังโหลดข้อมูล...</td></tr>`;
    modal.classList.add('active');

    try {
        const response = await fetch(`/api/admin/users/${userId}/history`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td style="font-weight:bold;">${item.title}</td>
                    <td><span class="role-tag-mini" style="font-size:0.65rem;">${item.category}</span></td>
                    <td style="color:var(--text-muted); font-size:0.85rem;">${new Date(item.enrolled_at).toLocaleString('th-TH')}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">ยังไม่มีประวัติการจองเวิร์กชอป</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#EF4444;">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
    }
}

function closeUserHistoryModal() {
    const modal = document.getElementById('userHistoryModal');
    if (modal) modal.classList.remove('active');
}