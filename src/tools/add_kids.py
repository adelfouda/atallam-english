"""يضيف محتوى الأطفال بالنطقين لملف البيانات. التشغيل: python3 src/tools/add_kids.py"""
import json, os, sys
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root,'src/tools')); sys.path.insert(0, os.path.join(root,'src/content'))
from us import sentence
from gb import phrase_gb
import importlib, kids, kids2
def pr(t):
    a,m=sentence(t)
    if m: print('MISS',t,m)
    return a, phrase_gb(t) or a
topics=[{"t":"الحروف","e":"🔤","letters":True,"items":[[w,e,ar,*pr(w),L] for L,w,e,ar in kids.LETTERS]}]
for T in kids.TOPICS:
    topics.append({"t":T["t"],"e":T["e"],"items":[[w,e,ar,*pr(w)] for w,e,ar in T["items"]]})
for T in kids2.MORE_TOPICS:
    topics.append({"t":T["t"],"e":T["e"],"items":[[w,e,ar,*pr(w)] for w,e,ar in T["items"]]})
def ex(en,ar):
    a,b=pr(en); return [en,ar,a,b]
kx={"ph":[[L,snd,ara,w,e,*pr(w)] for L,snd,ara,w,e in kids2.PHONICS],
    "cvc":[[w,e,ar,*pr(w)] for w,e,ar in kids2.CVC],
    "ch":[{"t":c["t"],"e":c["e"],"l":[ex(en,ar)+[em] for en,ar,em in c["l"]]} for c in kids2.CHANTS],
    "ps":[{"t":s["t"],"e":s["e"],"s":[[em]+ex(en,ar) for em,en,ar in s["s"]],"q":s["q"]} for s in kids2.PSTORIES]}
p=os.path.join(root,'src/data3.json'); d=json.load(open(p,encoding='utf-8')); d['kids']=topics; d['kx']=kx
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('topics',len(topics),'items',sum(len(t['items']) for t in topics))
