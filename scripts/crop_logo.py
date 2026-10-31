from PIL import Image

im = Image.open('public/images/logo.jpg')
# Crop tightly around the logo elements
# In 1024x571, the logo is centered: x approx 140 to 880, y approx 150 to 420
w, h = im.size

# Let's crop the full logo lockup (icon + text):
full_logo = im.crop((150, 150, 870, 420))
full_logo.save('public/images/dar-logo-full.jpg', quality=95)

# Also let's crop just the icon (honey droplet + olive branch):
# Icon is on the left side of the lockup: x approx 150 to 340, y approx 150 to 420
icon = im.crop((150, 150, 345, 420))
icon.save('public/images/dar-icon.jpg', quality=95)

print('Cropped full logo and icon!')
