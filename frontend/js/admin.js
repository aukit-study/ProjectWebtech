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
    const courses = await fetchAdminCourses();

    // 1. อัปเดตสถิติจำนวนคอร์สทั้งหมด
    const totalCoursesEl = document.getElementById('statAdminTotalCourses');
    if (totalCoursesEl) totalCoursesEl.innerText = courses.length;

    // 🌟 [เพิ่มใหม่] 2. คำนวณหาจำนวน "หมวดหมู่" ที่ไม่ซ้ำกัน แล้วอัปเดตขึ้นหน้าจอ
    const uniqueCategories = new Set(courses.map(c => c.category)).size;
    const totalCategoriesEl = document.getElementById('statAdminTotalCategories');
    if (totalCategoriesEl) totalCategoriesEl.innerText = `${uniqueCategories} หมวด`;

    // 3. วาดตารางคอร์สเรียน
    renderAdminCoursesTable(courses);

    // 4. สั่งรันฟังก์ชันดึงข้อมูลนักเรียนจาก Backend
    if (typeof fetchAndRenderUsers === 'function') {
        fetchAndRenderUsers();
    }
}

async function fetchAdminCourses() {
    try {
        const response = await fetch('/api/courses');
        const result = await response.json();
        
        if (response.ok && result.courses) {
            // 🌟 แก้ไขตรงนี้: เปลี่ยนคำว่า data เป็น result ให้ตรงกัน
            allAdminCoursesData = result.courses;
            return result.courses;
        }
    } catch (error) {
        console.error('Error fetching admin courses:', error);
    }
    
    // 🌟 เพิ่มความปลอดภัย: กรณี API พัง ให้เอาข้อมูลสำรอง (Fallback) มาใส่ระบบกรองด้วย
    const fallbackCourses = window.WebtechState.getCourses();
    allAdminCoursesData = fallbackCourses;
    return fallbackCourses;
}

function renderAdminCoursesTable(courses) {
    const tbody = document.getElementById('adminCoursesTableBody');
    if (!tbody) return;

    if (courses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    <i class="fa-solid fa-clipboard-list" style="font-size: 2rem; margin-bottom: 0.5rem; display:block;"></i>
                    ไม่พบทะเบียนคอร์สเรียนในระบบ กรุณากด "เพิ่มคอร์สเรียนใหม่" ด้านบนเพื่อเริ่มระบบ
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = courses.map(course => {
        const displayPrice = formatCoursePrice(course.price);

        return `
            <tr id="tr-${course.id}">
                <td><code style="color:var(--accent-cyan); font-weight:700;">${course.id}</code></td>
                <td><strong style="color:white;">${course.title}</strong></td>
                <td><span class="role-tag-mini" style="font-size:0.7rem;">${course.category}</span></td>
                <td><span class="role-tag-mini admin" style="font-size:0.7rem; background:rgba(139,92,246,0.1); color:var(--accent-purple); border:1px solid rgba(139,92,246,0.2);">${course.difficulty}</span></td>
                <td>${displayPrice}</td>
                <td><i class="fa-solid fa-users" style="color:var(--text-muted); margin-right:0.25rem;"></i> ${course.current_bookings}/${course.max_capacity}</td>
                <td>
                    <div class="table-action-btns">
                        <button onclick="openEditCourseModal(${course.id})" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-edit" style="color:var(--accent-cyan);"></i> แก้ไข
                        </button>
                        <button onclick="deleteCourse(${course.id})" class="btn btn-danger btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
    <i class="fa-solid fa-trash-can"></i> ลบ
</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}
// 1. ฟังก์ชันเปิดกล่อง Modal ถามความแน่ใจ (แทนที่ confirm เดิม)
function deleteCourse(courseId) {
    const modal = document.getElementById('customConfirmModal');
    if (modal) {
        modal.classList.add('active');
        
        // ผูกคำสั่งให้ปุ่ม "ใช่, ลบคอร์สเลย" ใน HTML
        document.getElementById('confirmDeleteBtn').onclick = function() {
            closeCustomConfirm();
            executeDeleteCourse(courseId);
        };
    }
}

// 2. ฟังก์ชันปิดกล่อง Modal
function closeCustomConfirm() {
    const modal = document.getElementById('customConfirmModal');
    if (modal) modal.classList.remove('active');
}

// 3. ฟังก์ชันลงมือลบจริงๆ (ย้ายโค้ด API เดิมของแบงค์มาไว้ตรงนี้)
async function executeDeleteCourse(courseId) {
    const token = localStorage.getItem('webtech_token'); // ใช้ key เดิมของแบงค์

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            // ใช้ showToast แทน alert() เพื่อความสวยงาม
            showToast('ลบคอร์สสำเร็จ', 'ลบข้อมูลออกจากฐานข้อมูลแล้ว', 'success');
            
            // รอ 1.5 วินาทีให้โชว์แจ้งเตือนสวยๆ ก่อน แล้วค่อยรีเฟรชหน้า
            setTimeout(() => {
                location.reload(); 
            }, 1500);
        } else {
            showToast('ลบไม่สำเร็จ', result.message, 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}

function formatCoursePrice(value) {
    const price = Number(value || 0);
    if (price === 0) return 'ฟรี';
    return price.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
}

// --- MODAL CRUD TOGGLES ---
function openAddCourseModal() {
    document.getElementById('courseCrudForm').reset();
    document.getElementById('crudCourseId').value = '';
    document.getElementById('crudCoursePrice').value = 0;
    document.getElementById('crudCourseMaxCapacity').value = 10;
    document.getElementById('crudCourseCoverImage').value = '#06B6D4';
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
        document.getElementById('crudCoursePrice').value = course.price !== undefined ? course.price : 0;
        document.getElementById('crudCourseMaxCapacity').value = course.max_capacity || 10;
        
        let coverHex = '#06B6D4';
        if (course.cover_image) {
            const hexMatch = course.cover_image.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
            if (hexMatch) coverHex = hexMatch[0];
        }
        document.getElementById('crudCourseCoverImage').value = coverHex;

        document.getElementById('crudCourseDescription').value = course.description;
        
        let lessonsText = '';
        if (course.lessons && Array.isArray(course.lessons)) {
            lessonsText = course.lessons.map(l => l.title).join('\n');
        }
        document.getElementById('crudCourseLessons').value = lessonsText;

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
    const lessonsRaw = document.getElementById('crudCourseLessons').value.trim();
    const lessonsArray = lessonsRaw ? lessonsRaw.split('\n').filter(l => l.trim() !== '').map((title, idx) => ({
        id: `l-${Date.now()}-${idx}`,
        title: title.trim(),
        isCompleted: false
    })) : [];

    const baseColor = document.getElementById('crudCourseCoverImage').value;
    const darkenColor = (color) => {
        let r = parseInt(color.substring(1,3), 16);
        let g = parseInt(color.substring(3,5), 16);
        let b = parseInt(color.substring(5,7), 16);
        r = Math.max(0, r - 40).toString(16).padStart(2, '0');
        g = Math.max(0, g - 40).toString(16).padStart(2, '0');
        b = Math.max(0, b - 40).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    };
    const cover_image = `linear-gradient(135deg, ${baseColor} 0%, ${darkenColor(baseColor)} 100%)`;

    const body = {
        title: document.getElementById('crudCourseTitle').value.trim(),
        category: document.getElementById('crudCourseCategory').value,
        difficulty: document.getElementById('crudCourseDifficulty').value,
        price: Number(document.getElementById('crudCoursePrice').value),
        max_capacity: Number(document.getElementById('crudCourseMaxCapacity').value),
        cover_image: cover_image,
        description: document.getElementById('crudCourseDescription').value.trim(),
        lessons: lessonsArray
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

// ==========================================
// ระบบค้นหาและกรองคอร์สเรียน (Search & Filter)
// ==========================================

// 1. สร้างตัวแปรเก็บข้อมูลคอร์สทั้งหมดตอนที่ดึงมาจาก API สำเร็จ
let allAdminCoursesData = []; 

// 2. ผูกการทำงาน (Events) ให้กับช่องค้นหาและ Dropdown
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('adminSearchInput');
    const filterCat = document.getElementById('adminFilterCategory');
    const filterDiff = document.getElementById('adminFilterDifficulty');

    // ถ้าพิมพ์ข้อความ หรือเปลี่ยน Dropdown ให้เรียกฟังก์ชันกรองข้อมูลทันที
    if (searchInput) searchInput.addEventListener('keyup', handleAdminCourseFilter); 
    if (filterCat) filterCat.addEventListener('change', handleAdminCourseFilter);
    if (filterDiff) filterDiff.addEventListener('change', handleAdminCourseFilter);
});

// 3. ฟังก์ชันหลักในการกรองข้อมูล
function handleAdminCourseFilter() {
    // อ่านค่าที่แอดมินพิมพ์หรือเลือก
    const keyword = document.getElementById('adminSearchInput').value.toLowerCase();
    const category = document.getElementById('adminFilterCategory').value;
    const difficulty = document.getElementById('adminFilterDifficulty').value;

    // ทำการคัดกรองข้อมูลจาก allAdminCoursesData
    const filteredCourses = allAdminCoursesData.filter(course => {
        const matchSearch = course.title.toLowerCase().includes(keyword);
        const matchCategory = (category === 'ALL') ? true : (course.category === category);
        const matchDifficulty = (difficulty === 'ALL') ? true : (course.difficulty === difficulty);

        // ต้องผ่านทั้ง 3 เงื่อนไขถึงจะถูกนำมาแสดง
        return matchSearch && matchCategory && matchDifficulty;
    });

    // ส่งข้อมูลที่กรองเสร็จแล้ว ไปให้ฟังก์ชันวาดตารางทำงานต่อ
    renderAdminCoursesTable(filteredCourses); 
}