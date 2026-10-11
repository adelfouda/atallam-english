"""يضيف القصص بالنطقين لملف البيانات. التشغيل: python3 src/tools/add_stories.py"""
import json, os, sys
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root,'src/tools')); sys.path.insert(0, os.path.join(root,'src/content'))
from us import sentence
from gb import phrase_gb
import stories
out=[]
for S in stories.STORIES:
    ss=[]
    for en,ar in S["s"]:
        a,m=sentence(en)
        if m: print('MISS',S['t'],m)
        ss.append([en,ar,a,phrase_gb(en) or a])
    out.append({"lv":S["lv"],"t":S["t"],"e":S["e"],"s":ss,"q":S["q"]})
p=os.path.join(root,'src/data3.json'); d=json.load(open(p,encoding='utf-8')); d['sto']=out
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('stories',len(out))
