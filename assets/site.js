/* Umumiy sarlavha, pastki qism va til almashtirish. */
(function(){
const page=document.body.dataset.page||'';
const cur=k=>page===k?' aria-current="page" class="active"':'';

/* Asosiy menyu va uning tarkibi: [matn, havola]. Havola "#" bo'lsa, sahifa hali tayyor emas. */
const MENU=[
 {t:'Akademiya haqida',href:'index.html#about',sub:[['Missiya va qaror','index.html#about'],['Rahbariyat','#'],['Tuzilma','#'],['Ustav va hujjatlar','ochiqlik.html#hujjat'],['Hamkor akademiyalar','#'],['Manzil va aloqa','index.html#aloqa']]},
 {t:'Ta’lim',href:'dastur.html',page:'talim',sub:[['Bakalavriat','dastur.html'],['Magistratura','#'],['Qo‘shma dasturlar','#'],['Dual ta’lim','dastur.html#amaliyot'],['Malaka oshirish','#'],['O‘quv kalendari','#']]},
 {t:'Qabul',href:'qabul.html',page:'qabul',sub:[['Yo‘nalishlar','dastur.html'],['Qabul tartibi','qabul.html#qadamlar'],['Ijodiy imtihon','qabul.html#talablar'],['To‘lov va grant','qabul.html#narx'],['Xorijiy fuqarolar','qabul.html#talablar'],['Onlayn ariza','ariza.html']]},
 {t:'Talabalarga',href:'index.html#xizmatlar',sub:[['Registrator ofisi','index.html#xizmatlar'],['HEMIS va LMS','index.html#xizmatlar'],['Turar joy','#'],['Stipendiya','#'],['To‘garaklar','#'],['Virtual qabulxona','ochiqlik.html#qabulxona']]},
 {t:'Ilm-fan',href:'#',sub:[['Tadqiqot yo‘nalishlari','#'],['Laboratoriyalar','#'],['Nashrlar','#'],['Konferensiyalar','#'],['Xalqaro hamkorlik','#'],['Innovatsiya','#']]},
 {t:'Showroom',href:'showroom.html',page:'showroom',sub:[['Bitiruv kolleksiyalari','showroom.html'],['Shoular va tadbirlar','showroom.html'],['Talaba loyihalari','showroom.html'],['Milliy brendlar','#'],['Arxiv','showroom.html'],['Galereya','showroom.html']]},
 {t:'Karyera',href:'#',sub:[['Vakansiyalar','#'],['Ish beruvchilarga','#'],['Bitiruvchilar','#'],['Amaliyot','#'],['Bandlik monitoringi','#'],['Karyera markazi','#']]},
 {t:'Yangiliklar',href:'yangiliklar.html',page:'yangilik',sub:[['Yangiliklar','yangiliklar.html'],['E’lonlar','yangiliklar.html'],['Tadbirlar kalendari','yangiliklar.html'],['Jurnal','yangiliklar.html'],['Media','yangiliklar.html'],['Matbuot xizmati','yangiliklar.html']]},
 {t:'Ochiqlik',href:'ochiqlik.html',page:'ochiqlik',sub:[['Ochiq ma’lumotlar','ochiqlik.html#malumot'],['Murojaatlar tartibi','ochiqlik.html#murojaat'],['Rahbar qabulxonasi','ochiqlik.html#qabulxona'],['Korrupsiyaga qarshi kurashish','ochiqlik.html#korrupsiya'],['Hisobotlar','ochiqlik.html#hisobot'],['Xaridlar','ochiqlik.html#xarid']]}
];
const AUD=[['Abituriyent','qabul.html'],['Talaba','index.html#xizmatlar'],['O‘qituvchi','#'],['Ish beruvchi va hamkor','#'],['Bitiruvchi','#'],['Xorijiy fuqaro','qabul.html#talablar']];

const TOP=`
<div class="proto">Prototip: matnlar, raqamlar va rasmlar namunaviy. Qizil belgilangan joylar tasdiqlanishi kerak.</div>
<div class="topbar">
  <div class="wrap">
    <div class="group left">
      <a href="tel:+998000000000"><span class="phone-label">Aloqa: </span><span data-cms-phone>+998 (__) ___-__-__</span></a>
      <a href="ochiqlik.html#qabulxona">Rektorning virtual qabulxonasi</a>
    </div>
    <div class="group">
      <form class="search" role="search" onsubmit="return false"><input type="search" placeholder="Qidiruv" data-t-attr="placeholder" aria-label="Qidiruv"><button type="submit" aria-label="Qidiruv">⌕</button></form>
      <a href="index.html#xizmatlar">HEMIS</a>
      <span class="lang" role="group" aria-label="Til / Language"><a href="#" data-lang="uz" class="on">UZ</a><a href="#" data-lang="en">EN</a><a href="#" data-lang="ru">RU</a><a href="#" data-lang="fr">FR</a></span>
    </div>
  </div>
</div>
<header class="site">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="TIFA">
      <span class="mark" aria-hidden="true"></span>
      <span><b>TIFA</b><small>Toshkent xalqaro<br>moda akademiyasi</small></span>
    </a>
    <nav id="nav" aria-label="Asosiy menyu">
      <ul>${MENU.map(m=>`
        <li class="has-sub"><a href="${m.href}"${m.page&&page===m.page?' aria-current="page" class="active"':''}>${m.t}</a><button class="subtoggle" type="button" aria-expanded="false" aria-label="+">+</button>
          <ul class="sub">${m.sub.map(s=>`<li><a href="${s[1]}">${s[0]}</a></li>`).join('')}</ul>
        </li>`).join('')}
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-primary" href="ariza.html"${cur('ariza')}>Ariza topshirish</a>
      <button class="burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Menyuni ochish">☰</button>
    </div>
  </div>
</header>
<div class="audience">
  <div class="wrap">
    <span class="lbl">Tezkor havolalar:</span>
    ${AUD.map(a=>`<a href="${a[1]}">${a[0]}</a>`).join('')}
  </div>
</div>`;

const FOOT=`
<footer id="ochiqlik">
  <div class="wrap">
    <div class="cols">
      <div>
        <a class="logo" href="index.html"><span class="mark" aria-hidden="true"></span><span><b style="color:#fff">TIFA</b></span></a>
        <p style="margin-top:12px">Toshkent xalqaro moda akademiyasi</p>
        <span class="accr">Akkreditatsiya belgilari: olingandan keyin</span>
      </div>
      <div>
        <h4>Ochiqlik</h4>
        <ul>
          <li><a href="ochiqlik.html#malumot">Ochiq ma’lumotlar</a></li>
          <li><a href="ochiqlik.html#murojaat">Murojaatlarni ko‘rib chiqish tartibi</a></li>
          <li><a href="ochiqlik.html#korrupsiya">Korrupsiyaga qarshi kurashish</a></li>
          <li><a href="ochiqlik.html#xarid">Xaridlar va tenderlar</a></li>
        </ul>
      </div>
      <div>
        <h4>Hujjatlar</h4>
        <ul>
          <li><a href="ochiqlik.html#hujjat">Me’yoriy hujjatlar</a></li>
          <li><a href="ochiqlik.html#hujjat">Nizom va tuzilma</a></li>
          <li><a href="ochiqlik.html#hujjat">Rekvizitlar</a></li>
          <li><a href="ochiqlik.html#hisobot">Hisobotlar</a></li>
        </ul>
      </div>
      <div>
        <h4>Qulaylik</h4>
        <ul>
          <li><a href="#">Maxfiylik siyosati</a></li>
          <li><a href="#">Sayt xaritasi</a></li>
          <li><a href="ochiqlik.html#qabulxona">Virtual qabulxona</a></li>
        </ul>
      </div>
    </div>
    <div class="bottom">
      <span>© 2026 Toshkent xalqaro moda akademiyasi</span>
      <span>Prototip · tasdiqlashga mo‘ljallangan</span>
    </div>
  </div>
</footer>`;

document.getElementById('site-top').outerHTML=TOP;
document.getElementById('site-foot').outerHTML=FOOT;

/* mobil menyu */
const b=document.getElementById('burger'),n=document.getElementById('nav');
b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.addEventListener('click',e=>{
  const t=e.target.closest('.subtoggle');
  if(t){const li=t.parentElement,o=li.classList.toggle('open');t.setAttribute('aria-expanded',o);t.textContent=o?'–':'+';return}
  if(e.target.tagName==='A'&&e.target.getAttribute('href')!=='#'){n.classList.remove('open');b.setAttribute('aria-expanded',false)}
});

/* tillar */
const IDX={en:0,ru:1,fr:2};
const norm=s=>s.replace(/\s+/g,' ').trim().replace(/[’‘ʻʼ]/g,"'");
const M=new Map(Object.entries(window.D).map(([k,v])=>[norm(k),v]));
const nodes=[];
const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let x;
while(x=w.nextNode()){
  if(x.parentElement.closest('script,style'))continue;
  const k=norm(x.nodeValue);if(M.has(k))nodes.push({n:x,raw:x.nodeValue,v:M.get(k)});
}
/* atributlar: aria-label, alt, placeholder, data-i18n-attr bilan belgilangan */
const attrs=[];
document.querySelectorAll('[data-t-attr]').forEach(el=>{
  const a=el.dataset.tAttr,raw=el.getAttribute(a),k=norm(raw||'');
  if(M.has(k))attrs.push({el,a,raw,v:M.get(k)});
});
const TITLE=window.PAGE_TITLE||{};
function setLang(l){
  nodes.forEach(o=>{
    if(l==='uz'){o.n.nodeValue=o.raw;return}
    const m=o.raw.match(/^(\s*)[\s\S]*?(\s*)$/);
    o.n.nodeValue=m[1]+o.v[IDX[l]]+m[2];
  });
  attrs.forEach(o=>o.el.setAttribute(o.a,l==='uz'?o.raw:o.v[IDX[l]]));
  document.documentElement.lang=l;
  if(TITLE[l])document.title=TITLE[l];
  document.querySelectorAll('.lang a').forEach(a=>a.classList.toggle('on',a.dataset.lang===l));
  try{localStorage.setItem('tifa-lang',l)}catch(e){}
  window.dispatchEvent(new CustomEvent('tifa:lang',{detail:l}));
}
window.setLang=setLang;window.TIFA_T=(uz)=>{const v=M.get(norm(uz));const l=document.documentElement.lang;return v&&IDX[l]!==undefined?v[IDX[l]]:uz};window.__i18nNodes=nodes;window.__i18nMap=M;
document.querySelector('.lang').addEventListener('click',e=>{
  const a=e.target.closest('a[data-lang]');if(!a)return;e.preventDefault();setLang(a.dataset.lang);
});
try{const s=localStorage.getItem('tifa-lang');if(s&&s!=='uz'&&IDX[s]!==undefined)setLang(s)}catch(e){}
})();
