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
    // 手機版：角色更大，佔螢幕寬度的 1/2
    character.width = Math.min(window.innerWidth / 2, 400);
    character.height = character.width;
  } else {
    // 桌面版：角色佔螢幕寬度的 1/3
    character.width = getCharacterSize();
    character.height = character.width;
  }
  character.x = character.width / 2 + 50;
}

// 切換視圖模式
function toggleViewMode() {
  isMobileMode = !isMobileMode;

  // 保存到 localStorage
  localStorage.setItem('viewMode', isMobileMode ? 'mobile' : 'desktop');

  // 應用新模式
  applyViewMode();
  updateToggleButton();
}

// 更新切換按鈕的圖標和文字
function updateToggleButton() {
  const toggleButton = document.getElementById('viewModeToggle');
  if (!toggleButton) return; // 如果元素還不存在，直接返回

  const icon = toggleButton.querySelector('.toggle-icon');
  const text = toggleButton.querySelector('.toggle-text');

  if (isMobileMode) {
    icon.textContent = '🖥️';
    text.textContent = '桌面版';
  } else {
    icon.textContent = '📱';
    text.textContent = '手機版';
  }
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
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}
// 每秒更新時鐘顯示真實時間
setInterval(updateClock, 1000);
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
    // 手機版：月亮在左上角
    targetX = 70;
    targetY = 70;
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

// ===== 初始化視圖模式系統 =====
// 在所有物件定義完成後才初始化
document.addEventListener('DOMContentLoaded', function() {
  // 綁定切換按鈕事件
  const toggleButton = document.getElementById('viewModeToggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleViewMode);
  }

  // 初始化視圖模式
  initViewMode();
});
