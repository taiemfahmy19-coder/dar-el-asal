import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"d:\ن"
files = os.listdir(src_dir)
print(f"Total files: {len(files)}")
for f in sorted(files):
    p = os.path.join(src_dir, f)
    try:
        im = Image.open(p)
        print(f"FILE: {f} | SIZE: {im.size} | FORMAT: {im.format}")
    except Exception as e:
        print(f"FILE: {f} | ERROR: {e}")
