"""
Smart Ghar — branded placeholder artwork generator.

Creates consistent, on-brand product illustrations (flat vector style) so the
storefront never ships with broken external image links. Every image can be
replaced by the owner from Admin -> Products -> "Main Image URL".

Run:  python3 tools/gen_images.py      (requires pillow)
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images")
P_DIR = os.path.join(OUT, "products")
S = 2                      # supersampling factor
BOX = 600                  # drawing coordinate space
GREEN = (34, 197, 94)
DARK = (20, 83, 45)
LIME = (132, 204, 22)
INK = (31, 41, 55)
GRAY = (229, 231, 235)
CREAM = (254, 249, 243)
WHITE = (255, 255, 255)
METAL = (203, 209, 214)


def canvas(w=BOX, h=BOX):
    W, H = w * S, h * S
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(1, H - 1)
        top = (247, 251, 248)
        bot = (232, 241, 235)
        c = (int(top[0] + (bot[0] - top[0]) * t),
             int(top[1] + (bot[1] - top[1]) * t),
             int(top[2] + (bot[2] - top[2]) * t))
        d.line([(0, y), (W, y)], fill=c)
    # soft green glow behind the product
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    r = int(min(W, H) * 0.34)
    gd.ellipse([W // 2 - r, H // 2 - r - H * 0.03, W // 2 + r, H // 2 + r - H * 0.03],
               fill=(34, 197, 94, 26))
    glow = glow.filter(ImageFilter.GaussianBlur(28 * S))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    # floor shadow
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.ellipse([W * 0.28, H * 0.73, W * 0.72, H * 0.80], fill=(20, 83, 45, 40))
    sh = sh.filter(ImageFilter.GaussianBlur(10 * S))
    return Image.alpha_composite(img.convert("RGBA"), sh).convert("RGB")


def rr(d, box, r, fill, outline=None, width=0):
    d.rounded_rectangle([box[0] * S, box[1] * S, box[2] * S, box[3] * S],
                        radius=r * S, fill=fill, outline=outline, width=int(width * S))


def el(d, box, fill, outline=None, width=0):
    d.ellipse([box[0] * S, box[1] * S, box[2] * S, box[3] * S],
              fill=fill, outline=outline, width=int(width * S))


def ln(d, pts, fill, width, joint="curve"):
    d.line([(x * S, y * S) for x, y in pts], fill=fill, width=int(width * S), joint=joint)


def poly(d, pts, fill, outline=None, width=0):
    d.polygon([(x * S, y * S) for x, y in pts], fill=fill, outline=outline, width=int(width * S))


# ------------------------------------------------------------------ products
def p_chopper(d):
    ln(d, [(300, 150), (300, 235)], DARK, 9)
    el(d, [285, 138, 315, 168], DARK)
    rr(d, [278, 228, 322, 262], 8, DARK)
    rr(d, [150, 255, 450, 315], 22, GREEN)
    rr(d, [165, 290, 435, 470], 34, WHITE, GRAY, 3)
    rr(d, [205, 330, 395, 430], 20, (240, 253, 244))
    for i, (x, y) in enumerate([(250, 360), (300, 390), (350, 355), (275, 415), (340, 415)]):
        el(d, [x - 13, y - 9, x + 13, y + 9], LIME if i % 2 else GREEN)
    el(d, [170, 452, 210, 480], DARK)
    el(d, [390, 452, 430, 480], DARK)


def p_beater(d):
    rr(d, [235, 200, 365, 420], 48, WHITE, GRAY, 3)
    rr(d, [247, 250, 353, 300], 14, GREEN)
    el(d, [282, 215, 318, 245], GREEN)
    for x in (272, 328):
        ln(d, [(x, 420), (x - 10 if x < 300 else x + 10, 540)], METAL, 8)
        el(d, [x - 34, 470, x + 14, 545], None, METAL, 6)
        el(d, [x - 12, 460, x + 36, 535], None, METAL, 6)
    rr(d, [250, 350, 350, 372], 10, (240, 253, 244))


def p_mandoline(d):
    # body / slicing board seen from a slight angle
    poly(d, [(150, 470), (196, 250), (452, 292), (406, 486)], (241, 245, 249), (148, 163, 184), 3)
    rr(d, [214, 300, 402, 344], 10, (203, 213, 225), (100, 116, 139), 2)
    # blade slot
    rr(d, [236, 312, 300, 332], 6, (71, 85, 105))
    # julienne blade
    rr(d, [314, 306, 388, 338], 8, METAL, (100, 116, 139), 2)
    for k in range(5):
        ln(d, [(322 + k * 14, 306), (322 + k * 14, 338)], (148, 163, 184), 2)
    # green grip
    rr(d, [150, 300, 200, 470], 16, GREEN)
    rr(d, [360, 372, 432, 470], 20, DARK)
    # hand guard
    rr(d, [236, 372, 330, 430], 16, LIME)
    el(d, [276, 388, 296, 408], DARK)
    # sliced veg
    for x, y, c in [(200, 500, (254, 215, 170)), (250, 508, (187, 247, 208)), (300, 500, (254, 202, 202))]:
        el(d, [x - 30, y - 12, x + 30, y + 12], c)


def p_dispenser(d):
    rr(d, [245, 300, 355, 480], 30, WHITE, GRAY, 3)
    rr(d, [285, 240, 315, 305], 8, DARK)
    rr(d, [285, 238, 375, 262], 10, DARK)
    rr(d, [262, 340, 338, 388], 10, (240, 253, 244))
    el(d, [293, 355, 307, 375], GREEN)
    for i, (x, y, r) in enumerate([(400, 300, 9), (425, 325, 7), (415, 280, 6), (450, 300, 5)]):
        el(d, [x - r, y - r, x + r, y + r], LIME)
    el(d, [250, 465, 290, 495], GRAY)
    el(d, [310, 465, 350, 495], GRAY)


def p_spatula(d):
    def spatula(angle, head_fill):
        cx, cy = 300, 500
        a = math.radians(angle)
        hx, hy = cx + math.sin(a) * 250, cy - math.cos(a) * 250
        # wooden handle
        ln(d, [(cx, cy), (cx + math.sin(a) * 130, cy - math.cos(a) * 130)], (146, 100, 62), 20)
        rr(d, [cx + math.sin(a) * 118 - 13, cy - math.cos(a) * 118 - 13,
               cx + math.sin(a) * 118 + 13, cy - math.cos(a) * 118 + 13], 8, (92, 61, 36))
        # silicone neck + head
        ln(d, [(cx + math.sin(a) * 130, cy - math.cos(a) * 130), (hx, hy)], head_fill, 14)
        ang = math.degrees(a)
        head = Image.new("RGBA", (170 * S, 120 * S), (0, 0, 0, 0))
        hd = ImageDraw.Draw(head)
        hd.rounded_rectangle([4 * S, 4 * S, 166 * S, 116 * S], radius=34 * S, fill=head_fill)
        for k in range(3):
            hd.rounded_rectangle([(30 + k * 42) * S, 34 * S, (54 + k * 42) * S, 100 * S], radius=10 * S,
                                 fill=(255, 255, 255, 60))
        head = head.rotate(-ang, expand=True, resample=Image.BICUBIC)
        d._image.paste(head, (int(hx * S - head.size[0] / 2), int(hy * S - head.size[1] / 2)), head)
    spatula(-38, DARK)
    spatula(38, LIME)
    spatula(0, GREEN)
    el(d, [150, 495, 450, 528], (20, 83, 45))


def p_airfryer(d):
    rr(d, [200, 210, 400, 470], 26, DARK)
    rr(d, [215, 225, 385, 300], 16, (22, 101, 52))
    rr(d, [250, 240, 350, 268], 8, (0, 0, 0))
    el(d, [300, 254, 320, 262], LIME)
    rr(d, [222, 320, 378, 448], 18, (31, 41, 55))
    rr(d, [240, 336, 360, 430], 14, (17, 24, 39))
    rr(d, [285, 330, 315, 440], 8, METAL)
    rr(d, [250, 380, 350, 392], 6, (55, 65, 81))
    el(d, [215, 462, 245, 484], GREEN)
    el(d, [355, 462, 385, 484], GREEN)
    rr(d, [180, 430, 210, 455], 8, GREEN)
    rr(d, [390, 430, 420, 455], 8, GREEN)


def p_oilsprayer(d):
    rr(d, [258, 330, 342, 480], 22, WHITE, GRAY, 3)
    rr(d, [280, 292, 320, 335], 6, GREEN)
    rr(d, [288, 250, 312, 295], 6, DARK)
    rr(d, [275, 244, 360, 262], 8, DARK)
    poly(d, [(258, 390), (342, 390), (342, 430), (258, 415)], (240, 253, 244))
    for i, (x, y, r) in enumerate([(400, 240, 8), (425, 262, 6), (438, 225, 5), (415, 200, 4)]):
        el(d, [x - r, y - r, x + r, y + r], LIME)
    el(d, [270, 468, 330, 495], GRAY)


def p_lamp(d):
    # warm light cone
    poly(d, [(262, 300), (338, 300), (392, 470), (208, 470)], (254, 243, 199))
    poly(d, [(274, 300), (326, 300), (360, 465), (240, 465)], (253, 230, 138))
    ln(d, [(300, 240), (300, 330)], DARK, 10)
    rr(d, [222, 168, 378, 306], 68, (241, 245, 249), (148, 163, 184), 3)
    rr(d, [214, 286, 386, 318], 16, GREEN)
    el(d, [300, 306, 320, 322], (250, 204, 21))
    rr(d, [252, 330, 348, 356], 10, (226, 232, 240), (148, 163, 184), 2)
    rr(d, [262, 356, 338, 400], 10, (241, 245, 249), (148, 163, 184), 3)
    el(d, [270, 392, 330, 410], GREEN)
    rr(d, [232, 405, 368, 440], 14, DARK)
    el(d, [252, 428, 348, 452], (30, 41, 59))


def p_dryingrack(d):
    ln(d, [(170, 490), (250, 210)], METAL, 12)
    ln(d, [(430, 490), (350, 210)], METAL, 12)
    ln(d, [(170, 490), (430, 490)], METAL, 12)
    for y in (250, 320, 390):
        ln(d, [(190, y), (410, y)], GREEN, 10)
    # hanging clothes
    rr(d, [210, 262, 285, 360], 8, (191, 219, 254))
    rr(d, [300, 332, 390, 400], 8, (254, 215, 170))
    el(d, [150, 480, 250, 505], GRAY)
    el(d, [350, 480, 450, 505], GRAY)


def p_shoerack(d):
    for y in (250, 340, 430):
        rr(d, [165, y, 435, y + 18], 6, GREEN)
    ln(d, [(170, 240), (170, 500)], DARK, 12)
    ln(d, [(430, 240), (430, 500)], DARK, 12)
    # shoes
    el(d, [195, 195, 285, 250], WHITE, GRAY, 3)
    rr(d, [205, 210, 275, 240], 10, (226, 232, 240))
    el(d, [315, 285, 405, 340], WHITE, GRAY, 3)
    rr(d, [325, 300, 395, 330], 10, (226, 232, 240))
    el(d, [205, 375, 295, 430], WHITE, GRAY, 3)


def p_containers(d):
    BODY = (209, 250, 229)
    BODY2 = (167, 243, 208)
    EDGE = (74, 222, 128)
    # large
    rr(d, [148, 372, 302, 482], 18, BODY, EDGE, 3)
    rr(d, [136, 344, 314, 388], 16, GREEN)
    rr(d, [176, 404, 274, 438], 8, BODY2)
    # medium
    rr(d, [206, 248, 334, 346], 18, BODY, EDGE, 3)
    rr(d, [194, 224, 346, 262], 14, LIME)
    # small
    rr(d, [334, 158, 456, 226], 16, BODY, EDGE, 3)
    rr(d, [322, 138, 468, 170], 12, DARK)
    for x in (188, 226, 264):
        el(d, [x - 9, 452, x + 9, 468], GREEN)


def p_storagebox(d):
    rr(d, [140, 290, 460, 450], 20, WHITE, GRAY, 3)
    rr(d, [125, 265, 475, 320], 16, GREEN)
    rr(d, [280, 300, 320, 330], 8, LIME)
    el(d, [190, 440, 240, 480], INK)
    el(d, [360, 440, 410, 480], INK)
    el(d, [205, 452, 225, 468], GRAY)
    el(d, [375, 452, 395, 468], GRAY)


def p_spicerack(d):
    el(d, [176, 386, 424, 506], (240, 253, 244), (148, 163, 184), 3)
    el(d, [200, 400, 400, 492], (220, 252, 231))
    ln(d, [(300, 386), (300, 236)], DARK, 12)
    for x, y, c in [(232, 286, GREEN), (300, 250, LIME), (368, 286, GREEN),
                    (264, 344, DARK), (336, 344, GREEN)]:
        rr(d, [x - 32, y - 46, x + 32, y + 30], 14, (255, 255, 255), (148, 163, 184), 3)
        rr(d, [x - 32, y - 46, x + 32, y - 24], 10, c)
        rr(d, [x - 28, y - 14, x + 28, y + 20], 8, (254, 240, 138))
        ln(d, [(x - 18, y + 2), (x + 18, y + 2)], (202, 138, 4), 3)
    el(d, [282, 360, 318, 396], DARK)


def p_blender(d):
    rr(d, [235, 170, 365, 430], 30, WHITE, GRAY, 3)
    rr(d, [245, 190, 355, 300], 20, (187, 247, 208))
    rr(d, [235, 300, 365, 345], 10, GREEN)
    rr(d, [225, 345, 375, 450], 22, DARK)
    el(d, [300, 390, 330, 420], LIME)
    rr(d, [255, 148, 345, 180], 12, DARK)
    el(d, [300, 130, 330, 155], GREEN)


def p_watch(d):
    rr(d, [255, 140, 345, 250], 26, DARK)
    rr(d, [255, 360, 345, 470], 26, DARK)
    rr(d, [210, 225, 390, 385], 30, INK)
    rr(d, [225, 240, 375, 370], 22, (17, 24, 39))
    el(d, [265, 275, 335, 345], None, GREEN, 6)
    ln(d, [(300, 290), (300, 312)], LIME, 5)
    ln(d, [(300, 312), (320, 322)], LIME, 5)
    rr(d, [385, 280, 400, 310], 6, GRAY)
    rr(d, [240, 200, 360, 216], 8, GREEN)


PRODUCTS = {
    "chopper.png": p_chopper,
    "egg-beater.png": p_beater,
    "mandoline.png": p_mandoline,
    "soap-dispenser.png": p_dispenser,
    "spatula-set.png": p_spatula,
    "air-fryer.png": p_airfryer,
    "oil-sprayer.png": p_oilsprayer,
    "night-lamp.png": p_lamp,
    "drying-rack.png": p_dryingrack,
    "shoe-rack.png": p_shoerack,
    "food-containers.png": p_containers,
    "under-bed-storage.png": p_storagebox,
    "spice-rack.png": p_spicerack,
    "usb-blender.png": p_blender,
    "smart-watch.png": p_watch,
}

CATEGORIES = {
    "cat-kitchen.png": (p_chopper, "🍳"),
    "cat-home.png": (p_lamp, "🏠"),
    "cat-storage.png": (p_containers, "📦"),
    "cat-gift.png": (p_watch, "🎁"),
}


def save(img, path, size):
    img = img.resize(size, Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=True)
    print("  ", os.path.basename(path), os.path.getsize(path) // 1024, "KB")


def main():
    os.makedirs(P_DIR, exist_ok=True)
    print("products:")
    for name, fn in PRODUCTS.items():
        img = canvas()
        d = ImageDraw.Draw(img)
        fn(d)
        save(img, os.path.join(P_DIR, name), (800, 800))

    print("categories:")
    for name, (fn, _icon) in CATEGORIES.items():
        W, H = 1200, 800
        img = Image.new("RGB", (W, H), WHITE)
        d = ImageDraw.Draw(img)
        for y in range(H):
            t = y / H
            d.line([(0, y), (W, y)], fill=(int(255 - 14 * t), int(250 - 16 * t), int(244 - 20 * t)))
        deco = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        dd = ImageDraw.Draw(deco)
        dd.ellipse([W * 0.42, -H * 0.35, W * 1.15, H * 1.2], fill=(34, 197, 94, 30))
        dd.ellipse([W * 0.62, H * 0.35, W * 1.3, H * 1.35], fill=(132, 204, 22, 22))
        deco = deco.filter(ImageFilter.GaussianBlur(40))
        img = Image.alpha_composite(img.convert("RGBA"), deco).convert("RGB")

        icon = canvas()
        fn(ImageDraw.Draw(icon))
        size = int(min(W, H) * 0.72)
        icon = icon.resize((size, size), Image.LANCZOS)
        mask = Image.new("L", icon.size, 0)
        ImageDraw.Draw(mask).ellipse([0, 0, size, size], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(4))
        img.paste(icon, (int(W * 0.55), int(H * 0.5 - size / 2)), mask)
        save(img, os.path.join(P_DIR, name), (900, 600))

    print("done")


if __name__ == "__main__":
    main()
