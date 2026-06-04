document.addEventListener('DOMContentLoaded', () => {
    renderHeaderSession();
    setupMobileNav();
    highlightActiveLink();

    // ตรวจสอบว่าหน้าไหนมี CartManager ถึงจะสั่ง init
    if (typeof CartManager !== 'undefined') {
        CartManager.init();
    }
});

// --- RENDER HEADER PROFILE / ACTIONS ---
function renderHeaderSession() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const currentUser = window.WebtechState.getCurrentUser();

    if (currentUser) {
        const isAdmin = currentUser.role === 'admin';
        const roleTag = isAdmin ? '<span class="role-tag-mini admin">Admin</span>' : '<span class="role-tag-mini">Student</span>';
        const displayName = currentUser.fullname || currentUser.username || 'User';
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

        navActions.innerHTML = `
            <div class="cart-icon-wrapper" onclick="if(typeof CartManager !== 'undefined') CartManager.toggleCartModal()" style="position: relative; cursor: pointer; color: white; margin-right: 1.5rem; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 1.2rem;"></i>
                <span id="cartBadgeCount" style="position: absolute; top: -8px; right: -12px; background: var(--accent-pink); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: bold; display: none;">0</span>
            </div>
            <div class="user-profile-badge" id="userProfileDropdownTrigger" onclick="window.location.href='profile.html'">
                <div class="user-avatar-mini">${initials}</div>
                <div class="user-name-mini">${displayName}</div>
                ${roleTag}
            </div>
            <button class="btn btn-secondary btn-sm" id="logoutBtn" onclick="handleHeaderLogout()">
                <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
            </button>
        `;

        // Update Hero Buttons (if on index.html)
        const heroActionButtons = document.getElementById('heroActionButtons');
        if (heroActionButtons) {
            heroActionButtons.innerHTML = `
                <a href="#catalog" class="btn btn-primary"><i class="fa-solid fa-graduation-cap"></i> ค้นหาคอร์สเรียน</a>
                <a href="classroom.html" class="btn btn-secondary"><i class="fa-solid fa-chalkboard-user"></i> ห้องเรียนของฉัน</a>
            `;
        }
    } else {
        navActions.innerHTML = `
            <div class="cart-icon-wrapper" onclick="window.location.href='login.html'" style="position: relative; cursor: pointer; color: white; margin-right: 1.5rem; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 1.2rem;"></i>
            </div>
            <a href="login.html" class="btn btn-primary btn-sm">
                <i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ
            </a>
        `;

        // Update Hero Buttons (if on index.html)
        const heroActionButtons = document.getElementById('heroActionButtons');
        if (heroActionButtons) {
            heroActionButtons.innerHTML = `
                <a href="#catalog" class="btn btn-primary"><i class="fa-solid fa-rocket"></i> เริ่มเรียนฟรีเลย</a>
                <a href="login.html" class="btn btn-secondary"><i class="fa-solid fa-user-plus"></i> สมัครสมาชิก</a>
            `;
        }
    }
}


// --- HANDLE LOGOUT IN HEADER ---
function handleHeaderLogout() {
    window.WebtechState.logout();
    if (typeof CartManager !== 'undefined') CartManager.clearCart();
    showToast("ออกจากระบบสำเร็จ", "บ๊ายบาย! ไว้กลับมาเรียนโค้ดด้วยกันใหม่นะ", "success");
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1200);
}

function setupMobileNav() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            toggle.classList.toggle('active');
        });
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function showToast(title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            z-index: 1;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '<i class="fas fa-info-circle"></i>';
    let borderColor = 'var(--accent-cyan)';
    let glowShadow = 'rgba(6, 182, 212, 0.2)';

    if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i>';
        borderColor = 'var(--accent-green)';
        glowShadow = 'rgba(16, 185, 129, 0.2)';
    } else if (type === 'error') {
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        borderColor = '#EF4444';
        glowShadow = 'rgba(239, 68, 68, 0.2)';
    }

    toast.style.cssText = `
        background: rgba(21, 31, 50, 0.9); backdrop-filter: blur(12px); border-left: 4px solid ${borderColor};
        padding: 1rem 1.5rem; border-radius: 8px; color: white; min-width: 300px; max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px ${glowShadow};
        display: flex; gap: 1rem; align-items: flex-start; pointer-events: auto;
        transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    toast.innerHTML = `
        <div style="font-size: 1.5rem; color: ${borderColor}">${icon}</div>
        <div style="flex: 1;">
            <h4 style="font-family: var(--font-heading); font-size: 0.95rem; margin-bottom: 0.25rem;">${title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">${message}</p>
        </div>
        <button style="color: var(--text-muted); cursor:pointer; font-size: 0.8rem; background:none; border:none;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 50);
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => { toast.remove(); }, 500);
    }, 4500);
}

window.showToast = showToast;