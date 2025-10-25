// ===== 按鈕觸覺回饋系統 =====
function triggerButtonFeedback(button) {
  // 音效反饋：播放點擊音效
  if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
    SoundEffects.playButtonClickSound();
  }

  // 視覺反饋：放大動畫
  button.style.transform = 'scale(1.15)';
  setTimeout(() => {
    button.style.transform = '';
  }, 200);

  // 觸覺反饋：震動 (僅手機支援)
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // 震動50毫秒
  }
}

// ===== 玩家名稱系統 =====
function setPlayerName() {
  const currentName = localStorage.getItem('playerName') || '匿名玩家';
  const newName = prompt(`設定你的玩家名稱\n\n目前名稱：${currentName}`, currentName);

  if (newName && newName.trim() !== '') {
    localStorage.setItem('playerName', newName.trim());
    console.log('✨ 名稱已更新為：', newName.trim());

    // 更新排行榜顯示（如果有的話）
    if (typeof updateLeaderboard === 'function') {
      updateLeaderboard();
    }
    if (typeof updatePermanentLeaderboard === 'function') {
      updatePermanentLeaderboard();
    }
  }
}

// ===== 進入月球世界 =====
let isInMoonWorld = false;
let galaxyBackground = null; // 儲存 GALAXY 背景圖片

function enterMoonWorld() {
  const button = document.getElementById('main-btn');
  triggerButtonFeedback(button);

  if (!isInMoonWorld) {
    // 顯示確認對話框
    showMoonConfirmDialog();
  } else {
    // 已經在月球中
    console.log("你已經在月球世界了！💫");
  }
}

// 顯示進入月球確認對話框
function showMoonConfirmDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog moon-confirm-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content">
      <div class="dialog-icon">🌙</div>
      <h2 class="battle-title">確認進入月球世界？</h2>
      <p class="dialog-message">進入月球世界後，將會切換到放鬆模式</p>
      <p class="dialog-message">您可以隨時返回魔王城 🏰</p>
      <div class="battle-buttons">
        <button class="battle-btn battle-cancel" style="background: linear-gradient(135deg, #f44336, #da190b);">
          <span class="btn-icon">🌊</span>
          <span>繼續漂泊</span>
        </button>
        <button class="battle-btn battle-confirm" style="background: linear-gradient(135deg, #4CAF50, #45a049);">
          <span class="btn-icon">🌌</span>
          <span>進入未知</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  setTimeout(() => {
    dialog.classList.add('show');
  }, 10);

  // 綁定取消按鈕
  const cancelBtn = dialog.querySelector('.battle-cancel');
  cancelBtn.addEventListener('click', () => {
    triggerButtonFeedback(cancelBtn);
    dialog.classList.remove('show');
    setTimeout(() => {
      dialog.remove();
    }, 300);
  });

  // 綁定確定按鈕
  const confirmBtn = dialog.querySelector('.battle-confirm');
  confirmBtn.addEventListener('click', () => {
    triggerButtonFeedback(confirmBtn);
    dialog.classList.remove('show');
    setTimeout(() => {
      dialog.remove();
      // 執行進入月球的邏輯
      proceedToMoonWorld();
    }, 300);
  });
}

// 執行進入月球世界的實際邏輯
function proceedToMoonWorld() {
  // 進入月球
  isInMoonWorld = true;
  window.isInMoonWorld = true; // 確保全局可訪問
  console.log('🌙 已進入月球世界，可愛訊息應停止');

  // 載入 GALAXY 背景圖片
  galaxyBackground = new Image();
  galaxyBackground.src = 'images/background-galaxy01.png';
  galaxyBackground.onload = () => {
    console.log('GALAXY 背景載入成功！');
  };

  // 隱藏卡片
  document.querySelector('.container').style.display = 'none';

  // 隱藏角色
  const character = document.querySelector('.character-animation');
  if (character) character.style.display = 'none';

  // 隱藏所有按鈕（保留時段顯示和音量控制）
  const elementsToHide = [
    'feedback-toggle', 'leaderboard-toggle', 'wish-toggle',
    'alarm-toggle', 'player-name-toggle'
  ];
  elementsToHide.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });

  // 隱藏社交連結面板
  const socialLinksPanel = document.querySelector('.social-links-panel');
  if (socialLinksPanel) socialLinksPanel.style.display = 'none';

  // 隱藏常駐排行榜
  const permanentLeaderboard = document.querySelector('.permanent-leaderboard');
  if (permanentLeaderboard) permanentLeaderboard.style.display = 'none';

  // 隱藏星星發射器
  const hintText = document.querySelector('.hint-text');
  if (hintText) hintText.style.display = 'none';

  // 保留時段顯示
  const timePeriodDisplay = document.getElementById('timePeriodDisplay');
  if (timePeriodDisplay) {
    timePeriodDisplay.style.display = 'block';
    timePeriodDisplay.style.zIndex = '10001';
  }

  // 保留音量控制器
  const volumeControl = document.querySelector('.volume-control-panel');
  if (volumeControl) {
    volumeControl.style.display = 'block';
    volumeControl.style.zIndex = '10001';
  }

  // 月球時鐘保持顯示
  const moonClock = document.querySelector('.info-panel');
  if (moonClock) {
    moonClock.style.display = 'flex';
    moonClock.style.zIndex = '10001'; // 確保在最上層
  }

  // 顯示返回魔王城按鈕
  const returnBtn = document.getElementById('return-to-main');
  if (returnBtn) {
    returnBtn.style.display = 'block';
    returnBtn.style.zIndex = '10001';
  }

  // 播放放鬆音樂（自動循環）
  switchBGM('music/rain-piano.mp3', true);

  console.log("✨ 歡迎來到月球世界！");
}

function showMoonTools() {
  // 顯示所有月球相關功能
  console.log('月球世界已啟動！');
}

// 返回魔王城（主頁）
function returnToMain() {
  if (!isInMoonWorld) return;

  console.log('🏰 返回魔王城...');

  // 播放音效
  if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
    SoundEffects.playButtonClickSound();
  }

  // 稍微延遲以確保音效播放
  setTimeout(() => {
    location.reload();
  }, 100);
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

}

// ===== Canvas 初始化 =====
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// ===== 全域變數 =====
let touchCount = 0;
const snowflakes = [];
const particles = [];

// ===== 背景音樂系統 =====
let bgMusic = null;
let isMusicPlaying = false;
let musicVolume = 0.7; // 預設音量70%

// ===== 戰鬥音效系統 =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 音效節流控制
let lastHitSoundTime = 0;
const HIT_SOUND_THROTTLE = 150; // 最小間隔 150ms，避免快速點擊太吵

// 音效生成器
const SoundEffects = {
  // 擊中音效 - 鬧鐘叮叮叮聲音
  playHitSound() {
    // 節流機制：如果距離上次播放太近，跳過
    const now = Date.now();
    if (now - lastHitSoundTime < HIT_SOUND_THROTTLE) {
      return; // 跳過音效，避免太吵
    }
    lastHitSoundTime = now;

    // 鬧鐘雙音調叮叮聲
    const playDing = (frequency, delay) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine'; // 使用正弦波，聲音清脆

        // 短促的叮聲
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }, delay);
    };

    // 播放兩個音調的叮叮聲（高音-低音）
    playDing(1200, 0);     // 第一聲 高音
    playDing(1000, 80);    // 第二聲 低音（80ms 後）
  },

  // Boss 受傷音效 - 惡魔大笑 "Ha Ha Ha"
  playBossHurtSound() {
    console.log('🎵 播放惡魔大笑 Ha Ha Ha');

    // 單個「哈」笑聲
    const playHa = (startTime, baseFreq) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 惡魔笑聲頻率變化（模擬 "Ha" 的聲音）
      oscillator.frequency.setValueAtTime(baseFreq, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, startTime + 0.2);
      oscillator.type = 'sawtooth'; // 鋸齒波給人邪惡感

      // 音量包絡（快速起音，緩慢衰減）- 超大音量
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02); // 提高到 0.4（超大聲）
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    };

    const now = audioContext.currentTime;

    // 三段笑聲 "Ha - Ha - Ha"（間隔加長）
    playHa(now, 280);           // 第一聲 Ha
    playHa(now + 0.25, 300);    // 第二聲 Ha（稍高音）
    playHa(now + 0.5, 260);     // 第三聲 Ha（降低，結尾）

    // 低頻惡魔基底音（增加恐怖感）- 增加音量
    const subOscillator = audioContext.createOscillator();
    const subGain = audioContext.createGain();

    subOscillator.connect(subGain);
    subGain.connect(audioContext.destination);

    subOscillator.frequency.setValueAtTime(90, now);
    subOscillator.frequency.exponentialRampToValueAtTime(70, now + 0.7);
    subOscillator.type = 'sine';

    subGain.gain.setValueAtTime(0.25, now); // 提高到 0.25（超大聲）
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    subOscillator.start(now);
    subOscillator.stop(now + 0.7);
  },

  // 狂暴模式音效 - 尖銳的警告聲
  playBerserkSound() {
    const now = audioContext.currentTime;

    for (let i = 0; i < 3; i++) {
      const startTime = now + (i * 0.15); // 預先計算開始時間

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(1200, startTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    }
  },

  // Boss 移動音效 - 詭異的低頻聲
  playBossMoveSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(40, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  },

  // 勝利音效 - 愉快的上升音階
  playVictorySound() {
    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const startTime = now + (index * 0.15); // 預先計算開始時間

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, startTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  },

  // 按鈕點擊音效 - 可愛的咚咚聲
  playButtonClickSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  },

  // 發射星星音效 - 咻～的飛行聲
  playShootSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  },

  // 戰鬥開始音效 - 播放開場低吼聲
  playBattleStartSound() {
    console.log('🎵 播放戰鬥開始音效：開場低吼聲');
    const audio = new Audio('Sound Effects/開場低吼聲.wav');
    audio.volume = 0.7;
    audio.play().catch(err => console.error('播放開場低吼聲失敗:', err));
  },

  // 狂暴模式音效文件 - 播放BOSS瘋狂模式開啟聲
  playBerserkModeSound() {
    console.log('🎵 播放狂暴模式音效：BOSS瘋狂模式開啟聲');
    const audio = new Audio('Sound Effects/BOSS瘋狂模式開啟聲.mp3');
    audio.volume = 0.8;
    audio.play().catch(err => console.error('播放狂暴模式音效失敗:', err));
  },

  // BOSS死亡音效 - 播放BOSS死掉音效
  playBossDeathSound() {
    console.log('🎵 播放BOSS死亡音效：BOSS死掉音效');
    const audio = new Audio('Sound Effects/BOSS死掉音效.wav');
    audio.volume = 0.8;
    audio.play().catch(err => console.error('播放BOSS死亡音效失敗:', err));
  }
};

// ===== Boss 戰系統 =====
let isBossBattle = false; // 是否在 Boss 戰中
let bossHP = 1500; // Boss 血量
let bossMaxHP = 1500; // Boss 最大血量
let bossBattleStarted = false; // 是否已經開始過 Boss 戰（確認對話框只顯示一次）
let currentBGMStage = 0; // 當前 BGM 階段 (0=未開始, 1=第一階段, 2=第二階段, 3=勝利)
let isBerserkMode = false; // 是否進入狂暴模式（<50% 血量）
let lastDialogueTime = 0; // 上次顯示對話的時間
let currentDialogueIndex = 0; // 當前對話索引（順序顯示）
let preBattleBgIndex = 0; // 戰鬥前的背景索引（用於恢復）
let preBattleBgStartTime = 0; // 戰鬥前的背景開始時間（用於恢復）

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
  berserkInterval: 500, // 狂暴模式間隔
  isFrozen: false, // 停格狀態
  useBouncePhysics: false, // 是否使用彈射物理
  bouncePhysicsLogged: false // 調試標記
};

// 背景圖片
const backgroundImages = {
  morning: null,
  afternoon: null,
  night: null,
  lateNight: null
};
let backgroundImagesLoaded = {
  morning: false,
  afternoon: false,
  night: false,
  lateNight: false
};

// ===== 背景時段系統（根據現實時間） =====
// 根據現實時間獲取當前時段索引
// 背景輪播系統
let currentBgIndex = 0; // 初始為早晨（索引0）
let bgRotationStartTime = Date.now();
const bgRotationIntervals = [30000, 30000, 30000, 60000]; // 早晨(30s) → 下午(30s) → 晚上(30s) → 深夜(60s)
let bgRotationLocked = false; // BOSS戰時鎖定背景
let lockedBgIndex = 0; // 鎖定的背景索引

function getCurrentBackgroundIndex() {
  // BOSS戰期間返回鎖定的背景
  if (bgRotationLocked) {
    return lockedBgIndex;
  }

  const elapsed = Date.now() - bgRotationStartTime;
  let totalTime = 0;

  // 計算完整循環所需時間
  const cycleDuration = bgRotationIntervals.reduce((sum, interval) => sum + interval, 0);

  // 當前在循環中的位置
  const currentPosition = elapsed % cycleDuration;

  // 找出當前應該顯示哪個背景
  for (let i = 0; i < bgRotationIntervals.length; i++) {
    totalTime += bgRotationIntervals[i];
    if (currentPosition < totalTime) {
      currentBgIndex = i;
      return i;
    }
  }

  return 0; // 備用
}

// 獲取當前時段名稱（用於背景輪播）
function getCurrentPeriodName() {
  const index = getCurrentBackgroundIndex();
  const periodNames = ['早晨', '下午', '晚上', '深夜'];
  return periodNames[index];
}

// 根據真實時間獲取時段名稱（用於左上角顯示）
function getRealTimePeriodName() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 6 && hour < 12) {
    return '早晨'; // 6:00-12:00
  } else if (hour >= 12 && hour < 18) {
    return '下午'; // 12:00-18:00
  } else if (hour >= 18 && hour < 22) {
    return '晚上'; // 18:00-22:00
  } else {
    return '深夜'; // 22:00-6:00
  }
}

// 設定 Canvas 尺寸為視窗大小
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== 載入背景圖片 =====
function loadBackgroundImages() {
  // 載入早晨背景
  backgroundImages.morning = new Image();
  backgroundImages.morning.src = 'images/morning.png';
  backgroundImages.morning.onload = () => {
    backgroundImagesLoaded.morning = true;
    console.log('早晨背景載入成功！');
  };
  backgroundImages.morning.onerror = () => {
    console.log('早晨背景載入失敗: images/morning.png');
  };

  // 載入下午背景
  backgroundImages.afternoon = new Image();
  backgroundImages.afternoon.src = 'images/1219.png';
  backgroundImages.afternoon.onload = () => {
    backgroundImagesLoaded.afternoon = true;
    console.log('下午背景載入成功！');
  };
  backgroundImages.afternoon.onerror = () => {
    console.log('下午背景載入失敗: images/1219.png');
  };

  // 載入夜晚背景
  backgroundImages.night = new Image();
  backgroundImages.night.src = 'images/1922.png';
  backgroundImages.night.onload = () => {
    backgroundImagesLoaded.night = true;
    console.log('晚上背景載入成功！');
  };
  backgroundImages.night.onerror = () => {
    console.log('晚上背景載入失敗: images/1922.png');
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

// ===== 角色圖片已改為 HTML <img> 標籤 =====
// 不再需要透過 Canvas 載入和繪製

// ===== 時鐘功能 =====
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
// 每秒更新時鐘以確保即時同步，避免延遲
setInterval(updateClock, 1000); // 1秒更新一次
updateClock();

// ===== 時段顯示器更新功能 =====
function updateTimePeriodDisplay() {
  const periodName = getRealTimePeriodName(); // 使用真實時間而不是背景輪播時間
  const displayElement = document.getElementById('timePeriodDisplay');
  if (displayElement) {
    displayElement.textContent = `當前時段：${periodName}`;
  }
}
// 每秒更新時段顯示（確保即時切換）
setInterval(updateTimePeriodDisplay, 1000);
updateTimePeriodDisplay();

// ===== 獲取當前背景圖片 =====
// 順序：早晨(30s) → 下午(30s) → 晚上(30s) → 深夜(60s)
function getCurrentBackgroundImage() {
  const index = getCurrentBackgroundIndex();

  switch(index) {
    case 0:
      // 早晨
      return backgroundImagesLoaded.morning ? backgroundImages.morning : null;
    case 1:
      // 下午
      return backgroundImagesLoaded.afternoon ? backgroundImages.afternoon : null;
    case 2:
      // 晚上
      return backgroundImagesLoaded.night ? backgroundImages.night : null;
    case 3:
      // 深夜
      return backgroundImagesLoaded.lateNight ? backgroundImages.lateNight : null;
    default:
      return null;
  }
}

// ===== 天空背景顏色系統（備用） =====
// 當背景圖片載入失敗時使用
// 順序：早晨 > 下午 > 晚上 > 深夜
function getSkyColor() {
  const index = getCurrentBackgroundIndex();
  let hue, saturation, lightness;

  switch(index) {
    case 0:
      // 早晨 - 淺藍天空
      hue = 200;
      saturation = 70;
      lightness = 70;
      break;
    case 1:
      // 下午 - 明亮天空
      hue = 210;
      saturation = 60;
      lightness = 65;
      break;
    case 2:
      // 晚上 - 深紫色
      hue = 280;
      saturation = 60;
      lightness = 30;
      break;
    case 3:
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
  // 如果在月球世界，繪製 GALAXY 背景
  if (isInMoonWorld && galaxyBackground && galaxyBackground.complete) {
    ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height);
    return;
  }

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

// ===== 發射粒子系統（追蹤系統） =====
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
// 角色已改為 HTML <img> 標籤，不再需要在 Canvas 上繪製

// ===== 發射星星函數 =====
function shootStars() {
  // 播放發射音效
  SoundEffects.playShootSound();

  // 固定發射位置在角色手前方
  const charX = 450;  // 固定X位置（角色手前方）
  const charY = window.innerHeight - 220;  // 固定Y位置（角色手的高度）

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
      particles.push(new Particle(charX, charY, targetX, targetY));
    }, i * 150);
  }
}

// ===== 點擊事件處理 =====
// 點擊角色發射星星
const characterElement = document.getElementById('characterImg');
if (characterElement) {
  characterElement.addEventListener('click', (e) => {
    e.stopPropagation();
    shootStars();
  });
}

// ===== 星星發射按鈕點擊事件 =====
document.querySelector('.hint-text').addEventListener('click', (e) => {
  e.stopPropagation(); // 防止事件冒泡

  // 視覺反饋：放大動畫
  const launcherBtn = document.querySelector('.hint-text');
  if (launcherBtn) {
    launcherBtn.style.transform = 'scale(1.15)';
    setTimeout(() => {
      launcherBtn.style.transform = '';
    }, 200);
  }

  // 如果已經開始過 Boss 戰，直接發射星星（發射音效在 shootStars 中）
  if (bossBattleStarted) {
    shootStars();
  } else {
    // 第一次點擊，播放可愛的按鈕音效並顯示確認對話框
    if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
      SoundEffects.playButtonClickSound();
    }
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
    triggerButtonFeedback(yesBtn);
    closeBattleDialog(dialog);
    startBossBattle(); // 開始 Boss 戰
  });

  noBtn.addEventListener('click', () => {
    triggerButtonFeedback(noBtn);
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

  // 保存戰鬥前的背景狀態
  preBattleBgIndex = currentBgIndex;
  preBattleBgStartTime = bgRotationStartTime;

  // 鎖定背景為深夜
  bgRotationLocked = true;
  lockedBgIndex = 3; // 深夜索引
  currentBgIndex = 3;
  console.log('🌙 BOSS戰開始！背景已鎖定為固定深夜模式');

  // 播放戰鬥開始音效（開場低吼聲）
  SoundEffects.playBattleStartSound();

  // 添加戰鬥模式 class（用於手機版隱藏背景元素）
  document.body.classList.add('boss-battle');

  // 隱藏卡片和進入月球按鈕（戰鬥中不需要顯示）
  const container = document.querySelector('.container');
  if (container) container.style.display = 'none';
  const mainBtn = document.getElementById('main-btn');
  if (mainBtn) mainBtn.style.display = 'none';
  console.log('🎴 已隱藏卡片和進入月球按鈕');

  // 顯示血條
  document.getElementById('boss-health-bar').style.display = 'block';
  updateBossHealthBar();

  // 顯示應援團
  document.getElementById('support-team').style.display = 'flex';

  // 啟動應援文字隨機切換
  startSupportMessages();

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

  // 播放狂暴模式音效（BOSS瘋狂模式開啟聲）
  SoundEffects.playBerserkModeSound();
  // 同時播放原有的警告聲效
  SoundEffects.playBerserkSound();

  // 啟用彈射物理模式
  bossMovement.useBouncePhysics = true;

  // 初始化隨機的斜向速度向量
  const angle = Math.random() * Math.PI * 2; // 隨機角度
  bossMovement.velocityX = Math.cos(angle) * bossMovement.berserkSpeed;
  bossMovement.velocityY = Math.sin(angle) * bossMovement.berserkSpeed;

  console.log(`狂暴模式速度初始化：vX=${bossMovement.velocityX.toFixed(2)}, vY=${bossMovement.velocityY.toFixed(2)}`);

  // 清除原有的移動間隔
  if (bossMovement.changeDirectionInterval) {
    clearInterval(bossMovement.changeDirectionInterval);
  }

  // 設置隨機停格和方向改變機制
  bossMovement.changeDirectionInterval = setInterval(() => {
    if (!bossMovement.active) return;

    // 30% 機率觸發停格
    if (Math.random() < 0.3 && !bossMovement.isFrozen) {
      bossMovement.isFrozen = true;
      setTimeout(() => {
        bossMovement.isFrozen = false;
        // 解凍後改變方向
        const angle = Math.random() * Math.PI * 2;
        bossMovement.velocityX = Math.cos(angle) * bossMovement.berserkSpeed;
        bossMovement.velocityY = Math.sin(angle) * bossMovement.berserkSpeed;
      }, 300); // 停格300ms
    }

    // 20% 機率隨機改變方向（不停格）
    if (Math.random() < 0.2 && !bossMovement.isFrozen) {
      const angle = Math.random() * Math.PI * 2;
      bossMovement.velocityX = Math.cos(angle) * bossMovement.berserkSpeed;
      bossMovement.velocityY = Math.sin(angle) * bossMovement.berserkSpeed;
    }

  }, bossMovement.berserkInterval); // 500ms 間隔

  console.log('狂暴模式已啟動！彈射物理已開啟！');
}

// Boss 移動系統
function startBossMovement() {
  bossMovement.active = true;

  // 禁用玩家拖動
  cleanupMoonDrag();

  // 將月亮從 right 定位改為 left 定位（用於移動系統）
  const moonElement = document.querySelector('.info-panel');
  if (moonElement) {
    const rect = moonElement.getBoundingClientRect();
    moonElement.style.setProperty('right', 'auto', 'important'); // 清除 right 定位
    moonElement.style.setProperty('left', rect.left + 'px', 'important');
    moonElement.style.setProperty('top', rect.top + 'px', 'important');
    console.log(`✅ 月亮定位已轉換：left=${rect.left}px, top=${rect.top}px`);
  }

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

    // 30% 機率播放移動音效
    if (Math.random() < 0.3) {
      SoundEffects.playBossMoveSound();
    }

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

  if (bossMovement.useBouncePhysics && isBerserkMode) {
    // ===== 彈射物理模式（狂暴） =====
    if (!bossMovement.bouncePhysicsLogged) {
      console.log('✅ 彈射物理模式已啟動！BOSS正在斜線移動！');
      bossMovement.bouncePhysicsLogged = true;
    }

    if (!bossMovement.isFrozen) {
      // 計算新位置
      let newX = currentX + bossMovement.velocityX;
      let newY = currentY + bossMovement.velocityY;

      const moonSize = isMobileMode ? 100 : 220;
      const maxX = window.innerWidth - moonSize;
      const maxY = window.innerHeight - moonSize;

      // 檢測左右邊界碰撞並彈射
      if (newX <= 0) {
        newX = 0;
        bossMovement.velocityX = Math.abs(bossMovement.velocityX); // 反彈向右
        SoundEffects.playBossMoveSound(); // 撞擊音效
      } else if (newX >= maxX) {
        newX = maxX;
        bossMovement.velocityX = -Math.abs(bossMovement.velocityX); // 反彈向左
        SoundEffects.playBossMoveSound();
      }

      // 檢測上下邊界碰撞並彈射
      if (newY <= 0) {
        newY = 0;
        bossMovement.velocityY = Math.abs(bossMovement.velocityY); // 反彈向下
        SoundEffects.playBossMoveSound();
      } else if (newY >= maxY) {
        newY = maxY;
        bossMovement.velocityY = -Math.abs(bossMovement.velocityY); // 反彈向上
        SoundEffects.playBossMoveSound();
      }

      moonElement.style.setProperty('left', newX + 'px', 'important');
      moonElement.style.setProperty('top', newY + 'px', 'important');
    }
    // 停格狀態時不移動
  } else {
    // ===== 原始目標追蹤模式（正常） =====
    const dx = bossMovement.targetX - currentX;
    const dy = bossMovement.targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const currentSpeed = isBerserkMode ? bossMovement.berserkSpeed : bossMovement.speed;
      const moveX = (dx / distance) * currentSpeed;
      const moveY = (dy / distance) * currentSpeed;

      moonElement.style.setProperty('left', (currentX + moveX) + 'px', 'important');
      moonElement.style.setProperty('top', (currentY + moveY) + 'px', 'important');
    }
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
  bossMovement.useBouncePhysics = false; // 重置彈射物理
  bossMovement.isFrozen = false; // 重置停格狀態
  bossMovement.velocityX = 0;
  bossMovement.velocityY = 0;
  bossMovement.bouncePhysicsLogged = false; // 重置調試標記
  if (bossMovement.changeDirectionInterval) {
    clearInterval(bossMovement.changeDirectionInterval);
  }

  // 恢復月亮到右上角位置（重置為 right 定位）
  const moonElement = document.querySelector('.info-panel');
  if (moonElement) {
    moonElement.style.setProperty('left', 'auto', 'important');
    moonElement.style.setProperty('right', '25px', 'important');
    moonElement.style.setProperty('top', '25px', 'important');
    console.log('✅ 月亮已恢復到右上角位置');
  }
}

// ===== 應援團訊息系統 =====
let supportMessageInterval = null;

// 應援訊息庫（每個角色3種訊息）
const supportMessages = [
  [
    '💪 加油！主人！',
    '✨ 你是最棒的！',
    '🌟 繼續努力呀！'
  ],
  [
    '💖 你可以的呢！',
    '🎀 相信你哦～',
    '💕 主人最強了！'
  ],
  [
    '⚡ Fighting！先輩！',
    '🔥 全力以赴！',
    '💫 不要放棄！'
  ],
  [
    '🌸 頑張って！',
    '🎵 一起加油！',
    '✨ 你做得很好！'
  ]
];

// 啟動應援訊息隨機切換
function startSupportMessages() {
  // 初始設定隨機訊息
  updateSupportMessages();

  // 每1.5秒隨機切換一次訊息
  supportMessageInterval = setInterval(() => {
    updateSupportMessages();
  }, 1500);
}

// 更新應援訊息
function updateSupportMessages() {
  const characters = document.querySelectorAll('.support-character');
  characters.forEach((char, index) => {
    const messageElement = char.querySelector('.char-message');
    if (messageElement && supportMessages[index]) {
      // 從該角色的訊息庫中隨機選一個
      const randomIndex = Math.floor(Math.random() * supportMessages[index].length);
      messageElement.textContent = supportMessages[index][randomIndex];
    }
  });
}

// 停止應援訊息切換
function stopSupportMessages() {
  if (supportMessageInterval) {
    clearInterval(supportMessageInterval);
    supportMessageInterval = null;
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

  // 解鎖並恢復戰鬥前的背景輪替
  bgRotationLocked = false;
  currentBgIndex = preBattleBgIndex;
  bgRotationStartTime = preBattleBgStartTime;
  console.log('🌅 BOSS戰結束！背景已解鎖並恢復正常輪替');

  // 播放BOSS死亡音效
  SoundEffects.playBossDeathSound();
  // 播放勝利音效
  SoundEffects.playVictorySound();

  // 移除戰鬥模式 class
  document.body.classList.remove('boss-battle');

  // 恢復卡片和進入月球按鈕的顯示
  const container = document.querySelector('.container');
  if (container) container.style.display = 'block';
  const mainBtn = document.getElementById('main-btn');
  if (mainBtn) mainBtn.style.display = 'block';
  console.log('🎴 已恢復卡片和進入月球按鈕');

  // 切換勝利音樂
  switchBGM('music/rain-piano.mp3', true);

  // 隱藏血條
  document.getElementById('boss-health-bar').style.display = 'none';

  // 停止應援訊息切換
  stopSupportMessages();

  // 隱藏應援團
  document.getElementById('support-team').style.display = 'none';

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

  // 先顯示恭喜訊息，再顯示選擇畫面
  setTimeout(() => {
    showCongratulationsDialog();
  }, 500);

  console.log('Boss 被擊敗！進入放鬆模式');
}

// 恭喜訊息對話框（第一步）
function showCongratulationsDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog congratulations-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content victory-content">
      <div class="victory-icon">🎉</div>
      <h2 class="battle-title">恭喜！成功擊敗 Boss！</h2>
      <div class="victory-icons">
        <span class="icon-item">🌈</span>
        <span class="icon-item">✨</span>
        <span class="icon-item">🎊</span>
        <span class="icon-item">💖</span>
        <span class="icon-item">🌸</span>
      </div>
      <p class="victory-message">血月已經消退，和平重新降臨～</p>
      <div class="battle-buttons">
        <button class="battle-btn battle-continue">
          <span class="btn-icon">✨</span>
          <span>確定</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  setTimeout(() => {
    dialog.classList.add('show');
  }, 10);

  // 綁定確定按鈕事件
  const continueBtn = dialog.querySelector('.battle-continue');

  continueBtn.addEventListener('click', () => {
    triggerButtonFeedback(continueBtn);
    closeBattleDialog(dialog);
    // 關閉後顯示選擇畫面
    setTimeout(() => {
      showChoiceDialog();
    }, 300);
  });

  // 點擊背景也可以關閉
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeBattleDialog(dialog);
      setTimeout(() => {
        showChoiceDialog();
      }, 300);
    }
  });
}

// 選擇對話框（第二步：休息或重新挑戰）
function showChoiceDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog choice-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content">
      <div class="battle-icon">🌙</div>
      <h2 class="battle-title">接下來要做什麼呢？</h2>
      <p class="battle-message">您可以選擇繼續放鬆，或是重新挑戰血月 Boss～</p>
      <div class="battle-buttons">
        <button class="battle-btn battle-rechallenge">
          <span class="btn-icon">⚔️</span>
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
    triggerButtonFeedback(rechallengeBtn);
    closeBattleDialog(dialog);
    startBossBattle(); // 重新開始 Boss 戰
  });

  relaxBtn.addEventListener('click', () => {
    triggerButtonFeedback(relaxBtn);
    closeBattleDialog(dialog);
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeBattleDialog(dialog);
    }
  });
}

// 勝利對話框（舊版，已不使用）
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
    triggerButtonFeedback(rechallengeBtn);
    closeBattleDialog(dialog);
    startBossBattle(); // 重新開始 Boss 戰
  });

  relaxBtn.addEventListener('click', () => {
    triggerButtonFeedback(relaxBtn);
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

  // 同步到排行榜
  syncCurrentUserHearts();

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

    // 播放擊中音效
    SoundEffects.playHitSound();

    // 每400點血量播放一次惡魔大笑
    if (bossHP % 400 === 0) {
      setTimeout(() => SoundEffects.playBossHurtSound(), 100);
    }
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
  bgMusic.src = 'music/rain-piano.mp3'; // 預設放鬆音樂
  bgMusic.loop = true;
  bgMusic.volume = musicVolume;

  bgMusic.addEventListener('canplaythrough', () => {
    console.log('背景音樂已載入');
  });

  bgMusic.addEventListener('error', () => {
    console.log('背景音樂載入失敗');
  });

  // 嘗試自動播放放鬆音樂
  attemptAutoplay();
}

// 嘗試自動播放（帶備援機制）
function attemptAutoplay() {
  if (!bgMusic) return;

  bgMusic.play().then(() => {
    isMusicPlaying = true;
    console.log('音樂自動播放成功');
    updateMusicButton();
  }).catch(err => {
    console.log('自動播放被瀏覽器阻擋，等待用戶互動:', err);
    // 添加一次性點擊監聽器，用戶互動後自動播放
    const autoplayOnInteraction = () => {
      playMusic();
      document.body.removeEventListener('click', autoplayOnInteraction);
      document.body.removeEventListener('touchstart', autoplayOnInteraction);
    };
    document.body.addEventListener('click', autoplayOnInteraction, { once: true });
    document.body.addEventListener('touchstart', autoplayOnInteraction, { once: true });
  });
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
  console.log('🚀 DOM 載入完成 - script.js DOMContentLoaded 已觸發');
  console.log('📊 檢查核心變數狀態：');
  console.log('  - isBossBattle:', isBossBattle);
  console.log('  - isInMoonWorld:', isInMoonWorld);
  console.log('  - audioContext:', typeof audioContext);

  // 初始化視圖模式（自動偵測）
  console.log('🖥️ 初始化視圖模式...');
  initViewMode();

  // 初始化月亮拖動（僅手機版）- 延遲確保元素完全渲染
  setTimeout(() => {
    console.log('🌙 準備初始化月亮拖動，當前模式:', isMobileMode ? '手機版' : '桌面版');
    initMoonDrag();
  }, 300);

  // 初始化背景音樂
  console.log('🎵 初始化背景音樂...');
  initBackgroundMusic();

  // 綁定音樂按鈕事件
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerButtonFeedback(musicBtn);
      toggleMusic();
    });
  }

  // 綁定音量滑桿事件
  const volumeSlider = document.getElementById('volume-slider');
  const volumePercentage = document.getElementById('volume-percentage');
  if (volumeSlider && volumePercentage) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value);
      musicVolume = volume / 100; // 轉換為 0-1 範圍
      if (bgMusic) {
        bgMusic.volume = musicVolume;
      }
      volumePercentage.textContent = volume + '%';
      console.log('音量調整為:', volume + '%');
    });
  }

  // 初始化排行榜系統
  initLeaderboard();

  // 立即更新常駐排行榜
  if (typeof updatePermanentLeaderboard === 'function') {
    console.log('🏆 初始化完成後立即更新常駐排行榜');
    updatePermanentLeaderboard();
  }

  // 初始化意見回饋系統
  initFeedback();

  // 初始化許願池系統
  initWish();

  // 初始化鬧鐘系統
  initAlarm();

  // 為所有重要按鈕添加觸覺反饋
  addButtonFeedbackToAll();

  // 綁定返回魔王城按鈕事件
  const returnBtn = document.getElementById('return-to-main');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      triggerButtonFeedback(returnBtn);
      returnToMain();
    });
  }
});

// ===== 愛心排行榜系統 =====
const LEADERBOARD_KEY = 'heartLeaderboard';
const USERNAME_KEY = 'currentUsername';

// 取得當前用戶名稱
function getCurrentUsername() {
  try {
    const username = localStorage.getItem(USERNAME_KEY) || null;
    console.log('📝 當前用戶名稱:', username || '(尚未設定)');
    return username;
  } catch (error) {
    console.error('❌ 讀取用戶名稱失敗:', error);
    return null;
  }
}

// 儲存用戶名稱
function saveUsername(username) {
  try {
    localStorage.setItem(USERNAME_KEY, username.trim());
    console.log('✅ 用戶名稱已儲存:', username.trim());
  } catch (error) {
    console.error('❌ 儲存用戶名稱失敗:', error);
  }
}

// 取得排行榜數據
function getLeaderboardData() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('❌ 讀取排行榜數據失敗:', error);
    return {};
  }
}

// 儲存排行榜數據
function saveLeaderboardData(data) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
    console.log('✅ 排行榜數據已儲存:', data);
  } catch (error) {
    console.error('❌ 儲存排行榜數據失敗:', error);
  }
}

// 更新用戶的愛心數量
function updateUserHearts(username, hearts) {
  if (!username) return;

  const data = getLeaderboardData();
  data[username] = hearts;
  saveLeaderboardData(data);
}

// 同步當前用戶的愛心數量到排行榜
function syncCurrentUserHearts() {
  const username = getCurrentUsername();
  if (username) {
    updateUserHearts(username, touchCount);
    console.log(`💖 已同步 ${username} 的愛心數量: ${touchCount}`);
  } else {
    console.warn('⚠️ 未找到用戶名稱，無法同步愛心數量');
  }
}

// 取得排行榜排名（前10名）
function getTopRankings() {
  const data = getLeaderboardData();
  const rankings = Object.entries(data)
    .map(([name, hearts]) => ({ name, hearts }))
    .sort((a, b) => b.hearts - a.hearts)
    .slice(0, 10);
  return rankings;
}

// 渲染排行榜
function renderLeaderboard() {
  const rankings = getTopRankings();
  const rankingsContainer = document.getElementById('leaderboard-rankings');
  const currentUsername = getCurrentUsername();

  if (rankings.length === 0) {
    rankingsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">還沒有人上榜！成為第一個吧！💖</p>';
    return;
  }

  rankingsContainer.innerHTML = '';

  rankings.forEach((user, index) => {
    const rankItem = document.createElement('div');
    rankItem.className = 'rank-item';

    if (user.name === currentUsername) {
      rankItem.classList.add('current-user');
    }

    let rankNumberClass = '';
    let rankSymbol = `#${index + 1}`;

    if (index === 0) {
      rankNumberClass = 'gold';
      rankSymbol = '🥇';
    } else if (index === 1) {
      rankNumberClass = 'silver';
      rankSymbol = '🥈';
    } else if (index === 2) {
      rankNumberClass = 'bronze';
      rankSymbol = '🥉';
    }

    rankItem.innerHTML = `
      <div class="rank-number ${rankNumberClass}">${rankSymbol}</div>
      <div class="rank-info">
        <div class="rank-name">${user.name}</div>
      </div>
      <div class="rank-hearts">💖 ${user.hearts}</div>
    `;

    rankingsContainer.appendChild(rankItem);
  });
}

// 顯示用戶名稱輸入區域
function showUsernameInput() {
  document.querySelector('.leaderboard-greeting').style.display = 'block';
  document.getElementById('username-input').style.display = 'inline-block';
  document.getElementById('save-username-btn').style.display = 'inline-block';
  document.getElementById('current-user-display').style.display = 'none';
}

// 顯示當前用戶資訊
function showCurrentUser(username) {
  document.querySelector('.leaderboard-greeting').style.display = 'none';
  document.getElementById('username-input').style.display = 'none';
  document.getElementById('save-username-btn').style.display = 'none';
  document.getElementById('current-user-display').style.display = 'block';
  document.getElementById('current-username').textContent = username;
}

// 初始化排行榜系統
function initLeaderboard() {
  console.log('🏆 開始初始化排行榜系統...');

  const leaderboardToggle = document.getElementById('leaderboard-toggle');
  const leaderboardPanel = document.getElementById('leaderboard-panel');
  const leaderboardClose = document.getElementById('leaderboard-close');
  const saveUsernameBtn = document.getElementById('save-username-btn');
  const changeUsernameBtn = document.getElementById('change-username-btn');
  const usernameInput = document.getElementById('username-input');

  console.log('  - leaderboard-toggle:', leaderboardToggle ? '存在' : '不存在');
  console.log('  - leaderboard-panel:', leaderboardPanel ? '存在' : '不存在');

  if (!leaderboardToggle || !leaderboardPanel) {
    console.error('❌ 排行榜必要元素不存在，停止初始化');
    return;
  }

  // 載入時檢查是否已有用戶名稱
  const currentUsername = getCurrentUsername();
  if (currentUsername) {
    showCurrentUser(currentUsername);
    // 載入該用戶的愛心數量
    const leaderboardData = getLeaderboardData();
    if (leaderboardData[currentUsername]) {
      touchCount = leaderboardData[currentUsername];
      const counterElement = document.getElementById('counter');
      if (counterElement) {
        counterElement.textContent = touchCount;
      }
    }
    // 同步當前愛心數量
    updateUserHearts(currentUsername, touchCount);
  } else {
    showUsernameInput();
  }

  // 打開排行榜
  leaderboardToggle.addEventListener('click', () => {
    console.log('🏆 排行榜按鈕被點擊');
    triggerButtonFeedback(leaderboardToggle);

    // 檢查是否已設定名稱
    const currentUsername = getCurrentUsername();
    if (!currentUsername) {
      // 沒有名稱，提示用戶先設定
      alert('請先設定您的名稱喔！\n\n點擊右上角的 👤 按鈕即可設定名稱 😊');
      console.log('⚠️ 用戶未設定名稱，無法進入排行榜');
      return;
    }

    leaderboardPanel.style.display = 'flex';
    renderLeaderboard();
  });

  // 關閉排行榜
  leaderboardClose.addEventListener('click', () => {
    triggerButtonFeedback(leaderboardClose);
    leaderboardPanel.style.display = 'none';
  });

  // 點擊背景關閉
  leaderboardPanel.addEventListener('click', (e) => {
    if (e.target === leaderboardPanel) {
      leaderboardPanel.style.display = 'none';
    }
  });

  // 儲存用戶名稱
  saveUsernameBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username.length === 0) {
      console.log('名字不能為空');
      return;
    }
    if (username.length > 20) {
      console.log('名字太長了，最多20個字元');
      return;
    }

    triggerButtonFeedback(saveUsernameBtn);
    saveUsername(username);
    showCurrentUser(username);
    updateUserHearts(username, touchCount);
    renderLeaderboard();
  });

  // 更改用戶名稱
  changeUsernameBtn.addEventListener('click', () => {
    triggerButtonFeedback(changeUsernameBtn);
    showUsernameInput();
    usernameInput.value = '';
    usernameInput.focus();
  });

  // 按 Enter 儲存
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveUsernameBtn.click();
    }
  });
}

// ===== 意見回饋系統 =====
const FEEDBACK_KEY = 'userFeedback';

// 取得所有回饋資料
function getFeedbackData() {
  const data = localStorage.getItem(FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
}

// 儲存回饋資料
function saveFeedbackData(feedbackArray) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackArray));
}

// 新增回饋
function addFeedback(category, message) {
  const feedbackArray = getFeedbackData();
  const newFeedback = {
    id: Date.now(),
    category: category,
    message: message,
    timestamp: new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  feedbackArray.unshift(newFeedback); // 新的在前面
  saveFeedbackData(feedbackArray);
  return newFeedback;
}

// 取得類別名稱
function getCategoryName(categoryValue) {
  const categoryMap = {
    'bug': '🐛 Bug 回報',
    'feature': '💡 功能建議',
    'combat': '⚔️ 戰鬥相關',
    'other': '📌 其他意見'
  };
  return categoryMap[categoryValue] || categoryValue;
}

// 渲染回饋歷史
function renderFeedbackHistory() {
  const feedbackArray = getFeedbackData();
  const historyContainer = document.getElementById('feedback-history');

  if (feedbackArray.length === 0) {
    historyContainer.innerHTML = '<div class="feedback-empty">你還沒有提交過任何回饋！</div>';
    return;
  }

  historyContainer.innerHTML = '';

  feedbackArray.slice(0, 10).forEach(feedback => {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';

    feedbackItem.innerHTML = `
      <div class="feedback-item-header">
        <div class="feedback-item-category">${getCategoryName(feedback.category)}</div>
        <div class="feedback-item-date">${feedback.timestamp}</div>
      </div>
      <div class="feedback-item-message">${feedback.message}</div>
    `;

    historyContainer.appendChild(feedbackItem);
  });
}

// 初始化回饋系統
function initFeedback() {
  console.log('💬 開始初始化意見回饋系統...');

  const feedbackToggle = document.getElementById('feedback-toggle');
  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackClose = document.getElementById('feedback-close');
  const feedbackCategory = document.getElementById('feedback-category');
  const feedbackMessage = document.getElementById('feedback-message');
  const feedbackCharCount = document.getElementById('feedback-char-count');
  const feedbackSubmitBtn = document.getElementById('feedback-submit-btn');

  console.log('  - feedback-toggle:', feedbackToggle ? '存在' : '不存在');
  console.log('  - feedback-panel:', feedbackPanel ? '存在' : '不存在');

  if (!feedbackToggle || !feedbackPanel) {
    console.error('❌ 意見回饋必要元素不存在，停止初始化');
    return;
  }

  // 打開回饋面板
  feedbackToggle.addEventListener('click', () => {
    console.log('💬 意見回饋按鈕被點擊');
    triggerButtonFeedback(feedbackToggle);
    feedbackPanel.style.display = 'flex';
    renderFeedbackHistory();
  });

  // 關閉回饋面板
  feedbackClose.addEventListener('click', () => {
    triggerButtonFeedback(feedbackClose);
    feedbackPanel.style.display = 'none';
  });

  // 點擊背景關閉
  feedbackPanel.addEventListener('click', (e) => {
    if (e.target === feedbackPanel) {
      feedbackPanel.style.display = 'none';
    }
  });

  // 字數統計
  feedbackMessage.addEventListener('input', () => {
    const length = feedbackMessage.value.length;
    feedbackCharCount.textContent = length;

    if (length > 450) {
      feedbackCharCount.style.color = '#f5576c';
    } else {
      feedbackCharCount.style.color = '#666';
    }
  });

  // 提交回饋
  feedbackSubmitBtn.addEventListener('click', () => {
    const category = feedbackCategory.value;
    const message = feedbackMessage.value.trim();

    if (message.length === 0) {
      console.log('請輸入意見');
      return;
    }

    if (message.length > 500) {
      console.log('訊息太長了，最多500個字元');
      return;
    }

    triggerButtonFeedback(feedbackSubmitBtn);

    // 儲存回饋
    addFeedback(category, message);

    // 清空表單
    feedbackMessage.value = '';
    feedbackCharCount.textContent = '0';

    console.log('感謝你的回饋！💖');

    // 重新渲染歷史
    renderFeedbackHistory();
  });
}

// ===== 許願池系統 =====
const WISH_KEY = 'userWishes';

function getWishData() {
  const data = localStorage.getItem(WISH_KEY);
  return data ? JSON.parse(data) : [];
}

function saveWishData(wishArray) {
  localStorage.setItem(WISH_KEY, JSON.stringify(wishArray));
}

function addWish(wishText) {
  const wishArray = getWishData();
  const newWish = {
    id: Date.now(),
    text: wishText,
    timestamp: new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  wishArray.unshift(newWish);
  saveWishData(wishArray);
  return newWish;
}

function renderWishList() {
  const wishArray = getWishData();
  const wishListContainer = document.getElementById('wish-list');

  if (wishArray.length === 0) {
    wishListContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">還沒有許願！快來許下你的第一個願望吧！🌟</div>';
    return;
  }

  wishListContainer.innerHTML = '';
  wishArray.slice(0, 10).forEach(wish => {
    const wishItem = document.createElement('div');
    wishItem.className = 'wish-item';
    wishItem.innerHTML = `
      <div class="wish-item-date">${wish.timestamp}</div>
      <div class="wish-item-text">${wish.text}</div>
    `;
    wishListContainer.appendChild(wishItem);
  });
}

function initWish() {
  console.log('🌠 開始初始化許願池系統...');

  const wishToggle = document.getElementById('wish-toggle');
  const wishPanel = document.getElementById('wish-panel');
  const wishClose = document.getElementById('wish-close');
  const wishInput = document.getElementById('wish-input');
  const wishCharCount = document.getElementById('wish-char-count');
  const wishSubmitBtn = document.getElementById('wish-submit-btn');

  console.log('  - wish-toggle:', wishToggle ? '存在' : '不存在');
  console.log('  - wish-panel:', wishPanel ? '存在' : '不存在');

  if (!wishToggle || !wishPanel) {
    console.error('❌ 許願池必要元素不存在，停止初始化');
    return;
  }

  wishToggle.addEventListener('click', () => {
    console.log('🌠 許願池按鈕被點擊');
    triggerButtonFeedback(wishToggle);
    wishPanel.style.display = 'flex';
    renderWishList();
  });

  wishClose.addEventListener('click', () => {
    triggerButtonFeedback(wishClose);
    wishPanel.style.display = 'none';
  });

  wishPanel.addEventListener('click', (e) => {
    if (e.target === wishPanel) {
      wishPanel.style.display = 'none';
    }
  });

  wishInput.addEventListener('input', () => {
    const length = wishInput.value.length;
    wishCharCount.textContent = length;
    if (length > 180) {
      wishCharCount.style.color = '#f5576c';
    } else {
      wishCharCount.style.color = '#666';
    }
  });

  wishSubmitBtn.addEventListener('click', () => {
    const wishText = wishInput.value.trim();
    if (wishText.length === 0) {
      console.log('請輸入你的願望');
      return;
    }
    if (wishText.length > 200) {
      console.log('願望太長了，最多200個字元');
      return;
    }

    triggerButtonFeedback(wishSubmitBtn);
    addWish(wishText);
    wishInput.value = '';
    wishCharCount.textContent = '0';
    console.log('✨ 願望已投入許願池！');
    renderWishList();
  });
}

// ===== 鬧鐘系統 =====
let alarmInterval = null;
let alarmTimeRemaining = 0;
let alarmTotalTime = 0;

function initAlarm() {
  console.log('⏰ 開始初始化鬧鐘系統...');

  const alarmToggle = document.getElementById('alarm-toggle');
  const alarmPanel = document.getElementById('alarm-panel');
  const alarmClose = document.getElementById('alarm-close');
  const alarmStartBtn = document.getElementById('alarm-start-btn');
  const alarmStopBtn = document.getElementById('alarm-stop-btn');
  const alarmDuration = document.getElementById('alarm-duration');
  const alarmTask = document.getElementById('alarm-task');
  const alarmDisplay = document.getElementById('alarm-display');
  const alarmTimer = document.getElementById('alarm-timer');
  const alarmTaskDisplay = document.getElementById('alarm-task-display');
  const alarmProgressFill = document.getElementById('alarm-progress-fill');
  const alarmForm = document.querySelector('.alarm-form');

  console.log('  - alarm-toggle:', alarmToggle ? '存在' : '不存在');
  console.log('  - alarm-panel:', alarmPanel ? '存在' : '不存在');

  if (!alarmToggle || !alarmPanel) {
    console.error('❌ 鬧鐘必要元素不存在，停止初始化');
    return;
  }

  alarmToggle.addEventListener('click', () => {
    console.log('⏰ 鬧鐘按鈕被點擊');
    triggerButtonFeedback(alarmToggle);
    alarmPanel.style.display = 'flex';
  });

  alarmClose.addEventListener('click', () => {
    triggerButtonFeedback(alarmClose);
    alarmPanel.style.display = 'none';
  });

  alarmPanel.addEventListener('click', (e) => {
    if (e.target === alarmPanel) {
      alarmPanel.style.display = 'none';
    }
  });

  alarmStartBtn.addEventListener('click', () => {
    const duration = parseInt(alarmDuration.value);
    const taskName = alarmTask.value.trim() || '專注學習';

    triggerButtonFeedback(alarmStartBtn);

    alarmTotalTime = duration * 60; // 轉換為秒
    alarmTimeRemaining = alarmTotalTime;

    alarmTaskDisplay.textContent = `任務：${taskName}`;
    alarmForm.style.display = 'none';
    alarmDisplay.style.display = 'block';
    alarmStartBtn.style.display = 'none';
    alarmStopBtn.style.display = 'block';

    startAlarmTimer();
  });

  alarmStopBtn.addEventListener('click', () => {
    triggerButtonFeedback(alarmStopBtn);
    stopAlarmTimer();
    alarmForm.style.display = 'block';
    alarmDisplay.style.display = 'none';
    alarmStartBtn.style.display = 'block';
    alarmStopBtn.style.display = 'none';
  });
}

function startAlarmTimer() {
  updateAlarmDisplay();

  alarmInterval = setInterval(() => {
    alarmTimeRemaining--;

    if (alarmTimeRemaining <= 0) {
      alarmTimerComplete();
      return;
    }

    updateAlarmDisplay();
  }, 1000);
}

function stopAlarmTimer() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

function updateAlarmDisplay() {
  const minutes = Math.floor(alarmTimeRemaining / 60);
  const seconds = alarmTimeRemaining % 60;
  const timerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  document.getElementById('alarm-timer').textContent = timerText;

  const progress = ((alarmTotalTime - alarmTimeRemaining) / alarmTotalTime) * 100;
  document.getElementById('alarm-progress-fill').style.width = progress + '%';
}

function alarmTimerComplete() {
  stopAlarmTimer();

  // 震動提醒
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }

  // 播放提示音
  console.log('⏰ 時間到！休息一下吧！');
  if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
    // 播放多次音效作為提醒
    SoundEffects.playButtonClickSound();
    setTimeout(() => SoundEffects.playButtonClickSound(), 200);
    setTimeout(() => SoundEffects.playButtonClickSound(), 400);
  }

  document.querySelector('.alarm-form').style.display = 'block';
  document.getElementById('alarm-display').style.display = 'none';
  document.getElementById('alarm-start-btn').style.display = 'block';
  document.getElementById('alarm-stop-btn').style.display = 'none';
}

// ===== 愛心放置系統 =====
let heartPlacementEnabled = true; // 是否啟用愛心放置

// 創建愛心元素
function createHeart(x, y) {
  if (!heartPlacementEnabled) return;

  const heart = document.createElement('div');
  heart.className = 'placed-heart';
  heart.textContent = '💖';
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';

  document.body.appendChild(heart);

  // 3秒後移除愛心
  setTimeout(() => {
    heart.remove();
  }, 3000);
}

// 監聽點擊事件來放置愛心
document.addEventListener('click', (e) => {
  // 如果點擊的是按鈕或其他互動元素，不放置愛心
  const isInteractive = e.target.closest('button, a, input, textarea, select, .info-panel, .character-animation');

  if (!isInteractive && heartPlacementEnabled) {
    createHeart(e.clientX, e.clientY);
  }
});

// ===== 為所有按鈕添加觸覺反饋 =====
function addButtonFeedbackToAll() {
  // 所有需要添加音效的按鈕 ID
  const buttonIds = [
    'leaderboard-toggle', 'feedback-toggle', 'music-toggle',
    'player-name-toggle', 'leaderboard-close', 'feedback-close',
    'wish-close', 'alarm-close',
    'save-username-btn', 'change-username-btn', 'feedback-submit-btn'
  ];

  buttonIds.forEach(id => {
    const button = document.getElementById(id);
    if (!button) return;

    // 為按鈕添加點擊音效
    button.addEventListener('click', function(e) {
      // 只播放音效和視覺反饋，不干擾原有功能
      if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
        SoundEffects.playButtonClickSound();
      }

      // 視覺反饋：放大動畫
      this.style.transform = 'scale(1.15)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);

      // 觸覺反饋：震動 (僅手機支援)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, { capture: true }); // 使用 capture 確保在其他事件之前執行
  });

  // 為所有 .btn 和 .battle-btn 類別的按鈕添加音效（通用處理）
  const allButtons = document.querySelectorAll('button:not([data-no-sound])');
  allButtons.forEach(button => {
    // 避免重複添加
    if (!button.dataset.soundAdded) {
      button.dataset.soundAdded = 'true';
      button.addEventListener('click', function() {
        if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
          SoundEffects.playButtonClickSound();
        }

        // 視覺反饋
        this.style.transform = 'scale(1.15)';
        setTimeout(() => {
          this.style.transform = '';
        }, 200);

        // 觸覺反饋
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, { capture: true });
    }
  });
}
