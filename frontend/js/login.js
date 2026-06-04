let currentRegRole = 'student';

function switchAuthTab(type) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if (type === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('webtech_token', result.token);
            window.WebtechState.setCurrentUser(result.user);
            window.showToast("เข้าสู่ระบบสำเร็จ", `ยินดีต้อนรับกลับมา, ${result.user.fullname}!`, "success");
            setTimeout(() => {
                window.location.href = result.user.role === 'admin' ? 'admin.html' : 'index.html';
            }, 1000);
        } else {
            window.showToast("เข้าสู่ระบบล้มเหลว", result.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "error");
        }
    } catch (err) {
        console.error('Login error:', err);
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('regUsername').value.trim();
    const fullnameInput = document.getElementById('regFullname').value.trim();
    const emailInput = document.getElementById('regEmail').value.trim();
    const passwordInput = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, fullname: fullnameInput, email: emailInput, password: passwordInput, role: currentRegRole })
        });
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('webtech_token', result.token);
            window.WebtechState.setCurrentUser(result.user);
            window.showToast("ลงทะเบียนสำเร็จ", `สร้างบัญชีเสร็จสิ้น!`, "success");
            setTimeout(() => {
                window.location.href = currentRegRole === 'admin' ? 'admin.html' : 'index.html';
            }, 1000);
        } else {
            window.showToast("ลงทะเบียนล้มเหลว", result.message || "มีชื่อผู้ใช้นี้ในระบบแล้ว", "error");
        }
    } catch (err) {
        console.error('Register error:', err);
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
}