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
                return;
            }
        } catch (apiErr) {
            console.log('API not available, using localStorage login...');
        }
        
        const loginResult = window.WebtechState.login(usernameInput, passwordInput);
        if (loginResult.success) {
            window.showToast("เข้าสู่ระบบสำเร็จ", `ยินดีต้อนรับกลับมา, ${loginResult.user.fullname}!`, "success");
            setTimeout(() => {
                window.location.href = loginResult.user.role === 'admin' ? 'admin.html' : 'index.html';
            }, 1000);
        } else {
            window.showToast("เข้าสู่ระบบล้มเหลว", loginResult.message, "error");
        }
    } catch (err) {
        console.error('Login error:', err);
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบได้", "error");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('regUsername').value.trim();
    const fullnameInput = document.getElementById('regFullname').value.trim();
    const emailInput = document.getElementById('regEmail').value.trim();
    const passwordInput = document.getElementById('regPassword').value;
    
    try {
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
                return;
            }
        } catch (apiErr) {
            console.log('API not available, using localStorage registration...');
        }
        
        const registerResult = window.WebtechState.register(usernameInput, fullnameInput, passwordInput, currentRegRole);
        if (registerResult.success) {
            window.showToast("ลงทะเบียนสำเร็จ", `สร้างบัญชีเสร็จสิ้น!`, "success");
            setTimeout(() => {
                window.location.href = currentRegRole === 'admin' ? 'admin.html' : 'index.html';
            }, 1000);
        } else {
            window.showToast("ลงทะเบียนล้มเหลว", registerResult.message, "error");
        }
    } catch (err) {
        console.error('Register error:', err);
        window.showToast("เกิดข้อผิดพลาด", "ไม่สามารถลงทะเบียนได้", "error");
    }
}