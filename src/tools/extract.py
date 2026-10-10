import docx, json, re, glob
from docx.table import Table
from docx.text.paragraph import Paragraph
files=[('الجزء_الأول',1),('الجزء_الثاني',2),('الجزء_الثالث',3),('الجزء_الرابع',4)]
words=[]; rules=[]; sections=[]
def ct(c): return [p.text.strip() for p in c.paragraphs]
for name,part in files:
    f=glob.glob(f'/mnt/attach/outputs/{name}*.docx')[0]
    d=docx.Document(f); body=d.element.body
    cur=None; curRule=None; pat=None
    for el in body.iterchildren():
        tag=el.tag.split('}')[1]
        if tag=='p':
            p=Paragraph(el,d); t=p.text.strip(); s=p.style.name if p.style is not None else ''
            if t and ('Heading' in s):
                cur=re.sub(r'\s*\(.*?\)\s*$','',t).strip(); cur=re.sub(r'^[٠-٩0-9]+\.\s*','',cur); pat=None; curRule=cur
            elif t and re.fullmatch(r'[A-Za-z /]+',t) and cur: pat=t.strip()
        elif tag=='tbl':
            tb=Table(el,d); hdr=[c.text.strip() for c in tb.rows[0].cells]
            if hdr[:2]==['م','الكلمة']:
                sec=cur+(' '+pat if pat else '')
                if sec not in [s['t'] for s in sections]: sections.append({'t':sec,'p':part})
                si=[s['t'] for s in sections].index(sec)
                for r in tb.rows[1:]:
                    c=[ct(x) for x in r.cells]
                    w={'w':c[1][0],'p':c[2][0],'m':c[3][0],'s':si,'part':part}
                    if len(c)>4: w['e']=c[4][0]; w['ea']=c[4][1] if len(c[4])>1 else ''
                    words.append(w)
            elif hdr[0]=='الحروف':
                rows=[[x.text.strip() for x in r.cells] for r in tb.rows[1:]]
                rules.append({'t':curRule,'rows':rows})
print(len(words), len(sections), len(rules))
print(words[0], words[1500], sections[:3])
json.dump({'words':words,'sections':sections,'rules':rules},open('data.json','w'),ensure_ascii=False,separators=(',',':'))
