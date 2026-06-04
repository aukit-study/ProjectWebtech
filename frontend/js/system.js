document.addEventListener('DOMContentLoaded', () => {
    verifySystemAdminPermissions();
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
            renderSystemUsersTable(result.data);
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
    renderSystemUsersTable(localUsers);
}

// 4. วาดตารางสมาชิก
function renderSystemUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return; 
    
    if (!Array.isArray(users)) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#EF4444;">ข้อมูลผิดพลาด ไม่สามารถแสดงผลได้</td></tr>`;
        return;
    }

    const studentCount = users.filter(u => (u.role || '').toLowerCase() === 'student').length;
    const statUsers = document.getElementById('totalUsersStat');
    if (statUsers) statUsers.innerText = users.length;
    const statStudents = document.getElementById('totalStudentsStat');
    if (statStudents) statStudents.innerText = studentCount;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">ไม่พบข้อมูลสมาชิกในระบบ</td></tr>`;
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

// 5. เปิดป๊อปอัปดูประวัติ
async function openUserHistoryModal(userId, fullname, email, joinedDate) {
    const modal = document.getElementById('userHistoryModal');
    const tbody = document.getElementById('userHistoryTableBody');
    const token = localStorage.getItem('webtech_token');
    
    if(!modal || !tbody) {
        console.error("Modal element not found!");
        return;
    }

    const nameLabel = document.getElementById('historyModalUserName');
    if(nameLabel) nameLabel.innerText = fullname;
    
    const idLabel = document.getElementById('historyModalUserId');
    if(idLabel) idLabel.innerText = '#' + userId;
    
    const emailLabel = document.getElementById('historyModalUserEmail');
    if(emailLabel) emailLabel.innerText = email;
    
    const joinedLabel = document.getElementById('historyModalUserJoined');
    if(joinedLabel) joinedLabel.innerText = joinedDate;
    
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

// 6. ปิดป๊อปอัป
function closeUserHistoryModal() {
    const modal = document.getElementById('userHistoryModal');
    if(modal) modal.classList.remove('active');
}