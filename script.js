let cur = 1;
const TOTAL = 10;
const labels = ['Message','Cover','1st Date','Story','Childhood','Year','Moments','Them','Proud','Song'];
const photoCount = { coverImg:0, datePhotos:0, littlePhotos:0, moments:0, themPhotos:0 };

function buildProgress() {
  const bar = document.getElementById('progressBar');
  bar.innerHTML = '';
  for (let i=1; i<=TOTAL; i++) {
    const cls = i===cur?' active':i<cur?' done':'';
    const d = document.createElement('div');
    d.className='prog-step'+cls; d.id='pg'+i;
    d.innerHTML=`<div class="prog-dot">${i<cur?'✓':i}</div><div class="prog-label">${labels[i-1]}</div>`;
    d.onclick=()=>{if(i<cur)jumpTo(i);};
    bar.appendChild(d);
    if(i<TOTAL){const l=document.createElement('div');l.className='prog-line';bar.appendChild(l);}
  }
  // scroll active into view
  const active = document.getElementById('pg'+cur);
  if(active) active.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
}

function jumpTo(n) {
  document.getElementById('step'+cur)?.classList.remove('active');
  cur=n;
  (document.getElementById('step'+cur)||document.getElementById('stepFinal')).classList.add('active');
  updateNav(); buildProgress(); window.scrollTo(0,0);
}
function nextStep() {
  if(cur===TOTAL){submit();return;}
  document.getElementById('step'+cur).classList.remove('active');
  cur++;
  document.getElementById('step'+cur).classList.add('active');
  updateNav(); buildProgress(); window.scrollTo(0,0);
}
function prevStep() {
  if(cur<=1)return;
  document.getElementById('step'+cur).classList.remove('active');
  cur--;
  document.getElementById('step'+cur).classList.add('active');
  updateNav(); buildProgress(); window.scrollTo(0,0);
}
function updateNav() {
  document.getElementById('backBtn').style.display = cur>1?'block':'none';
  document.getElementById('nextBtn').textContent = cur===TOTAL?'Submit Order 💌':'Next →';
}

// live message cover sync
function liveMsg(v) {
  const el=document.getElementById('prevMsg');
  el.textContent=v||'Your message will appear here…';
  el.style.color=v?'rgba(255,220,220,0.95)':'rgba(255,200,200,0.7)';
  const el2=document.getElementById('prevMsg2');
  if(el2) el2.textContent=v;
}

function handleCover(input) {
  const f=input.files[0]; if(!f)return;
  photoCount.coverImg=1;
  const url=URL.createObjectURL(f);
  const area=document.getElementById('coverImgArea');
  area.innerHTML=`<img class="cover-photo" src="${url}">`;
  document.getElementById('upBtn2').classList.add('has-files');
}

function handleDuo(input,s1,s2,btnId,capId) {
  const files=Array.from(input.files);
  photoCount.datePhotos=files.length;
  document.getElementById(btnId).classList.add('has-files');
  files.slice(0,2).forEach((f,i)=>{
    const slot=document.getElementById(i===0?s1:s2);
    slot.innerHTML=`<img src="${URL.createObjectURL(f)}"><div class="slot-label">Photo ${i+1}</div>`;
    slot.classList.add('filled');
  });
  document.getElementById(capId).textContent='Your first date ♥ ('+files.length+' photo'+(files.length>1?'s':'')+')';
}

function handlePolaroids(input,gridId,btnId,captions) {
  const files=Array.from(input.files);
  if(gridId==='littleGrid') photoCount.littlePhotos=files.length;
  else photoCount.themPhotos=files.length;
  const grid=document.getElementById(gridId);
  grid.innerHTML='';
  const rots=[-3,2,-1,3,-2,1];
  files.slice(0,4).forEach((f,i)=>{
    const p=document.createElement('div');
    p.className='polaroid'; p.style.setProperty('--rot',rots[i%rots.length]+'deg');
    p.innerHTML=`<img src="${URL.createObjectURL(f)}"><div class="pol-caption">${captions[i%captions.length]}</div>`;
    grid.appendChild(p);
  });
  document.getElementById(btnId).classList.add('has-files');
}

function handleGrid(input,gridId,btnId,capId,previewN,minN) {
  const files=Array.from(input.files);
  photoCount.moments=files.length;
  const grid=document.getElementById(gridId);
  grid.innerHTML='';
  for(let i=0;i<previewN;i++){
    const slot=document.createElement('div');
    slot.className='photo-slot';
    if(i<files.length){slot.innerHTML=`<img src="${URL.createObjectURL(files[i])}">`;slot.classList.add('filled');}
    else slot.textContent='📷';
    grid.appendChild(slot);
  }
  const enough=files.length>=minN;
  const cap=document.getElementById(capId);
  cap.textContent=files.length+' photos uploaded'+(enough?' ✓ Perfect!':' — need at least '+minN);
  cap.style.color=enough?'var(--red)':'var(--text-light)';
  document.getElementById(btnId).classList.add('has-files');
}

function clip(s,n){return s?(s.length>n?s.slice(0,n)+'…':s):'—';}

function submit() {
  if(cur==='preview'){
    document.getElementById('s1').textContent=clip(document.getElementById('loveMsg').value,50);
    document.getElementById('s2').textContent=photoCount.coverImg?'1 photo uploaded ✓':'Not uploaded';
    document.getElementById('s3').textContent=photoCount.datePhotos+' photo(s)';
    document.getElementById('s4').textContent=clip(document.getElementById('startedMsg').value,50);
    document.getElementById('s5').textContent=photoCount.littlePhotos+' photo(s)';
    document.getElementById('s6').textContent='20'+(document.getElementById('yearInput').value||'__');
    document.getElementById('s7').textContent=photoCount.moments+' photo(s)';
    document.getElementById('s8').textContent=photoCount.themPhotos+' photo(s)';
    document.getElementById('s9').textContent=clip(document.getElementById('proudMsg').value,50);
    document.getElementById('s10').textContent=document.getElementById('songInput').value||'—';
    document.getElementById('stepPreview').classList.remove('active');
    document.getElementById('stepFinal').classList.add('active');
    document.getElementById('navBar').style.display='none';
    document.getElementById('progressBar').style.display='none';
    window.scrollTo(0,0);
  }else{
    openPreview();
  }
}

function openIG() {
  const msg=encodeURIComponent(
    "Hi Handy Crafts! 💌 I just submitted my Valentine's Book order.\n\n"+
    "Message: "+(document.getElementById('loveMsg').value||'—')+"\n"+
    "Song: "+(document.getElementById('songInput').value||'—')+"\n"+
    "Year: 20"+(document.getElementById('yearInput').value||'__')+"\n\n"+
    "Total photos: "+(photoCount.coverImg+photoCount.datePhotos+photoCount.littlePhotos+photoCount.moments+photoCount.themPhotos)+"\n"+
    "I'm ready to send everything!"
  );
  window.open('https://instagram.com/handycrafts','_blank'); // IG doesn't support pre-filled text like WA but we can just redirect to profile
}

function restart() {
  cur=1;
  document.getElementById('stepFinal').classList.remove('active');
  document.getElementById('step1').classList.add('active');
  document.getElementById('navBar').style.display='flex';
  document.getElementById('progressBar').style.display='flex';
  updateNav(); buildProgress(); window.scrollTo(0,0);
}

// BOOK PREVIEW SYSTEM
let previewPage = 0;
const bookPages = [];
const photoStore = { coverImg: null, datePhotos: [], littlePhotos: [], moments: [], themPhotos: [] };

function captureAllData() {
  photoStore.coverImg = document.getElementById('coverImgArea')?.innerHTML || '';
  photoStore.datePhotos = [];
  photoStore.littlePhotos = [];
  photoStore.moments = [];
  photoStore.themPhotos = [];
  
  document.querySelectorAll('#d1 img, #d2 img').forEach(img => photoStore.datePhotos.push(img.src));
  document.querySelectorAll('#littleGrid img').forEach(img => photoStore.littlePhotos.push(img.src));
  document.querySelectorAll('#momGrid img').forEach(img => photoStore.moments.push(img.src));
  document.querySelectorAll('#themGrid img').forEach(img => photoStore.themPhotos.push(img.src));
}

function generateBookPages() {
  bookPages.length = 0;
  
  bookPages.push({
    type: 'cover',
    title: '💌 Valentine\'s Book',
    text: document.getElementById('loveMsg').value || 'Forever and always ♥',
    image: photoStore.coverImg
  });
  
  bookPages.push({
    type: 'dual',
    title: '🌹 First Date',
    text: 'Our perfect moment together',
    images: photoStore.datePhotos
  });
  
  bookPages.push({
    type: 'text',
    title: '✍️ How It Started',
    text: document.getElementById('startedMsg').value || 'Our beautiful beginning...'
  });
  
  bookPages.push({
    type: 'gallery',
    title: '👶 Before We Met',
    images: photoStore.littlePhotos
  });
  
  bookPages.push({
    type: 'text',
    title: '🗓️ The Year',
    text: '20' + (document.getElementById('yearInput').value || '__'),
    subtitle: 'When our story began'
  });
  
  bookPages.push({
    type: 'gallery',
    title: '📷 Our Moments',
    images: photoStore.moments.slice(0, 9)
  });
  
  if (photoStore.moments.length > 9) {
    bookPages.push({
      type: 'gallery',
      title: '📷 More Moments',
      images: photoStore.moments.slice(9, 18)
    });
  }
  
  bookPages.push({
    type: 'gallery',
    title: '🌟 You',
    images: photoStore.themPhotos
  });
  
  bookPages.push({
    type: 'text',
    title: '🏆 You Make Me Proud',
    text: document.getElementById('proudMsg').value || 'I\'m so proud of you...'
  });
  
  bookPages.push({
    type: 'text',
    title: '🎵 Our Song',
    text: document.getElementById('songInput').value || 'Our favorite song',
    subtitle: 'Playing in our hearts forever'
  });
}

function renderPageContent(pageData) {
  let html = `<div class="page-content">`;
  
  if (pageData.type === 'cover') {
    html += `<div class="page-header">${pageData.title}</div>`;
    if (pageData.image) html += pageData.image;
    html += `<div class="page-text">${pageData.text}</div><div style="margin-top:14px;font-size:32px;line-height:1;">♥</div>`;
  } else if (pageData.type === 'text') {
    html += `<div class="page-header">${pageData.title}</div><div class="page-text" style="margin-top:8px;">${pageData.text}</div>`;
    if (pageData.subtitle) html += `<div style="font-size:11px;margin-top:10px;color:var(--text-light);font-style:italic;">${pageData.subtitle}</div>`;
  } else if (pageData.type === 'dual') {
    html += `<div class="page-header" style="margin-bottom:8px;">${pageData.title}</div><div class="page-text" style="font-size:11px;margin-bottom:6px;">${pageData.text}</div><div class="page-images">`;
    pageData.images.forEach((img, i) => {
      if (img) html += `<img src="${img}" class="page-img" alt="photo ${i+1}">`;
    });
    html += `</div>`;
  } else if (pageData.type === 'gallery') {
    html += `<div class="page-header" style="margin-bottom:8px;">${pageData.title}</div><div class="page-gallery">`;
    pageData.images.slice(0, 6).forEach(img => {
      if (img) html += `<img src="${img}" alt="photo">`;
    });
    html += `</div>`;
  }
  
  html += `</div><div class="page-num">Page ${pageData.pageNum}</div>`;
  return html;
}

function renderPreviewPages() {
  const leftStack = document.getElementById('leftStack');
  const rightStack = document.getElementById('rightStack');
  leftStack.innerHTML = '';
  rightStack.innerHTML = '';
  
  const leftPageIdx = previewPage;
  const rightPageIdx = previewPage + 1;
  
  if (leftPageIdx < bookPages.length) {
    const leftPage = document.createElement('div');
    leftPage.className = `page page-left ${previewPage > 0 ? '' : 'cover'}`;
    bookPages[leftPageIdx].pageNum = leftPageIdx + 1;
    leftPage.innerHTML = renderPageContent(bookPages[leftPageIdx]);
    leftStack.appendChild(leftPage);
  }
  
  if (rightPageIdx < bookPages.length) {
    const rightPage = document.createElement('div');
    rightPage.className = `page page-right`;
    bookPages[rightPageIdx].pageNum = rightPageIdx + 1;
    rightPage.innerHTML = renderPageContent(bookPages[rightPageIdx]);
    rightStack.appendChild(rightPage);
  }
  
  const spread = previewPage + 1;
  document.getElementById('currentPage').textContent = spread + '-' + Math.min(spread + 1, bookPages.length);
  document.getElementById('totalPages').textContent = bookPages.length;
  document.getElementById('prevBtn').disabled = previewPage === 0;
  document.getElementById('nextBtn').disabled = previewPage + 1 >= bookPages.length;
}

function nextPreview() {
  if (previewPage + 1 < bookPages.length) {
    const leftPage = document.querySelector('.page-left');
    const rightPage = document.querySelector('.page-right');
    
    if (leftPage) leftPage.classList.add('flip');
    if (rightPage) rightPage.classList.add('flip');
    
    setTimeout(() => {
      previewPage += 2;
      if (previewPage >= bookPages.length) previewPage = bookPages.length - 1;
      renderPreviewPages();
      document.querySelectorAll('.page').forEach(p => p.classList.remove('flip'));
    }, 400);
  }
}

function prevPreview() {
  if (previewPage > 0) {
    const leftPage = document.querySelector('.page-left');
    const rightPage = document.querySelector('.page-right');
    
    if (leftPage) leftPage.classList.add('flip');
    if (rightPage) rightPage.classList.add('flip');
    
    setTimeout(() => {
      previewPage -= 2;
      if (previewPage < 0) previewPage = 0;
      renderPreviewPages();
      document.querySelectorAll('.page').forEach(p => p.classList.remove('flip'));
    }, 400);
  }
}

function openPreview() {
  captureAllData();
  generateBookPages();
  previewPage = 0;
  document.getElementById('step'+cur).classList.remove('active');
  document.getElementById('stepPreview').classList.add('active');
  renderPreviewPages();
  document.getElementById('navBar').style.display='flex';
  document.getElementById('progressBar').style.display='none';
  document.getElementById('backBtn').style.display='block';
  document.getElementById('nextBtn').textContent='Confirm Order 💌';
  cur='preview';
  window.scrollTo(0,0);
}

buildProgress(); updateNav();
