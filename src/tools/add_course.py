"""يبني المنهج ويضيفه لملف البيانات. التشغيل: python3 src/tools/add_course.py
- الدروس الجديدة بتتضاف لقايمة دروس القواعد، والوحدة بتشاور على رقم الدرس.
- النطق الأمريكي والبريطاني بيتولد لكل كلمة وجملة."""
import json, os, re, sys
root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root,'src/tools')); sys.path.insert(0, os.path.join(root,'src/content'))
from us import sentence
from gb import phrase_gb
from num2words import num2words
import course1, course2, course3, course4

MISS=set()
def spoken(t):
    t=t.replace('%',' percent').replace('’',"'")
    def yr(m):
        n=int(m.group())
        if 1100<=n<=2099 and len(m.group())==4: return num2words(n,to='year')
        if len(m.group())>4: return ' '.join(num2words(int(d)) for d in m.group())
        return num2words(n)
    t=re.sub(r'(\d+)(st|nd|rd|th)\b',lambda m:num2words(int(m.group(1)),to='ordinal'),t)
    t=re.sub(r'\d+',yr,t)
    return t.replace('-',' ')
def pron(t):
    s=spoken(t); a,m=sentence(s)
    for x in m: MISS.add(x)
    return a, (phrase_gb(s) or a)
def ex(pair):
    a,b=pron(pair[0]); return [pair[0],pair[1],a,b]

p=os.path.join(root,'src/data3.json'); D=json.load(open(p,encoding='utf-8'))
BASE=12
D['les']=D['les'][:BASE]
units=course1.U1+course1.U2+course2.U3+course2.U4+course3.U5+course3.U6+course4.U7
out=[]
for u in units:
    if 'gl' in u: gi=u['gl']
    else:
        g=u['g']; D['les'].append({"t":g['t'],"x":g['x'],"pat":g['pat'],"ex":[ex(e) for e in g['ex']],"q":g['q']}); gi=len(D['les'])-1
    out.append({"lv":u['lv'],"t":u['t'],"e":u['e'],"g":gi,
      "v":[ex(v) for v in u['v']],
      "d":{"r":u['d']['r'],"l":[[l[0]]+ex(l[1:]) for l in u['d']['l']]},
      "rd":[ex(r) for r in u['rd']],"rq":u['rq'],
      "w":[u['w'][0]]+ex(u['w'][1:])})
D['crs']=out
D['lvn']=['','المستوى الأول: مبتدئ','المستوى التاني: أساسي','المستوى التالت: ما قبل المتوسط','المستوى الرابع: متوسط','المستوى الخامس: فوق المتوسط','المستوى السادس: متقدم','مسار إنجليزي الشغل']
json.dump(D,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('units',len(out),'lessons',len(D['les']))
if MISS: print('MISSING',sorted(MISS))
