# 🎮 角色动画系统使用指南

完整的游戏角色动画解决方案，包含待机、走路、奔跑、跳跃四种动画状态。

## 📦 文件清单

### 精灵图（Sprite Sheets）
- `character_idle_sprite.png` - 待机动画 (8帧, 12 FPS)
- `character_walk_sprite.png` - 走路动画 (12帧, 24 FPS)
- `character_run_sprite.png` - 奔跑动画 (12帧, 24 FPS)
- `character_jump_sprite.png` - 跳跃动画 (30帧, 24 FPS)

### 配置文件
- `character_animations.json` - 动画配置数据（Lottie风格）

### 示例文件
- `animation_player.html` - 基础动画播放器
- `example_javascript.html` - **方法2：JavaScript Canvas 完整示例**
- `example_css.html` - **方法3：CSS Sprite 完整示例**
- `game_demo.html` - **完整游戏集成示例**

---

## 🚀 使用方法

### 方法 1：HTML 基础播放器

直接打开 `animation_player.html`，点击按钮预览动画效果。

```html
<!-- 最简单的使用方式 -->
<script src="animation_player.html"></script>
```

---

### 方法 2：JavaScript Canvas（推荐用于游戏）

**完整示例：** `example_javascript.html`

#### 2.1 基础使用

```javascript
// 1. 创建播放器
const canvas = document.getElementById('gameCanvas');
const player = new CharacterAnimationPlayer(canvas, 'character_animations.json');

// 2. 播放动画
player.playAnimation('run');   // 奔跑
player.playAnimation('jump');  // 跳跃
player.playAnimation('walk');  // 走路
player.playAnimation('idle');  // 待机

// 3. 控制播放
player.pause();                // 暂停
player.resume();               // 继续
player.stop();                 // 停止
player.setSpeed(2);            // 2倍速
```

#### 2.2 完整代码

```javascript
class CharacterAnimationPlayer {
    constructor(canvas, jsonPath) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1.0;

        this.init(jsonPath);
    }

    async init(jsonPath) {
        // 加载 JSON 配置
        const response = await fetch(jsonPath);
        this.animationData = await response.json();

        // 加载精灵图
        await this.loadAllSprites();

        // 开始动画循环
        this.startAnimationLoop();

        // 默认播放待机
        this.playAnimation('idle');
    }

    async loadAllSprites() {
        const promises = Object.entries(this.animationData.animations).map(
            async ([name, data]) => {
                const img = new Image();
                img.src = data.spriteSheet;
                await new Promise(resolve => img.onload = resolve);
                this.sprites[name] = img;
            }
        );
        await Promise.all(promises);
    }

    playAnimation(animName) {
        this.currentAnimation = animName;
        this.currentFrame = 0;
        this.isPlaying = true;
    }

    render() {
        const anim = this.animationData.animations[this.currentAnimation];
        const sprite = this.sprites[this.currentAnimation];

        // 计算当前帧在精灵图中的位置
        const col = this.currentFrame % anim.columns;
        const row = Math.floor(this.currentFrame / anim.columns);

        const sx = col * anim.frameWidth;
        const sy = row * anim.frameHeight;

        // 绘制
        this.ctx.drawImage(
            sprite,
            sx, sy, anim.frameWidth, anim.frameHeight,
            0, 0, this.canvas.width, this.canvas.height
        );
    }
}
```

#### 2.3 游戏中集成

```javascript
// 在游戏循环中使用
class Game {
    constructor() {
        this.player = new CharacterAnimationPlayer(canvas, 'character_animations.json');
    }

    update() {
        // 根据玩家输入切换动画
        if (this.isJumping) {
            this.player.playAnimation('jump');
        } else if (this.isRunning) {
            this.player.playAnimation('run');
        } else if (this.isWalking) {
            this.player.playAnimation('walk');
        } else {
            this.player.playAnimation('idle');
        }
    }
}
```

---

### 方法 3：CSS Sprite（纯CSS，性能最优）

**完整示例：** `example_css.html`

#### 3.1 CSS 代码

```css
/* 角色容器 */
.character {
    width: 256px;
    height: 256px;
    image-rendering: pixelated;  /* 保持像素清晰 */
    background-repeat: no-repeat;
}

/* 待机动画 - 8帧，横向排列 */
.character.idle {
    background-image: url('character_idle_sprite.png');
    background-size: 800% 100%;  /* 8列 = 800% */
    animation: idle-anim 0.667s steps(8) infinite;
}

@keyframes idle-anim {
    from { background-position: 0% 0; }
    to   { background-position: 100% 0; }
}

/* 奔跑动画 - 12帧，8列2行 */
.character.run {
    background-image: url('character_run_sprite.png');
    background-size: 800% 200%;  /* 8列2行 */
    animation: run-anim 0.5s steps(12) infinite;
}

@keyframes run-anim {
    /* 第1行：帧0-7 */
    0%     { background-position: 0% 0%; }
    66.67% { background-position: 100% 0%; }

    /* 第2行：帧8-11 */
    66.68% { background-position: 0% 100%; }
    100%   { background-position: 50% 100%; }
}

/* 跳跃动画 - 30帧，8列4行 */
.character.jump {
    background-image: url('character_jump_sprite.png');
    background-size: 800% 400%;  /* 8列4行 */
    animation: jump-anim 1.25s steps(30);  /* 不循环 */
}

@keyframes jump-anim {
    /* 第1行 */
    0%     { background-position: 0% 0%; }
    26.67% { background-position: 100% 0%; }

    /* 第2行 */
    26.68% { background-position: 0% 33.33%; }
    53.33% { background-position: 100% 33.33%; }

    /* 第3行 */
    53.34% { background-position: 0% 66.67%; }
    80%    { background-position: 100% 66.67%; }

    /* 第4行 */
    80.01% { background-position: 0% 100%; }
    100%   { background-position: 75% 100%; }
}
```

#### 3.2 HTML 使用

```html
<!-- 只需改变 class 即可切换动画 -->
<div class="character idle"></div>
<div class="character walk"></div>
<div class="character run"></div>
<div class="character jump"></div>
```

#### 3.3 JavaScript 切换

```javascript
// 方法1：直接设置 className
document.querySelector('.character').className = 'character run';

// 方法2：使用 classList
const char = document.querySelector('.character');
char.classList.remove('idle', 'walk', 'run', 'jump');
char.classList.add('run');

// 方法3：封装函数
function setCharacterAnimation(anim) {
    const character = document.querySelector('.character');
    const validAnims = ['idle', 'walk', 'run', 'jump'];

    validAnims.forEach(a => character.classList.remove(a));
    character.classList.add(anim);
}

setCharacterAnimation('run');
```

---

## 🎯 完整游戏示例

**完整示例：** `game_demo.html`

展示如何在实际游戏中集成动画系统：

- ✅ 根据玩家输入自动切换动画
- ✅ 移动、跳跃、奔跑的完整实现
- ✅ 角色翻转（左右方向）
- ✅ 物理系统（重力、碰撞）
- ✅ 键盘控制
- ✅ FPS 统计

### 控制说明

- **← →** 移动
- **Shift** 奔跑
- **Space** 跳跃
- **R** 重置位置

---

## 📐 计算公式

### background-size 计算

```
background-size: (列数 × 100)% (行数 × 100)%
```

示例：
- 8列1行 → `800% 100%`
- 8列2行 → `800% 200%`
- 8列4行 → `800% 400%`

### animation 时长计算

```
duration = (帧数 / FPS) 秒
```

示例：
- idle: 8帧 / 12 FPS = **0.667s**
- walk: 12帧 / 24 FPS = **0.5s**
- run: 12帧 / 24 FPS = **0.5s**
- jump: 30帧 / 24 FPS = **1.25s**

### keyframes 位置计算

对于多行布局：

```
第N行结束位置 = (N × 每行帧数 / 总帧数) × 100%
```

示例（12帧，8x2布局）：
- 第1行结束: 8/12 × 100% = **66.67%**
- 第2行结束: 12/12 × 100% = **100%**

---

## 📊 动画配置 (JSON)

`character_animations.json` 包含所有动画的元数据：

```json
{
  "version": "1.0.0",
  "name": "Character Animations",
  "meta": {
    "characterWidth": 1024,
    "characterHeight": 1024
  },
  "animations": {
    "idle": {
      "spriteSheet": "character_idle_sprite.png",
      "frameCount": 8,
      "fps": 12,
      "loop": true,
      "duration": 667
    },
    "run": {
      "spriteSheet": "character_run_sprite.png",
      "frameCount": 12,
      "fps": 24,
      "loop": true,
      "duration": 500
    }
  }
}
```

---

## ⚡ 性能优化建议

### CSS Sprite 方式（推荐）
- ✅ 纯 CSS，GPU 加速
- ✅ 零 JavaScript 开销
- ✅ 可同时显示多个角色
- ✅ 适合2D横版游戏

### JavaScript Canvas 方式
- ✅ 更灵活的控制
- ✅ 可编程的动画逻辑
- ✅ 适合复杂游戏
- ⚠️ 需要注意性能优化

---

## 🎨 自定义尺寸

所有动画都是 1024x1024 原始尺寸，可以缩放到任意大小：

```css
.character {
    width: 128px;   /* 小尺寸 */
    width: 256px;   /* 中等尺寸 */
    width: 512px;   /* 大尺寸 */
    width: 1024px;  /* 原始尺寸 */
}
```

---

## 🔧 常见问题

### Q: 动画看起来模糊？
A: 添加 `image-rendering: pixelated;` 保持像素艺术清晰。

### Q: 如何调整动画速度？
A: 修改 CSS `animation` 的 duration 值，或 JavaScript 中的 `setSpeed()` 方法。

### Q: 可以添加更多动画吗？
A: 可以！使用相同的脚本重新生成，或手动创建精灵图和 JSON 配置。

### Q: 奔跑和走路有什么区别？
A: 奔跑有更大的腿部摆动、身体前倾、更快的速度感。

---

## 📝 动画特征对比

| 动画 | 帧数 | FPS | 时长 | 循环 | 特征 |
|------|------|-----|------|------|------|
| **idle** | 8 | 12 | 0.67s | ✓ | 轻微呼吸效果 |
| **walk** | 12 | 24 | 0.50s | ✓ | 腿部交叉，手臂摆动 |
| **run** | 12 | 24 | 0.50s | ✓ | 身体前倾，大幅度摆动 |
| **jump** | 30 | 24 | 1.25s | ✗ | 蹲下→起跳→落地→恢复 |

---

## 🎓 学习资源

- `animation_player.html` - 从这里开始，熟悉动画效果
- `example_css.html` - 学习 CSS Sprite 技术
- `example_javascript.html` - 学习 Canvas 动画控制
- `game_demo.html` - 完整游戏集成案例

---

## 📜 许可

此动画系统为示例项目，可自由使用和修改。

---

**Made with ❤️ using Python + Pillow + JavaScript**
