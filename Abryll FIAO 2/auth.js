(function(){
const $=s=>document.querySelector(s);
const users=()=>JSON.parse(localStorage.getItem('fiao_users')||'[]');
const msg=t=>{const m=$('#msg');if(m)m.textContent=t};
// Marca la página actual en el menú
const page=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.nav .pill').forEach(a=>{if(a.getAttribute('href')===page)a.classList.add('on')});
// Si ya hay sesión, el Home muestra "Go to dashboard" y "Log out"
const cta=$('.cta');
if(cta&&localStorage.getItem('fiao_session')){
  cta.innerHTML='<a class="pill" href="credit.html">Go to dashboard</a><a class="pill" href="#" id="out">Log out</a>';
  $('#out').onclick=e=>{e.preventDefault();localStorage.removeItem('fiao_session');location.reload()};
}
const su=$('#signup');
if(su)su.onsubmit=e=>{
  e.preventDefault();
  const name=$('#name').value.trim(),email=$('#email').value.trim().toLowerCase(),pw=$('#pw').value;
  if(pw.length<6)return msg('Password must be at least 6 characters.');
  if(pw!==$('#pw2').value)return msg('Passwords do not match.');
  const l=users();
  if(l.some(x=>x.email===email))return msg('That email is already registered. Log in instead.');
  l.push({name,email,pw});
  localStorage.setItem('fiao_users',JSON.stringify(l));
  localStorage.setItem('fiao_session',email);
  location.href='credit.html';
};
const li=$('#login');
if(li)li.onsubmit=e=>{
  e.preventDefault();
  const email=$('#email').value.trim().toLowerCase(),pw=$('#pw').value;
  if(!users().find(x=>x.email===email&&x.pw===pw))return msg('Incorrect email or password.');
  localStorage.setItem('fiao_session',email);
  location.href='credit.html';
};
})();
