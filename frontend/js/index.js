let selectedCategories = new Set(['ALL']);
let selectedPriceRange = 'ALL';
let searchTimeoutToken = null;
let allCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    // โหลดคอร์สจาก API ตอนหน้าโหลด
    renderCourses();

    const priceRange = document.getElementById('filterPriceRange');
    if (priceRange) {
        priceRange.addEventListener('change', () => {
            selectedPriceRange = priceRange.value;
            renderCourses();
        });
    }

    const unownedCheckbox = document.getElementById('filterUnownedOnly');
    if (unownedCheckbox) {
        unownedCheckbox.addEventListener('change', renderCourses);
    }

    // Debounce Search
    const searchInput = document.getElementById('filterSearchKeyword');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeoutToken);
            searchTimeoutToken = setTimeout(() => {
                renderCourses();
            }, 400);
        });
    }
});

function filterCatalog(category) {
    if (category === 'ALL') {
        selectedCategories.clear();
        selectedCategories.add('ALL');
    } else {
        selectedCategories.delete('ALL');
        if (selectedCategories.has(category)) {
            selectedCategories.delete(category);
            if (selectedCategories.size === 0) {
                selectedCategories.add('ALL');
            }
        } else {
            selectedCategories.add(category);
        }
    }

    // อัปเดต active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const btnMap = { 'ALL': 'btn-cat-ALL', 'HTML/CSS': 'btn-cat-HTML', 'JavaScript': 'btn-cat-JS', 'Backend': 'btn-cat-Backend', 'Database': 'btn-cat-Database', 'DevOps': 'btn-cat-DevOps' };

    selectedCategories.forEach(cat => {
        const targetBtn = document.getElementById(btnMap[cat]);
        if (targetBtn) targetBtn.classList.add('active');
    });

    renderCourses();
}

// ✅ ดึงคอร์สจาก API จริง
async function renderCourses() {
    const container = document.getElementById('coursesGridContainer');
    if (!container) return;

    container.innerHTML = `<p style="color: var(--text-secondary);">กำลังโหลดคอร์ส...</p>`;

    try {
        const token = localStorage.getItem('webtech_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/courses', { headers });
        const data = await response.json();
        const courses = data.courses;
        allCourses = courses;

        // กรองตาม category และ keyword
        const keyword = (document.getElementById('filterSearchKeyword')?.value || '').toLowerCase();
        const filtered = courses.filter(course => {
            const matchCategory = selectedCategories.has('ALL') || selectedCategories.has(course.category);
            const matchKeyword = !keyword || course.title.toLowerCase().includes(keyword);
            const coursePrice = Number(course.price || 0);
            let matchPrice = true;

            if (selectedPriceRange === 'FREE') {
                matchPrice = coursePrice === 0;
            } else if (selectedPriceRange === 'BUDGET') {
                matchPrice = coursePrice > 0 && coursePrice <= 500;
            } else if (selectedPriceRange === 'STANDARD') {
                matchPrice = coursePrice > 500 && coursePrice <= 1000;
            } else if (selectedPriceRange === 'PREMIUM') {
                matchPrice = coursePrice > 1000;
            }

            const showUnownedOnly = document.getElementById('filterUnownedOnly')?.checked;
            const matchUnowned = showUnownedOnly ? !(course.is_enrolled > 0) : true;

            return matchCategory && matchKeyword && matchPrice && matchUnowned;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary);">ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>`;
            return;
        }

        container.innerHTML = filtered.map(course => {
            const isFull = course.current_bookings >= course.max_capacity;
            const seatsLeft = course.max_capacity - course.current_bookings;
            const coursePrice = Number(course.price || 0);

            return `
                <div class="card floating-ui" style="display: flex; flex-direction: column;">
                    <div class="course-card-cover" style="background: ${course.cover_image};">
                        <span class="course-card-tag">${course.category}</span>
                        <span class="course-card-difficulty ${course.difficulty}">${course.difficulty}</span>
                    </div>
                    <h3 class="course-card-title">${course.title}</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin:0.75rem 0 0.5rem;">
                        <span style="font-weight:700; color:#F59E0B; font-size:0.95rem;">${coursePrice === 0 ? 'ฟรี' : formatThaiBaht(coursePrice)}</span>
                        <span style="font-size:0.85rem; color: var(--text-secondary);">${course.max_capacity} ที่นั่งทั้งหมด</span>
                    </div>
                    <p class="course-card-desc">${course.description}</p>
                    <div class="course-card-footer">
                        <div class="course-card-stats">
                            <span><i class="fa-solid fa-users"></i> ${course.current_bookings}/${course.max_capacity}</span>
                            <span style="color: ${isFull ? '#EF4444' : '#10B981'}">
                                <i class="fa-solid fa-${isFull ? 'ban' : 'circle-check'}"></i>
                                ${isFull ? 'เต็มแล้ว' : `เหลือ ${seatsLeft} ที่นั่ง`}
                            </span>
                        </div>
                        ${course.is_enrolled > 0 ? `
                            <a href="classroom.html?courseId=c-${course.id}" class="btn btn-blue btn-sm">
                                <i class="fa-solid fa-circle-play"></i> เรียน
                            </a>
                        ` : `
                            <button 
                                class="btn ${isFull ? 'btn-secondary' : 'btn-primary'} btn-sm"
                                onclick="handleAddToCartClick(${course.id})"
                                ${isFull ? 'disabled' : ''}>
                                <i class="fa-solid fa-${isFull ? 'ban' : 'cart-plus'}"></i>
                                ${isFull ? 'เต็มแล้ว' : 'เพิ่มลงตะกร้า'}
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        container.innerHTML = `<p style="color: #EF4444;">เกิดข้อผิดพลาดในการโหลดคอร์ส</p>`;
    }
}

function formatThaiBaht(value) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        maximumFractionDigits: 0
    }).format(value);
}

// ✅ หยิบใส่ตะกร้า (Cart)
function handleAddToCartClick(courseId) {
    const course = allCourses.find(c => c.id === courseId);
    if (course && typeof CartManager !== 'undefined') {
        CartManager.addToCart(course);
    }
}