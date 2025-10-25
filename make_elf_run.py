from PIL import Image, ImageDraw
import math

# === 載入角色原圖 ===
base = Image.open("elf_base.png").convert("RGBA")
w, h = base.size
frames = []

# === 生成 12 幀 ===
for i in range(12):
    frame = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    offset_y = int(math.sin(i / 12 * math.pi * 2) * 4)
    offset_x = int(math.sin(i / 6 * math.pi * 2) * 2)
    frame.paste(base, (offset_x, offset_y), base)

    # 金藍粒子閃爍（微光效果）
    draw = ImageDraw.Draw(frame)
    for j in range(8):
        cx = 330 + j * 4
        cy = 260 + offset_y + int(math.sin(i * 0.5 + j) * 3)
        if (i + j) % 4 < 2:
            color = (255, 215, 0, 160)  # 金色光點
        else:
            color = (100, 180, 255, 160)  # 藍色光點
        draw.ellipse((cx, cy, cx + 2, cy + 2), fill=color)

    frames.append(frame)

# === 儲存動態 GIF ===
try:
    frames[0].save(
        "elf_run.gif",
        save_all=True,
        append_images=frames[1:],
        duration=75,  # 約13fps
        loop=0,
        transparency=0,
        disposal=2
    )
    print("[OK] elf_run.gif generated successfully!")
except Exception as e:
    print(f"[ERROR] Failed to generate GIF: {e}")

# === 合成 Spritesheet（橫向 12 格）===
sheet_width = w * len(frames)
spritesheet = Image.new("RGBA", (sheet_width, h), (0, 0, 0, 0))

for idx, frame in enumerate(frames):
    spritesheet.paste(frame, (idx * w, 0), frame)

spritesheet.save("elf_run_spritesheet.png")
print("[OK] elf_run_spritesheet.png generated successfully!")

print("[SUCCESS] Generation complete! GIF and Spritesheet are ready to use.")
