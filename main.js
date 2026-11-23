// --- ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (СВЕТЛАЯ / ТЁМНАЯ) ---
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('site-theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
});

// --- ПЛАВНЫЙ РАССЕИВАЮЩИЙ ЭФФЕКТ ОТ КНОПОК (RIPPLE) ---
document.querySelectorAll('.ripple-target').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const wave = document.createElement('span');
    
    wave.classList.add('ripple-wave');
    wave.style.width = wave.style.height = `${size}px`;
    wave.style.left = `${e.clientX - rect.left - size / 2}px`;
    wave.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    this.appendChild(wave);
    setTimeout(() => wave.remove(), 650);
  });
});

// --- СКОЛЬЗЯЩИЙ ИНДИКАТОР ВКЛАДОК И ПЛАВНАЯ ВЫСОТА ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const tabsWrapper = document.getElementById('tabs-wrapper');
const tabIndicator = document.getElementById('tab-indicator');

let currentTabIndex = 0;

function updateWrapperHeight() {
  const activeContent = tabContents[currentTabIndex];
  if (activeContent) {
    tabsWrapper.style.height = (activeContent.offsetHeight + 16) + 'px';
  }
}

function switchTab(index) {
  if (index < 0 || index >= tabBtns.length) return;
  currentTabIndex = index;

  tabBtns.forEach((b, i) => b.classList.toggle('active', i === index));
  tabContents.forEach((c, i) => c.classList.toggle('active', i === index));

  tabIndicator.style.transform = `translateX(${index * 100}%)`;
  updateWrapperHeight();
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.index);
    switchTab(index);
  });
});

window.addEventListener('resize', updateWrapperHeight);

// --- УВЕДОМЛЕНИЕ И КОПИРОВАНИЕ ---
const toast = document.getElementById('toast');
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input.value || input.value === 'Нажми Сгенерировать') return;
    navigator.clipboard.writeText(input.value);
    showToast('Скопировано: ' + input.value);
  });
});

// --- ПЛАВНЫЙ ПОЛЗУНОК ДЛИНЫ ПАРОЛЯ ---
const passSlider = document.getElementById('pass-slider');
const sliderFill = document.getElementById('slider-fill');
const sliderThumb = document.getElementById('slider-thumb');
const passLen = document.getElementById('pass-len');
const passLenVal = document.getElementById('pass-len-val');

const MIN_LEN = 6;
const MAX_LEN = 32;
let isDraggingSlider = false;

function setSliderValue(val) {
  const clamped = Math.max(MIN_LEN, Math.min(MAX_LEN, Math.round(val)));
  const percent = ((clamped - MIN_LEN) / (MAX_LEN - MIN_LEN)) * 100;

  sliderFill.style.width = `${percent}%`;
  sliderThumb.style.left = `${percent}%`;
  passSlider.setAttribute('aria-valuenow', clamped);

  if (parseInt(passLen.value) !== clamped) {
    passLen.value = clamped;
    passLenVal.textContent = clamped;
    passLenVal.classList.remove('pulse');
    void passLenVal.offsetWidth;
    passLenVal.classList.add('pulse');
  }
}

function updateSliderFromPointer(clientX) {
  const rect = passSlider.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const newValue = MIN_LEN + ratio * (MAX_LEN - MIN_LEN);
  setSliderValue(newValue);
}

passSlider.addEventListener('pointerdown', (e) => {
  isDraggingSlider = true;
  passSlider.classList.add('dragging');
  passSlider.setPointerCapture(e.pointerId);
  updateSliderFromPointer(e.clientX);
});

passSlider.addEventListener('pointermove', (e) => {
  if (!isDraggingSlider) return;
  updateSliderFromPointer(e.clientX);
});

passSlider.addEventListener('pointerup', (e) => {
  if (!isDraggingSlider) return;
  isDraggingSlider = false;
  passSlider.classList.remove('dragging');
  passSlider.releasePointerCapture(e.pointerId);
});

passSlider.addEventListener('keydown', (e) => {
  const current = parseInt(passLen.value);
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    setSliderValue(current + 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    setSliderValue(current - 1);
  }
});

setSliderValue(14);

// --- 1. ГЕНЕРАТОР ПАРОЛЕЙ ---
document.getElementById('gen-pass').addEventListener('click', () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const sym = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (document.getElementById('pass-upper').checked) chars += upper;
  if (document.getElementById('pass-lower').checked) chars += lower;
  if (document.getElementById('pass-num').checked) chars += num;
  if (document.getElementById('pass-sym').checked) chars += sym;

  if (!chars) {
    showToast('Выбери хотя бы один тип символов!');
    return;
  }

  let result = '';
  const length = parseInt(passLen.value);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('pass-result').value = result;
});

// --- 2. ГЕНЕРАТОР НИКНЕЙМОВ ---
const nickWords = {
  gamer: {
    adj: ['Shadow', 'Dark', 'Silent', 'Rapid', 'Frost', 'Blaze', 'Night', 'Phantom', 'Iron', 'Storm'],
    noun: ['Wolf', 'Hunter', 'Viper', 'Ghost', 'Striker', 'Ninja', 'Sniper', 'Knight', 'Reaper', 'Falcon']
  },
  cyber: {
    adj: ['Neon', 'Cyber', 'Zero', 'Byte', 'Glitch', 'Pixel', 'Nova', 'Synth', 'Matrix', 'Turbo'],
    noun: ['Core', 'Pulse', 'Node', 'Bot', 'Code', 'Link', 'Spark', 'Drive', 'Shift', 'Wave']
  }
};

function generateShortNick() {
  const consonants = 'bcdfghjklmnpqrstvwxz';
  const vowels = 'aeiouy';
  let nick = '';
  const len = Math.random() > 0.5 ? 4 : 5;
  for (let i = 0; i < len; i++) {
    const pool = i % 2 === 0 ? consonants : vowels;
    let char = pool.charAt(Math.floor(Math.random() * pool.length));
    if (i === 0) char = char.toUpperCase();
    nick += char;
  }
  return nick;
}

document.getElementById('gen-nick').addEventListener('click', () => {
  const style = document.getElementById('nick-style').value;
  const addNum = document.getElementById('nick-num').checked;
  const addTag = document.getElementById('nick-tag').checked;

  let nick = '';
  if (style === 'short') {
    nick = generateShortNick();
  } else {
    const list = nickWords[style];
    const adj = list.adj[Math.floor(Math.random() * list.adj.length)];
    const noun = list.noun[Math.floor(Math.random() * list.noun.length)];
    nick = adj + noun;
  }

  if (addNum) {
    nick += Math.floor(10 + Math.random() * 89);
  }

  if (addTag) {
    const tags = ['xX_' + nick + '_Xx', '[PRO] ' + nick, nick + '_YT', '★' + nick + '★'];
    nick = tags[Math.floor(Math.random() * tags.length)];
  }

  document.getElementById('nick-result').value = nick;
});

// --- 3. ГЕНЕРАТОР ПОЧТЫ ---
const firstNames = ['alex', 'max', 'daniil', 'artem', 'ivan', 'dmitry', 'kirill', 'egor', 'nikita', 'roman', 'leo', 'mark'];
const lastNames = ['smirnov', 'ivanov', 'kuznetsov', 'popov', 'sokolov', 'lebedev', 'kozlov', 'novikov', 'morozov', 'volkov'];

document.getElementById('gen-email').addEventListener('click', () => {
  const domain = document.getElementById('email-domain').value;
  const useDots = document.getElementById('email-dots').checked;
  const useYear = document.getElementById('email-year').checked;

  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const sep = useDots ? (Math.random() > 0.5 ? '.' : '_') : '';
  
  let login = first + sep + last;
  if (useYear) {
    login += Math.floor(1998 + Math.random() * 14);
  } else {
    login += Math.floor(10 + Math.random() * 899);
  }

  document.getElementById('email-result').value = `${login}@${domain}`;
});

// Сразу генерируем значения и выставляем начальную высоту
document.getElementById('gen-pass').click();
document.getElementById('gen-nick').click();
document.getElementById('gen-email').click();
switchTab(0);

// --- БЛОКИРОВКА ПЛАВАЮЩИХ ВИДЖЕТОВ РАСШИРЕНИЙ БРАУЗЕРА ---
// --- ЖЁСТКАЯ БЛОКИРОВКА ЛЮБЫХ ЧУЖИХ ВИДЖЕТОВ И БОКОВЫХ КНОПОК ---
function hideExtensionWidgets() {
  const allowedIds = ['app-container', 'toast'];

  // 1. Удаляем любые посторонние корневые блоки в body и html
  [...document.body.children, ...document.documentElement.children].forEach(el => {
    if (
      el.tagName !== 'SCRIPT' &&
      el.tagName !== 'STYLE' &&
      el.tagName !== 'HEAD' &&
      el.tagName !== 'BODY' &&
      !allowedIds.includes(el.id)
    ) {
      el.remove();
    }
  });

  // 2. Ищем любые фиксированные элементы у правого края экрана (не наши) и удаляем
  document.querySelectorAll('*').forEach(el => {
    if (el.closest('#app-container') || el.id === 'toast') return;
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' && (style.right === '0px' || parseInt(style.right) < 30)) {
      el.remove();
    }
  });
}

hideExtensionWidgets();
setInterval(hideExtensionWidgets, 500);
const extObserver = new MutationObserver(hideExtensionWidgets);
extObserver.observe(document.documentElement, { childList: true, subtree: true });

