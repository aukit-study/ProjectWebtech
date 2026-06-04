let allSystemUsersData = []; // เก็บข้อมูลสมาชิกทั้งหมด
let currentRoleFilter = 'ALL'; // 🆕 เก็บค่าว่าตอนนี้กดปุ่มบทบาทไหนอยู่

document.addEventListener('DOMContentLoaded', () => {
    verifySystemAdminPermissions();

    const searchInput = document.getElementById('systemSearchInput');
    const sortFilter = document.getElementById('systemSortFilter');

    if (searchInput) searchInput.addEventListener('keyup', handleSystemUserFilter);
    if (sortFilter) sortFilter.addEventListener('change', handleSystemUserFilter);
});

// 1. ตรวจสอบสิทธิ์ว่าใช่ Admin หรือไม่
function verifySystemAdminPermissions() {
    const currentUser = window.WebtechState.getCurrentUser();
    const restrictedPanel = document.getElementById('restrictedAccessPanel');
    const systemPanel = document.getElementById('adminSystemPanel');

    if (!currentUser || currentUser.role !== 'admin') {
        if(restrictedPanel) restrictedPanel.style.display = 'block';
        if(systemPanel) systemPanel.style.display = 'none';
    } else {
        if(restrictedPanel) restrictedPanel.style.display = 'none';
        if(systemPanel) systemPanel.style.display = 'block';
        fetchSystemUsersData();
    }
}

// 2. ดึงข้อมูล User จาก API
async function fetchSystemUsersData() {
    const token = localStorage.getItem('webtech_token');
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (response.ok && result.data) {
            allSystemUsersData = result.data; 
            handleSystemUserFilter(); 
        } else {
            fallbackLocalUsers();
        }
    } catch (err) {
        console.error("API Error:", err);
        fallbackLocalUsers();
    }
}

// 3. ฟังก์ชันสำรองกรณีเรียก API ไม่สำเร็จ
function fallbackLocalUsers() {
    let localUsers = [];
    try {
        localUsers = JSON.parse(localStorage.getItem('webtech_users')) || [];
    } catch(e) {}
    allSystemUsersData = localUsers;
    handleSystemUserFilter();
}

// 🆕 ฟังก์ชันใหม่: จัดการตอนกดปุ่ม Role Filter
function setRoleFilter(role) {
    currentRoleFilter = role; // อัปเดตค่าบทบาทปัจจุบัน
    
    // รีเซ็ตสีปุ่มทั้งหมดให้เป็นสีเทา
    document.getElementById('btnRoleALL').classList.remove('active');
    document.getElementById('btnRoleADMIN').classList.remove('active');
    document.getElementById('btnRoleSTUDENT').classList.remove('active');
    
    // ไฮไลต์สีม่วงที่ปุ่มที่เพิ่งกด
    document.getElementById(`btnRole${role}`).classList.add('active');
    
    // สั่งให้ตารางกรองข้อมูลใหม่
    handleSystemUserFilter();
}

// 4. 🌟 ฟังก์ชันหลักสำหรับค้นหา และจัดเรียงข้อมูล 🌟
function handleSystemUserFilter() {
    const keyword = (document.getElementById('systemSearchInput')?.value || '').toLowerCase();
    const roleFilterVal = currentRoleFilter; // 🆕 ดึงค่าจากตัวแปรแทน (เพราะไม่มี Dropdown แล้ว)
    const sortFilterVal = document.getElementById('systemSortFilter')?.value || 'NEWEST';

    let filtered = allSystemUsersData.filter(user => {
        const safeUsername = (user.username || '').toLowerCase();
        const safeFullname = (user.fullname || '').toLowerCase();
        const safeEmail = (user.email || '').toLowerCase();
        const safeRole = (user.role || '').toLowerCase();

        const matchSearch = safeUsername.includes(keyword) || safeFullname.includes(keyword) || safeEmail.includes(keyword);
        
        let matchRole = true;
        if (roleFilterVal === 'ADMIN') matchRole = safeRole === 'admin';
        if (roleFilterVal === 'STUDENT') matchRole = safeRole === 'student';

        return matchSearch && matchRole;
    });

    filtered.sort((a, b) => {
        if (sortFilterVal === 'NEWEST') {
            return new Date(b.created_at || 0) - new Date(a.created_at || 0); 
        } else if (sortFilterVal === 'OLDEST') {
            return new Date(a.created_at || 0) - new Date(b.created_at || 0); 
        } else if (sortFilterVal === 'MOST_COURSES') {
            return (b.total_enrolled || 0) - (a.total_enrolled || 0); 
        } else if (sortFilterVal === 'LEAST_COURSES') {
            return (a.total_enrolled || 0) - (b.total_enrolled || 0); 
        }
        return 0; 
    });

    renderSystemUsersTable(filtered);
}

// 5. วาดตารางสมาชิก
function renderSystemUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return; 
    
    if (!Array.isArray(users)) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#EF4444;">ข้อมูลผิดพลาด ไม่สามารถแสดงผลได้</td></tr>`;
        return;
    }

    const studentCount = allSystemUsersData.filter(u => (u.role || '').toLowerCase() === 'student').length;
    const statUsers = document.getElementById('totalUsersStat');
    if (statUsers) statUsers.innerText = allSystemUsersData.length;
    const statStudents = document.getElementById('totalStudentsStat');
    if (statStudents) statStudents.innerText = studentCount;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">ไม่พบข้อมูลสมาชิกที่ค้นหา</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const safeRole = (user.role || 'student').toLowerCase();
        const isStudent = safeRole === 'student';
        const roleTagClass = isStudent ? '' : 'admin';
        const roleBg = isStudent ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)';
        const roleColor = isStudent ? 'var(--accent-cyan)' : '#EF4444';
        
        const enrolledCount = user.total_enrolled || 0;
        const safeUsername = user.username || 'Unknown';
        const safeFullname = user.fullname || 'ไม่ระบุชื่อ';
        const safeEmail = user.email || 'ไม่มีอีเมล';
        
        const cleanFullname = safeFullname.replace(/'/g, "\\'");
        const cleanEmail = safeEmail.replace(/'/g, "\\'");
        
        const joinedDate = user.created_at 
            ? new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) 
            : '-';

        return `
            <tr>
                <td><code style="color:var(--text-muted);">#${user.id}</code></td>
                <td><strong style="color:var(--accent-cyan);">${safeUsername}</strong></td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${safeEmail}</td>
                <td><span style="color:white;">${safeFullname}</span></td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${joinedDate}</td>
                <td>
                    <span class="role-tag-mini ${roleTagClass}" style="background:${roleBg}; color:${roleColor}; border-color:${roleColor};">
                        ${safeRole.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span style="font-weight:bold;">${enrolledCount}</span> คอร์ส
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openUserHistoryModal(${user.id || 0}, '${cleanFullname}', '${cleanEmail}', '${joinedDate}')" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-eye" style="color:var(--accent-cyan);"></i> ดูประวัติ
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 6. เปิดป๊อปอัปดูประวัติ
async function openUserHistoryModal(userId, fullname, email, joinedDate) {
    const modal = document.getElementById('userHistoryModal');
    const tbody = document.getElementById('userHistoryTableBody');
    const token = localStorage.getItem('webtech_token');
    
    if(!modal || !tbody) return;

    document.getElementById('historyModalUserName').innerText = fullname;
    document.getElementById('historyModalUserId').innerText = '#' + userId;
    document.getElementById('historyModalUserEmail').innerText = email;
    document.getElementById('historyModalUserJoined').innerText = joinedDate;
    
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">กำลังดึงข้อมูลจากฐานข้อมูล...</td></tr>`;
    modal.classList.add('active');

    try {
        const response = await fetch(`/api/admin/users/${userId}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (response.ok && result.data && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td style="font-weight:bold; color:#F9FAFB;">${item.title || 'ไม่ทราบชื่อวิชา'}</td>
                    <td><span class="role-tag-mini" style="font-size:0.65rem;">${item.category || 'ไม่ระบุ'}</span></td>
                    <td style="color:var(--text-muted); font-size:0.85rem;">${item.enrolled_at ? new Date(item.enrolled_at).toLocaleString('th-TH') : '-'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">สมาชิกรายนี้ยังไม่มีประวัติการลงทะเบียนเรียน</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#EF4444;">เกิดข้อผิดพลาดในการดึงประวัติการเรียน</td></tr>`;
    }
}

// 7. ปิดป๊อปอัป
function closeUserHistoryModal() {
    const modal = document.getElementById('userHistoryModal');
    if(modal) modal.classList.remove('active');
}