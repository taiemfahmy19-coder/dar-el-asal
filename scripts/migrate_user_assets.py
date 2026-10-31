import os
import sys
import shutil
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"d:\ن"
dest_honey = r"d:\بزار\public\images\honey"
dest_oil = r"d:\بزار\public\images\olive-oil"
dest_main = r"d:\بزار\public\images"

os.makedirs(dest_honey, exist_ok=True)
os.makedirs(dest_oil, exist_ok=True)

# 1. Process Hero Banner
hero_file = None
for f in os.listdir(src_dir):
    if "وجهه الموقع" in f or f.endswith(".jfif"):
        hero_file = os.path.join(src_dir, f)
        break

if hero_file:
    im_hero = Image.open(hero_file).convert('RGB')
    target_hero = os.path.join(dest_main, 'dar-hero-banner-hd.jpg')
    im_hero.save(target_hero, quality=95)
    print("Saved HD Hero Banner ->", target_hero, im_hero.size)

# 2. Process Logo
logo_file = os.path.join(src_dir, "logo.jpg")
if os.path.exists(logo_file):
    im_logo = Image.open(logo_file).convert('RGB')
    # Save full HD
    im_logo.save(os.path.join(dest_main, 'logo-hd.jpg'), quality=95)
    # Also crop tightly around logo content for the header
    # Let's inspect logo bounds
    w, h = im_logo.size
    # Crop center area where the logo is
    cropped_logo = im_logo.crop((int(w*0.12), int(h*0.25), int(w*0.88), int(h*0.75)))
    cropped_logo.save(os.path.join(dest_main, 'dar-logo-full.jpg'), quality=95)
    print("Saved Logo HD & Cropped Navbar Logo!")

# 3. Honey Mapping
honey_files = {
    'prod-honey-sidr': 'Sidr_honey_glass_jar_3cf333a2.jpg',
    'prod-honey-mountain': 'Jar_of_mountain_honey_c2a90f44.jpg',
    'prod-honey-blackseed': 'Jar_of_black_seed_honey_142ed318.jpg',
    'prod-honey-wildflower': 'Jar_of_Wildflower_Honey_f39a7b99.jpg',
    'prod-honey-mixed-nuts': 'Jar_of_honey_with_nuts_0dd44147.jpg',
    'prod-honey-citrus': 'Citrus_honey_glass_jar_8fa2da15.jpg',
    'prod-honey-orange': 'Jar_of_orange_blossom_honey_adc0a907.jpg',
    'prod-honey-clover': 'Clover_honey_in_glass_jar_3f71fcda.jpg',
    'prod-honey-acacia': 'Glass_jar_of_Acacia_Honey_477dd332.jpg',
    'prod-honey-eucalyptus': 'Jar_of_eucalyptus_honey_0ec2c388.jpg',
    'prod-honey-manuka': 'Jar_of_Manuka_honey_a9dc35ed.jpg',
    'prod-honey-plain': 'Hexagonal_glass_jar_of_honey_00fc9c93.jpg',
    'prod-honey-comb': 'Hexagonal_glass_jar_of_honey_37b89ad5.jpg',
    'prod-honey-creamed': 'Hexagonal_glass_jar_of_honey_724d153c.jpg',
    'prod-honey-sesame': 'Hexagonal_glass_jar_of_honey_c0b76a59.jpg',
}

for prod_id, fname in honey_files.items():
    src_p = os.path.join(src_dir, fname)
    if os.path.exists(src_p):
        out_name = f"{prod_id}.jpg"
        target_p = os.path.join(dest_honey, out_name)
        Image.open(src_p).convert('RGB').save(target_p, quality=92)
        print(f"Copied Honey: {fname} -> {out_name}")

# 4. Olive Oil Mapping
oil_files = {
    'prod-oil-siwa-cold': 'Glass_bottle_of_olive_oil_5dd02286.jpg',
    'prod-oil-stone-pressed': 'Glass_bottle_of_olive_oil_9d63ea1c.jpg',
    'prod-oil-early-harvest': 'Green_glass_bottle_olive_oil_0b9d9baf.jpg',
    'prod-oil-sinai-wild': 'Olive_oil_bottle_on_background_2b718b14.jpg',
    'prod-oil-family-can': 'Olive_oil_bottle_on_background_7f482fdc.jpg',
    'prod-oil-organic': 'Organic_olive_oil_bottle_photogr._41da67f9.jpg',
    'prod-oil-palestinian': 'Palestinian_olive_oil_bottle_e2b33069.jpg',
}

for prod_id, fname in oil_files.items():
    # Handle possible filename truncation
    match_file = None
    for f in os.listdir(src_dir):
        if fname.startswith(f[:25]) or f.startswith(fname[:25]):
            match_file = f
            break
    if match_file:
        src_p = os.path.join(src_dir, match_file)
        out_name = f"{prod_id}.jpg"
        target_p = os.path.join(dest_oil, out_name)
        Image.open(src_p).convert('RGB').save(target_p, quality=92)
        print(f"Copied Olive Oil: {match_file} -> {out_name}")

print("\n--- All user assets successfully processed and copied! ---")
