(() => {
  const config = window.PROTOTYPE_CONFIG || {};
  const catalog = [
    {id:'sales',icon:'↗',name:'Sales Agent',industries:['all'],keywords:['sales','lead','prospect','crm','outreach','follow up','pipeline','revenue','deal'],summary:'Qualifies opportunities, researches prospects and keeps every follow-up moving.',portrait:'/hatchy-sales.webp',team:'Sales',mcps:['HubSpot','Salesforce','Gmail','Slack','LinkedIn'],outcomes:['Research every new lead automatically','Score and prioritise opportunities','Draft outreach in your company voice','Schedule timely follow-ups','Keep your CRM records current']},
    {id:'documents',icon:'▤',name:'Document Agent',industries:['professional-services','legal','construction','all'],keywords:['document','proposal','contract','report','brief','policy','pdf','draft','legal','template'],summary:'Turns briefs and source material into polished documents using your templates.',portrait:'/hatchy-document.webp',team:'Documents',mcps:['Google Drive','Microsoft 365','Notion','Dropbox','Slack'],outcomes:['Create proposals from approved templates','Summarise long source documents','Prepare client-ready reports','Maintain consistent tone and branding','Route drafts for human approval']},
    {id:'invoices',icon:'$',name:'Invoice Agent',industries:['professional-services','retail','construction','all'],keywords:['invoice','finance','accounts','payment','expense','bookkeeping','xero','billing','purchase order'],summary:'Reads invoices, checks records, flags anomalies and prepares approvals.',portrait:'/hatchy-invoice.webp',team:'Finance',mcps:['Xero','MYOB','QuickBooks','Gmail','Google Drive'],outcomes:['Capture invoice data automatically','Match invoices to business records','Flag duplicates and unusual amounts','Prepare approval queues','Produce scheduled finance summaries']},
    {id:'support',icon:'◉',name:'Support Agent',industries:['retail','healthcare','technology','all'],keywords:['support','enquiry','ticket','customer service','help desk','reply','triage','complaint','inbox'],summary:'Triages customer enquiries, drafts helpful replies and escalates what matters.',portrait:'/hatchy-support.webp',team:'Support',mcps:['Zendesk','Intercom','Gmail','Slack','Microsoft Teams'],outcomes:['Classify every inbound enquiry','Draft replies in your support voice','Surface urgent or sensitive cases','Find answers from your knowledge base','Track recurring customer issues']},
    {id:'website',icon:'◇',name:'Website Agent',industries:['all'],keywords:['website','content','seo','publish','webflow','wordpress','page','marketing','blog','copy'],summary:'Keeps website content accurate, on-brand and ready for approval before publishing.',portrait:'/hatchy-website.webp',team:'Marketing',mcps:['GitHub','Webflow','WordPress','Google Drive','Slack'],outcomes:['Draft new website pages','Update approved copy and details','Check pages for stale information','Prepare search-friendly metadata','Publish only after human approval']},
    {id:'operations',icon:'✓',name:'Operations Agent',industries:['professional-services','construction','healthcare','all'],keywords:['operations','workflow','project','task','deadline','schedule','coordination','process','compliance','ops'],summary:'Coordinates repeatable workflows and keeps teams informed when work changes state.',portrait:'/hatchy-routing.webp',team:'Operations',mcps:['Monday.com','Asana','Notion','Slack','Microsoft Teams'],outcomes:['Turn requests into structured work','Monitor deadlines and blockers','Prepare daily operating summaries','Chase missing information','Escalate exceptions to the right person']}
  ];
  const state = {step:0,name:'',role:'',look:'',slots:[],variant:null,selectedImage:'',done:false};
  const root = document.getElementById('prototype-app');
  const company = config.company || 'Your Company';
  const industry = config.industry || 'professional-services';
  const industryLabel = config.industryLabel || 'Your industry';
  const variantLabels = ['Cobalt','Teal','Indigo'];
  // Real portrait generation. Point portraitEndpoint at a callable endpoint and it upgrades
  // automatically; until then each egg falls back to an on-brand simulated mascot so the
  // prospect experience is never broken. Set generatePortraits:false to skip the call entirely.
  const portraitEndpoint = config.portraitEndpoint || 'https://agent-hatchers-portrait-proxy.vercel.app/api/prototype-portrait';
  const usePortraits = config.generatePortraits !== false && !!portraitEndpoint;
  const recommended = new Set(config.recommendedAgents||[]);
  function rankAgents(){const text=`${state.name} ${state.role} ${state.look}`.toLowerCase();return catalog.map((agent,index)=>{let score=0;agent.keywords.forEach(k=>{if(text.includes(k))score+=4});if(agent.industries.includes(industry))score+=2;if(recommended.has(agent.id))score+=1;return{agent,score,index};}).sort((a,b)=>b.score-a.score||a.index-b.index);}
  const roleSeeds = [
    {label:'Sales',text:'Qualify inbound leads, research prospects and keep follow-ups moving.'},
    {label:'Invoices',text:'Read invoices, check them against our records and prepare approvals.'},
    {label:'Research',text:'Research companies, people and topics and summarise the findings.'},
    {label:'Email assistant',text:'Triage the inbox, draft replies in our voice and flag what needs a human.'},
    {label:'Support',text:'Answer customer questions and draft helpful, on-brand replies.'}
  ];
  const lookSeeds = [
    {label:'Friendly & rounded',text:'a friendly, rounded robot with big eyes in blue and white'},
    {label:'Sleek & techy',text:'a sleek metallic assistant with glowing blue accents'},
    {label:'Playful mascot',text:'a playful cartoon mascot, soft and approachable'},
    {label:'Calm & professional',text:'a calm, professional helper in navy and white'}
  ];

  const button = (label, action, secondary=false) => `<button class="btn ${secondary?'btn-secondary':'btn-primary'}" data-action="${action}">${label}</button>`;
  const bot = (extra='') => `<div class="bot ${extra}" role="img" aria-label="Agent design"></div>`;
  const slotVisual = (slot,i) => slot && slot.image ? `<img src="${escapeHtml(slot.image)}" alt="Agent design ${i+1}">` : bot('v'+i);
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function chip(){if(state.variant===null)return `<span class="private-pill">Private preview for ${escapeHtml(company)}</span>`;const inner=state.selectedImage?`<img class="chip-img" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+state.variant+' chip');return `<span class="agent-chip">${inner}<span>${escapeHtml(state.name)}</span></span>`;}
  const layout = content => `<main class="shell"><header class="topbar"><div class="brand"><img src="/agent-hatchers-logo.png" alt=""><span>Agent Hatchers</span></div>${chip()}</header><section class="panel"><div class="progress" aria-label="Prototype progress"><span style="--progress:${Math.min(100,(state.step+1)/7*100)}%"></span></div><div class="step-label">Step ${state.step+1} of 7</div>${content}</section></main>`;

  function render(){
    const screens = [welcome,nameScreen,designScreen,hatchScreen,revealScreen,marketScreen,connectScreen];
    const inner = screens[state.step]();
    root.innerHTML = state.step>=5 ? inner : layout(inner);
    bind();
  }
  const ic = {
    profiles:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>',
    chats:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 3z" fill="none" stroke-width="2"/></svg>',
    analytics:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke-width="2"/></svg>',
    config:'<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke-width="2"/><circle cx="16" cy="7" r="2.4" fill="none" stroke-width="2"/><circle cx="8" cy="17" r="2.4" fill="none" stroke-width="2"/></svg>',
    market:'<svg viewBox="0 0 24 24"><path d="M4 9l1-4h14l1 4M4 9h16v10H4zM4 9a3 3 0 006 0 3 3 0 006 0 3 3 0 004 0" fill="none" stroke-width="2"/></svg>',
    gallery:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg>',
    kanban:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1.4"/><rect x="10" y="4" width="5" height="11" rx="1.4"/><rect x="17" y="4" width="4" height="14" rx="1.4"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke-width="2"/><path d="M20 20l-4-4" stroke-width="2"/></svg>',
    plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-width="2.4"/></svg>',
    chev:'<svg viewBox="0 0 24 24"><path d="M8 10l4 4 4-4" fill="none" stroke-width="2"/></svg>'
  };
  function welcome(){return `<div class="stage welcome-grid"><div><h1 class="welcome-title">Hatch your agent</h1><div class="actions">${button('Start →','next')}</div></div><div class="welcome-art" aria-hidden="true"><div class="preview-egg"></div></div></div>`;}
  function nameScreen(){return `<div class="stage"><span class="eyebrow">Step 1 · Create a profile</span><h2>What should your agent be called?</h2><p>Choose a name your team will enjoy seeing in Slack, Teams or email — then tell us what it should help with.</p><input class="name-field" id="agent-name" maxlength="28" autocomplete="off" placeholder="e.g. Pip, Scout or Atlas" value="${escapeHtml(state.name)}" aria-label="Agent name"><label class="field-label" for="agent-role">What should ${escapeHtml(state.name||'it')} help with?</label><textarea class="look-field" id="agent-role" placeholder="e.g. Draft proposals from our templates and chase approvals" aria-label="What the agent does">${escapeHtml(state.role)}</textarea>${roleSeeds.length?`<div class="chips">${roleSeeds.map((s,i)=>`<button class="chip" data-role-index="${i}">${escapeHtml(s.label)}</button>`).join('')}</div>`:''}<div class="actions">${button('Back','back',true)}${button('Design its look →','save-name')}</div></div>`;}
  function designScreen(){return `<div class="stage"><span class="eyebrow">Step 2 · Design the look</span><h2>Describe how ${escapeHtml(state.name)} should look</h2><p>Write a short, practical description and we’ll hatch three designs for you to choose from.</p><textarea class="look-field" id="agent-look" maxlength="600" placeholder="e.g. a friendly rounded robot medic in blue and white, holding a checklist" aria-label="Describe the avatar">${escapeHtml(state.look)}</textarea><div class="chips">${lookSeeds.map((s,i)=>`<button class="chip" data-look-index="${i}">${escapeHtml(s.label)}</button>`).join('')}</div><div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  function hatchScreen(){const slots=state.slots.length?state.slots:[null,null,null];const settled=slots.every(Boolean);return `<div class="stage hatch-zone"><span class="eyebrow">Hatching</span><h2>Your clutch is hatching…</h2><p>${usePortraits?'Drawing three genuinely different designs from your description.':'Bringing three designs to life from your description.'} Each egg opens as it’s ready.</p><div class="hatch-row" aria-live="polite">${slots.map((slot,i)=>`<div class="hatch-card ${slot?'opened':''}" data-i="${i}"><div class="egg-mini v${i}"><svg class="crack crack1" viewBox="0 0 100 130" preserveAspectRatio="none"><path d="M53 20 L47 33 L57 41 L49 55 L58 66"/></svg><svg class="crack crack2" viewBox="0 0 100 130" preserveAspectRatio="none"><path d="M34 72 L45 77 L37 88 L48 95 L40 104"/></svg></div>${slot?`<div class="hatchling">${slotVisual(slot,i)}</div>`:''}<span class="hatch-number">Design ${i+1}</span></div>`).join('')}</div><div class="hatch-actions">${settled?button('Choose your agent →','choose'):`<p class="hatch-status">Hatching your designs…</p>`}</div></div>`;}
  function revealScreen(){const slots=state.slots;return `<div class="stage"><span class="eyebrow">Meet the clutch</span><h2>${escapeHtml(state.name)} hatched — pick your favourite</h2><p>Three takes on your description. Choose the one to use as ${escapeHtml(state.name)}’s avatar.</p><div class="choice-grid">${slots.map((slot,i)=>`<button class="generated-choice ${state.variant===i?'selected':''}" data-option="${i}" aria-pressed="${state.variant===i}">${slotVisual(slot,i)}<span class="pick-name">${escapeHtml(state.name)}</span><span class="pick-tag">${slot&&slot.image?'Generated design':variantLabels[i]}</span></button>`).join('')}</div><div class="actions">${button('Redesign','redesign',true)}${button('Use this avatar →','market')}</div></div>`;}
  function initials(str){return String(str||'AH').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
  function agentCard(agent){return `<article class="p-card" data-agent="${agent.id}" data-search="${escapeHtml((agent.name+' '+agent.team).toLowerCase())}" tabindex="0"><div class="p-thumb thumb-${agent.id}"><img src="${agent.portrait}" alt="${escapeHtml(agent.name)}" loading="lazy"></div><div class="p-meta"><div class="p-name">${agent.name} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(company)}</span><span class="p-tag">${agent.team}</span></div></div></article>`;}
  function hatchedCard(){const vis=state.selectedImage?`<img src="${escapeHtml(state.selectedImage)}" alt="${escapeHtml(state.name)}">`:`<div class="thumb-bot">${bot('v'+(state.variant||0))}</div>`;return `<article class="p-card is-yours"><div class="p-thumb thumb-new">${vis}</div><div class="p-meta"><div class="p-name">${escapeHtml(state.name||'Your agent')} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(company)}</span><span class="p-tag tag-new">Just hatched</span></div></div></article>`;}
  function marketScreen(){
    const ranked=rankAgents().map(r=>r.agent);
    const tab=(k,label,on=false)=>`<button class="nav-tab ${on?'active':''}" ${on?'':'data-noop="1"'}>${ic[k]}<span>${label}</span></button>`;
    const pill=(label,sel=false)=>`<button class="filter-pill ${sel?'sel':''}" data-noop="1">${label} ${ic.chev}</button>`;
    return `<div class="app">
      <header class="app-nav">
        <div class="ws"><img class="ws-logo" src="/agent-hatchers-logo.png" alt=""><span>${escapeHtml(company)}</span><i class="ws-chev">${ic.chev}</i></div>
        <nav class="nav-tabs">${tab('profiles','Profiles',true)}${tab('chats','Chats')}${tab('analytics','Analytics')}${tab('config','Config')}${tab('market','Marketplace')}</nav>
        <div class="nav-right"><button class="create-btn" data-noop="1">${ic.plus}<span>Create</span></button><span class="nav-avatar">${initials(company)}</span></div>
      </header>
      <div class="filter-bar">
        <div class="seg"><button class="seg-on">${ic.gallery}<span>Gallery</span></button><button data-noop="1">${ic.kanban}<span>Kanban</span></button></div>
        ${pill('Status: All')}${pill('Team: All')}${pill('Manager: All')}${pill('Group by: Status',true)}
        <div class="search-box">${ic.search}<input id="market-search" placeholder="Search profiles..." autocomplete="off"></div>
      </div>
      <div class="board" id="board">
        <section class="board-group g-active"><div class="group-head"><h3>Active</h3><span class="count">1</span></div><div class="p-grid">${hatchedCard()}</div></section>
        <section class="board-group g-rec"><div class="group-head"><h3>Recommended for ${escapeHtml(company)}</h3><span class="count">${ranked.length}</span></div><div class="p-grid">${ranked.map(agentCard).join('')}</div></section>
        <div class="board-empty" id="board-empty" hidden>No profiles match your search.</div>
      </div>
      <div class="board-foot"><div class="foot-nav">${button('← Back','back',true)}${button('Start over','reset',true)}</div>${button('Connect your agent →','next')}</div>
    </div>`;
  }
  function connectScreen(){
    const cic={
      link:'<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7L11 6"/><path d="M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7L13 18"/></svg>',
      key:'<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8 2 2M17 6l2 2"/></svg>',
      server:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>',
      ticket:'<svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 012-2h12a2 2 0 012 2 2 2 0 000 4 2 2 0 010 4 2 2 0 01-2 2H6a2 2 0 01-2-2 2 2 0 000-4 2 2 0 010-4z"/><path d="M13 6v12"/></svg>',
      cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>'
    };
    if(state.done){return `<main class="connect-shell"><section class="connect-card connect-success"><div class="success-emoji">🎉</div><h3>You’re all set</h3><p>Thanks, ${escapeHtml(company)}. We’ll be in touch to bring ${escapeHtml(state.name||'your agent')} to life.</p><div class="connect-nav center"><button class="btn cta-book" data-noop="1">Book a call</button>${button('Start over','reset',true)}</div></section></main>`;}
    const field=(ic,name,ph)=>`<label class="field-row"><span class="field-ic">${ic}</span>${name}</label><input class="connect-input" placeholder="${ph}" autocomplete="off" spellcheck="false">`;
    return `<main class="connect-shell">
      <header class="connect-head"><img class="connect-mascot" src="/agent-hatchers-mark.png" alt=""><h2>It’s time to hatch your agent</h2></header>
      <section class="connect-card">
        <h3>Connect Your Agent</h3>
        ${field(cic.link,'Base URL','https://your-host.ts.net:8642')}
        ${field(cic.key,'API Key','hc_…')}
        ${field(cic.server,'Dashboard URL','https://your-host.ts.net:9119')}
        ${field(cic.ticket,'Session Token','dashboard session token')}
        <button class="btn connect-save" data-action="save-test">Save and test connection</button>
      </section>
      <div class="connect-cta"><span class="cta-left">${cic.cal} No agent yet? Let Agent Hatchers hatch one for you.</span><button class="btn cta-book" data-noop="1">Book Call</button></div>
      <nav class="connect-nav">${button('← Back','back',true)}${button('Next →','finish')}</nav>
    </main>`;
  }
  function showAgent(id){const agent=catalog.find(a=>a.id===id);if(!agent)return;const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="agent-title"><div class="modal-top"><div><span class="eyebrow">Agent profile</span><h2 id="agent-title">${agent.name}</h2></div><button class="close" aria-label="Close agent profile">×</button></div><p>${agent.summary}</p><h3>What this agent can do for ${escapeHtml(company)}</h3><div class="checks">${agent.outcomes.map(o=>`<div class="check"><i>✓</i><span>${o}</span></div>`).join('')}</div><h3>Available MCP connections</h3><p>These secure connectors let the agent work with your existing systems while respecting approvals and permissions.</p><div class="mcp-list">${agent.mcps.map(m=>`<span class="mcp">${m}</span>`).join('')}</div></section>`;document.body.appendChild(backdrop);const close=()=>backdrop.remove();backdrop.querySelector('.close').onclick=close;backdrop.onclick=e=>{if(e.target===backdrop)close()};document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});}
  function celebrate(){const c=document.createElement('div');c.className='confetti';for(let i=0;i<38;i++){const s=document.createElement('span');s.style.left=`${Math.random()*100}%`;s.style.background=['#216bac','#c1dce8','#ffb36b','#59c6ad'][i%4];s.style.animationDelay=`${Math.random()*.5}s`;c.appendChild(s)}document.body.appendChild(c);setTimeout(()=>c.remove(),2400)}

  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  async function fetchPortrait(variant){
    // Pinned avatars (config.bakedImages) win — lets a page show fixed designs or work
    // offline (e.g. a published artifact where external calls are blocked).
    const baked = Array.isArray(config.bakedImages) ? config.bakedImages[variant] : null;
    if(baked) return String(baked);
    if(!usePortraits) return null;
    try{
      const res = await fetch(portraitEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief:state.look,name:state.name,role:state.role,company,industry:industryLabel,variant})});
      const body = await res.json().catch(()=>({}));
      if(res.ok && body && body.image) return String(body.image);
    }catch(e){/* fall through to simulated design */}
    return null;
  }
  function openEgg(i){const card=root.querySelector(`.hatch-card[data-i="${i}"]`);if(!card||card.classList.contains('opened'))return;card.classList.add('opened');const wrap=document.createElement('div');wrap.className='hatchling';wrap.innerHTML=slotVisual(state.slots[i],i);card.appendChild(wrap);}
  async function generateAgents(){
    const lookTa=document.getElementById('agent-look');state.look=lookTa?lookTa.value.trim():state.look;
    state.slots=[null,null,null];state.variant=null;state.selectedImage='';state.step=3;render();
    const started=Date.now();
    await Promise.all([0,1,2].map(async i=>{
      const image=await fetchPortrait(i);
      // Hold each egg long enough for both cracks to form, then open in sequence.
      const minMs=3400+i*1500;const wait=Math.max(0,minMs-(Date.now()-started));if(wait)await sleep(wait);
      state.slots[i]={status:'ready',image};
      openEgg(i);
    }));
    celebrate();
    const bar=root.querySelector('.hatch-actions');if(bar){bar.innerHTML=button('Choose your agent →','choose');bind();}
  }
  function bind(){
    root.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
      const a=el.dataset.action;
      if(a==='back'){state.step=Math.max(0,state.step-1);render()}
      if(a==='next'){state.step++;render()}
      if(a==='save-name'){const input=document.getElementById('agent-name');state.name=input.value.trim();const roleTa=document.getElementById('agent-role');state.role=roleTa?roleTa.value.trim():'';if(!state.name){input.focus();input.setAttribute('aria-invalid','true');return}state.step++;render()}
      if(a==='generate'){const lookTa=document.getElementById('agent-look');const look=lookTa?lookTa.value.trim():'';if(look.length<8){lookTa.focus();lookTa.setAttribute('aria-invalid','true');return}state.look=look;generateAgents()}
      if(a==='choose'){if(state.variant===null)state.variant=0;state.step=4;render()}
      if(a==='redesign'){state.step=2;render()}
      if(a==='save-test'||a==='finish'){state.done=true;render();celebrate()}
      if(a==='market'){if(state.variant===null){state.variant=0;const s=state.slots[0];state.selectedImage=s&&s.image?s.image:''}document.querySelectorAll('.confetti').forEach(c=>c.remove());state.step=5;render()}
      if(a==='reset'){state.step=0;state.name='';state.role='';state.look='';state.slots=[];state.variant=null;state.selectedImage='';state.done=false;document.querySelectorAll('.confetti').forEach(c=>c.remove());render()}
    });
    root.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>{const i=+el.dataset.option;state.variant=i;const s=state.slots[i];state.selectedImage=s&&s.image?s.image:'';root.querySelectorAll('.generated-choice').forEach(c=>{const on=+c.dataset.option===i;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',on)});});
    root.querySelectorAll('[data-role-index]').forEach(el=>el.onclick=()=>{const ta=document.getElementById('agent-role');if(ta){ta.value=roleSeeds[+el.dataset.roleIndex].text;ta.focus()}});
    root.querySelectorAll('[data-look-index]').forEach(el=>el.onclick=()=>{const ta=document.getElementById('agent-look');if(ta){ta.value=lookSeeds[+el.dataset.lookIndex].text;ta.focus()}});
    root.querySelectorAll('[data-agent]').forEach(el=>{el.onclick=()=>showAgent(el.dataset.agent);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showAgent(el.dataset.agent)}};});
    const search=document.getElementById('market-search');if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();let visible=0;root.querySelectorAll('.p-card[data-search]').forEach(c=>{const show=!q||c.dataset.search.includes(q);c.hidden=!show;if(show)visible++;});const yours=root.querySelector('.p-card.is-yours');if(yours)yours.hidden=!!q;root.querySelectorAll('.board-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.p-card')].some(c=>!c.hidden);});const empty=document.getElementById('board-empty');if(empty)empty.hidden=visible>0;};
    const input=document.getElementById('agent-name');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('[data-action="save-name"]').click()}};
  }
  render();
})();
