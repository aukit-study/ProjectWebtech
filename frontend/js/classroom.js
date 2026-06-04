/* ==========================================================================
   Webtech E-Learning Platform - Classroom Controller & Gamification Engine
   ========================================================================== */

let activeCourse = null;
let activeLesson = null;
let isVideoPlayingSimulated = false;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    const overviewEl = document.getElementById('enrolledCoursesOverview');
    const mainEl = document.getElementById('classroomMainContent');

    if (!courseId) {
        if (overviewEl) overviewEl.style.display = 'block';
        if (mainEl) mainEl.style.display = 'none';
        renderEnrolledCoursesOverview();
    } else {
        if (overviewEl) overviewEl.style.display = 'none';
        if (mainEl) mainEl.style.display = 'block';
        // ซ่อน toolbar เมื่ออยู่ในโหมดดูบทเรียน
        const toolbar = document.getElementById('searchFilterBar');
        if (toolbar) toolbar.style.display = 'none';
        loadClassroomCourse(courseId);
    }

    initConfettiCanvas();
});

// ===== SEARCH & FILTER =====
function initSearchFilter() {
    const toolbar = document.getElementById('searchFilterBar');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';

    // แสดง toolbar
    if (toolbar) toolbar.style.display = 'flex';

    function applyFilter() {
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cards = document.querySelectorAll('#enrolledCoursesGrid .card');
        const noResultsMsg = document.getElementById('noResultsMsg');
        let visibleCount = 0;

        cards.forEach(card => {
            // ดึงชื่อคอร์สจาก h3
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            // ดึง tag หมวดหมู่จาก role-tag-mini
            const tag = card.querySelector('.role-tag-mini')?.textContent.toLowerCase() || '';
            // ดึง progress จาก progress-bar width style หรือ text
            const progressText = card.querySelector('[style*="width:"]');
            const progressVal = parseFloat(progressText?.style?.width) || 0;

            const matchKeyword = !keyword || title.includes(keyword);

            let matchFilter = false;
            switch (currentFilter) {
                case 'all':
                    matchFilter = true;
                    break;
                case 'javascript':
                    matchFilter = tag.includes('javascript');
                    break;
                case 'htmlcss':
                    matchFilter = tag.includes('html') || tag.includes('css');
                    break;
                case 'react':
                    matchFilter = tag.includes('react');
                    break;
                case 'done':
                    matchFilter = progressVal >= 100;
                    break;
                case 'inprogress':
                    matchFilter = progressVal > 0 && progressVal < 100;
                    break;
                default:
                    matchFilter = true;
            }

            const visible = matchKeyword && matchFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) visibleCount++;
        });

        // แสดง/ซ่อน no-results message
        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }

    // Filter button listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilter();
        });
    });
}

// ===== RENDER ENROLLED COURSES OVERVIEW =====
async function renderEnrolledCoursesOverview() {
    const container = document.getElementById('enrolledCoursesGrid');
    if (!container) return;

    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">กำลังโหลดคอร์สที่สมัครไว้...</div>`;

    try {
        const token = localStorage.getItem('webtech_token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/courses', { headers });
        const data = await response.json();
        const allCourses = data.courses || [];
        
        const enrolledCourses = allCourses.filter(c => c.is_enrolled > 0);

        if (enrolledCourses.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--border-color);">
                    <i class="fa-solid fa-graduation-cap" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">คุณยังไม่ได้สมัครเรียนคอร์สใดเลย</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 1.5rem;">ไปเลือกคอร์สเรียนกัน!</a>
                </div>
            `;
            // ซ่อน toolbar ถ้าไม่มีคอร์ส
            const toolbar = document.getElementById('searchFilterBar');
            if (toolbar) toolbar.style.display = 'none';
            return;
        }

        const stateCourses = window.WebtechState.getCourses();

        container.innerHTML = enrolledCourses.map(course => {
            const stateCourse = stateCourses.find(c => c.id === `c-${course.id}`);
            const progress = stateCourse ? window.WebtechState.getCourseProgress(stateCourse) : 0;
            const lessonsCount = stateCourse && stateCourse.lessons ? stateCourse.lessons.length : 0;
            const completedCount = stateCourse && stateCourse.lessons ? stateCourse.lessons.filter(l => l.isCompleted).length : 0;
            let barColor = progress === 100 ? 'var(--accent-green)' : 'var(--accent-purple)';

            return `
                <div class="card floating-ui" style="display:flex; flex-direction:column; cursor:pointer;" onclick="window.location.href='classroom.html?courseId=c-${course.id}'">
                    <div style="height: 140px; border-radius: 8px; background: ${course.cover_image || 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'}; margin-bottom: 1rem; display:flex; align-items:flex-end; padding:1rem; background-size: cover; background-position: center;">
                        <span class="role-tag-mini" style="background:rgba(0,0,0,0.6); color:white;">${course.category}</span>
                    </div>
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${course.title}</h3>
                    
                    <div class="progress-container" style="margin-top: auto; padding-top: 1rem;">
                        <div class="progress-header" style="margin-bottom:0.4rem;">
                            <span style="font-size:0.8rem;">ความก้าวหน้า</span>
                            <span style="font-size:0.8rem; color:${barColor}; font-weight:700;">${progress}% (${completedCount}/${lessonsCount})</span>
                        </div>
                        <div class="progress-track" style="height:6px;">
                            <div class="progress-bar" style="width: ${progress}%; background:${barColor}; box-shadow:0 0 5px ${barColor};"></div>
                        </div>
                    </div>
                    
                    <a href="classroom.html?courseId=c-${course.id}" class="btn btn-blue btn-sm" style="margin-top: 1rem; width: 100%; text-align: center; justify-content: center;">
                        <i class="fa-solid fa-circle-play"></i> เข้าเรียน
                    </a>
                </div>
            `;
        }).join('');

        // เรียก initSearchFilter หลัง render cards เสร็จแล้ว
        initSearchFilter();

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #EF4444;">เกิดข้อผิดพลาดในการโหลดคอร์สเรียนของคุณ</div>`;
    }
}

// ===== LOAD COURSE AND DEFAULT FIRST LESSON =====
function loadClassroomCourse(courseId) {
    const courses = window.WebtechState.getCourses();

    activeCourse = courses.find(c => c.id === courseId);
    if (!activeCourse) {
        renderNoCoursesState();
        return;
    }

    document.getElementById('classroomCourseCategory').innerText = activeCourse.category;
    document.getElementById('classroomCourseTitle').innerText = activeCourse.title;

    renderLessonsTimeline();
    renderCourseProgress();

    if (activeCourse.lessons && activeCourse.lessons.length > 0) {
        const firstIncomplete = activeCourse.lessons.find(l => !l.isCompleted);
        selectLesson(firstIncomplete ? firstIncomplete.id : activeCourse.lessons[0].id);
    }
}

function renderNoCoursesState() {
    document.getElementById('classroomCourseTitle').innerText = "ไม่พบวิชาเรียนใดๆ ในคลังคอร์ส";
    document.getElementById('lessonsTimelineContainer').innerHTML = "<li>ไม่มีบทเรียน</li>";
}

// ===== RENDER LESSONS TIMELINE =====
function renderLessonsTimeline() {
    const container = document.getElementById('lessonsTimelineContainer');
    if (!container || !activeCourse || !activeCourse.lessons) return;

    container.innerHTML = activeCourse.lessons.map(lesson => {
        const completedClass = lesson.isCompleted ? 'completed' : '';
        const activeClass = (activeLesson && activeLesson.id === lesson.id) ? 'active' : '';
        const icon = lesson.isCompleted ? '<i class="fa-solid fa-check"></i>' : '';

        return `
            <li class="timeline-item ${completedClass} ${activeClass}" id="tl-${lesson.id}" onclick="selectLesson('${lesson.id}')">
                <div class="timeline-checkbox">${icon}</div>
                <span class="timeline-title">${lesson.title}</span>
            </li>
        `;
    }).join('');
}

// ===== SELECT AND LOAD SINGLE LESSON DETAILS =====
function selectLesson(lessonId) {
    if (!activeCourse || !activeCourse.lessons) return;

    const targetLesson = activeCourse.lessons.find(l => l.id === lessonId);
    if (!targetLesson) return;

    activeLesson = targetLesson;

    document.querySelectorAll('.timeline-item').forEach(item => item.classList.remove('active'));
    const activeTimelineItem = document.getElementById(`tl-${lessonId}`);
    if (activeTimelineItem) {
        activeTimelineItem.classList.add('active');
    }

    document.getElementById('currentLessonTitle').innerText = activeLesson.title;
    document.getElementById('currentLessonCourseName').innerText = activeCourse.title;

    document.getElementById('currentLessonDescription').innerHTML = `
        <p style="margin-bottom: 1rem;">ยินดีต้อนรับเข้าสู่หัวข้อ <strong>${activeLesson.title}</strong> ในคอร์สเรียนนี้เราจะเน้นสร้างทักษะการลงมือทำ (Hands-on) ผ่านความรู้ด้านเทคโนโลยีเว็บระดับสูง</p>
        <p style="margin-bottom: 1rem;">โปรดคลิกเล่นวิดีโอจำลองด้านบนเพื่อศึกษาเนื้อหา เมื่อทำความเข้าใจแนวคิดหลักแล้ว ให้กดปุ่ม <strong>"Mark as Completed"</strong> ด้านขวาบนเพื่อยืนยันการเรียนรู้และอัปเกรดเปอร์เซ็นต์ความสำเร็จของวิชานี้!</p>
        <div style="background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: var(--border-radius-sm); font-family: monospace; font-size: 0.8rem; color:#A78BFA;">
            <span style="color:#EC4899;">// Recommended exercise:</span><br>
        </div>
    `;

    const completeBtn = document.getElementById('markAsCompletedBtn');
    if (completeBtn) {
        if (activeLesson.isCompleted) {
            completeBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> เรียนจบแล้ว';
            completeBtn.className = 'btn btn-secondary';
            completeBtn.disabled = true;
        } else {
            completeBtn.className = 'btn btn-success';
            completeBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Mark as Completed';
            completeBtn.disabled = false;
        }
    }

    isVideoPlayingSimulated = false;
    const playIcon = document.getElementById('playIconSim');
    if (playIcon) playIcon.className = 'fa-solid fa-play';
    document.getElementById('mockPlayerTitleText').innerText = `บทเรียน: ${activeLesson.title}`;
}

// ===== RENDER DYNAMIC COURSE OVERALL PROGRESS BAR =====
function renderCourseProgress() {
    const container = document.getElementById('courseOverallProgressContainer');
    if (!container || !activeCourse) return;

    const progress = window.WebtechState.getCourseProgress(activeCourse);
    const completedCount = activeCourse.lessons.filter(l => l.isCompleted).length;
    const totalCount = activeCourse.lessons.length;

    container.innerHTML = `
        <div class="progress-container" style="margin-top: 0;">
            <div class="progress-header">
                <span>ความก้าวหน้าคอร์ส</span>
                <span>${progress}% (${completedCount}/${totalCount} บทเรียน)</span>
            </div>
            <div class="progress-track">
                <div class="progress-bar" style="width: ${progress}%;"></div>
            </div>
        </div>
    `;
}

// ===== HANDLE MARK AS COMPLETED BUTTON CLICK =====
function handleMarkCompletedClick() {
    if (!activeCourse || !activeLesson) return;

    const newStatus = !activeLesson.isCompleted;
    const result = window.WebtechState.markLessonComplete(activeCourse.id, activeLesson.id, newStatus);

    if (result.success) {
        activeCourse = result.course;
        activeLesson = activeCourse.lessons.find(l => l.id === activeLesson.id);

        renderLessonsTimeline();
        renderCourseProgress();
        selectLesson(activeLesson.id);

        if (newStatus) {
            window.showToast("สำเร็จบทเรียน!", `คุณเรียนผ่านหัวข้อ "${activeLesson.title}" แล้ว`, "success");

            const currentProgress = window.WebtechState.getCourseProgress(activeCourse);
            if (currentProgress === 100) {
                playLevelUpSound();
                triggerConfettiExplosion();
                window.showToast("ยินดีด้วย! จบคอร์สเรียน", `คุณผ่านหลักสูตร "${activeCourse.title}" ครบ 100%`, "success");
            }

            if (result.unlockedJustNow && result.unlockedJustNow.length > 0) {
                result.unlockedJustNow.forEach(badgeId => {
                    setTimeout(() => {
                        triggerBadgeUnlockModal(badgeId);
                    }, 800);
                });
            }
        }
    }
}

// ===== MOCK MEDIA PLAYER CONTROLLER =====
function togglePlaySimulation() {
    isVideoPlayingSimulated = !isVideoPlayingSimulated;
    const playIcon = document.getElementById('playIconSim');
    const titleText = document.getElementById('mockPlayerTitleText');

    if (isVideoPlayingSimulated) {
        playIcon.className = 'fa-solid fa-pause';
        titleText.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" style="color:var(--accent-cyan); margin-right:0.5rem;"></i> วิดีโอกำลังเล่น... ${activeLesson.title}`;
        window.showToast("จำลองการเล่นวิดีโอ", "กำลังเล่นบทบรรยายระบบความเชี่ยวชาญ", "info");
    } else {
        playIcon.className = 'fa-solid fa-play';
        titleText.innerText = `หยุดเล่นวิดีโอ: ${activeLesson.title}`;
    }
}

// ===== CONFETTI & BADGES CELEBRATION SYSTEMS =====
function triggerBadgeUnlockModal(badgeId) {
    const badgeDefs = window.WebtechState.getBadgeDefinitions();
    const badge = badgeDefs.find(b => b.id === badgeId);
    if (!badge) return;

    playLevelUpSound();

    document.getElementById('badgePopupTitle').innerText = badge.title;
    document.getElementById('badgePopupDesc').innerText = badge.description;
    document.getElementById('badgePopupReq').innerText = badge.requirement;

    const iconContainer = document.getElementById('badgePopupIconContainer');
    iconContainer.innerHTML = window.TechSVGIcons[badgeId] || '';

    const modal = document.getElementById('badgeUnlockModal');
    if (modal) modal.classList.add('active');

    triggerConfettiExplosion();
}

function closeBadgeModal() {
    const modal = document.getElementById('badgeUnlockModal');
    if (modal) modal.classList.remove('active');
}

// ===== SYNTHESIZED BROWSER AUDIO API =====
function playLevelUpSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.25);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.25);

        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.35);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.35);
        }, 80);

        setTimeout(() => {
            const osc3 = audioCtx.createOscillator();
            const gain3 = audioCtx.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime);
            gain3.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.5);
            osc3.connect(gain3);
            gain3.connect(audioCtx.destination);
            osc3.start();
            osc3.stop(audioCtx.currentTime + 0.5);
        }, 160);
    } catch (e) {
        console.warn("Audio chime prevented by browser tab restrictions.", e);
    }
}

// ===== COMPACT CANVAS-BASED CONFETTI PARTICLE SYSTEM =====
let confettiCanvas, ctx;
let confettiActive = false;
let particles = [];
const particleCount = 100;
const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#EC4899', '#F59E0B', '#FFF'];

function initConfettiCanvas() {
    confettiCanvas = document.getElementById('confettiCanvas');
    if (!confettiCanvas) return;
    ctx = confettiCanvas.getContext('2d');

    window.addEventListener('resize', resizeConfettiCanvas);
    resizeConfettiCanvas();
}

function resizeConfettiCanvas() {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}

function triggerConfettiExplosion() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: confettiCanvas.height + 20,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 15 - 10,
            r: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }

    if (!confettiActive) {
        confettiActive = true;
        animateConfetti();
    }
}

function animateConfetti() {
    if (!confettiActive || !ctx) return;

    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let livingParticles = 0;

    particles.forEach(p => {
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < confettiCanvas.height) {
            livingParticles++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
            ctx.restore();
        }
    });

    if (livingParticles > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiActive = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ===== UNENROLL SYSTEM =====
function triggerUnenroll() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdParam = urlParams.get('courseId');
    
    if (courseIdParam) {
        const actualId = courseIdParam.replace('c-', '');
        handleUnenrollCourse(actualId);
    } else {
        showToast('ผิดพลาด', 'ไม่พบรหัสคอร์สเรียน', 'error');
    }
}

function handleUnenrollCourse(courseId) {
    const modal = document.getElementById('customConfirmModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('confirmUnenrollBtn').onclick = function() {
            closeCustomConfirm();
            executeUnenroll(courseId);
        };
    }
}

function closeCustomConfirm() {
    const modal = document.getElementById('customConfirmModal');
    if (modal) modal.classList.remove('active');
}

async function executeUnenroll(courseId) {
    const token = localStorage.getItem('webtech_token');
    const unenrollBtn = document.getElementById('unenrollBtn');
    
    if (unenrollBtn) {
        unenrollBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังดำเนินการ...';
        unenrollBtn.disabled = true;
    }

    try {
        const response = await fetch(`/api/courses/${courseId}/unenroll`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('ยกเลิกสำเร็จ', 'นำคอร์สเรียนออกจากห้องเรียนของคุณแล้ว', 'success');
            setTimeout(() => window.location.href = 'classroom.html', 1500);
        } else {
            showToast('ผิดพลาด', result.message || 'ไม่สามารถยกเลิกได้', 'error');
            resetUnenrollBtn(unenrollBtn);
        }
    } catch (err) {
        showToast('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
        resetUnenrollBtn(unenrollBtn);
    }
}

function resetUnenrollBtn(btn) {
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> ยกเลิกคอร์สเรียนนี้';
        btn.disabled = false;
    }
}