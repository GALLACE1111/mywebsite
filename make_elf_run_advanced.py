from PIL import Image, ImageDraw
import math
import sys
import io

# 設置輸出編碼為 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print("=" * 60)
print("Creating Advanced Running Animation")
print("=" * 60)

# === 載入角色原圖 ===
print("\n[1/6] Loading character image...")
base = Image.open("images/character.png").convert("RGBA")
w, h = base.size
print(f"Image size: {w}x{h}")

# === 分析角色邊界 ===
pixels = base.load()
min_x, min_y = w, h
max_x, max_y = 0, 0

for y in range(h):
    for x in range(w):
        if pixels[x, y][3] > 0:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

char_width = max_x - min_x
char_height = max_y - min_y
center_x = (min_x + max_x) // 2
center_y = (min_y + max_y) // 2

print(f"Character bounds: ({min_x}, {min_y}) to ({max_x}, {max_y})")
print(f"Character size: {char_width}x{char_height}")
print(f"Center: ({center_x}, {center_y})")

# === 跑步動畫參數 ===
print("\n[2/6] Configuring advanced running parameters...")
FRAME_COUNT = 12
STEP_CYCLE = FRAME_COUNT // 2  # 6 幀一個步伐週期

print(f"Total frames: {FRAME_COUNT}")
print(f"Step cycle: {STEP_CYCLE} frames")

# === 生成動畫幀 ===
print("\n[3/6] Generating {FRAME_COUNT} frames with transform effects...")
frames = []

for i in range(FRAME_COUNT):
    # 創建較大的畫布以容納變形
    canvas = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))

    # === 1. 計算跑步週期位置 (0-1) ===
    cycle_pos = (i % STEP_CYCLE) / STEP_CYCLE  # 0.0 到 1.0

    # === 2. 垂直運動（跑步彈跳）===
    # 使用 sin² 創建快速上升、緩慢下降的效果
    bounce_phase = math.sin(cycle_pos * math.pi * 2)
    bounce = int(bounce_phase * bounce_phase * 8)  # 0-8 像素彈跳

    # === 3. 著地時的垂直壓縮效果 ===
    # 著地時（bounce 最小）角色會被「壓扁」一點
    compression = 1.0 + (bounce_phase * 0.05)  # 0.95-1.05 的縮放

    # === 4. 水平重心移動（左右腳交替）===
    sway = int(math.sin(cycle_pos * math.pi * 2) * 4)  # ±4 像素左右搖擺

    # === 5. 身體前傾角度（跑步時向前傾）===
    lean_angle = math.sin(cycle_pos * math.pi * 2) * 0.08  # ±4.5 度

    # === 6. 應用仿射變換 ===
    # 計算變換矩陣（傾斜 + 壓縮）
    cos_a = math.cos(lean_angle)
    sin_a = math.sin(lean_angle)

    # 創建變換矩陣：先移到原點，變換，再移回
    # 格式：(a, b, c, d, e, f) 代表 [a b c] [x]   [ax+by+c]
    #                             [d e f] [y] = [dx+ey+f]
    #                             [0 0 1] [1]   [   1   ]

    # 簡化版：只做 Y 軸壓縮和輕微傾斜
    transformed = base.transform(
        base.size,
        Image.AFFINE,
        (1, lean_angle * 0.5, 0, 0, compression, 0),
        resample=Image.BICUBIC
    )

    # === 7. 計算最終位置 ===
    final_x = 20 + sway  # 水平位移
    final_y = 20 - bounce  # 垂直位移（向上彈跳為負）

    # 貼上變形後的角色
    canvas.paste(transformed, (final_x, final_y), transformed)

    # === 8. 添加動態魔法粒子 ===
    draw = ImageDraw.Draw(canvas)

    # 魔法光球基礎位置（跟隨手臂）
    magic_base_x = 330 + final_x + int(math.sin(cycle_pos * math.pi * 2 + math.pi) * 5)
    magic_base_y = 260 + final_y - bounce // 2

    # 繪製8個魔法粒子
    for j in range(8):
        # 粒子隨著跑步週期旋轉飄動
        angle = (cycle_pos * math.pi * 2) + (j * math.pi / 4)
        radius = 15 + math.sin(i * 0.3 + j) * 5

        px = magic_base_x + int(math.cos(angle) * radius)
        py = magic_base_y + int(math.sin(angle) * radius) + int(math.sin(i * 0.4 + j) * 3)

        # 交替金色和藍色
        if (i + j) % 4 < 2:
            color = (255, 215, 0, 200)  # 金色
        else:
            color = (100, 180, 255, 200)  # 藍色

        # 繪製粒子（大小隨機變化）
        size = 3 if (i + j) % 3 == 0 else 2
        draw.ellipse((px, py, px + size, py + size), fill=color)

    # === 9. 裁剪回原始尺寸 ===
    frame = canvas.crop((20, 20, w + 20, h + 20))
    frames.append(frame)

    print(f"  Frame {i+1}/{FRAME_COUNT} | Bounce: {bounce:+3d}px | Sway: {sway:+2d}px | Compress: {compression:.2f}x")

# === 儲存 GIF ===
print("\n[4/6] Saving animated GIF...")
frames[0].save(
    "images/elf_run_advanced.gif",
    save_all=True,
    append_images=frames[1:],
    duration=75,  # ~13fps
    loop=0,
    transparency=0,
    disposal=2
)
print("OK - elf_run_advanced.gif saved!")

# === 儲存 Spritesheet ===
print("\n[5/6] Creating spritesheet...")
sheet_width = w * FRAME_COUNT
spritesheet = Image.new("RGBA", (sheet_width, h), (0, 0, 0, 0))

for idx, frame in enumerate(frames):
    spritesheet.paste(frame, (idx * w, 0), frame)

spritesheet.save("images/elf_run_advanced_spritesheet.png")
print("OK - elf_run_advanced_spritesheet.png saved!")

# === Done ===
print("\n[6/6] Animation complete!")
print("=" * 60)
print("Advanced Running Animation Generated Successfully!")
print("=" * 60)
print("\nGenerated files:")
print("  - images/elf_run_advanced.gif")
print("  - images/elf_run_advanced_spritesheet.png")
print("\nAnimation features:")
print("  - Vertical bounce (0-8px)")
print("  - Landing compression (0.95-1.05x)")
print("  - Horizontal sway (±4px)")
print("  - Dynamic body lean (±4.5 degrees)")
print("  - Magic particles rotation")
print("  - 12 frames smooth loop (13fps)")
print("\nReady to deploy!")
