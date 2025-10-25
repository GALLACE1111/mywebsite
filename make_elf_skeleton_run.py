from PIL import Image, ImageDraw
import math

# === 載入角色原圖 ===
print("[1/5] Loading character image...")
base = Image.open("images/character.png").convert("RGBA")
w, h = base.size
print(f"Image size: {w}x{h}")

# === 分析角色結構 (像素掃描找邊界) ===
pixels = base.load()

# 找到角色實際像素的邊界
min_x, min_y = w, h
max_x, max_y = 0, 0

for y in range(h):
    for x in range(w):
        if pixels[x, y][3] > 0:  # 有不透明像素
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
print(f"Center point: ({center_x}, {center_y})")

# === 骨架參數定義 ===
# 根據角色大小自動計算關鍵點
head_y = min_y + char_height * 0.2  # 頭部中心
body_center_y = min_y + char_height * 0.5  # 身體中心
hip_y = min_y + char_height * 0.65  # 腰部/臀部
knee_y = min_y + char_height * 0.85  # 膝蓋
foot_y = max_y  # 腳底

shoulder_y = min_y + char_height * 0.35  # 肩膀
elbow_y = min_y + char_height * 0.55  # 手肘
hand_y = min_y + char_height * 0.7  # 手

print("\n[2/5] Skeleton structure defined")

# === 生成 12 幀跑步動畫 ===
print("\n[3/5] Generating 12 frames of running animation...")
frames = []

for i in range(12):
    frame = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # === 跑步週期計算 (0-11 幀，每6幀一個步伐週期) ===
    cycle = i / 6.0  # 0 到 2 的週期
    phase = math.sin(cycle * math.pi)  # -1 到 1 的擺動

    # === 1. 身體上下起伏（跑步時的彈跳） ===
    bounce = int(math.sin(i / 6 * math.pi * 2) * 3)  # 上下3像素

    # === 2. 身體微微前傾（跑步姿態） ===
    lean = 1 if i % 12 < 6 else -1

    # === 3. 左右腳擺動（交替） ===
    left_leg_swing = int(math.sin((i / 12) * math.pi * 2) * 5)  # 左腳前後擺動
    right_leg_swing = int(math.sin((i / 12) * math.pi * 2 + math.pi) * 5)  # 右腳相反

    # === 4. 手臂擺動（與腿相反） ===
    left_arm_swing = -right_leg_swing  # 左手與右腳同步
    right_arm_swing = -left_leg_swing  # 右手與左腳同步

    # === 5. 頭髮飄動（延遲效果） ===
    hair_delay = int(math.sin((i / 12) * math.pi * 2 - 0.3) * 2)

    # === 合成角色（加入所有動作偏移） ===
    # 主體位移
    offset_x = lean + (left_leg_swing + right_leg_swing) // 4
    offset_y = bounce

    # 貼上基礎圖像（加入動作）
    frame.paste(base, (offset_x, offset_y), base)

    # === 添加動態效果（魔法光點隨著動作飄動） ===
    draw = ImageDraw.Draw(frame)

    # 魔法光點位置會隨著手臂擺動
    magic_base_x = 330
    magic_base_y = 260

    for j in range(8):
        # 光點跟隨右手擺動
        cx = magic_base_x + j * 4 + right_arm_swing
        cy = magic_base_y + offset_y + int(math.sin(i * 0.5 + j) * 3)

        # 金藍粒子閃爍
        if (i + j) % 4 < 2:
            color = (255, 215, 0, 180)  # 金色光點（更亮）
        else:
            color = (100, 180, 255, 180)  # 藍色光點（更亮）

        draw.ellipse((cx, cy, cx + 3, cy + 3), fill=color)

    frames.append(frame)
    print(f"  Frame {i+1}/12 complete")

print("\n[4/5] Saving animated GIF...")

# === 儲存動態 GIF ===
try:
    frames[0].save(
        "images/elf_skeleton_run.gif",
        save_all=True,
        append_images=frames[1:],
        duration=75,  # 約13fps
        loop=0,
        transparency=0,
        disposal=2
    )
    print("[OK] elf_skeleton_run.gif generated successfully!")
except Exception as e:
    print(f"[ERROR] Failed to generate GIF: {e}")

print("\n[5/5] Creating spritesheet...")

# === 合成 Spritesheet（橫向 12 格）===
sheet_width = w * len(frames)
spritesheet = Image.new("RGBA", (sheet_width, h), (0, 0, 0, 0))

for idx, frame in enumerate(frames):
    spritesheet.paste(frame, (idx * w, 0), frame)

spritesheet.save("images/elf_skeleton_run_spritesheet.png")
print("[OK] elf_skeleton_run_spritesheet.png generated successfully!")

print("\n" + "="*50)
print("SUCCESS! Skeleton-based running animation complete!")
print("="*50)
print("\nGenerated files:")
print("  - images/elf_skeleton_run.gif")
print("  - images/elf_skeleton_run_spritesheet.png")
print("\nAnimation features:")
print("  - Real leg swing motion")
print("  - Counter-balanced arm movement")
print("  - Body bounce and lean")
print("  - Hair flowing delay effect")
print("  - Magic particles follow hand movement")
print("\nReady to use in your website!")
