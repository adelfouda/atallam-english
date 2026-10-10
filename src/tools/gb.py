import re
from us import D, CONS, VOW, base, stress, MED, INI, word as us_word
def conv_gb(phones, w):
    w=w.lower(); out=''; n=len(phones)
    lot = ('o' in w) or re.search(r'(^|[^a-z])(w|qu)a', w) is not None or w.startswith('wa')
    for i,p in enumerate(phones):
        b=base(p); s=stress(p)
        prev = base(phones[i-1]) if i>0 else None
        nb = base(phones[i+1]) if i+1<n else None
        r_next = (nb=='R') and not (i+2<n and base(phones[i+2]) in VOW)   # R that will be dropped
        if b in VOW:
            start=(i==0)
            if b=='ER':
                if nb in VOW:
                    out += ('أَر' if start else 'َر'); continue
                if s in (1,2): out += ('إِ' if start else 'ِ')
                else: out += ('أَ' if start else ('ا' if i==n-1 else 'َ'))
                continue
            if r_next and b in ('EH','IH','IY'):
                out += ('إيا' if start else 'يا'); continue
            if r_next and b in ('UH','UW'):
                out += ('أوا' if start else 'وا'); continue
            if b=='AO':
                out += ('أو' if start else 'و'); continue
            if b=='AA' and not r_next and lot:
                out += ('أو' if start else 'و'); continue
            if b=='UW' and prev in ('T','D','N','S','Z','L') and re.search(r'u|ew|eu', w) and not re.search(r'oo', w):
                out += 'يو'; continue
            if i==0: out += INI[b]
            elif prev in VOW and prev!='ER' and b in ('IH','EH') and not out.endswith('ي'): out+='يِ'
            elif prev in VOW and prev!='ER':
                glide='' if out.endswith(('ي','و','ا')) else ('و' if prev in ('UW','OW','AW','UH') else 'ي')
                out += glide+('ا' if (b=='AH' and i==n-1) else MED[b])
            elif b=='AH' and i==n-1 and n>2: out+='ا'
            else: out+=MED[b]
        else:
            if b=='R' and not (nb in VOW): continue
            if b=='NG' and nb in ('K','G'): out+='ن'; continue
            out+=CONS[b]
    return out
GB={'a':'أَ','the':'ذَ','to':'تو','you':'يو','for':'فو','of':'أوڤ','and':'آند','an':'آن','i':'آي','my':'ماي','your':'يو','can':'كان',
'do':'دو','does':'دَز','was':'ووز','at':'آت','in':'إِن','on':'أون','is':'إِز','are':'آ','am':'آم','it':'إِت','what':'ووت','that':'ذات',
'have':'هاڤ','has':'هاز','with':'وِذ','from':'فروم','or':'أو','but':'بَت','me':'مي','we':'وي','be':'بي','not':'نوت','some':'سَم',
'there':'ذيا','where':'ويا','here':'هيا','their':'ذيا','hear':'هيا','our':'آوا','hour':'آوا','ok':'أوكَي','okay':'أوكَي','tv':'تي ڤي',
'wifi':'واي فاي','wi':'واي','fi':'فاي','use':'يوز','read':'ريد','live':'لِڤ','lead':'ليد','close':'كلوز','wind':'وِند','wound':'ووند','record':'رِكود',
'schedule':'شِديول','tomato':'تَماتو','vitamin':'ڤِتَمِن','garage':'گاراژ','data':'دَيتا','herb':'هِب','advertisement':'أدڤِتِسمَنت',
'either':'آيذا','neither':'نايذا','route':'روت','can\'t':'كانت','after':'آفتا','water':'ووتا','sorry':'سوري','not':'نوت','often':'أوفَن',
'lieutenant':'لِفتِنَنت','leisure':'لِژا','privacy':'پرِڤَسي','mobile':'موبايل','stomachache':'ستَمَك أَيك','iqama':'إِقاما','quran':'كُران','halal':'حَلال','eid':'عيد','ramadan':'رامَدان'}
def word_gb(w):
    k=w.lower()
    if k in GB: return GB[k]
    if k in D: return conv_gb(D[k][0], k)
    if "'" in k:
        a,b=k.split("'",1); bs=word_gb(a)
        if bs is None: return None
        suf={'s':'س','m':'م','re':'','ll':'ل','ve':'ڤ','d':'د','t':'ت'}.get(b)
        return bs+suf if suf is not None else None
    return None
def phrase_gb(text):
    toks=re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?|\.\.\.|[^\sA-Za-z]",text.replace('’',"'"))
    out=[]
    for t in toks:
        if re.match(r"[A-Za-z]",t):
            r=word_gb(t)
            if r is None: return None
            out.append(r)
        elif t=='...': out.append('...')
        elif t in '?!' and out: out[-1]+= '؟' if t=='?' else '!'
        elif t==',' and out: out[-1]+='،'
    return ' '.join(out)
if __name__=='__main__':
    for w in ['water','car','hot','job','stop','new','Tuesday','student','teacher','bird','work','nurse','chair','here','door','four','call','talk','coffee','dog','better','city','party','sure','tour','father','watch','want','what','body','idea','I\'m fine, thank you.','Where is the bathroom?','Can you help me, please?','dictionary','computer','very','sorry','hurry','carry','story','morning']:
        print(w, phrase_gb(w))
