/* ==========================================================================
   Webtech E-Learning Platform - Classroom Controller & Gamification Engine
   ========================================================================== */

let activeCourse = null;
let activeLesson = null;
let isVideoPlayingSimulated = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Course ID from URL Query Params
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    // 2. Load Active Course
    loadClassroomCourse(courseId);
    
    // 3. Setup Confetti Canvas Size
    initConfettiCanvas();
});

// --- LOAD COURSE AND DEFAULT FIRST LESSON ---
function loadClassroomCourse(courseId) {
    const courses = window.WebtechState.getCourses();
    
    // If no course ID or course doesn't exist, default to the first one available
    activeCourse = courses.find(c => c.id === courseId);
    if (!activeCourse) {
        if (courses.length > 0) {
            activeCourse = courses[0];
        } else {
            // Edge case: no courses in database
            renderNoCoursesState();
            return;
        }
    }

    // Render Course UI Titles
    document.getElementById('classroomCourseCategory').innerText = activeCourse.category;
    document.getElementById('classroomCourseTitle').innerText = activeCourse.title;

    // Render Timeline & Progress
    renderLessonsTimeline();
    renderCourseProgress();

    // Select the first incomplete lesson, or just the first lesson overall if all are completed
    if (activeCourse.lessons && activeCourse.lessons.length > 0) {
        const firstIncomplete = activeCourse.lessons.find(l => !l.isCompleted);
        selectLesson(firstIncomplete ? firstIncomplete.id : activeCourse.lessons[0].id);
    }
}

function renderNoCoursesState() {
    document.getElementById('classroomCourseTitle').innerText = "ไม่พบวิชาเรียนใดๆ ในคลังคอร์ส";
    document.getElementById('lessonsTimelineContainer').innerHTML = "<li>ไม่มีบทเรียน</li>";
}

// --- RENDER LESSONS TIMELINE ---
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

// --- SELECT AND LOAD SINGLE LESSON DETAILS ---
function selectLesson(lessonId) {
    if (!activeCourse || !activeCourse.lessons) return;

    const targetLesson = activeCourse.lessons.find(l => l.id === lessonId);
    if (!targetLesson) return;

    activeLesson = targetLesson;

    // Highlight active in timeline
    document.querySelectorAll('.timeline-item').forEach(item => item.classList.remove('active'));
    const activeTimelineItem = document.getElementById(`tl-${lessonId}`);
    if (activeTimelineItem) {
        activeTimelineItem.classList.add('active');
    }

    // Update Detail Panel
    document.getElementById('currentLessonTitle').innerText = activeLesson.title;
    document.getElementById('currentLessonCourseName').innerText = activeCourse.title;
    
    // Simulate premium custom technical description texts
    document.getElementById('currentLessonDescription').innerHTML = `
        <p style="margin-bottom: 1rem;">ยินดีต้อนรับเข้าสู่หัวข้อ <strong>${activeLesson.title}</strong> ในคอร์สเรียนนี้เราจะเน้นสร้างทักษะการลงมือทำ (Hands-on) ผ่านความรู้ด้านเทคโนโลยีเว็บระดับสูง</p>
        <p style="margin-bottom: 1rem;">โปรดคลิกเล่นวิดีโอจำลองด้านบนเพื่อศึกษาเนื้อหา เมื่อทำความเข้าใจแนวคิดหลักแล้ว ให้กดปุ่ม <strong>"Mark as Completed"</strong> ด้านขวาบนเพื่อยืนยันการเรียนรู้และอัปเกรดเปอร์เซ็นต์ความสำเร็จของวิชานี้!</p>
        <div style="background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: var(--border-radius-sm); font-family: monospace; font-size: 0.8rem; color:#A78BFA;">
            <span style="color:#EC4899;">// Recommended exercise:</span><br>
            console.log("ศึกษาหัวข้อ ${activeLesson.title} เรียบร้อยแล้ว!");
        </div>
    `;

    // Manage "Mark as Completed" button state
    const completeBtn = document.getElementById('markAsCompletedBtn');
    completeBtn.disabled = false;
    
    if (activeLesson.isCompleted) {
        completeBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Completed ✔';
        completeBtn.className = 'btn btn-secondary';
    } else {
        completeBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Mark as Completed';
        completeBtn.className = 'btn btn-success';
    }

    // Reset Player Mockup Play State
    isVideoPlayingSimulated = false;
    const playIcon = document.getElementById('playIconSim');
    if (playIcon) playIcon.className = 'fa-solid fa-play';
    document.getElementById('mockPlayerTitleText').innerText = `บทเรียน: ${activeLesson.title}`;
}

// --- RENDER DYNAMIC COURSE OVERALL PROGRESS BAR ---
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

// --- HANDLE MARK AS COMPLETED BUTTON CLICK ---
function handleMarkCompletedClick() {
    if (!activeCourse || !activeLesson) return;

    // Toggle complete state
    const newStatus = !activeLesson.isCompleted;
    
    const result = window.WebtechState.markLessonComplete(activeCourse.id, activeLesson.id, newStatus);
    
    if (result.success) {
        // Sync active objects
        activeCourse = result.course;
        activeLesson = activeCourse.lessons.find(l => l.id === activeLesson.id);

        // Render UI
        renderLessonsTimeline();
        renderCourseProgress();
        selectLesson(activeLesson.id);

        if (newStatus) {
            window.showToast("สำเร็จบทเรียน!", `คุณเรียนผ่านหัวข้อ "${activeLesson.title}" แล้ว`, "success");
            
            // Check if course completed 100%
            const currentProgress = window.WebtechState.getCourseProgress(activeCourse);
            if (currentProgress === 100) {
                // Play level up chime
                playLevelUpSound();
                // Explosion of confetti
                triggerConfettiExplosion();
                window.showToast("ยินดีด้วย! จบคอร์สเรียน", `คุณผ่านหลักสูตร "${activeCourse.title}" ครบ 100%`, "success");
            }

            // Check if any badges unlocked just now
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

// --- MOCK MEDIA PLAYER CONTROLLER ---
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

// --- CONFETTI & BADGES CELEBRATION SYSTEMS ---
function triggerBadgeUnlockModal(badgeId) {
    const badgeDefs = window.WebtechState.getBadgeDefinitions();
    const badge = badgeDefs.find(b => b.id === badgeId);
    if (!badge) return;

    // Play unlocking level-up chime!
    playLevelUpSound();

    // Populate Modal Content
    document.getElementById('badgePopupTitle').innerText = badge.title;
    document.getElementById('badgePopupDesc').innerText = badge.description;
    document.getElementById('badgePopupReq').innerText = badge.requirement;

    // Load SVG Icon dynamically
    const iconContainer = document.getElementById('badgePopupIconContainer');
    iconContainer.innerHTML = window.TechSVGIcons[badgeId] || '';

    // Show Modal
    const modal = document.getElementById('badgeUnlockModal');
    if (modal) modal.classList.add('active');

    // Trigger local screen confetti
    triggerConfettiExplosion();
}

function closeBadgeModal() {
    const modal = document.getElementById('badgeUnlockModal');
    if (modal) modal.classList.remove('active');
}

// --- SYNTHESIZED BROWSER AUDIO API ---
function playLevelUpSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Tone 1: C5
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.25);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.25);

        // Tone 2: E5 (delayed)
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
            gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.35);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.35);
        }, 80);

        // Tone 3: G5 (delayed more)
        setTimeout(() => {
            const osc3 = audioCtx.createOscillator();
            const gain3 = audioCtx.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
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

// --- COMPACT CANVAS-BASED CONFETTI PARTICLE SYSTEM ---
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
            y: confettiCanvas.height + 20, // start below screen
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 15 - 10, // shoot upwards
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
        p.vy += 0.3; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < confettiCanvas.height) {
            livingParticles++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
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
