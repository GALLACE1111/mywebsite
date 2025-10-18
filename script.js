// ===== 原有功能：點我按鈕 =====
function sayHello() {
  alert("恭喜獲得一顆愛心！💕");
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

  // 視窗改變時更新角色大小
  character.width = getCharacterSize();
  character.height = getCharacterSize();
  character.x = character.width / 2 + 50;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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
// 每秒更新時鐘
setInterval(updateClock, 1000);
updateClock();

// ===== 天空背景系統 =====
function getSkyColor() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInHours = hours + minutes / 60;

  let hue, saturation, lightness;

  if (timeInHours >= 6 && timeInHours < 12) {
    // 早晨 6:00-12:00 - 淺藍色
    hue = 200;
    saturation = 70;
    lightness = 60 + (timeInHours - 6) * 2;
  } else if (timeInHours >= 12 && timeInHours < 17) {
    // 下午 12:00-17:00 - 明亮藍色
    hue = 210;
    saturation = 75;
    lightness = 70;
  } else if (timeInHours >= 17 && timeInHours < 19) {
    // 傍晚 17:00-19:00 - 橙紅色
    const progress = (timeInHours - 17) / 2;
    hue = 200 - progress * 180; // 200 -> 20
    saturation = 70 + progress * 20;
    lightness = 70 - progress * 30;
  } else if (timeInHours >= 19 && timeInHours < 22) {
    // 夜晚 19:00-22:00 - 深藍色
    const progress = (timeInHours - 19) / 3;
    hue = 220;
    saturation = 60;
    lightness = 40 - progress * 20;
  } else {
    // 深夜 22:00-6:00 - 深紫藍色
    hue = 240;
    saturation = 50;
    lightness = 15;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function drawSky() {
  const skyColor = getSkyColor();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, skyColor);
  gradient.addColorStop(1, adjustBrightness(skyColor, -15));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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

// 初始化雪花
function initSnowflakes(count = 100) {
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
  const targetX = window.innerWidth - 120;
  const targetY = 120;

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
