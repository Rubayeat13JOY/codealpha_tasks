// Banner Slider
let currentSlide = 0;
const slides = document.querySelectorAll(".banner-slider img");
const nextBtn = document.querySelector(".banner-slider .next");
const prevBtn = document.querySelector(".banner-slider .prev");

function showSlide(index){ slides.forEach((s,i)=>s.classList.toggle("active",i===index)); }
nextBtn.addEventListener("click",()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); });
prevBtn.addEventListener("click",()=>{ currentSlide=(currentSlide-1+slides.length)%slides.length; showSlide(currentSlide); });
setInterval(()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); },4000);

// Recommended Slider
const recItems = document.querySelector(".rec-items");
const recPrev = document.querySelector(".rec-prev");
const recNext = document.querySelector(".rec-next");
let recIndex=0;
recNext.addEventListener("click",()=>{ recIndex=Math.min(recIndex+1,3); recItems.style.transform=`translateX(-${recIndex*210}px)`; });
recPrev.addEventListener("click",()=>{ recIndex=Math.max(recIndex-1,0); recItems.style.transform=`translateX(-${recIndex*210}px)`; });

// Popup Login/Register
const loginBtn=document.querySelector('.login');
const registerBtn=document.querySelector('.register');
const loginPopup=document.getElementById('login-popup');
const registerPopup=document.getElementById('register-popup');
const closeLogin=loginPopup.querySelector('.close');
const closeRegister=registerPopup.querySelector('.close-register');
const loginLink=registerPopup.querySelector('.login-link');
const roleBtns=document.querySelectorAll('.role-btn');
const welcomeText=loginPopup.querySelector('.welcome-text');

loginBtn.addEventListener('click',e=>{ e.preventDefault(); loginPopup.style.display='flex'; });
closeLogin.addEventListener('click',()=>loginPopup.style.display='none');
registerBtn.addEventListener('click',e=>{ e.preventDefault(); registerPopup.style.display='flex'; });
closeRegister.addEventListener('click',()=>registerPopup.style.display='none');
window.addEventListener('click',e=>{ if(e.target===loginPopup)loginPopup.style.display='none'; if(e.target===registerPopup)registerPopup.style.display='none'; });
loginLink.addEventListener('click',e=>{ e.preventDefault(); registerPopup.style.display='none'; loginPopup.style.display='flex'; });
roleBtns.forEach(btn=>{ btn.addEventListener('click',()=>{ roleBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const role=btn.dataset.role; if(role==='user') welcomeText.textContent='Hello again!'; else if(role==='admin') welcomeText.textContent='Welcome back, Boss!'; else if(role==='register'){ loginPopup.style.display='none'; registerPopup.style.display='flex'; } }); });
