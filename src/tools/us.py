import cmudict, re
D = cmudict.dict()
CONS = {'B':'ب','CH':'تش','D':'د','DH':'ذ','F':'ف','G':'گ','HH':'ه','JH':'ج','K':'ك','L':'ل','M':'م','N':'ن','NG':'نگ',
        'P':'پ','R':'ر','S':'س','SH':'ش','T':'ت','TH':'ث','V':'ڤ','W':'و','Y':'ي','Z':'ز','ZH':'ژ'}
VOW = {'AA','AE','AH','AO','EH','ER','EY','IH','IY','OW','OY','UH','UW','AY','AW'}
def base(p): return re.sub(r'\d','',p)
def stress(p): m=re.search(r'\d',p); return int(m.group()) if m else None
MED = {'AA':'ا','AE':'ا','AH':'َ','EH':'ِ','IH':'ِ','IY':'ي','UH':'ُ','UW':'و','EY':'َي','AY':'اي','OW':'و','AW':'او','OY':'وي'}
INI = {'AA':'آ','AE':'آ','AH':'أَ','EH':'إِ','IH':'إِ','IY':'إي','UH':'أُ','UW':'أو','EY':'أَي','AY':'آي','OW':'أو','AW':'آو','OY':'أوي','AO':'آ'}
def conv(phones):
    out=''; n=len(phones)
    for i,p in enumerate(phones):
        b=base(p); s=stress(p)
        prev = base(phones[i-1]) if i>0 else None
        nxt = phones[i+1] if i+1<n else None
        if b in VOW:
            start=(i==0)
            if b=='ER':
                out += ('إِر' if s in (1,2) else 'أَر') if start else ('ِر' if s in (1,2) else 'َر'); continue
            if b=='AO':
                v='و' if (nxt and base(nxt)=='R') else 'ا'
                out += ('أو' if v=='و' else 'آ') if start else v; continue
            if i==0: out += INI[b]
            elif prev in VOW and prev!='ER' and b in ('IH','EH') and not out.endswith('ي'): out+='يِ'
            elif prev in VOW and prev!='ER':
                glide='' if out.endswith(('ي','و')) else ('و' if prev in ('UW','OW','AW','UH') else 'ي')
                out += glide+('ا' if (b=='AH' and i==n-1) else MED[b])
            elif b=='AH' and i==n-1 and n>2: out+='ا'
            else: out+=MED[b]
        else:
            if b in ('T','D') and prev and (prev in VOW or prev=='R') and nxt and base(nxt) in VOW and stress(nxt)==0:
                out+='د'; continue
            if b=='NG' and nxt and base(nxt) in ('K','G'): out+='ن'; continue
            out+=CONS[b]
    return out
OVR={'use':'يوز','read':'ريد','live':'لِڤ','lead':'ليد','close':'كلوز','wind':'وِند','wound':'ووند','record':'رِكورد','wi':'واي','fi':'فاي','wifi':'واي فاي','tv':'تي ڤي','ok':'أوكَي','okay':'أوكَي','a':'أَ','the':'ذَ','to':'تو','you':'يو','for':'فور','of':'أَڤ','and':'آند','an':'آن','i':'آي','my':'ماي','your':'يور','can':'كان','do':'دو','does':'دَز','was':'وَز','at':'آت','in':'إِن','on':'أون','is':'إِز','are':'آر','am':'آم','it':'إِت','what':'وات','that':'ذات','have':'هاڤ','has':'هاز','with':'وِذ','from':'فرَم','or':'أور','but':'بَت','me':'مي','we':'وي','be':'بي','not':'نات','some':'سَم','there':'ذير','where':'وير'}
def word(w):
    k=w.lower()
    if k in OVR: return OVR[k]
    if k in D: return conv(D[k][0])
    if "'" in k:
        a,b=k.split("'",1)
        base=word(a)
        if base is None: return None
        suf={'s':'س','m':'م','re':'ر','ll':'ل','ve':'ڤ','d':'د','t':'ت'}.get(b)
        if k in D: return conv(D[k][0])
        return base+suf if suf else None
    return None
def sentence(text):
    toks=re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?|\.\.\.|[^\sA-Za-z]",text)
    out=[];miss=[]
    for t in toks:
        if re.match(r"[A-Za-z]",t):
            r=word(t)
            if r is None: miss.append(t); r='?'
            out.append(r)
        elif t=='...': out.append('...')
        elif t in '?!': 
            if out: out[-1]+= '؟' if t=='?' else '!'
        elif t==',':
            if out: out[-1]+='،'
    return ' '.join(out),miss
