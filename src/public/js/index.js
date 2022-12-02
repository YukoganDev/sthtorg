const loginBtn = document.querySelector('#login-btn');
let user = document.getElementById('user').dataset.user;
console.log(`Logged in as ${user}`);
if (user) {
  loginBtn.innerHTML = `Logout (${user})`;
  loginBtn.href = '/logout';
} else {
  loginBtn.innerHTML = `Login`;
}