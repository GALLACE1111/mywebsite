// ===== 原有功能：點我按鈕 =====
function sayHello() {
  alert("恭喜獲得一顆愛心！💕");
}

// ===== 裝置偵測 =====
let isMobileMode = false;

// 偵測是否為手機裝置
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
}

// 初始化視圖模式（自動偵測）
function initViewMode() {
  // 自動偵測裝置
  isMobileMode = isMobileDevice();

  // 應用模式
  applyViewMode();
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

// ===== Canvas 初始化 =====
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// ===== 全域變數 =====
let touchCount = 0;
const snowflakes = [];
const particles = [];
let characterImage = null;
let characterLoaded = false;

// ===== 背景音樂系統 =====
let bgMusic = null;
let isMusicPlaying = false;
let musicVolume = 0.3; // 預設音量30%

// ===== Boss 戰系統 =====
let isBossBattle = false; // 是否在 Boss 戰中
let bossHP = 1500; // Boss 血量
let bossMaxHP = 1500; // Boss 最大血量
let bossBattleStarted = false; // 是否已經開始過 Boss 戰（確認對話框只顯示一次）
let currentBGMStage = 0; // 當前 BGM 階段 (0=未開始, 1=第一階段, 2=第二階段, 3=勝利)
let isBerserkMode = false; // 是否進入狂暴模式（<50% 血量）
let lastDialogueTime = 0; // 上次顯示對話的時間
let currentDialogueIndex = 0; // 當前對話索引（順序顯示）

// Boss 對話池（按順序顯示）
const bossDialogues = [
  '我只是個鬧鐘',
  '你確定要繼續攻擊我嗎？',
  '我感覺好痛',
  '你的手不酸嗎？',
  '你弄得我好痛!',
  '我快發狂了!',
  '不要再打了~'
];

// Boss 移動系統
let bossMovement = {
  active: false,
  velocityX: 0,
  velocityY: 0,
  targetX: 0,
  targetY: 0,
  speed: 8, // 正常移動速度
  berserkSpeed: 15, // 狂暴模式速度
  changeDirectionInterval: null,
  normalInterval: 1000, // 正常改變方向間隔
  berserkInterval: 500 // 狂暴模式間隔
};

// 背景圖片
const backgroundImages = {
  night: null,
  lateNight: null
};
let backgroundImagesLoaded = {
  night: false,
  lateNight: false
};

// ===== 背景循環系統 =====
// 每60秒切換一次，循環2種背景圖片
const BACKGROUND_CYCLE_DURATION = 2 * 60 * 1000; // 2分鐘（毫秒）
const BACKGROUNDS_COUNT = 2; // 2種背景
const EACH_BACKGROUND_DURATION = BACKGROUND_CYCLE_DURATION / BACKGROUNDS_COUNT; // 每種背景60秒
const backgroundStartTime = Date.now(); // 背景循環開始時間

// 獲取當前應該顯示第幾個背景（0-1）
function getCurrentBackgroundIndex() {
  const elapsed = Date.now() - backgroundStartTime;
  const cyclePosition = elapsed % BACKGROUND_CYCLE_DURATION; // 在2分鐘循環中的位置
  const index = Math.floor(cyclePosition / EACH_BACKGROUND_DURATION); // 0, 1
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
// 每60秒切換一次，循環2種背景
// 順序：深夜 > 晚上
function getCurrentBackgroundImage() {
  const index = getCurrentBackgroundIndex();

  switch(index) {
    case 0:
      // 第1階段（0-60秒）：深夜
      return backgroundImagesLoaded.lateNight ? backgroundImages.lateNight : null;
    case 1:
      // 第2階段（60-120秒）：晚上
      return backgroundImagesLoaded.night ? backgroundImages.night : null;
    default:
      return null;
  }
}

// ===== 天空背景顏色系統（備用） =====
// 當背景圖片載入失敗時使用
// 順序：深夜 > 晚上
function getSkyColor() {
  const index = getCurrentBackgroundIndex();
  let hue, saturation, lightness;

  switch(index) {
    case 0:
      // 深夜 - 深紫藍色
      hue = 260;
      saturation = 55;
      lightness = 18;
      break;
    case 1:
      // 夜晚 - 深紫色
      hue = 280;
      saturation = 60;
      lightness = 30;
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

// ===== 發射粒子系統（追蹤系統） =====
class Particle {
  constructor(startX, startY, targetX, targetY) {
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.progress = 0;
    this.speed = 0.012; // 追蹤速度
    this.size = Math.random() * 8 + 12; // 星星更大
    this.hue = Math.random() * 60 + 30; // 金黃色調
    this.active = true;
    this.rotation = Math.random() * Math.PI * 2; // 隨機旋轉角度
    this.rotationSpeed = (Math.random() - 0.5) * 0.05; // 旋轉速度
    this.trackingStrength = 0.08; // 追蹤強度
    this.createdAt = Date.now(); // 記錄創建時間
  }

  // 更新目標位置（即時追蹤月亮）
  updateTarget() {
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
      // 桌面版：使用月亮的實際位置
      const moonElement = document.querySelector('.info-panel');
      if (moonElement) {
        const rect = moonElement.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      } else {
        targetX = window.innerWidth - 120;
        targetY = 120;
      }
    }
    this.targetX = targetX;
    this.targetY = targetY;
  }

  update() {
    // 即時更新目標位置（追蹤月亮）
    this.updateTarget();

    this.progress += this.speed;

    // 計算生存時間（最多5秒）
    const lifetime = (Date.now() - this.createdAt) / 1000;
    if (lifetime > 5 || this.progress >= 1) {
      this.active = false;
      incrementCounter();
      return;
    }

    // 計算到目標的距離
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果非常接近目標（50像素內），標記為完成
    if (distance < 50) {
      this.active = false;
      incrementCounter();
      return;
    }

    // 使用追蹤算法：混合貝茲曲線和直接追蹤
    const t = this.progress;
    const controlX = (this.startX + this.targetX) / 2;
    const controlY = Math.min(this.startY, this.targetY) - 200;

    // 貝茲曲線路徑
    const bezierX = Math.pow(1 - t, 2) * this.startX +
                    2 * (1 - t) * t * controlX +
                    Math.pow(t, 2) * this.targetX;

    const bezierY = Math.pow(1 - t, 2) * this.startY +
                    2 * (1 - t) * t * controlY +
                    Math.pow(t, 2) * this.targetY;

    // 直接追蹤向量
    const trackingX = this.x + dx * this.trackingStrength;
    const trackingY = this.y + dy * this.trackingStrength;

    // 混合兩種移動方式（後期更偏向追蹤）
    const trackingWeight = Math.min(t * 1.5, 1); // 隨時間增加追蹤權重
    this.x = bezierX * (1 - trackingWeight) + trackingX * trackingWeight;
    this.y = bezierY * (1 - trackingWeight) + trackingY * trackingWeight;

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

  // 發射 8 顆星星
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      particles.push(new Particle(character.x, character.y, targetX, targetY));
    }, i * 150);
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

  // 如果已經開始過 Boss 戰，直接發射星星
  if (bossBattleStarted) {
    shootStars();
  } else {
    // 第一次點擊，顯示確認對話框
    showBattleConfirmDialog();
  }
});

// ===== 戰鬥確認對話框 =====
function showBattleConfirmDialog() {
  // 創建對話框容器
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content">
      <div class="battle-icon">⚔️</div>
      <h2 class="battle-title">確定開始戰鬥嗎？</h2>
      <div class="battle-icons">
        <span class="icon-item">✨</span>
        <span class="icon-item">💫</span>
        <span class="icon-item">🌟</span>
        <span class="icon-item">⭐</span>
        <span class="icon-item">🎯</span>
      </div>
      <div class="battle-buttons">
        <button class="battle-btn battle-yes">
          <span class="btn-icon">⚡</span>
          <span>開始戰鬥！</span>
        </button>
        <button class="battle-btn battle-no">
          <span class="btn-icon">🛡️</span>
          <span>取消</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // 延遲添加顯示class以觸發動畫
  setTimeout(() => {
    dialog.classList.add('show');
  }, 10);

  // 綁定按鈕事件
  const yesBtn = dialog.querySelector('.battle-yes');
  const noBtn = dialog.querySelector('.battle-no');

  yesBtn.addEventListener('click', () => {
    closeBattleDialog(dialog);
    startBossBattle(); // 開始 Boss 戰
  });

  noBtn.addEventListener('click', () => {
    closeBattleDialog(dialog);
  });

  // 點擊背景關閉
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeBattleDialog(dialog);
    }
  });
}

function closeBattleDialog(dialog) {
  dialog.classList.remove('show');
  setTimeout(() => {
    dialog.remove();
  }, 300);
}

// ===== Boss 戰系統功能 =====
// 開始 Boss 戰
function startBossBattle() {
  bossBattleStarted = true;
  isBossBattle = true;
  bossHP = bossMaxHP;
  currentBGMStage = 1;

  // 顯示血條
  document.getElementById('boss-health-bar').style.display = 'block';
  updateBossHealthBar();

  // 播放第一階段戰鬥音樂
  switchBGM('music/PerituneMaterial_8bitRPG_Battle.mp3', true);

  // 月亮變成血月並開始快速亂跑
  startBossMovement();

  // 發射第一波星星
  shootStars();

  console.log('Boss 戰開始！');
}

// 更新 Boss 血條
function updateBossHealthBar() {
  const hpPercent = (bossHP / bossMaxHP) * 100;
  const fillElement = document.getElementById('boss-health-fill');
  const currentElement = document.getElementById('boss-hp-current');

  fillElement.style.width = hpPercent + '%';
  currentElement.textContent = bossHP;

  // 根據血量改變顏色
  if (hpPercent > 70) {
    fillElement.style.background = 'linear-gradient(90deg, #f39c12, #e74c3c)';
  } else if (hpPercent > 40) {
    fillElement.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
  } else {
    fillElement.style.background = 'linear-gradient(90deg, #c0392b, #8b0000)';
  }

  // Boss 對話系統（隨機觸發）
  checkBossDialogue();

  // 血量低於 70% 時切換第二階段音樂（血月模式）
  if (hpPercent <= 70 && currentBGMStage === 1) {
    currentBGMStage = 2;
    switchBGM('music/fast-chiptune-instrumental-2-minute-boss-fight-254040.mp3', true);
    console.log('進入血月模式！第二階段音樂啟動！');
  }

  // 血量低於 50% 時進入狂暴模式（移動速度加快）
  if (hpPercent <= 50 && !isBerserkMode) {
    activateBerserkMode();
    console.log('狂暴模式啟動！移動速度加快！');
  }

  // Boss 被擊敗
  if (bossHP <= 0) {
    defeatBoss();
  }
}

// Boss 對話系統（按順序顯示）
function checkBossDialogue() {
  const now = Date.now();

  // 限制對話顯示頻率：至少間隔 2 秒
  if (now - lastDialogueTime < 2000) {
    return;
  }

  // 按順序顯示對話
  const message = bossDialogues[currentDialogueIndex];
  showBossMessage(message);

  lastDialogueTime = now;

  // 移動到下一句對話，循環顯示
  currentDialogueIndex = (currentDialogueIndex + 1) % bossDialogues.length;
}

// 顯示 Boss 訊息（跟隨月亮移動）
function showBossMessage(message) {
  // 移除舊訊息
  const oldMessage = document.querySelector('.boss-message');
  if (oldMessage) {
    oldMessage.remove();
  }

  // 創建新訊息
  const messageDiv = document.createElement('div');
  messageDiv.className = 'boss-message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  // 淡入（訊息框已經透過 CSS 固定在螢幕中央）
  setTimeout(() => {
    messageDiv.classList.add('show');
  }, 10);

  // 3秒後淡出並移除
  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => {
      messageDiv.remove();
    }, 500);
  }, 3000);
}

// 啟動狂暴模式
function activateBerserkMode() {
  if (isBerserkMode) return;
  isBerserkMode = true;

  // 清除原有的移動間隔
  if (bossMovement.changeDirectionInterval) {
    clearInterval(bossMovement.changeDirectionInterval);
  }

  // 使用更快的速度和更短的間隔
  bossMovement.changeDirectionInterval = setInterval(() => {
    if (!bossMovement.active) return;

    const moonElement = document.querySelector('.info-panel');
    if (!moonElement) return;

    const moonSize = isMobileMode ? 100 : 220;
    const maxX = window.innerWidth - moonSize;
    const maxY = window.innerHeight - moonSize;

    // 狂暴模式：更激進的隨機移動
    bossMovement.targetX = Math.random() * maxX;
    bossMovement.targetY = Math.random() * maxY;

  }, bossMovement.berserkInterval); // 500ms 間隔

  console.log('狂暴模式已啟動！');
}

// Boss 移動系統
function startBossMovement() {
  bossMovement.active = true;

  // 禁用玩家拖動
  cleanupMoonDrag();

  // 快速隨機移動
  bossMovement.changeDirectionInterval = setInterval(() => {
    if (!bossMovement.active) return;

    // 隨機目標位置
    const moonElement = document.querySelector('.info-panel');
    if (!moonElement) return;

    const moonSize = isMobileMode ? 100 : 220;
    const maxX = window.innerWidth - moonSize;
    const maxY = window.innerHeight - moonSize;

    bossMovement.targetX = Math.random() * maxX;
    bossMovement.targetY = Math.random() * maxY;

  }, 1000); // 每秒改變方向

  // 動畫循環
  animateBossMovement();
}

function animateBossMovement() {
  if (!bossMovement.active) return;

  const moonElement = document.querySelector('.info-panel');
  if (!moonElement) return;

  const rect = moonElement.getBoundingClientRect();
  const currentX = rect.left;
  const currentY = rect.top;

  // 計算移動方向
  const dx = bossMovement.targetX - currentX;
  const dy = bossMovement.targetY - currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 5) {
    // 根據模式選擇速度
    const currentSpeed = isBerserkMode ? bossMovement.berserkSpeed : bossMovement.speed;
    const moveX = (dx / distance) * currentSpeed;
    const moveY = (dy / distance) * currentSpeed;

    moonElement.style.left = (currentX + moveX) + 'px';
    moonElement.style.top = (currentY + moveY) + 'px';
  }

  // 血月視覺效果
  updateBloodMoonEffect(moonElement);

  requestAnimationFrame(animateBossMovement);
}

// 血月視覺效果
function updateBloodMoonEffect(moonElement) {
  const hpPercent = (bossHP / bossMaxHP) * 100;

  // 1. 顏色漸變（金黃 → 深紅）
  const hue = 45 - (45 - 0) * (1 - hpPercent / 100); // 45度(金黃) → 0度(紅)
  const saturation = 50 + 50 * (1 - hpPercent / 100); // 飽和度增加
  const lightness = 80 - 30 * (1 - hpPercent / 100); // 亮度降低

  // 2. 震動效果（血量越低越劇烈）
  const shakeIntensity = (1 - hpPercent / 100) * 5;
  const shakeX = (Math.random() - 0.5) * shakeIntensity;
  const shakeY = (Math.random() - 0.5) * shakeIntensity;

  // 使用 setProperty 確保覆蓋原有樣式
  moonElement.style.setProperty('background', `radial-gradient(circle at 35% 35%,
    hsl(${hue}, ${saturation}%, ${lightness}%) 0%,
    hsl(${hue}, ${saturation - 10}%, ${lightness - 10}%) 30%,
    hsl(${hue}, ${saturation - 20}%, ${lightness - 20}%) 60%,
    hsl(${hue}, ${saturation - 30}%, ${lightness - 30}%) 100%)`, 'important');

  moonElement.style.setProperty('transform', `translate(${shakeX}px, ${shakeY}px)`, 'important');

  // 3. 裂痕效果（使用 box-shadow 模擬）
  const crackCount = Math.floor((1 - hpPercent / 100) * 5);
  let shadows = '0 0 30px rgba(139, 0, 0, ' + (1 - hpPercent / 100) + ')';

  for (let i = 0; i < crackCount; i++) {
    shadows += `, inset ${Math.random() * 40 - 20}px ${Math.random() * 40 - 20}px 10px rgba(0, 0, 0, 0.5)`;
  }

  moonElement.style.setProperty('box-shadow', shadows, 'important');
}

// 停止 Boss 移動
function stopBossMovement() {
  bossMovement.active = false;
  if (bossMovement.changeDirectionInterval) {
    clearInterval(bossMovement.changeDirectionInterval);
  }
}

// 擊敗 Boss
function defeatBoss() {
  isBossBattle = false;
  isBerserkMode = false;
  bossBattleStarted = false; // 重置，允許再次彈出確認對話框
  bossDialogueStage = 0; // 重置對話階段
  currentBGMStage = 0; // 重置音樂階段
  stopBossMovement();

  // 切換勝利音樂
  switchBGM('music/sleepy-rain-116521.mp3', true);

  // 隱藏血條
  document.getElementById('boss-health-bar').style.display = 'none';

  // 恢復月亮正常樣式和位置
  const moonElement = document.querySelector('.info-panel');
  if (moonElement) {
    // 清除所有 Boss 戰期間添加的樣式
    moonElement.style.removeProperty('background');
    moonElement.style.removeProperty('transform');
    moonElement.style.removeProperty('box-shadow');

    // 恢復月亮初始位置
    if (isMobileMode) {
      moonElement.style.left = '15px';
      moonElement.style.top = '15px';
    } else {
      moonElement.style.removeProperty('left');
      moonElement.style.removeProperty('top');
    }
  }

  // 重新啟用月亮拖動功能
  initMoonDrag();

  // 顯示勝利對話框
  setTimeout(() => {
    showVictoryDialog();
  }, 500);

  console.log('Boss 被擊敗！進入放鬆模式');
}

// 勝利對話框
function showVictoryDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog victory-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content victory-content">
      <div class="victory-icon">🎉</div>
      <h2 class="battle-title">您已成功擊敗 Boss！</h2>
      <div class="victory-icons">
        <span class="icon-item">🌈</span>
        <span class="icon-item">✨</span>
        <span class="icon-item">🎊</span>
        <span class="icon-item">💖</span>
        <span class="icon-item">🌸</span>
      </div>
      <p class="victory-message">請進入放鬆階段，享受寧靜時光～</p>
      <div class="battle-buttons">
        <button class="battle-btn battle-rechallenge">
          <span class="btn-icon">🌙</span>
          <span>重新挑戰</span>
        </button>
        <button class="battle-btn battle-relax">
          <span class="btn-icon">🛋️</span>
          <span>繼續放鬆</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  setTimeout(() => {
    dialog.classList.add('show');
  }, 10);

  // 綁定按鈕事件
  const rechallengeBtn = dialog.querySelector('.battle-rechallenge');
  const relaxBtn = dialog.querySelector('.battle-relax');

  rechallengeBtn.addEventListener('click', () => {
    closeBattleDialog(dialog);
    startBossBattle(); // 重新開始 Boss 戰
  });

  relaxBtn.addEventListener('click', () => {
    closeBattleDialog(dialog);
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeBattleDialog(dialog);
    }
  });
}

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

  // Boss 戰中扣血
  if (isBossBattle && bossHP > 0) {
    bossHP--;
    updateBossHealthBar();
  }
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

  const moon = document.querySelector('.info-panel');
  if (!moon) {
    console.log('月亮元素未找到');
    return;
  }

  moonPhysics.element = moon;

  // 根據模式設定半徑和初始位置
  if (isMobileMode) {
    // 手機版：100x100，左上角
    moonPhysics.radius = 50;
    moonPhysics.x = 15;
    moonPhysics.y = 15;
  } else {
    // 網頁版：220x220，右上角
    moonPhysics.radius = 110;
    moonPhysics.x = window.innerWidth - 245; // 245 = 220 + 25
    moonPhysics.y = 25;
  }

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

  // 滑鼠事件
  moon.addEventListener('mousedown', moonPhysics.boundHandlers.mouseDown);
  document.addEventListener('mousemove', moonPhysics.boundHandlers.mouseMove);
  document.addEventListener('mouseup', moonPhysics.boundHandlers.mouseEnd);

  moonPhysics.initialized = true;
  console.log('月亮拖動系統已初始化 - 模式:', isMobileMode ? '手機版' : '網頁版');
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
  if (!moonPhysics.element) return;

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

// ===== 背景音樂載入與控制 =====
function initBackgroundMusic() {
  bgMusic = new Audio();
  bgMusic.src = 'music/sleepy-rain-116521.mp3'; // 預設放鬆音樂
  bgMusic.loop = true;
  bgMusic.volume = musicVolume;

  bgMusic.addEventListener('canplaythrough', () => {
    console.log('背景音樂已載入');
  });

  bgMusic.addEventListener('error', () => {
    console.log('背景音樂載入失敗');
  });

  // 自動播放放鬆音樂
  playMusic();
}

// 切換 BGM
function switchBGM(musicFile, loop = true) {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.src = musicFile;
    bgMusic.loop = loop;
    bgMusic.volume = musicVolume;
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      console.log('切換音樂:', musicFile);
    }).catch(err => {
      console.log('音樂播放失敗:', err);
    });
  }
}

// 播放音樂
function playMusic() {
  if (bgMusic && !isMusicPlaying) {
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      console.log('背景音樂開始播放');
      updateMusicButton();
    }).catch(err => {
      console.log('音樂播放失敗:', err);
    });
  }
}

// 暫停音樂
function pauseMusic() {
  if (bgMusic && isMusicPlaying) {
    bgMusic.pause();
    isMusicPlaying = false;
    console.log('背景音樂已暫停');
    updateMusicButton();
  }
}

// 切換音樂播放狀態
function toggleMusic() {
  if (isMusicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

// 更新音樂按鈕狀態
function updateMusicButton() {
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn) {
    musicBtn.textContent = isMusicPlaying ? '🔊 暫停音樂' : '🔇 播放音樂';
  }
}

// ===== 初始化視圖模式系統 =====
// 在所有物件定義完成後才初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 載入完成');

  // 初始化視圖模式（自動偵測）
  initViewMode();

  // 初始化月亮拖動（僅手機版）- 延遲確保元素完全渲染
  setTimeout(() => {
    console.log('準備初始化月亮拖動，當前模式:', isMobileMode ? '手機版' : '桌面版');
    initMoonDrag();
  }, 300);

  // 初始化背景音樂
  initBackgroundMusic();

  // 綁定音樂按鈕事件
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }
});
