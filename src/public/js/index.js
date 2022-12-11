// const loginBtn = document.querySelector('#login-btn');
let user = document.getElementById('user').dataset.user;
console.log(`Logged in as ${user}`);
// if (user) {
//   loginBtn.innerHTML = `Logout (${user})`;
//   loginBtn.href = '/logout';
// } else {
//   loginBtn.innerHTML = `Login`;
// }

const socket = io();

socket.emit('getPreferences');
function parsePreference(preference, value) {
  if (preference === 'scale') {
    if (value === 0) {
      return 0.9;
    }
    if (value === 1) {
      return 1;
    }
    if (value === 2) {
      return 1.1;
    }
    if (value === 3) {
      return 1.2;
    }
    if (value === 4) {
      return 1.3;
    }
    if (value === 5) {
      return 1.4;
    }
    return 1;
  }
  if (preference === 'theme') {
    if (value === 0) {
      return 'warning';
    }
    if (value === 1) {
      return 'light';
    }
    if (value === 2) {
      return 'dark';
    }
    return 'dark';
  }
  return null;
}

let zoom = 1;
let width = 100;
let height = 100;
let themeColor = 'dark';
let themeBgColor = 'light';
socket.on('loadPreferences', (preferences) => {
  zoom = parsePreference('scale', preferences.scale);
  width = 100 / zoom;
  height = 100 / zoom;

  document.body.style.transformOrigin = 'left top';
  document.body.style.transform = 'scale(' + zoom + ')';
  document.body.style.width = width + '%';
  document.body.style.maxHeight = height + '%';

  themeColor = parsePreference('theme', preferences.theme);
  document.body.classList.add('text-bg-' + themeColor);
  if (themeColor === 'light') {
    themeBgColor = 'white';
  }
  //document.getElementById('createCard').querySelector('div').classList += ' text-bg-' + themeBgColor;
});