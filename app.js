(function(){
  // Last updated/year
  const y = document.getElementById('year');
  const lu = document.getElementById('lastUpdated');
  if (y) y.textContent = new Date().getFullYear();
  if (lu) lu.textContent = document.body.getAttribute('data-last-updated') || new Date().toISOString().slice(0,10);

  // Mobile nav
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Back to Top
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) btt.classList.add('show'); else btt.classList.remove('show');
    });
    btt.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  // Theme (persisted)
  const themeToggle = document.getElementById('themeToggle');
  const applyTheme = (t) => document.documentElement.setAttribute('data-theme', t);
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
  if (themeToggle) {
    themeToggle.textContent = saved === 'dark' ? '🌙' : '☀️';
    themeToggle.addEventListener('click', () => {
      const next = (localStorage.getItem('theme') || 'dark') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
      applyTheme(next);
    });
  }

  // Command palette
  const palette = document.getElementById('palette');
  const paletteSearch = document.getElementById('paletteSearch');
  const paletteList = document.getElementById('paletteList');
  const paletteClose = document.getElementById('paletteClose');
  const pages = [
    {href:'index.html',label:'Home'},
    {href:'about.html',label:'About'},
    {href:'stanford-fit.html',label:'Stanford Fit'},
    {href:'research.html',label:'Research'},
    {href:'publications.html',label:'Publications'},
    {href:'teaching.html',label:'Teaching'},
    {href:'awards.html',label:'Awards'},
    {href:'news.html',label:'News'},
    {href:'contact.html',label:'Contact'},
  ];
  function openPalette(){
    palette.setAttribute('aria-hidden','false');
    paletteSearch.value = '';
    renderList('');
    setTimeout(()=>paletteSearch.focus(), 0);
  }
  function closePalette(){
    palette.setAttribute('aria-hidden','true');
  }
  function renderList(q){
    const ql = q.trim().toLowerCase();
    const items = pages.filter(p=>!ql || p.label.toLowerCase().includes(ql));
    paletteList.innerHTML = items.map(p=>`<li data-href="${p.href}">${p.label}</li>`).join('');
  }
  document.getElementById('cmdK')?.addEventListener('click', openPalette);
  document.addEventListener('keydown', (e)=>{
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openPalette(); }
    if(e.key === 'Escape') closePalette();
  });
  paletteClose?.addEventListener('click', closePalette);
  palette?.addEventListener('click', (e)=>{ if(e.target === palette) closePalette(); });
  paletteList?.addEventListener('click', (e)=>{
    const li = e.target.closest('li'); if (!li) return;
    window.location.href = li.getAttribute('data-href');
  });

  // Publications page enhancements
  const pubList = document.getElementById('pubList');
  const pubSearch = document.getElementById('pubSearch');
  const pubYear = document.getElementById('pubYear');
  const pubCount = document.getElementById('pubCount');
  if (pubList && pubSearch && pubYear) {
    fetch('assets/pubs.json').then(r=>r.json()).then(data=>{
      const years = ['All', ...Array.from(new Set(data.map(d=>d.year))).sort((a,b)=>b-a)];
      years.forEach(y=>{
        const opt = document.createElement('option'); opt.value = y; opt.textContent = y; pubYear.appendChild(opt);
      });
      function render(){
        const q = pubSearch.value.trim().toLowerCase();
        const y = pubYear.value;
        const filtered = data.filter(d => (y==='All' || d.year == y) && (
          d.title.toLowerCase().includes(q) || d.venue.toLowerCase().includes(q) || (d.topics||[]).join(' ').toLowerCase().includes(q)
        ));
        pubList.innerHTML = filtered.map(d=>`
          <li>
            <div class="row">
              <div>
                <div class="title">${d.title}</div>
                <div class="muted">${d.venue} • ${d.year}</div>
                <div class="badges">${(d.topics||[]).map(t=>`<span class="badge">${t}</span>`).join('')}</div>
              </div>
              <div class="actions"><a class="btn secondary" target="_blank" rel="noopener" href="${d.doi}">DOI</a></div>
            </div>
          </li>`).join('');
        if (pubCount) pubCount.textContent = `${filtered.length} result${filtered.length===1?'':'s'}`;
      }
      pubSearch.addEventListener('input', render);
      pubYear.addEventListener('change', render);
      render();
    });
  }
})();


  // Canonical link (set your base here once you deploy)
  const BASE_URL = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  (function ensureCanonical(){
    const link = document.querySelector('link[rel=canonical]') || document.createElement('link');
    link.setAttribute('rel','canonical');
    link.setAttribute('href', BASE_URL + (window.location.pathname.split('/').pop() || 'index.html'));
    if (!link.parentNode) document.head.appendChild(link);
  })();

  // Simple fuzzy includes filter for palette
  (function enhancePalette(){
    const input = document.getElementById('paletteSearch');
    const list = document.getElementById('paletteList');
    if (!input || !list) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      [...list.querySelectorAll('li')].forEach(li => {
        const visible = !q || li.textContent.toLowerCase().includes(q);
        li.style.display = visible ? '' : 'none';
      });
    });
  })();

  // Citation export (BibTeX/RIS) from assets/pubs.json
  function exportCitations(format, data){
    const lines = [];
    if (format === 'bib'){
      data.forEach((d,i)=>{
        const key = (d.title || 'ref').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') + '-' + d.year;
        lines.push(`@article{${key},`);
        lines.push(`  title={${d.title}},`);
        lines.push(`  year={${d.year}},`);
        lines.push(`  journal={${d.venue}},`);
        if (d.doi) lines.push(`  doi={${d.doi.replace('https://doi.org/','')}},`);
        lines.push('}');
        lines.push('');
      });
      downloadText('foysal-publications.bib', lines.join('\n'));
    } else if (format === 'ris'){
      data.forEach(d=>{
        lines.push('TY  - JOUR');
        lines.push(`TI  - ${d.title}`);
        lines.push(`PY  - ${d.year}`);
        if (d.venue) lines.push(`JO  - ${d.venue}`);
        if (d.doi) lines.push(`DO  - ${d.doi}`);
        lines.push('ER  - ');
        lines.push('');
      });
      downloadText('foysal-publications.ris', lines.join('\n'));
    }
  }
  function downloadText(filename, text){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:'text/plain'}));
    a.download = filename; a.click(); URL.revokeObjectURL(a.href);
  }

  (function wirePubExports(){
    const bib = document.getElementById('pubExportBib');
    const ris = document.getElementById('pubExportRIS');
    if (!bib || !ris) return;
    fetch('assets/pubs.json').then(r=>r.json()).then(data=>{
      bib.addEventListener('click', ()=>exportCitations('bib', data));
      ris.addEventListener('click', ()=>exportCitations('ris', data));
    });
  })();
