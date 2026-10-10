"""يبني public/index.html من القالب والبيانات.
التشغيل من جذر المستودع:  python3 src/build.py  أو  python3 src/build.py '{...firebase config...}'"""
import sys, os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg=sys.argv[1] if len(sys.argv)>1 else 'null'
tpl=open(os.path.join(root,'src/template.html'),encoding='utf-8').read()
data=open(os.path.join(root,'src/data3.json'),encoding='utf-8').read().replace('</','<\\/')
head='''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#21508F">
<meta name="description" content="تعلم الإنجليزي بالنطق الأمريكي والبريطاني: كلمات يومية، مراجعة، تمارين، دروس قواعد، ومحادثات.">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/icon-192.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="أتعلم إنجليزي">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
'''
tail=open(os.path.join(root,'src/standalone_tail.html'),encoding='utf-8').read().replace('__FIREBASE_CONFIG__',cfg)
open(os.path.join(root,'public/index.html'),'w',encoding='utf-8').write(head+tpl.replace('__DATA__',data)+tail+'\n</body></html>\n')
print('built public/index.html')
