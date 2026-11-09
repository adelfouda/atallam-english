"""يبني قسم الحروف الصامتة والمركبة. التشغيل: python3 src/tools/add_letters.py"""
import json, os, sys
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root,'src/tools')); sys.path.insert(0, os.path.join(root,'src/content'))
from us import sentence
from gb import phrase_gb
import letters as L
MISS=set()
def parse(raw):
    out='';idx=[];inb=False
    for ch in raw:
        if ch=='[': inb=True; continue
        if ch==']': inb=False; continue
        if inb: idx.append(len(out))
        out+=ch
    return out,idx
def pr(w):
    a,m=sentence(w); [MISS.add(x) for x in m]; return a,(phrase_gb(w) or a)
def row(raw,ar):
    w,idx=parse(raw); a,b=pr(w); return [w,idx,ar,a,b]
snd={
 "sil":[{"t":g["t"],"x":g["x"],"w":[row(r,a) for r,a in g["w"]],"ex":[[e,a,' ← '.join(pr(x)[0] for x in e.split(' ← ')),e.split(' ← ')[-1]] for e,a in g.get("ex",[])],"exn":g.get("exn","")} for g in L.SILENT],
 "dg":[{"p":g["p"],"s":g["s"],"x":g["x"],"w":[row(r,a) for r,a in g["w"]]} for g in L.DIGRAPHS],
 "ks":[row(r,a)[:2]+[e,a,pr(parse(r)[0])[0]] for r,e,a in L.KIDS_SILENT],
 "kd":[{"p":g["p"],"s":g["s"],"w":[[w,e,a,pr(w)[0]] for w,e,a in g["w"]]} for g in L.KIDS_DIGRAPHS],
}
p=os.path.join(root,'src/data3.json'); d=json.load(open(p,encoding='utf-8')); d['snd']=snd
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('silent',len(snd['sil']),'digraphs',len(snd['dg']))
if MISS: print('MISSING',sorted(MISS))
