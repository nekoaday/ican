"""Create the competition source/deployment ZIP using Python's standard library."""
from pathlib import Path
import os, re, zipfile, hashlib, json

root=Path(__file__).resolve().parents[1]
out=root/'outputs';out.mkdir(exist_ok=True)
target=out/'03_源代码与部署材料.zip'
excluded={'node_modules','.git','work','outputs','__pycache__'}
files=[]
for folder,dirs,names in os.walk(root):
    dirs[:]=[d for d in dirs if d not in excluded]
    for name in names:
        file=Path(folder)/name;relative=file.relative_to(root)
        if name.startswith('.env') and not name.endswith('.example'):continue
        if name.endswith(('.log','.tsbuildinfo','.pyc')):continue
        if file.suffix in {'.ts','.tsx','.mjs','.js','.json','.md','.html','.css','.py'} or name.startswith('.env'):
            if re.search(rb'sk-[A-Za-z0-9]{24,}',file.read_bytes()):raise SystemExit(f'Credential-like value found in {relative}')
        files.append((file,relative))
for file in sorted(out.glob('*.pdf')):files.append((file,Path('outputs')/file.name))
for needed in ['README.md','package.json','package-lock.json','docs/DEPLOYMENT.md','docs/TESTING.md','dist/index.html','server/index.mjs','server/chat-handler.ts']:
    if not (root/needed).is_file():raise SystemExit(f'Missing required file: {needed}')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for file,relative in sorted(files,key=lambda pair:str(pair[1])):archive.write(file,Path('InsureCompass')/relative)
with zipfile.ZipFile(target) as archive:
    if archive.testzip() is not None:raise SystemExit('ZIP integrity check failed')
    entries=archive.namelist()
    if any('/node_modules/' in x or '/work/' in x or '/.git/' in x or (Path(x).name.startswith('.env') and not x.endswith('.example')) for x in entries):raise SystemExit('Excluded content entered archive')
manifest=[]
for file in sorted(out.glob('*')):
    if file.suffix not in {'.pdf','.zip'}:continue
    size=file.stat().st_size
    limit=300 if file.suffix=='.zip' else (80 if file.name.startswith('02') else 50)
    if size>limit*1_000_000:raise SystemExit(f'Submission size limit exceeded: {file.name}')
    manifest.append({'file':file.name,'bytes':size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
(out/'SHA256SUMS.txt').write_text('\n'.join(f"{x['sha256']}  {x['file']}" for x in manifest)+'\n',encoding='utf-8')
print(json.dumps({'archiveEntries':len(entries),'archiveBytes':target.stat().st_size,'files':manifest},ensure_ascii=True,indent=2))
