<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Popup Example</title>
<style>
/* ===== Popup Base ===== */
.popup {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    justify-content: center;
    align-items: center;
    z-index: 2000;
    font-family: "Poppins", sans-serif;
    animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

/* Container */
.login-container { display:flex; width:780px; max-width:90%; max-height:90vh; border-radius:20px; overflow:hidden; background:#fff; box-shadow:0 10px 35px rgba(0,0,0,0.3); }
.login-left { flex:1; background:linear-gradient(135deg, #0d0d0d, #1a1a1a); color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:30px; }
.login-left .login-logo { width:250px; margin-bottom:20px; }
.login-left .qr-code { width:250px; border-radius:12px; margin-bottom:15px; background:#fff; padding:6px; }
.login-left p { font-size:14px; color:#d6f2ff; }

.login-right { flex:1.2; padding:45px 50px; background:#f9fbfd; display:flex; flex-direction:column; justify-content:center; position:relative; }
.login-right h2 { margin-bottom:8px; font-size:26px; color:#111; font-weight:600; }
.login-right .subtitle { font-size:14px; color:#555; margin-bottom:25px; }

.input-group { margin-bottom:18px; }
.input-group label { font-weight:600; display:block; margin-bottom:6px; color:#333; }
.input-box { display:flex; align-items:center; background:#fff; border:1px solid #ccc; border-radius:10px; padding:10px 12px; box-shadow:inset 0 1px 3px rgba(0,0,0,0.08); transition:all 0.3s ease; }
.input-box:hover { border-color:#000; box-shadow:0 0 5px rgba(0,120,255,0.2); }
.input-box input { border:none; outline:none; width:100%; font-size:15px; background:transparent; }

.login-right button { width:100%; padding:12px; background:linear-gradient(135deg, #302e2e, #000000); color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.3s ease; box-shadow:0 4px 12px rgba(0,120,255,0.3); }
.login-right button:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,120,255,0.4); }

.forgot { display:block; text-align:center; margin-top:10px; color:#ac4545; font-size:14px; text-decoration:none; }
.forgot:hover { text-decoration:underline; }

.close, .close-register { position:absolute; top:10px; right:15px; font-size:25px; cursor:pointer; color:#888; transition:color 0.3s; }
.close:hover, .close-register:hover { color:red; }

.role-select { display:flex; justify-content:center; gap:5px; margin-top:-10px; margin-bottom:30px; }
.role-btn { flex:1; padding:8px 0; border:1px solid #000; border-radius:8px; background:#fff; cursor:pointer; font-size:14px; font-weight:600; color:#000; transition:all 0.25s ease; }
.role-btn:hover:not(.active) { background:#f2f2f2; color:#000; }
.role-btn.active { background:#fff; color:#000; border-color:#000; }

.error-msg { color:red; font-size:14px; margin-top:5px; }
</style>
</head>
<body>

<!-- Login Popup -->
<div id="login-popup" class="popup">
    <div class="login-container">
        <div class="login-left">
            <img src="images/logo.png" alt="Gadget Nest Logo" class="login-logo" />
            <img src="images/qr.png" alt="QR Code" class="qr-code" />
            <p>Scan to connect with <b>Gadget Nest</b></p>
        </div>
        <div class="login-right">
            <span class="close">&times;</span>
            <div class="role-select">
                <button type="button" class="role-btn active" data-role="user">User</button>
                <button type="button" class="role-btn" data-role="admin">Admin</button>
                <button type="button" class="role-btn" data-role="register">Register</button>
            </div>
            <h2 class="welcome-text">Hello again!</h2>
            <p class="subtitle">Login to your account</p>
            <form id="login-form" method="POST">
                <div class="input-group">
                    <label>Email ID</label>
                    <div class="input-box">
                        <input type="email" name="email" placeholder="Enter your email" required />
                    </div>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <div class="input-box">
                        <input type="password" name="password" placeholder="Enter your password" required />
                    </div>
                </div>
                <button type="submit">Login</button>
                <div id="login-error" class="error-msg"></div>
                <a href="#" class="forgot">Forgot Password?</a>
                <input type="hidden" name="role" id="login-role" value="user">

            </form>
        </div>
    </div>
</div>

<!-- Register Popup -->
<div id="register-popup" class="popup">
    <div class="login-container">
        <div class="login-left">
            <img src="images/logo.png" alt="Gadget Nest Logo" class="login-logo" />
            <img src="images/qr.png" alt="QR Code" class="qr-code" />
            <p>Scan to connect with <b>Gadget Nest</b></p>
        </div>
        <div class="login-right">
            <span class="close-register">&times;</span>
            <h2>Join Us</h2>
            <p class="subtitle">Create your account</p>
            <form id="register-form" method="POST">
                <div class="input-group">
                    <label>Full Name</label>
                    <div class="input-box"><input type="text" name="fullname" placeholder="Enter your full name" required /></div>
                </div>
                <div class="input-group">
                    <label>Email ID</label>
                    <div class="input-box"><input type="email" name="email" placeholder="Enter your email" required /></div>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <div class="input-box"><input type="password" name="password" placeholder="Enter your password" required /></div>
                </div>
                <div class="input-group">
                    <label>Confirm Password</label>
                    <div class="input-box"><input type="password" name="confirm_password" id="confirm_password" placeholder="Confirm your password" required /></div>
                    <div id="password-match-msg" class="error-msg"></div>
                </div>
                <button type="submit">Register</button>
                <div id="register-error" class="error-msg"></div>
                <p style="text-align:center; margin-top:10px; font-size:14px;">
                    Already have an account? <a href="#" class="login-link">Login</a>
                </p>
            </form>
        </div>
    </div>
</div>

<script>
// Popups and role buttons
const loginBtn = document.querySelector('.login');
const registerBtn = document.querySelector('.register');
const loginPopup = document.getElementById('login-popup');
const registerPopup = document.getElementById('register-popup');
const closeLogin = loginPopup.querySelector('.close');
const closeRegister = registerPopup.querySelector('.close-register');
const loginLink = registerPopup.querySelector('.login-link');
const roleBtns = document.querySelectorAll('.role-btn');
const welcomeText = loginPopup.querySelector('.welcome-text');
roleBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        roleBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.dataset.role;
        document.getElementById('login-role').value = role;
        if(role==='user') welcomeText.textContent='Hello again!';
        else if(role==='admin') welcomeText.textContent='Welcome back, Boss!';
        else if(role==='register') { loginPopup.style.display='none'; registerPopup.style.display='flex'; }
    });
});


// Open/close popup
loginBtn.addEventListener('click', e => { e.preventDefault(); loginPopup.style.display='flex'; });
closeLogin.addEventListener('click', ()=> loginPopup.style.display='none');
window.addEventListener('click', e => { if(e.target===loginPopup) loginPopup.style.display='none'; });

registerBtn.addEventListener('click', e => { e.preventDefault(); registerPopup.style.display='flex'; });
closeRegister.addEventListener('click', ()=> registerPopup.style.display='none');
window.addEventListener('click', e => { if(e.target===registerPopup) registerPopup.style.display='none'; });

loginLink.addEventListener('click', e => { e.preventDefault(); registerPopup.style.display='none'; loginPopup.style.display='flex'; });

roleBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        roleBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.dataset.role;
        if(role==='user') welcomeText.textContent='Hello again!';
        else if(role==='admin') welcomeText.textContent='Welcome back, Boss!';
        else if(role==='register') { loginPopup.style.display='none'; registerPopup.style.display='flex'; }
    });
});

// ----------------------
// AJAX Registration
// ----------------------
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');
const passwordInput = registerForm.querySelector('input[name="password"]');
const confirmPasswordInput = document.getElementById('confirm_password');
const passwordMatchMsg = document.getElementById('password-match-msg');

confirmPasswordInput.addEventListener('input', function() {
    if(confirmPasswordInput.value !== passwordInput.value){
        passwordMatchMsg.textContent = "Passwords do not match!";
    } else {
        passwordMatchMsg.textContent = "";
    }
});

registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    registerError.textContent = '';

    if(confirmPasswordInput.value !== passwordInput.value){
        registerError.textContent = "Passwords do not match!";
        return;
    }

    const formData = new FormData(registerForm);

    fetch('register.php', { method:'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        if(data.success){
            registerPopup.style.display='none';
            loginPopup.style.display='none';
            location.reload(); // update header with user icon
        } else {
            registerError.textContent = data.message;
        }
    })
    .catch(err => {
        registerError.textContent = "An error occurred. Try again.";
    });
});

// ----------------------
// AJAX Login
// ----------------------
const loginForm = loginPopup.querySelector('form');
const loginErrorDiv = document.createElement('div');
loginErrorDiv.style.color = 'red';
loginForm.appendChild(loginErrorDiv);

loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    loginErrorDiv.textContent = '';
    const formData = new FormData(loginForm);
    fetch('login.php',{
        method:'POST', body: formData
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.success){
            loginPopup.style.display = 'none';
            registerPopup.style.display = 'none';
            location.reload();
        }else{
            loginErrorDiv.textContent = data.message;
        }
    })
    .catch(err=>{
        loginErrorDiv.textContent = "An error occurred. Try again.";
    });
});

</script>
</body>
</html>
