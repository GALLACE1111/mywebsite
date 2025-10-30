/**
 * Boss 移動軌跡系統
 * 在戰鬥開始後為 Boss 添加紅色移動軌跡效果
 */

// 軌跡粒子計數器（用於控制生成頻率）
let trailFrameCounter = 0;

/**
 * 創建軌跡粒子
 * @param {number} x - X 座標
 * @param {number} y - Y 座標
 */
function createTrailParticle(x, y) {
  const trail = document.createElement('div');
  trail.className = 'boss-trail-particle';
  trail.style.cssText = `
    position: fixed;
    left: ${x + 110}px;
    top: ${y + 110}px;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, rgba(220, 0, 0, 0.8) 0%, rgba(139, 0, 0, 0.4) 50%, transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    animation: trailFade 0.6s ease-out forwards;
  `;
  document.body.appendChild(trail);

  // 0.6秒後移除
  setTimeout(() => {
    trail.remove();
  }, 600);
}

/**
 * 更新 Boss 軌跡（在 animateBossMovement 中調用）
 * @param {number} x - Boss 當前 X 座標
 * @param {number} y - Boss 當前 Y 座標
 */
function updateBossTrail(x, y) {
  // 每 3 幀生成一個軌跡粒子（避免過於密集）
  trailFrameCounter++;
  if (trailFrameCounter >= 3) {
    createTrailParticle(x, y);
    trailFrameCounter = 0;
  }
}

// 添加軌跡動畫 CSS
if (!document.getElementById('boss-trail-animation')) {
  const style = document.createElement('style');
  style.id = 'boss-trail-animation';
  style.textContent = `
    @keyframes trailFade {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.3);
      }
    }

    .boss-trail-particle {
      box-shadow: 0 0 10px rgba(220, 0, 0, 0.6);
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ Boss 軌跡系統已載入');
