// ===== 放鬆驚喜系統 =====
let relaxationInterval = null;

const relaxationSurprises = [
  { emoji: '🌸', message: '櫻花飄落好美呢' },
  { emoji: '🦋', message: '蝴蝶輕輕飛過' },
  { emoji: '🌈', message: '雨後的彩虹出現了' },
  { emoji: '✨', message: '星光閃閃發亮' },
  { emoji: '💫', message: '流星劃過天際' },
  { emoji: '🌙', message: '月光溫柔灑落' },
  { emoji: '☀️', message: '陽光暖暖的' },
  { emoji: '⭐', message: '小星星在眨眼' },
  { emoji: '💖', message: '送你一顆愛心' },
  { emoji: '🌻', message: '向日葵朝著陽光' },
  { emoji: '🌷', message: '鬱金香綻放了' },
  { emoji: '🎵', message: '聽見美妙的旋律' },
  { emoji: '🌠', message: '對著流星許願吧' },
  { emoji: '☁️', message: '白雲悠悠飄過' },
  { emoji: '🦄', message: '發現夢幻獨角獸' },
  { emoji: '🐰', message: '小兔子蹦蹦跳' },
  { emoji: '🎁', message: '收到神秘禮物' },
  { emoji: '🎉', message: '一起歡樂慶祝' },
  { emoji: '🍰', message: '香甜的蛋糕' },
  { emoji: '🎨', message: '繽紛色彩好美' }
];

// 儲存最近的驚喜位置，避免太近
let recentSurprisePositions = [];
// 儲存最近使用的訊息索引，避免重複
let recentSurpriseIndices = [];

function triggerRelaxationSurprise() {
  console.log('🌸 觸發可愛訊息...');

  // 戰鬥中或月球世界內部停止訊息
  if (typeof isBossBattle !== 'undefined' && isBossBattle) {
    console.log('⚔️ 戰鬥中，停止可愛訊息');
    return;
  }
  if (typeof isInMoonWorld !== 'undefined' && isInMoonWorld) {
    console.log('🌙 在月球世界中，停止可愛訊息');
    return;
  }

  // 選擇未重複的訊息
  let surpriseIndex;
  let attempts = 0;
  do {
    surpriseIndex = Math.floor(Math.random() * relaxationSurprises.length);
    attempts++;
  } while (recentSurpriseIndices.includes(surpriseIndex) && attempts < 10);

  // 記錄使用過的訊息（最多記錄5個）
  recentSurpriseIndices.push(surpriseIndex);
  if (recentSurpriseIndices.length > 5) {
    recentSurpriseIndices.shift();
  }

  const surprise = relaxationSurprises[surpriseIndex];
  console.log('  ✨ 選中訊息:', surprise.emoji, surprise.message);

  const surpriseElement = document.createElement('div');
  surpriseElement.className = 'relaxation-surprise';
  surpriseElement.textContent = surprise.emoji;

  // 生成位置，確保與最近的位置保持距離
  let left, top;
  attempts = 0; // 重置 attempts 用於位置選擇
  const minDistance = 20; // 最小距離 20%

  do {
    left = Math.random() * 85 + 5;
    top = Math.random() * 50 + 5;
    attempts++;

    // 檢查是否與最近的位置太近
    const tooClose = recentSurprisePositions.some(pos => {
      const distance = Math.sqrt(Math.pow(pos.left - left, 2) + Math.pow(pos.top - top, 2));
      return distance < minDistance;
    });

    if (!tooClose || attempts > 10) break; // 最多嘗試10次
  } while (true);

  surpriseElement.style.left = left + '%';
  surpriseElement.style.top = top + '%';
  document.body.appendChild(surpriseElement);

  // 記錄位置
  recentSurprisePositions.push({ left, top });
  if (recentSurprisePositions.length > 5) {
    recentSurprisePositions.shift(); // 只保留最近5個位置
  }

  // 顯示訊息
  setTimeout(() => {
    const messageElement = document.createElement('div');
    messageElement.className = 'surprise-message';
    messageElement.textContent = surprise.message;
    messageElement.style.left = surpriseElement.style.left;
    messageElement.style.top = (parseFloat(surpriseElement.style.top) + 10) + '%';
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 1500); // 快速消散
  }, 500);

  setTimeout(() => {
    surpriseElement.remove();
  }, 2500); // 快速消散
}

function startRelaxationMode() {
  console.log('🌸 啟動放鬆驚喜模式（可愛訊息系統）');

  if (relaxationInterval) {
    console.log('  ⚠️ 清除舊的計時器');
    clearInterval(relaxationInterval);
  }

  // 立即執行第一組訊息（2個，延遲出現）
  console.log('🚀 立即執行第一組可愛訊息');
  triggerRelaxationSurprise();
  setTimeout(() => {
    triggerRelaxationSurprise();
  }, 500); // 第二個訊息延遲0.5秒出現

  // 每1秒跳出2個訊息（有延遲）
  relaxationInterval = setInterval(() => {
    console.log('⏰ 1秒計時器觸發，跳出第一組可愛訊息');
    triggerRelaxationSurprise();

    // 第二個訊息延遲0.5秒
    setTimeout(() => {
      console.log('  ⏰ 延遲0.5秒，跳出第二個可愛訊息');
      triggerRelaxationSurprise();
    }, 500);
  }, 1000); // 每1秒觸發一次（高頻率）

  console.log('✅ 放鬆驚喜模式已設定：每1秒跳出2個訊息（延遲0.5秒）');
}

// ===== 月球傳送門系統 =====
function enterMoonDimension() {
  // 播放傳送音效
  playPortalSound();

  // 顯示傳送動畫
  const moonElement = document.querySelector('.info-panel');
  moonElement.classList.add('portal-active');

  // 顯示確認彈窗（減少延遲）
  setTimeout(() => {
    moonElement.classList.remove('portal-active');
    // 調用月球確認對話框
    if (typeof showMoonConfirmDialog === 'function') {
      showMoonConfirmDialog();
    }
  }, 150); // 優化：從300ms減少到150ms，提升反應速度
}

function showMoonPortalDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog moon-portal-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content">
      <h2 class="battle-title">發現月球傳送門</h2>
      <p class="victory-message">這是一個通往未知空想世界的傳送門<br>是否要進入月球維度？</p>
      <div class="battle-buttons">
        <button class="battle-btn battle-yes" style="background: linear-gradient(135deg, #4CAF50, #45a049);">
          <span>進入月球</span>
        </button>
        <button class="battle-btn battle-no" style="background: linear-gradient(135deg, #f44336, #da190b);">
          <span>繼續探索</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  setTimeout(() => {
    dialog.classList.add('show');
  }, 10);

  const yesBtn = dialog.querySelector('.battle-yes');
  const noBtn = dialog.querySelector('.battle-no');

  yesBtn.addEventListener('click', () => {
    if (typeof triggerButtonFeedback === 'function') {
      triggerButtonFeedback(yesBtn);
    }
    if (typeof closeBattleDialog === 'function') {
      closeBattleDialog(dialog);
    }
    // 進入月球世界
    if (typeof enterMoonWorld === 'function') {
      enterMoonWorld();
    }
  });

  noBtn.addEventListener('click', () => {
    if (typeof triggerButtonFeedback === 'function') {
      triggerButtonFeedback(noBtn);
    }
    if (typeof closeBattleDialog === 'function') {
      closeBattleDialog(dialog);
    }
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      if (typeof closeBattleDialog === 'function') {
        closeBattleDialog(dialog);
      }
    }
  });
}

// 月球世界內部的對話框（詩意版本）
function showMoonWorldInnerDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'battle-dialog moon-portal-dialog';
  dialog.innerHTML = `
    <div class="battle-dialog-content">
      <h2 class="battle-title">月之彼岸</h2>
      <p class="victory-message" style="line-height: 1.8; font-size: 16px;">
        踏上這片未知的月面，<br>
        記憶、幻象、光與影交織成新的秩序。<br>
        這裡沒有規則，只有意識在流動。<br><br>
        準備好啟程了嗎？你的故事，從此展開。
      </p>
      <div class="battle-buttons">
        <button class="battle-btn battle-continue" style="background: linear-gradient(135deg, #9c27b0, #7b1fa2);">
          <span>繼續漂流</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  setTimeout(() => {
    dialog.classList.add('show');
  }, 10);

  const continueBtn = dialog.querySelector('.battle-continue');
  continueBtn.addEventListener('click', () => {
    if (typeof triggerButtonFeedback === 'function') {
      triggerButtonFeedback(continueBtn);
    }
    if (typeof closeBattleDialog === 'function') {
      closeBattleDialog(dialog);
    }
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      if (typeof closeBattleDialog === 'function') {
        closeBattleDialog(dialog);
      }
    }
  });
}

function playPortalSound() {
  if (typeof audioContext === 'undefined') {
    console.warn('audioContext not available');
    return;
  }

  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator1.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator1.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 1);
  oscillator2.frequency.setValueAtTime(220, audioContext.currentTime);
  oscillator2.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 1);

  oscillator1.type = 'sine';
  oscillator2.type = 'sine';

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

  oscillator1.start(audioContext.currentTime);
  oscillator2.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 1);
  oscillator2.stop(audioContext.currentTime + 1);
}

function initMoonPortal() {
  console.log('🌙 開始初始化月球傳送門系統...');

  const moonElement = document.querySelector('.info-panel');
  console.log('  - info-panel 元素:', moonElement ? '存在' : '不存在');

  if (!moonElement) {
    console.error('❌ 找不到 info-panel 元素，停止初始化月球傳送門');
    return;
  }

  let moonClickCount = 0;
  let moonClickTimer = null;

  moonElement.addEventListener('click', (e) => {
    console.log('🌙 月亮時鐘被點擊，點擊次數:', moonClickCount + 1);

    // 每次點擊都播放音效
    if (typeof SoundEffects !== 'undefined' && SoundEffects.playButtonClickSound) {
      SoundEffects.playButtonClickSound();
      console.log('🔊 播放可愛點擊音效');
    } else {
      console.warn('⚠️ SoundEffects 未定義');
    }

    // 戰鬥中不允許進入
    if (typeof isBossBattle !== 'undefined' && isBossBattle) {
      console.log('⚔️ 戰鬥中，無法進入月球傳送門');
      return;
    }

    moonClickCount++;

    if (moonClickCount === 1) {
      console.log('👆 第一次點擊');
      moonClickTimer = setTimeout(() => {
        moonClickCount = 0;
        console.log('⏰ 點擊計時器重置');
      }, 200); // 優化：從300ms減少到200ms，提升反應速度
    } else if (moonClickCount === 2) {
      console.log('👆👆 雙擊偵測！');
      clearTimeout(moonClickTimer);
      moonClickCount = 0;

      // 隱藏提示（用戶已知道功能）
      const moonHint = document.getElementById('moonHint');
      if (moonHint) {
        moonHint.classList.add('hidden');
        localStorage.setItem('moonHintSeen', 'true');
      }

      // 檢查是否已在月球世界內部
      if (typeof isInMoonWorld !== 'undefined' && isInMoonWorld) {
        console.log('🌙 已在月球世界內部，顯示詩意對話框');
        // 在月球世界內部，顯示詩意對話框
        showMoonWorldInnerDialog();
      } else {
        console.log('🏠 在主頁，顯示進入月球選項');
        // 在主頁，顯示進入選項
        enterMoonDimension();
      }
    }
  });

  console.log('✅ 月球傳送門事件監聽器已設置');
}

// ===== 初始化所有新功能 =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Additional scripts DOMContentLoaded event fired');
  console.log('📊 檢查核心函數是否存在：');
  console.log('  - triggerButtonFeedback:', typeof triggerButtonFeedback);
  console.log('  - closeBattleDialog:', typeof closeBattleDialog);
  console.log('  - enterMoonWorld:', typeof enterMoonWorld);
  console.log('  - SoundEffects:', typeof SoundEffects);
  console.log('  - getTopRankings:', typeof getTopRankings);
  console.log('  - isBossBattle:', typeof isBossBattle);
  console.log('  - isInMoonWorld:', typeof isInMoonWorld);
  console.log('  - audioContext:', typeof audioContext);

  // 啟動放鬆驚喜
  try {
    console.log('🌸 開始啟動放鬆驚喜系統...');
    startRelaxationMode();
    console.log('✅ 放鬆驚喜系統已啟動');
  } catch (e) {
    console.error('❌ 放鬆驚喜系統啟動失敗:', e);
    console.error('錯誤堆疊:', e.stack);
  }

  // 初始化月球傳送門
  try {
    console.log('🌙 開始初始化月球傳送門...');
    const moonElement = document.querySelector('.info-panel');
    console.log('  - info-panel 元素:', moonElement ? '存在' : '不存在');

    initMoonPortal();
    console.log('✅ 月球傳送門已初始化');
  } catch (e) {
    console.error('❌ 月球傳送門初始化失敗:', e);
    console.error('錯誤堆疊:', e.stack);
  }

  // 檢查用戶是否已看過時鐘提示
  try {
    const moonHintSeen = localStorage.getItem('moonHintSeen');
    const moonHint = document.getElementById('moonHint');
    if (moonHintSeen === 'true' && moonHint) {
      moonHint.classList.add('hidden');
      console.log('🌙 用戶已看過時鐘提示，隱藏提示');
    }
  } catch (e) {
    console.error('❌ 檢查時鐘提示狀態失敗:', e);
  }

  // 初始化名稱設定提示系統
  try {
    console.log('👤 開始初始化名稱設定提示...');
    const nameHint = document.getElementById('nameHint');
    const playerNameBtn = document.getElementById('player-name-toggle');

    // 檢查是否已設定名稱
    const checkAndUpdateNameHint = () => {
      if (typeof getCurrentUsername === 'function') {
        const currentUsername = getCurrentUsername();
        if (currentUsername && nameHint) {
          nameHint.classList.add('hidden');
          console.log('👤 用戶已設定名稱，隱藏提示');
        } else if (!currentUsername && nameHint) {
          nameHint.classList.remove('hidden');
          console.log('👤 用戶未設定名稱，顯示提示');
        }
      }
    };

    // 點擊名稱提示時打開玩家名稱設定
    if (nameHint) {
      nameHint.addEventListener('click', () => {
        console.log('👤 名稱提示被點擊');
        if (playerNameBtn) {
          playerNameBtn.click();
        }
      });
    }

    // 初始檢查
    checkAndUpdateNameHint();

    // 定期檢查（每5秒檢查一次，確保即時更新）
    setInterval(checkAndUpdateNameHint, 5000);

    console.log('✅ 名稱設定提示系統已初始化');
  } catch (e) {
    console.error('❌ 名稱設定提示初始化失敗:', e);
  }

  console.log('✅ All additional features initialized!');
});
