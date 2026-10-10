"""يضيف محتوى الأطفال بالنطقين لملف البيانات. التشغيل: python3 src/tools/add_kids.py"""
import json, os, sys
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root,'src/tools')); sys.path.insert(0, os.path.join(root,'src/content'))
from us import sentence
from gb import phrase_gb
import importlib, kids; importlib.reload(kids)
def pr(t):
    a,m=sentence(t)
    if m: print('MISS',t,m)
    return a, phrase_gb(t) or a
topics=[{"t":"الحروف","e":"🔤","letters":True,"items":[[w,e,ar,*pr(w),L] for L,w,e,ar in kids.LETTERS]}]
for T in kids.TOPICS:
    topics.append({"t":T["t"],"e":T["e"],"items":[[w,e,ar,*pr(w)] for w,e,ar in T["items"]]})
p=os.path.join(root,'src/data3.json'); d=json.load(open(p,encoding='utf-8')); d['kids']=topics
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('topics',len(topics),'items',sum(len(t['items']) for t in topics))
