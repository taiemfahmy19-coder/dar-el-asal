from PIL import Image

im = Image.open('public/images/mockup-hero.jpg')
w, h = im.size

# The screen inside the laptop mockup:
# Left edge of screen is approx x=201, top is y=54, right is x=822, bottom is y=570
# Let's inspect coordinates precisely:
# Screen navbar starts around y=54 to y=95
# Hero section is around y=95 to y=315, x=202 to x=822
hero = im.crop((202, 95, 822, 315))
hero.save('public/images/dar-hero-banner.jpg', quality=95)

# The hero showcase image on right side:
# from x=475 to 822, y=95 to 315
hero_showcase = im.crop((475, 95, 822, 315))
hero_showcase.save('public/images/dar-hero-showcase.jpg', quality=95)

# Product cards in the grid:
# Row 1 of products: y is approx 345 to 500
# Card 1: x approx 267 to 376
p1 = im.crop((267, 345, 376, 465))
p1.save('public/images/honey/dar-honey-white-label.jpg', quality=95)

# Card 2: x approx 386 to 495
p2 = im.crop((386, 345, 495, 465))
p2.save('public/images/honey/dar-honey-green-label.jpg', quality=95)

# Card 3: x approx 505 to 614
p3 = im.crop((505, 345, 614, 465))
p3.save('public/images/honey/dar-honey-mountain.jpg', quality=95)

# Card 4: x approx 624 to 733 (Olive oil bottle)
p4 = im.crop((624, 345, 733, 465))
p4.save('public/images/olive-oil/dar-olive-oil-bottle.jpg', quality=95)

print('Cropped assets saved successfully!')
