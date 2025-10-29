/**
 * 血液粒子系統
 * - Boss爆走後的移動軌跡效果
 * - 受傷時的噴濺效果
 */

// 血液粒子陣列
const bloodParticles = [];
const MAX_BLOOD_PARTICLES = 200; // 最大粒子數量限制

/**
 * 血液軌跡粒子類別
 */
class BloodTrailParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4; // 4-12px
        this.opacity = 0.8;
        this.fadeSpeed = 0.015; // 淡出速度
        this.gravity = Math.random() * 0.3 + 0.1; // 下墜效果
        this.velocityY = Math.random() * 1 - 0.5;
    }

    update() {
        this.opacity -= this.fadeSpeed;
        this.y += this.velocityY;
        this.velocityY += this.gravity; // 重力加速
        this.size *= 0.99; // 逐漸縮小
    }

    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // 紅色漸變
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, 'rgba(139, 0, 0, 1)'); // 深紅
        gradient.addColorStop(0.5, 'rgba(178, 34, 34, 0.8)'); // 火磚紅
        gradient.addColorStop(1, 'rgba(220, 20, 60, 0)'); // 緋紅

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0 || this.size <= 0.5;
    }
}

/**
 * 血液噴濺粒子類別
 */
class BloodSplatterParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 5; // 5-15px
        this.opacity = 1.0;
        this.fadeSpeed = 0.02;

        // 隨機方向噴濺
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3; // 3-11px/frame
        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed - 2; // 向上噴

        this.gravity = 0.4; // 重力
        this.damping = 0.98; // 阻尼
    }

    update() {
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 應用重力和阻尼
        this.velocityY += this.gravity;
        this.velocityX *= this.damping;
        this.velocityY *= this.damping;

        // 淡出
        this.opacity -= this.fadeSpeed;
        this.size *= 0.98; // 逐漸縮小
    }

    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // 血紅色
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, 'rgba(139, 0, 0, 1)');
        gradient.addColorStop(0.4, 'rgba(178, 34, 34, 0.9)');
        gradient.addColorStop(1, 'rgba(220, 20, 60, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 添加一些血滴效果
        if (Math.random() < 0.3) {
            ctx.fillStyle = `rgba(139, 0, 0, ${this.opacity * 0.6})`;
            ctx.beginPath();
            ctx.arc(
                this.x + (Math.random() - 0.5) * this.size,
                this.y + (Math.random() - 0.5) * this.size,
                this.size * 0.3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0 || this.size <= 0.5;
    }
}

/**
 * 創建血液移動軌跡
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - 粒子數量
 */
function createBloodTrail(x, y, count = 5) {
    // 檢查粒子數量限制
    if (bloodParticles.length >= MAX_BLOOD_PARTICLES) {
        return; // 達到上限，不再創建新粒子
    }

    const actualCount = Math.min(count, MAX_BLOOD_PARTICLES - bloodParticles.length);
    for (let i = 0; i < actualCount; i++) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        bloodParticles.push(new BloodTrailParticle(x + offsetX, y + offsetY));
    }
}

/**
 * 創建血液噴濺效果
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - 粒子數量
 */
function createBloodSplatter(x, y, count = 15) {
    // 檢查粒子數量限制
    if (bloodParticles.length >= MAX_BLOOD_PARTICLES) {
        return; // 達到上限，不再創建新粒子
    }

    const actualCount = Math.min(count, MAX_BLOOD_PARTICLES - bloodParticles.length);
    for (let i = 0; i < actualCount; i++) {
        bloodParticles.push(new BloodSplatterParticle(x, y));
    }
}

/**
 * 更新並繪製所有血液粒子
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 */
function updateAndDrawBloodParticles(ctx) {
    // 反向遍歷以安全刪除
    for (let i = bloodParticles.length - 1; i >= 0; i--) {
        const particle = bloodParticles[i];
        particle.update();
        particle.draw(ctx);

        if (particle.isDead()) {
            bloodParticles.splice(i, 1);
        }
    }
}

/**
 * 清除所有血液粒子
 */
function clearBloodParticles() {
    bloodParticles.length = 0;
}

// 導出到全局
window.bloodParticles = bloodParticles;
window.createBloodTrail = createBloodTrail;
window.createBloodSplatter = createBloodSplatter;
window.updateAndDrawBloodParticles = updateAndDrawBloodParticles;
window.clearBloodParticles = clearBloodParticles;

console.log('🩸 血液粒子系統已載入');
