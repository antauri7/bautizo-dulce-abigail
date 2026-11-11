from PIL import Image, ImageOps, ImageDraw, ImageFont
from pathlib import Path
import json, shutil
items=[]
for i,p in enumerate(sorted(Path('images').glob('*.jpeg')),1):
 im=ImageOps.exif_transpose(Image.open(p)).convert('RGB'); w,h=im.size
 for size in (480,960,1440):
  out=im.copy();out.thumbnail((size,size*2));out.save(f'public/images/momento-{i:02}-{size}.webp',quality=83,method=6)
 items.append({'id':i,'original':p.name,'width':w,'height':h})
Path('src/config/photos.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
shutil.copy2(next(Path('images').glob('*.mp3')),'public/audio/youll-be-in-my-heart.mp3')
im=ImageOps.exif_transpose(Image.open(sorted(Path('images').glob('*.jpeg'))[7])).convert('RGB')
canvas=Image.new('RGB',(1200,630),'#FAF7F2');canvas.paste(ImageOps.fit(im,(470,630)),(730,0));d=ImageDraw.Draw(canvas)
font='/System/Library/Fonts/Supplemental/Georgia.ttf'
for xy,t,size in [((80,150),'MI BAUTIZO',22),((75,225),'Dulce Abigail',68),((80,340),'26 · Diciembre · 2026',27),((80,420),'Con amor, la familia Flores Martínez',20)]:
 d.text(xy,t,font=ImageFont.truetype(font,size),fill='#514A45')
canvas.save('public/og-image.jpg',quality=90)
