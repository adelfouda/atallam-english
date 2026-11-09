"""يبني الأصوات المتشابهة ولعبة الحركة وملصقات الألبوم. التشغيل: python3 src/tools/add_extra.py"""
import json, os, sys, re
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root,'src/tools')); sys.path.insert(0, os.path.join(root,'src/content'))
from us import sentence
import extra
MISS=set()
def pr(w):
    a,m=sentence(w); [MISS.add(x) for x in m]; return a
mp=[{"t":g["t"],"a":g["a"],"b":g["b"],"tip":g["tip"],"w":[[w1,a1,pr(w1),w2,a2,pr(w2)] for w1,a1,w2,a2 in g["w"]]} for g in extra.PAIRS]
mv=[[e,a,em,pr(e)] for e,a,em in extra.MOVES]
s=extra.STICKERS
st=[x for x in re.findall(r'.️?',''.join(s))] if isinstance(s,list) else []
p=os.path.join(root,'src/data3.json'); d=json.load(open(p,encoding='utf-8'))
d['mp']=mp; d['kx']['mv']=mv; d['kx']['stk']=[x for x in st if x!='️']
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('pairs',len(mp),'moves',len(mv),'stickers',len(d['kx']['stk']))
if MISS: print('MISSING',sorted(MISS))
