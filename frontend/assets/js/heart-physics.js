/**
 * 💖 統一愛心物理系統
 * 使用 Matter.js 實現真實的物理碰撞效果
 *
 * 功能：
 * - Boss擊敗後的愛心雨
 * - 點擊稱號的愛心噴發
 * - 與UI元素的碰撞
 * - 愛心永久堆積
 */

class HeartPhysicsSystem {
    constructor() {
        this.engine = null;
        this.world = null;
        this.hearts = [];
        this.maxHearts = 200; // 最大愛心數量
        this.uiColliders = []; // UI元素的碰撞體
        this.isInitialized = false;

        // 物理參數
        this.gravity = 0.8;
        this.heartSize = 30;
        this.restitution = 0.6; // 彈性（0-1）
        this.friction = 0.3;

        this.init();
    }

    /**
     * 初始化物理引擎
     */
    init() {
        if (this.isInitialized) return;

        console.log('💖 初始化愛心物理系統...');

        // 檢查 Matter.js 是否載入
        if (typeof Matter === 'undefined') {
            console.error('❌ Matter.js 未載入！');
            return;
        }

        // 創建引擎
        this.engine = Matter.Engine.create({
            gravity: { x: 0, y: this.gravity }
        });

        this.world = this.engine.world;

        // 創建邊界
        this.createBoundaries();

        // 創建UI碰撞體
        this.createUIColliders();

        // 啟動渲染循環
        this.startRenderLoop();

        this.isInitialized = true;
        console.log('✅ 愛心物理系統初始化完成');
    }

    /**
     * 創建邊界（地板和牆壁）
     */
    createBoundaries() {
        const { Bodies, World } = Matter;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 地板
        const ground = Bodies.rectangle(
            width / 2,
            height + 25,
            width * 2,
            50,
            {
                isStatic: true,
                label: 'ground',
                friction: this.friction,
                restitution: 0.3
            }
        );

        // 左牆
        const leftWall = Bodies.rectangle(
            -25,
            height / 2,
            50,
            height * 2,
            {
                isStatic: true,
                label: 'leftWall'
            }
        );

        // 右牆
        const rightWall = Bodies.rectangle(
            width + 25,
            height / 2,
            50,
            height * 2,
            {
                isStatic: true,
                label: 'rightWall'
            }
        );

        World.add(this.world, [ground, leftWall, rightWall]);

        console.log('✅ 物理邊界已創建');
    }

    /**
     * 為UI元素創建碰撞體
     */
    createUIColliders() {
        // 選取需要碰撞的UI元素
        const uiElements = [
            { selector: '.side-leaderboard', padding: 5 },
            { selector: '.info-panel', padding: 5 },
            { selector: '.container', padding: 10 },
            { selector: '#global-announcement', padding: 0 },
            { selector: '.time-period-display', padding: 3 },
            { selector: '.volume-control-panel', padding: 3 }
        ];

        uiElements.forEach(({ selector, padding }) => {
            const element = document.querySelector(selector);
            if (!element || element.style.display === 'none') return;

            this.addColliderForElement(element, padding);
        });

        console.log(`✅ 已創建 ${this.uiColliders.length} 個UI碰撞體`);
    }

    /**
     * 為單個元素添加碰撞體
     */
    addColliderForElement(element, padding = 5) {
        const rect = element.getBoundingClientRect();
        const { Bodies, World } = Matter;

        const collider = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width + padding * 2,
            rect.height + padding * 2,
            {
                isStatic: true,
                label: `ui-${element.className}`,
                friction: this.friction,
                restitution: 0.4
            }
        );

        World.add(this.world, collider);
        this.uiColliders.push({ element, body: collider });
    }

    /**
     * 更新UI碰撞體位置（當UI移動時調用）
     */
    updateUIColliders() {
        this.uiColliders.forEach(({ element, body }) => {
            const rect = element.getBoundingClientRect();
            Matter.Body.setPosition(body, {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        });
    }

    /**
     * 創建愛心物理體
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} vx - X方向速度
     * @param {number} vy - Y方向速度
     */
    createHeartBody(x, y, vx = 0, vy = 0) {
        if (this.hearts.length >= this.maxHearts) {
            console.warn('⚠️ 已達到最大愛心數量');
            return null;
        }

        const { Bodies, World, Body } = Matter;

        // 創建圓形物理體（愛心形狀用DOM模擬）
        const radius = this.heartSize / 2;
        const heartBody = Bodies.circle(x, y, radius, {
            restitution: this.restitution,
            friction: this.friction,
            density: 0.04,
            label: 'heart'
        });

        // 設置初始速度
        Body.setVelocity(heartBody, { x: vx, y: vy });

        // 添加到世界
        World.add(this.world, heartBody);

        // 創建對應的DOM元素
        const heartElement = this.createHeartElement(heartBody);

        // 存儲
        this.hearts.push({ body: heartBody, element: heartElement });

        return heartBody;
    }

    /**
     * 創建愛心DOM元素
     */
    createHeartElement(body) {
        const heart = document.createElement('div');
        heart.className = 'physics-heart';
        heart.textContent = '💖';
        heart.style.fontSize = this.heartSize + 'px';

        document.body.appendChild(heart);

        return heart;
    }

    /**
     * 從上方掉落愛心（Boss擊敗用）
     * @param {number} x - X座標（可選，隨機）
     */
    addHeartFromAbove(x = null) {
        if (!this.isInitialized) {
            console.warn('⚠️ 物理系統未初始化');
            return;
        }

        const posX = x !== null ? x : Math.random() * window.innerWidth;
        const posY = -50; // 從螢幕上方
        const velocityX = (Math.random() - 0.5) * 2; // 輕微的水平速度
        const velocityY = Math.random() * 2 + 1; // 向下的速度

        this.createHeartBody(posX, posY, velocityX, velocityY);
    }

    /**
     * 愛心噴發效果（點擊稱號用）
     * @param {number} x - 中心X座標
     * @param {number} y - 中心Y座標
     * @param {number} count - 愛心數量
     */
    addHeartBurst(x, y, count = 12) {
        if (!this.isInitialized) {
            console.warn('⚠️ 物理系統未初始化');
            return;
        }

        for (let i = 0; i < count; i++) {
            // 圓形分佈
            const angle = (i / count) * Math.PI * 2;
            const speed = 10 + Math.random() * 5;

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // 輕微的位置偏移
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;

            this.createHeartBody(x + offsetX, y + offsetY, vx, vy);
        }

        console.log(`💖 噴發了 ${count} 個愛心`);
    }

    /**
     * 渲染循環
     */
    startRenderLoop() {
        const { Engine } = Matter;

        const loop = () => {
            // 更新物理引擎
            Engine.update(this.engine, 1000 / 60);

            // 同步DOM元素位置
            this.hearts.forEach(({ body, element }) => {
                if (!element || !element.parentNode) return;

                element.style.left = (body.position.x - this.heartSize / 2) + 'px';
                element.style.top = (body.position.y - this.heartSize / 2) + 'px';
                element.style.transform = `rotate(${body.angle}rad)`;
            });

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
        console.log('✅ 物理渲染循環已啟動');
    }

    /**
     * 獲取當前愛心數量
     */
    getHeartCount() {
        return this.hearts.length;
    }

    /**
     * 清除所有愛心
     */
    clearAll() {
        const { World } = Matter;

        this.hearts.forEach(({ body, element }) => {
            World.remove(this.world, body);
            if (element && element.parentNode) {
                element.remove();
            }
        });

        this.hearts = [];
        console.log('🗑️ 已清除所有愛心');
    }

    /**
     * 視窗大小改變時更新邊界
     */
    handleResize() {
        // 重新創建邊界
        const { World } = Matter;

        // 移除舊邊界
        const oldBoundaries = Matter.Composite.allBodies(this.world).filter(body =>
            body.label === 'ground' || body.label === 'leftWall' || body.label === 'rightWall'
        );
        oldBoundaries.forEach(body => World.remove(this.world, body));

        // 創建新邊界
        this.createBoundaries();

        // 更新UI碰撞體
        this.updateUIColliders();

        console.log('🔄 物理邊界已更新');
    }
}

// 創建全局實例
window.heartPhysics = new HeartPhysicsSystem();

// 監聽視窗大小改變
window.addEventListener('resize', () => {
    if (window.heartPhysics) {
        window.heartPhysics.handleResize();
    }
});

console.log('💖 愛心物理系統已載入');
