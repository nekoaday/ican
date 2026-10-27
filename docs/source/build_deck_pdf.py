from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
root=Path(__file__).resolve().parents[2]
target=root/'outputs/02_答辩材料.pdf'
c=canvas.Canvas(str(target),pagesize=(960,540),pageCompression=1)
c.setTitle('保额罗盘 - 答辩材料');c.setAuthor('InsureCompass')
for file in sorted((root/'work/slides').glob('slide-*.png')):
    c.drawImage(ImageReader(str(file)),0,0,width=960,height=540)
    c.showPage()
c.save()
print('Created 10-page defense PDF.')
