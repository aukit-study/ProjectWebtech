const CartManager = {
    items: [],
    
    init() {
        this.loadCart();
        this.createCartModal();
        this.updateCartUI();
    },

    getCartKey() {
        const currentUser = window.WebtechState && window.WebtechState.getCurrentUser ? window.WebtechState.getCurrentUser() : null;
        return currentUser ? `webtech_cart_${currentUser.username}` : 'webtech_cart_guest';
    },

    loadCart() {
        const storedCart = localStorage.getItem(this.getCartKey());
        if (storedCart) {
            try { this.items = JSON.parse(storedCart); } catch (e) { this.items = []; }
        } else {
            this.items = [];
        }
    },

    saveCart() {
        localStorage.setItem(this.getCartKey(), JSON.stringify(this.items));
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

        const total = this.getTotalPrice();
        const itemCount = this.items.length;

        let discountPercent = 0;
        let discountReason = '';

        if (itemCount > 3 && total > 1500) {
            discountPercent = 15;
            discountReason = 'ยอดรวมเกิน ฿1,500 และ ซื้อมากกว่า 3 คอร์ส';
        } else if (total > 1500) {
            discountPercent = 10;
            discountReason = 'ยอดรวมเกิน ฿1,500';
        } else if (itemCount > 3) {
            discountPercent = 5;
            discountReason = 'ซื้อมากกว่า 3 คอร์ส';
        }

        if (discountPercent > 0) {
            const discountAmount = Math.round(total * discountPercent / 100);
            const finalTotal = total - discountAmount;
            priceLabel.innerHTML = `
                <div style="text-align:right;">
                    <div style="text-decoration:line-through; color:#888; font-size:0.85rem;">฿${total.toLocaleString()}</div>
                    <div style="color:#10B981; font-size:1.25rem; font-weight:bold;">฿${finalTotal.toLocaleString()}</div>
                    <div style="color:#10B981; font-size:0.75rem;">🏷️ ${discountReason} ลด ${discountPercent}%</div>
                </div>
            `;
        } else {
            priceLabel.innerText = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(total);
        }
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
        if (checkoutBtn) {
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
                const p = result.pricing;
                const discountLine = p.discountPercent > 0
                    ? ` | ลด ${p.discountPercent}% = -฿${p.discountAmount} → ฿${p.recalculatedTotal}`
                    : ' | ไม่มีส่วนลด';

                showToast("สั่งซื้อสำเร็จ!", `ยอดเดิม ฿${p.originalTotal}${discountLine}`, "success");

                const priceLabel = document.getElementById('cartTotalPrice');
                if (priceLabel && p.discountPercent > 0) {
                    priceLabel.innerHTML = `
                        <span style="text-decoration:line-through; color:#888; font-size:0.9rem;">฿${p.originalTotal}</span>
                        <span style="color:#10B981; margin-left:8px;">฿${p.recalculatedTotal}</span>
                        <span style="font-size:0.7rem; color:#10B981; display:block;">${p.discountReason} · ${p.calculatedBy}</span>
                    `;
                    await new Promise(r => setTimeout(r, 2000));
                }

                this.clearCart();
                this.closeCartModal();

                if (typeof renderCourses === 'function') {
                    renderCourses();
                } else {
                    setTimeout(() => window.location.href = 'classroom.html', 1500);
                }

            } else if (response.status === 409) {
                if (result.pricing) {
                    const p = result.pricing;
                    const discountLine = p.discountPercent > 0
                        ? ` | ลด ${p.discountPercent}% = -฿${p.discountAmount} → ฿${p.recalculatedTotal}`
                        : ' | ไม่มีส่วนลด';
                    showToast("สมัครไปแล้ว", `ยอดเดิม ฿${p.originalTotal}${discountLine}`, "error");
                } else {
                    showToast("ไม่สามารถจองได้", result.message, "error");
                }
            }
        } catch (err) {
            showToast("เชื่อมต่อล้มเหลว", "โปรดลองใหม่อีกครั้ง", "error");
        } finally {
            if (checkoutBtn && this.items.length > 0) {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> ชำระเงิน / ยืนยันการจอง';
            }
        }
    }
};