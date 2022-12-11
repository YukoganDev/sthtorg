const themeSelect = document.getElementById('theme-select');
const loadingSelect = document.getElementById('loading-select');

let selectedTheme = themeSelect.classList[1];
themeSelect.querySelector('[value="' + selectedTheme + '"]').selected = true;