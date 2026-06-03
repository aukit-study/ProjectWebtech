/* ==========================================================================
   Webtech E-Learning Platform - Shared Global Script (Header & UI Helpers)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Dynamic User Navigation in Header
    renderHeaderSession();
    
    // 2. Setup Mobile Navigation Menu
    setupMobileNav();

    // 3. Highlight Active Page Link
    highlightActiveLink();

    // 4. Initialize Cart System
    CartManager.init();
});

// --- RENDER HEADER PROFILE / ACTIONS ---
function renderHeaderSession() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const currentUser = window.WebtechState.getCurrentUser();

    if (currentUser) {
        const isAdmin = currentUser.role === 'admin';
        const roleTag = isAdmin ? '<span class="role-tag-mini admin">Admin</span>' : '<span class="role-tag-mini">Student</span>';
        
        // Handle fullname that might be undefined or empty
        const displayName = currentUser.fullname || currentUser.username || 'User';
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
        
        navActions.innerHTML = `
            <div class="cart-icon-wrapper" onclick="CartManager.toggleCartModal()" style="position: relative; cursor: pointer; color: white; margin-right: 1.5rem; display: flex; align-items: center; justify-content: center;">
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
    } else {
        navActions.innerHTML = `
            <div class="cart-icon-wrapper" onclick="window.location.href='login.html'" style="position: relative; cursor: pointer; color: white; margin-right: 1.5rem; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 1.2rem;"></i>
            </div>
            <a href="login.html" class="btn btn-primary btn-sm">
                <i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ
            </a>
        `;
    }
}

// --- CART MANAGER SYSTEM ---
const CartManager = {
    items: [],
    
    init() {
        this.loadCart();
        this.createCartModal();
        this.updateCartUI();
    },

    loadCart() {
        const storedCart = localStorage.getItem('webtech_cart');
        if (storedCart) {
            try {
                this.items = JSON.parse(storedCart);
            } catch (e) {
                this.items = [];
            }
        }
    },

    saveCart() {
        localStorage.setItem('webtech_cart', JSON.stringify(this.items));
        this.updateCartUI();
    },

    addToCart(course) {
        if (this.items.find(item => item.id === course.id)) {
            showToast("เพิ่มไม่ได้", "คอร์สนี้อยู่ในตะกร้าของคุณแล้ว", "warning");
            return;
        }
        this.items.push(course);
        this.saveCart();
        showToast("เพิ่มสำเร็จ", `เพิ่ม "${course.title}" ลงในตะกร้า`, "success");
        this.openCartModal();
    },

    removeFromCart(courseId) {
        this.items = this.items.filter(item => item.id !== courseId);
        this.saveCart();
    },

    clearCart() {
        this.items = [];
        this.saveCart();
    },

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    },

    updateCartUI() {
        const badge = document.getElementById('cartBadgeCount');
        if (badge) {
            badge.innerText = this.items.length;
            badge.style.display = this.items.length > 0 ? 'flex' : 'none';
        }
        this.renderCartModalContent();
    },

    createCartModal() {
        if (document.getElementById('cartModalWrapper')) return;

        const modalHTML = `
            <div id="cartModalWrapper" class="cart-modal-overlay" style="display: none;" onclick="if(event.target === this) CartManager.closeCartModal()">
                <div class="cart-modal-sidebar floating-ui">
                    <div class="cart-header">
                        <h2><i class="fa-solid fa-cart-shopping"></i> ตะกร้าของคุณ</h2>
                        <button class="cart-close-btn" onclick="CartManager.closeCartModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <div id="cartItemsContainer" class="cart-items">
                        <!-- Loaded Dynamically -->
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total-row">
                            <span>ยอดรวมทั้งหมด:</span>
                            <span id="cartTotalPrice" style="color: #F59E0B; font-weight: bold; font-size: 1.25rem;">฿0</span>
                        </div>
                        <button id="cartCheckoutBtn" class="btn btn-primary" style="width: 100%; justify-content: center; font-size: 1.1rem; padding: 1rem;" onclick="CartManager.handleCheckout()">
                            <i class="fa-solid fa-credit-card"></i> ชำระเงิน / ยืนยันการจอง
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    renderCartModalContent() {
        const container = document.getElementById('cartItemsContainer');
        const priceLabel = document.getElementById('cartTotalPrice');
        const checkoutBtn = document.getElementById('cartCheckoutBtn');
        
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                    <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>ตะกร้าของคุณยังว่างเปล่า</p>
                    <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="CartManager.closeCartModal()">ไปเลือกคอร์สเรียนกันเลย!</button>
                </div>
            `;
            priceLabel.innerText = '฿0';
            checkoutBtn.disabled = true;
            return;
        }

        container.innerHTML = this.items.map(item => {
            const priceText = Number(item.price) === 0 ? 'ฟรี' : new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(item.price);
            return `
                <div class="cart-item">
                    <div class="cart-item-img" style="background: ${item.cover_image || 'var(--accent-purple)'}; background-size: cover; background-position: center;"></div>
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <span class="cart-item-price">${priceText}</span>
                    </div>
                    <button class="cart-item-remove" onclick="CartManager.removeFromCart(${item.id})" title="ลบออก">
                        <i class="fa-solid fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');

        priceLabel.innerText = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(this.getTotalPrice());
        checkoutBtn.disabled = false;
    },

    toggleCartModal() {
        const modal = document.getElementById('cartModalWrapper');
        if (modal) modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    },
    
    openCartModal() {
        const modal = document.getElementById('cartModalWrapper');
        if (modal) modal.style.display = 'flex';
    },

    closeCartModal() {
        const modal = document.getElementById('cartModalWrapper');
        if (modal) modal.style.display = 'none';
    },

    async handleCheckout() {
        if (this.items.length === 0) return;
        
        const currentUser = window.WebtechState.getCurrentUser();
        if (!currentUser) {
            showToast("กรุณาเข้าสู่ระบบ", "คุณต้องล็อกอินก่อนทำการจองเวิร์กชอป", "error");
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
            return;
        }

        const token = localStorage.getItem('webtech_token');
        const courseIds = this.items.map(i => i.id);

        const checkoutBtn = document.getElementById('cartCheckoutBtn');
        if(checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังดำเนินการ...';
        }

        try {
            const response = await fetch('/api/courses/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseIds })
            });

            const result = await response.json();

            if (response.ok) {
                showToast("สั่งซื้อสำเร็จ!", result.message, "success");
                this.clearCart();
                this.closeCartModal();
                
                // If on index page, refresh courses to show enrolled status
                if (typeof renderCourses === 'function') {
                    renderCourses();
                } else {
                    setTimeout(() => window.location.href = 'classroom.html', 1500);
                }
            } else if (response.status === 409) {
                showToast("ไม่สามารถจองได้", result.message, "error");
            } else if (response.status === 401) {
                showToast("เซสชันหมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "error");
                setTimeout(() => window.location.href = 'login.html', 1000);
            } else {
                showToast("เกิดข้อผิดพลาด", result.message || "ไม่สามารถทำรายการได้", "error");
            }
        } catch (err) {
            showToast("เชื่อมต่อล้มเหลว", "โปรดลองใหม่อีกครั้ง", "error");
        } finally {
            if(checkoutBtn && this.items.length > 0) {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> ชำระเงิน / ยืนยันการจอง';
            }
        }
    }
};

// --- HANDLE LOGOUT IN HEADER ---
function handleHeaderLogout() {
    window.WebtechState.logout();
    showToast("ออกจากระบบสำเร็จ", "บ๊ายบาย! ไว้กลับมาเรียนโค้ดด้วยกันใหม่นะ", "success");
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1200);
}

// --- MOBILE NAVIGATION TOGGLE ---
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

// --- HIGHLIGHT ACTIVE PAGE LINK ---
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

// --- MODERN PREMIUM TOAST NOTIFICATION SYSTEM ---
function showToast(title, message, type = 'info') {
    // Create container if not exists
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
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Type specific colors & icons
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
    } else if (type === 'badge') {
        icon = '🏆';
        borderColor = 'var(--accent-purple)';
        glowShadow = 'rgba(139, 92, 246, 0.3)';
    }

    toast.style.cssText = `
        background: rgba(21, 31, 50, 0.9);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-left: 4px solid ${borderColor};
        border-top: 1px solid rgba(255,255,255,0.05);
        border-right: 1px solid rgba(255,255,255,0.05);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px ${glowShadow};
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        pointer-events: auto;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    toast.innerHTML = `
        <div style="font-size: 1.5rem; color: ${borderColor === '🏆' ? '#FFF' : borderColor}">${icon}</div>
        <div style="flex: 1;">
            <h4 style="font-family: var(--font-heading); font-size: 0.95rem; margin-bottom: 0.25rem;">${title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">${message}</p>
        </div>
        <button style="color: var(--text-muted); cursor:pointer; font-size: 0.8rem;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    // Slide in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 50);

    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4500);
}

// Make globally available
window.showToast = showToast;

// --- DYNAMIC INLINE SVG GENERATION FOR BADGES ---
// In case the system doesn't have local images, we can dynamically build high-fidelity technology icons in SVG!
const TechSVGIcons = {
    "b-1": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8" />
                    <stop offset="100%" stop-color="#0369A1" />
                </linearGradient>
                <filter id="glow-b1">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b1)" stroke-width="4" filter="url(#glow-b1)" />
            <polygon points="50,15 80,35 80,68 50,88 20,68 20,35" fill="rgba(56, 189, 248, 0.1)" stroke="url(#g-b1)" stroke-width="2" />
            <!-- Code Bracket Icon -->
            <path d="M38,42 L28,50 L38,58 M62,42 L72,50 L62,58 M54,34 L46,66" stroke="url(#g-b1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="50" cy="50" r="4" fill="#FFF" />
        </svg>
    `,
    "b-2": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#06B6D4" />
                    <stop offset="100%" stop-color="#0891B2" />
                </linearGradient>
                <filter id="glow-b2">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b2)" stroke-width="4" filter="url(#glow-b2)" />
            <!-- CSS Shield -->
            <path d="M50,20 L78,26 L72,68 L50,82 L28,68 L22,26 Z" fill="rgba(6, 182, 212, 0.1)" stroke="url(#g-b2)" stroke-width="3" stroke-linejoin="round" />
            <!-- Paint Brush -->
            <path d="M40,55 L58,37 L63,42 L45,60 Z" fill="#FFF" />
            <path d="M63,42 L58,37 L61,31 C63,28 68,28 70,30 C72,32 72,37 69,39 Z" fill="url(#g-b2)" />
            <path d="M45,60 C42,63 36,65 32,66 C33,62 35,56 38,53 Z" fill="#E2E8F0" />
            <!-- Sparks -->
            <path d="M30,30 L34,34 M70,64 L74,68 M68,25 L70,29" stroke="#FFF" stroke-width="2" stroke-linecap="round" />
        </svg>
    `,
    "b-3": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F59E0B" />
                    <stop offset="100%" stop-color="#D97706" />
                </linearGradient>
                <filter id="glow-b3">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b3)" stroke-width="4" filter="url(#glow-b3)" />
            <!-- Hexagon -->
            <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="rgba(245, 158, 11, 0.1)" stroke="url(#g-b3)" stroke-width="3" />
            <!-- JS Character & Magic Spark -->
            <text x="35" y="62" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="url(#g-b3)">JS</text>
            <path d="M68,36 L64,48 L74,48 L66,64 L68,52 L58,52 Z" fill="#FFF" filter="drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))" />
        </svg>
    `,
    "b-4": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#C084FC" />
                    <stop offset="50%" stop-color="#8B5CF6" />
                    <stop offset="100%" stop-color="#5B21B6" />
                </linearGradient>
                <filter id="glow-b4">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b4)" stroke-width="4" filter="url(#glow-b4)" />
            <!-- Crown graphic -->
            <path d="M24,65 L76,65 L82,40 L65,52 L50,30 L35,52 L18,40 Z" fill="url(#g-b4)" stroke="#FFF" stroke-width="2" stroke-linejoin="round" />
            <!-- Crown Base Jewels -->
            <circle cx="32" cy="61" r="2.5" fill="#FFF" />
            <circle cx="50" cy="61" r="2.5" fill="#FFF" />
            <circle cx="68" cy="61" r="2.5" fill="#FFF" />
            <!-- Tips jewels -->
            <circle cx="18" cy="38" r="3.5" fill="#F43F5E" />
            <circle cx="50" cy="28" r="3.5" fill="#22C55E" />
            <circle cx="82" cy="38" r="3.5" fill="#06B6D4" />
            <!-- Underline glow -->
            <path d="M30,72 L70,72" stroke="url(#g-b4)" stroke-width="3" stroke-linecap="round" />
            <path d="M40,78 L60,78" stroke="url(#g-b4)" stroke-width="2" stroke-linecap="round" />
        </svg>
    `
};

window.TechSVGIcons = TechSVGIcons;
