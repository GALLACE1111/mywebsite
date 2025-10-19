// ===== 原有功能：點我按鈕 =====
function sayHello() {
  alert("恭喜獲得一顆愛心！💕");
}

// ===== 裝置偵測與模式切換系統 =====
let isMobileMode = false;

// 偵測是否為手機裝置
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
}

// 初始化視圖模式
function initViewMode() {
  // 檢查 localStorage 是否有保存的設定
  const savedMode = localStorage.getItem('viewMode');

  if (savedMode) {
    // 使用保存的設定
    isMobileMode = (savedMode === 'mobile');
  } else {
    // 自動偵測裝置
    isMobileMode = isMobileDevice();
  }

  // 應用模式
  applyViewMode();
  updateToggleButton();
}

// 應用視圖模式
function applyViewMode() {
  if (isMobileMode) {
    document.body.classList.add('mobile-mode');
  } else {
    document.body.classList.remove('mobile-mode');
  }

  // 更新角色大小
  updateCharacterSize();

  // 重新初始化雪花（根據模式調整數量）
  if (typeof initSnowflakes === 'function') {
    initSnowflakes();
  }
}

// 更新角色大小（根據模式）
function updateCharacterSize() {
  // 確保 character 物件已定義
  if (typeof character === 'undefined') return;

  if (isMobileMode) {
    // 手機版：角色縮小，避免和按鈕重疊
    character.width = Math.min(window.innerWidth / 3.5, 250);
    character.height = character.width;
    // 手機版：角色放在左下角最邊邊
    character.x = character.width / 2 + 10;
  } else {
    // 桌面版：角色佔螢幕寬度的 1/3
    character.width = getCharacterSize();
    character.height = character.width;
    character.x = character.width / 2 + 50;
  }
}

// 切換視圖模式
function toggleViewMode() {
  isMobileMode = !isMobileMode;

  console.log('切換模式到:', isMobileMode ? '手機版' : '桌面版');

  // 保存到 localStorage
  localStorage.setItem('viewMode', isMobileMode ? 'mobile' : 'desktop');

  // 應用新模式
  applyViewMode();
  updateToggleButton();

  // 重新初始化月亮拖動（先清理再初始化）
  setTimeout(() => {
    console.log('重新初始化月亮拖動');
    cleanupMoonDrag();
    initMoonDrag();
  }, 200);
}

// 更新切換按鈕（圖標固定，不需要更新）
function updateToggleButton() {
  // 按鈕圖標固定為 ⚙，不需要動態更新
}

// ===== Canvas 初始化 =====
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// ===== 全域變數 =====
let touchCount = 0;
const snowflakes = [];
const particles = [];
let characterImage = null;
let characterLoaded = false;

// 背景圖片
const backgroundImages = {
  afternoon: null,
  night: null,
  lateNight: null
};
let backgroundImagesLoaded = {
  afternoon: false,
  night: false,
  lateNight: false
};

// ===== 背景循環系統 =====
// 5分鐘內循環3種背景圖片
// 每種背景顯示時間 = 5分鐘 / 3 = 100秒
const BACKGROUND_CYCLE_DURATION = 5 * 60 * 1000; // 5分鐘（毫秒）
const BACKGROUNDS_COUNT = 3; // 3種背景
const EACH_BACKGROUND_DURATION = BACKGROUND_CYCLE_DURATION / BACKGROUNDS_COUNT; // 每種背景100秒
const backgroundStartTime = Date.now(); // 背景循環開始時間

// 獲取當前應該顯示第幾個背景（0-2）
function getCurrentBackgroundIndex() {
  const elapsed = Date.now() - backgroundStartTime;
  const cyclePosition = elapsed % BACKGROUND_CYCLE_DURATION; // 在5分鐘循環中的位置
  const index = Math.floor(cyclePosition / EACH_BACKGROUND_DURATION); // 0, 1, 2
  return index;
}

// 角色位置（左下角，腳平貼底部）
// 計算角色寬度為視窗寬度的 1/3
const getCharacterSize = () => {
  const baseWidth = window.innerWidth / 3;
  return Math.min(baseWidth, 500); // 最大不超過 500px
};

const character = {
  x: getCharacterSize() / 2 + 50, // 給點邊距
  y: window.innerHeight - 80,
  width: getCharacterSize(),
  height: getCharacterSize()
};

// 設定 Canvas 尺寸為視窗大小
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 視窗改變時更新角色大小（根據當前模式）
  updateCharacterSize();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== 載入背景圖片 =====
function loadBackgroundImages() {
  // 載入下午/傍晚背景
  backgroundImages.afternoon = new Image();
  backgroundImages.afternoon.src = 'images/1219.png';
  backgroundImages.afternoon.onload = () => {
    backgroundImagesLoaded.afternoon = true;
    console.log('下午/傍晚背景載入成功！');
  };
  backgroundImages.afternoon.onerror = () => {
    console.log('下午/傍晚背景載入失敗: images/1219.png');
  };

  // 載入夜晚背景
  backgroundImages.night = new Image();
  backgroundImages.night.src = 'images/1922.png';
  backgroundImages.night.onload = () => {
    backgroundImagesLoaded.night = true;
    console.log('夜晚背景載入成功！');
  };
  backgroundImages.night.onerror = () => {
    console.log('夜晚背景載入失敗: images/1922.png');
  };

  // 載入深夜背景
  backgroundImages.lateNight = new Image();
  backgroundImages.lateNight.src = 'images/2206.png';
  backgroundImages.lateNight.onload = () => {
    backgroundImagesLoaded.lateNight = true;
    console.log('深夜背景載入成功！');
  };
  backgroundImages.lateNight.onerror = () => {
    console.log('深夜背景載入失敗: images/2206.png');
  };
}
loadBackgroundImages();

// ===== 載入角色圖片 =====
function loadCharacter() {
  characterImage = new Image();
  // 請確認您的圖片路徑，可能是以下之一：
  // 'images/character.png'
  // 'images/character.jpg'
  // 'images/character.svg'
  characterImage.src = 'images/character.png'; // 根據您的圖片格式調整

  characterImage.onload = () => {
    characterLoaded = true;
    console.log('角色圖片載入成功！');
  };

  characterImage.onerror = () => {
    console.log('角色圖片載入失敗，將使用簡單圖形代替');
    console.log('請確認圖片是否在: images/character.png');
  };
}
loadCharacter();

// ===== 時鐘功能 =====
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
// 每分鐘更新時鐘（不需要每秒更新了）
setInterval(updateClock, 60000); // 60秒 = 1分鐘
updateClock();

// ===== 獲取當前背景圖片 =====
// 每100秒切換一次，5分鐘循環3種背景
function getCurrentBackgroundImage() {
  const index = getCurrentBackgroundIndex();

  switch(index) {
    case 0:
      // 第1階段（0-100秒）：下午/傍晚
      return backgroundImagesLoaded.afternoon ? backgroundImages.afternoon : null;
    case 1:
      // 第2階段（100-200秒）：夜晚
      return backgroundImagesLoaded.night ? backgroundImages.night : null;
    case 2:
      // 第3階段（200-300秒）：深夜
      return backgroundImagesLoaded.lateNight ? backgroundImages.lateNight : null;
    default:
      return null;
  }
}

// ===== 天空背景顏色系統（備用） =====
// 當背景圖片載入失敗時使用
function getSkyColor() {
  const index = getCurrentBackgroundIndex();
  let hue, saturation, lightness;

  switch(index) {
    case 0:
      // 下午/傍晚 - 淡粉紫色
      hue = 320;
      saturation = 50;
      lightness = 80;
      break;
    case 1:
      // 夜晚 - 深紫色
      hue = 280;
      saturation = 60;
      lightness = 30;
      break;
    case 2:
      // 深夜 - 深紫藍色
      hue = 260;
      saturation = 55;
      lightness = 18;
      break;
    default:
      hue = 200;
      saturation = 50;
      lightness = 50;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function drawSky() {
  // 獲取當前背景圖片
  const bgImage = getCurrentBackgroundImage();

  if (bgImage) {
    // 繪製背景圖片（覆蓋整個 Canvas）
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    // 如果圖片未載入，使用純色背景
    const skyColor = getSkyColor();
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, skyColor);
    gradient.addColorStop(1, adjustBrightness(skyColor, -15));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// 調整顏色亮度
function adjustBrightness(hsl, adjustment) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const h = match[1];
    const s = match[2];
    const l = Math.max(0, Math.min(100, parseInt(match[3]) + adjustment));
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return hsl;
}

// ===== 雪花粒子系統 =====
class Snowflake {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.radius = Math.random() * 3 + 1;
    this.speed = Math.random() * 1 + 0.5;
    this.drift = Math.random() * 0.5 - 0.25;
  }

  update() {
    this.y += this.speed;
    this.x += this.drift;

    // 重置到頂部
    if (this.y > canvas.height) {
      this.y = -10;
      this.x = Math.random() * canvas.width;
    }

    // 邊界檢查
    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
  }

  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 初始化雪花（手機版減少數量以提升性能）
function initSnowflakes(count) {
  // 清空現有雪花
  snowflakes.length = 0;

  // 根據模式決定數量
  if (!count) {
    count = isMobileMode ? 50 : 100; // 手機版50個，桌面版100個
  }

  for (let i = 0; i < count; i++) {
    snowflakes.push(new Snowflake());
  }
}
initSnowflakes();

// ===== 發射粒子系統 =====
class Particle {
  constructor(startX, startY, targetX, targetY) {
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.progress = 0;
    this.speed = 0.008; // 變慢：從 0.02 改為 0.008
    this.size = Math.random() * 8 + 12; // 星星更大
    this.hue = Math.random() * 60 + 30; // 金黃色調
    this.active = true;
    this.rotation = Math.random() * Math.PI * 2; // 隨機旋轉角度
    this.rotationSpeed = (Math.random() - 0.5) * 0.05; // 旋轉也變慢
  }

  update() {
    this.progress += this.speed;

    if (this.progress >= 1) {
      this.active = false;
      incrementCounter();
      return;
    }

    // 使用貝茲曲線路徑
    const t = this.progress;
    const controlX = (this.startX + this.targetX) / 2;
    const controlY = Math.min(this.startY, this.targetY) - 200;

    this.x = Math.pow(1 - t, 2) * this.startX +
             2 * (1 - t) * t * controlX +
             Math.pow(t, 2) * this.targetX;

    this.y = Math.pow(1 - t, 2) * this.startY +
             2 * (1 - t) * t * controlY +
             Math.pow(t, 2) * this.targetY;

    // 更新旋轉
    this.rotation += this.rotationSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 繪製五角星
    ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // 添加白色中心
    ctx.fillStyle = `hsl(${this.hue}, 100%, 85%)`;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ===== 繪製角色 =====
function drawCharacter() {
  // 更新角色 Y 位置（響應視窗大小，腳平貼底部）
  character.y = canvas.height - character.height / 2;

  if (characterLoaded && characterImage) {
    ctx.drawImage(
      characterImage,
      character.x - character.width / 2,
      character.y - character.height / 2,
      character.width,
      character.height
    );
  } else {
    // 如果圖片未載入，繪製簡單的替代圖形（根據角色大小）
    const radius = character.width / 3;
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(character.x, character.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 繪製眼睛（根據角色大小）
    const eyeDistance = radius / 2;
    const eyeSize = radius / 6;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(character.x - eyeDistance, character.y - radius / 6, eyeSize, 0, Math.PI * 2);
    ctx.arc(character.x + eyeDistance, character.y - radius / 6, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(character.x - eyeDistance, character.y - radius / 6, eyeSize / 2.5, 0, Math.PI * 2);
    ctx.arc(character.x + eyeDistance, character.y - radius / 6, eyeSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== 發射星星函數 =====
function shootStars() {
  // 根據模式決定目標位置
  let targetX, targetY;
  if (isMobileMode) {
    // 手機版：使用月亮的實際位置
    if (moonPhysics.element) {
      const rect = moonPhysics.element.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    } else {
      targetX = 70;
      targetY = 70;
    }
  } else {
    // 桌面版：月亮在右上角
    targetX = window.innerWidth - 120;
    targetY = 120;
  }

  // 發射 4 顆星星
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      particles.push(new Particle(character.x, character.y, targetX, targetY));
    }, i * 300);
  }
}

// ===== 點擊事件處理 =====
// 由於 Canvas 設定為 pointer-events: none，我們需要在 body 上監聽點擊
document.body.addEventListener('click', (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  // 檢查是否點擊角色附近
  const distance = Math.sqrt(
    Math.pow(clickX - character.x, 2) + Math.pow(clickY - character.y, 2)
  );

  if (distance < character.width / 2 + 50) { // 根據角色大小調整點擊範圍
    shootStars();
  }
});

// ===== 星星發射按鈕點擊事件 =====
document.querySelector('.hint-text').addEventListener('click', (e) => {
  e.stopPropagation(); // 防止事件冒泡
  shootStars();
});

// ===== 增加計數器 =====
function incrementCounter() {
  touchCount++;
  const counterElement = document.getElementById('counter');
  counterElement.textContent = touchCount;

  // 添加脈衝動畫
  counterElement.classList.remove('pulse');
  setTimeout(() => {
    counterElement.classList.add('pulse');
  }, 10);
  setTimeout(() => {
    counterElement.classList.remove('pulse');
  }, 310);
}

// ===== 主動畫循環 =====
function animate() {
  // 繪製天空背景
  drawSky();

  // 更新和繪製雪花
  snowflakes.forEach(snowflake => {
    snowflake.update();
    snowflake.draw();
  });

  // 繪製角色
  drawCharacter();

  // 更新和繪製粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].active) {
      particles[i].draw();
    } else {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

// 啟動動畫
animate();

// ===== 月亮物理拖動系統（僅手機版） =====
let moonPhysics = {
  isDragging: false,
  element: null,
  offsetX: 0,
  offsetY: 0,
  x: 15,
  y: 15,
  velocityX: 0,
  velocityY: 0,
  isAnimating: false,
  radius: 50, // 100px / 2
  damping: 0.95, // 阻尼係數
  bounce: 0.7,   // 反彈係數
  initialized: false,
  boundHandlers: null
};

function cleanupMoonDrag() {
  if (!moonPhysics.element || !moonPhysics.boundHandlers) return;

  const moon = moonPhysics.element;
  const handlers = moonPhysics.boundHandlers;

  // 移除所有事件監聽器
  moon.removeEventListener('touchstart', handlers.touchStart);
  document.removeEventListener('touchmove', handlers.touchMove);
  document.removeEventListener('touchend', handlers.touchEnd);
  moon.removeEventListener('mousedown', handlers.mouseDown);
  document.removeEventListener('mousemove', handlers.mouseMove);
  document.removeEventListener('mouseup', handlers.mouseEnd);

  moonPhysics.initialized = false;
  moonPhysics.boundHandlers = null;
}

function initMoonDrag() {
  // 先清除舊的事件監聽器
  cleanupMoonDrag();

  if (!isMobileMode) return;

  const moon = document.querySelector('.info-panel');
  if (!moon) {
    console.log('月亮元素未找到');
    return;
  }

  moonPhysics.element = moon;
  moonPhysics.radius = 50; // 100px / 2

  // 創建綁定的處理函數（避免重複綁定）
  moonPhysics.boundHandlers = {
    touchStart: (e) => handleMoonTouchStart(e),
    touchMove: (e) => handleMoonTouchMove(e),
    touchEnd: (e) => handleMoonTouchEnd(e),
    mouseDown: (e) => handleMoonMouseDown(e),
    mouseMove: (e) => handleMoonMouseMove(e),
    mouseEnd: (e) => handleMoonMouseEnd(e)
  };

  // 觸控事件
  moon.addEventListener('touchstart', moonPhysics.boundHandlers.touchStart, { passive: false });
  document.addEventListener('touchmove', moonPhysics.boundHandlers.touchMove, { passive: false });
  document.addEventListener('touchend', moonPhysics.boundHandlers.touchEnd);

  // 滑鼠事件（桌面測試用）
  moon.addEventListener('mousedown', moonPhysics.boundHandlers.mouseDown);
  document.addEventListener('mousemove', moonPhysics.boundHandlers.mouseMove);
  document.addEventListener('mouseup', moonPhysics.boundHandlers.mouseEnd);

  moonPhysics.initialized = true;
  console.log('月亮拖動系統已初始化');
}

function handleMoonTouchStart(e) {
  e.preventDefault();
  e.stopPropagation();
  const touch = e.touches[0];
  console.log('觸控開始:', touch.clientX, touch.clientY);
  startMoonDrag(touch.clientX, touch.clientY);
}

function handleMoonMouseDown(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('滑鼠點擊開始:', e.clientX, e.clientY);
  startMoonDrag(e.clientX, e.clientY);
}

function startMoonDrag(clientX, clientY) {
  if (!isMobileMode || !moonPhysics.element) return;

  moonPhysics.isDragging = true;
  moonPhysics.isAnimating = false;
  moonPhysics.element.classList.add('dragging');

  const rect = moonPhysics.element.getBoundingClientRect();
  moonPhysics.offsetX = clientX - rect.left;
  moonPhysics.offsetY = clientY - rect.top;
  moonPhysics.x = rect.left;
  moonPhysics.y = rect.top;
  moonPhysics.velocityX = 0;
  moonPhysics.velocityY = 0;

  console.log('開始拖動月亮', { x: moonPhysics.x, y: moonPhysics.y });
}

function handleMoonTouchMove(e) {
  if (!moonPhysics.isDragging) return;
  e.preventDefault();
  e.stopPropagation();
  const touch = e.touches[0];
  moveMoon(touch.clientX, touch.clientY);
}

function handleMoonMouseMove(e) {
  if (!moonPhysics.isDragging) return;
  moveMoon(e.clientX, e.clientY);
}

function moveMoon(clientX, clientY) {
  const newX = clientX - moonPhysics.offsetX;
  const newY = clientY - moonPhysics.offsetY;

  // 計算速度
  moonPhysics.velocityX = newX - moonPhysics.x;
  moonPhysics.velocityY = newY - moonPhysics.y;

  moonPhysics.x = newX;
  moonPhysics.y = newY;

  // 直接更新位置（使用 setProperty 確保覆蓋）
  moonPhysics.element.style.setProperty('left', moonPhysics.x + 'px', 'important');
  moonPhysics.element.style.setProperty('top', moonPhysics.y + 'px', 'important');
}

function handleMoonTouchEnd(e) {
  endMoonDrag();
}

function handleMoonMouseEnd(e) {
  endMoonDrag();
}

function endMoonDrag() {
  if (!moonPhysics.isDragging) return;

  moonPhysics.isDragging = false;
  moonPhysics.element.classList.remove('dragging');

  // 如果有速度，開始物理動畫
  const speed = Math.sqrt(
    moonPhysics.velocityX * moonPhysics.velocityX +
    moonPhysics.velocityY * moonPhysics.velocityY
  );

  if (speed > 2) {
    // 速度夠快，啟動物理動畫
    moonPhysics.isAnimating = true;
    animateMoonPhysics();
  } else {
    // 速度太慢，固定在當前位置
    fixMoonPosition();
  }
}

function animateMoonPhysics() {
  if (!moonPhysics.isAnimating) return;

  // 應用速度
  moonPhysics.x += moonPhysics.velocityX;
  moonPhysics.y += moonPhysics.velocityY;

  // 應用阻尼
  moonPhysics.velocityX *= moonPhysics.damping;
  moonPhysics.velocityY *= moonPhysics.damping;

  // 邊界檢測與反彈
  const maxX = window.innerWidth - moonPhysics.radius * 2;
  const maxY = window.innerHeight - moonPhysics.radius * 2;

  // 左右邊界
  if (moonPhysics.x < 0) {
    moonPhysics.x = 0;
    moonPhysics.velocityX = -moonPhysics.velocityX * moonPhysics.bounce;
  } else if (moonPhysics.x > maxX) {
    moonPhysics.x = maxX;
    moonPhysics.velocityX = -moonPhysics.velocityX * moonPhysics.bounce;
  }

  // 上下邊界
  if (moonPhysics.y < 0) {
    moonPhysics.y = 0;
    moonPhysics.velocityY = -moonPhysics.velocityY * moonPhysics.bounce;
  } else if (moonPhysics.y > maxY) {
    moonPhysics.y = maxY;
    moonPhysics.velocityY = -moonPhysics.velocityY * moonPhysics.bounce;
  }

  // 更新位置（使用 setProperty 確保覆蓋）
  moonPhysics.element.style.setProperty('left', moonPhysics.x + 'px', 'important');
  moonPhysics.element.style.setProperty('top', moonPhysics.y + 'px', 'important');

  // 檢查是否停止
  const speed = Math.sqrt(
    moonPhysics.velocityX * moonPhysics.velocityX +
    moonPhysics.velocityY * moonPhysics.velocityY
  );

  if (speed < 0.5) {
    // 速度很慢，停止動畫並固定
    moonPhysics.isAnimating = false;
    fixMoonPosition();
  } else {
    // 繼續動畫
    requestAnimationFrame(animateMoonPhysics);
  }
}

function fixMoonPosition() {
  // 固定月亮在當前位置
  moonPhysics.velocityX = 0;
  moonPhysics.velocityY = 0;
}

// ===== 初始化視圖模式系統 =====
// 在所有物件定義完成後才初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 載入完成');

  // 綁定切換按鈕事件
  const toggleButton = document.getElementById('viewModeToggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleViewMode);
    console.log('切換按鈕已綁定');
  }

  // 初始化視圖模式
  initViewMode();

  // 初始化月亮拖動（僅手機版）- 延遲確保元素完全渲染
  setTimeout(() => {
    console.log('準備初始化月亮拖動，當前模式:', isMobileMode ? '手機版' : '桌面版');
    initMoonDrag();
  }, 300);
});
