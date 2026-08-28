(() => {
  const config = window.PROTOTYPE_CONFIG || {};
  const catalog = [
    {id:'sales',icon:'↗',name:'Sales Agent',industries:['all'],keywords:['sales','lead','prospect','crm','outreach','follow up','pipeline','revenue','deal'],summary:'Qualifies opportunities, researches prospects and keeps every follow-up moving.',portrait:'/hatchy-sales.webp',team:'Sales',scene:'It is a sales agent, standing in front of a wall of glowing monitors showing charts and graphs.',mcps:['HubSpot','Salesforce','Gmail','Slack','LinkedIn'],outcomes:['Research every new lead automatically','Score and prioritise opportunities','Draft outreach in your company voice','Schedule timely follow-ups','Keep your CRM records current']},
    {id:'documents',icon:'▤',name:'Document Agent',industries:['professional-services','legal','construction','all'],keywords:['document','proposal','contract','report','brief','policy','pdf','draft','legal','template'],summary:'Turns briefs and source material into polished documents using your templates.',portrait:'/hatchy-document.webp',team:'Documents',scene:'It is a document agent, holding a neat stack of papers and a clipboard.',mcps:['Google Drive','Microsoft 365','Notion','Dropbox','Slack'],outcomes:['Create proposals from approved templates','Summarise long source documents','Prepare client-ready reports','Maintain consistent tone and branding','Route drafts for human approval']},
    {id:'invoices',icon:'$',name:'Invoice Agent',industries:['professional-services','retail','construction','all'],keywords:['invoice','finance','accounts','payment','expense','bookkeeping','xero','billing','purchase order'],summary:'Reads invoices, checks records, flags anomalies and prepares approvals.',portrait:'/hatchy-invoice.webp',team:'Finance',scene:'It is a finance agent, holding a printed invoice in one hand and a calculator in the other.',mcps:['Xero','MYOB','QuickBooks','Gmail','Google Drive'],outcomes:['Capture invoice data automatically','Match invoices to business records','Flag duplicates and unusual amounts','Prepare approval queues','Produce scheduled finance summaries']},
    {id:'support',icon:'◉',name:'Support Agent',industries:['retail','healthcare','technology','all'],keywords:['support','enquiry','ticket','customer service','help desk','reply','triage','complaint','inbox'],summary:'Triages customer enquiries, drafts helpful replies and escalates what matters.',portrait:'/hatchy-support.webp',team:'Support',scene:'It is a customer support agent wearing a headset, holding an envelope and a speech-bubble.',mcps:['Zendesk','Intercom','Gmail','Slack','Microsoft Teams'],outcomes:['Classify every inbound enquiry','Draft replies in your support voice','Surface urgent or sensitive cases','Find answers from your knowledge base','Track recurring customer issues']},
    {id:'website',icon:'◇',name:'Website Agent',industries:['all'],keywords:['website','content','seo','publish','webflow','wordpress','page','marketing','blog','copy'],summary:'Keeps website content accurate, on-brand and ready for approval before publishing.',portrait:'/hatchy-website.webp',team:'Marketing',scene:'It is a website agent, holding a laptop that displays a colourful web page.',mcps:['GitHub','Webflow','WordPress','Google Drive','Slack'],outcomes:['Draft new website pages','Update approved copy and details','Check pages for stale information','Prepare search-friendly metadata','Publish only after human approval']},
    {id:'operations',icon:'✓',name:'Operations Agent',industries:['professional-services','construction','healthcare','all'],keywords:['operations','workflow','project','task','deadline','schedule','coordination','process','compliance','ops'],summary:'Coordinates repeatable workflows and keeps teams informed when work changes state.',portrait:'/hatchy-routing.webp',team:'Operations',scene:'It is an operations agent, holding a checklist with gears and a small kanban board beside it.',mcps:['Monday.com','Asana','Notion','Slack','Microsoft Teams'],outcomes:['Turn requests into structured work','Monitor deadlines and blockers','Prepare daily operating summaries','Chase missing information','Escalate exceptions to the right person']}
  ];
  const state = {step:0,name:'',biz:'',look:'',slots:[],variant:null,selectedImage:'',done:false,marketImages:{},marketStarted:false,tab:'profiles',chatActive:8,chatExtra:{}};
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
  function rankAgents(){const text=`${state.name} ${state.biz} ${state.look}`.toLowerCase();return catalog.map((agent,index)=>{let score=0;agent.keywords.forEach(k=>{if(text.includes(k))score+=4});if(agent.industries.includes(industry))score+=2;if(recommended.has(agent.id))score+=1;return{agent,score,index};}).sort((a,b)=>b.score-a.score||a.index-b.index);}
  const lookSeeds = [
    {label:'Friendly & rounded',text:'a friendly, rounded robot with big eyes in blue and white'},
    {label:'Sleek & techy',text:'a sleek metallic assistant with glowing blue accents'},
    {label:'Playful mascot',text:'a playful cartoon mascot, soft and approachable'},
    {label:'Calm & professional',text:'a calm, professional helper in navy and white'}
  ];

  const button = (label, action, secondary=false) => `<button class="btn ${secondary?'btn-secondary':'btn-primary'}" data-action="${action}">${label}</button>`;
  const bot = (extra='') => `<div class="bot ${extra}" role="img" aria-label="Agent design"></div>`;
  const micSvg = '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/></svg>';
  const ci = {
    server:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>',
    link:'<svg viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8"/></svg>',
    key:'<svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.5 12.5 20 3l1.5 1.5M17 6l2 2"/></svg>',
    arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 4.2A10 10 0 0112 4c6.5 0 10 8 10 8a15 15 0 01-3.3 3.9M6.1 6.1A15 15 0 002 12s3.5 7 10 7a10 10 0 003-.5"/></svg>',
    check:'<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-11"/></svg>',
    cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>'
  };
  const slotVisual = (slot,i) => slot && slot.image ? `<img src="${escapeHtml(slot.image)}" alt="Agent design ${i+1}">` : bot('v'+i);
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function chip(){if(state.variant===null)return `<span class="private-pill">Private preview for ${escapeHtml(company)}</span>`;const inner=state.selectedImage?`<img class="chip-img" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+state.variant+' chip');return `<span class="agent-chip">${inner}<span>${escapeHtml(state.name)}</span></span>`;}
  const layout = content => `<main class="shell"><header class="topbar"><div class="brand"><img src="/agent-hatchers-logo.png" alt=""><span>Agent Hatchers</span></div>${chip()}</header><section class="panel"><div class="progress" aria-label="Prototype progress"><span style="--progress:${Math.min(100,(state.step+1)/6*100)}%"></span></div><div class="step-label">Step ${state.step+1} of 6</div>${content}</section></main>`;

  function render(){
    const screens = [welcome,nameScreen,hatchScreen,revealScreen,marketScreen,connectScreen];
    const inner = screens[state.step]();
    root.innerHTML = state.step>=4 ? inner : layout(inner);
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
  function nameScreen(){return `<div class="stage"><span class="eyebrow">Step 1 · Create a profile</span><h2>Create your agent</h2><p>Give it a name, tell us your type of company, and describe how it should look. You’ll pick specialist agents (sales, invoices, support…) from the marketplace next.</p><input class="name-field" id="agent-name" maxlength="28" autocomplete="off" placeholder="Agent name — e.g. Pip, Scout or Atlas" value="${escapeHtml(state.name)}" aria-label="Agent name"><label class="field-label" for="agent-biz">Type of company</label><input class="name-field" id="agent-biz" maxlength="60" autocomplete="off" placeholder="e.g. e-commerce, agency, clinic, SaaS" value="${escapeHtml(state.biz)}" aria-label="Type of company"><label class="field-label" for="agent-look">Image description</label><div class="mic-field"><textarea class="look-field" id="agent-look" placeholder="e.g. a friendly rounded robot in blue and white, holding a suitcase" aria-label="Image description">${escapeHtml(state.look)}</textarea><button type="button" class="mic-btn" data-mic="agent-look" aria-label="Dictate image description">${micSvg}</button></div><div class="chips">${lookSeeds.map((s,i)=>`<button class="chip" data-look-index="${i}">${escapeHtml(s.label)}</button>`).join('')}</div><div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  function designScreen(){return `<div class="stage"><span class="eyebrow">Step 2 · Design the look</span><h2>Describe how ${escapeHtml(state.name)} should look</h2><p>Write a short, practical description and we’ll hatch three designs for you to choose from.</p><div class="mic-field"><textarea class="look-field" id="agent-look" maxlength="600" placeholder="e.g. a friendly rounded robot medic in blue and white, holding a checklist" aria-label="Describe the avatar">${escapeHtml(state.look)}</textarea><button type="button" class="mic-btn" data-mic="agent-look" aria-label="Dictate image description">${micSvg}</button></div><div class="chips">${lookSeeds.map((s,i)=>`<button class="chip" data-look-index="${i}">${escapeHtml(s.label)}</button>`).join('')}</div><div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  // The EXACT homepage hero hatch (index.html #eggScene): closed egg wobbles ×3, one
  // crack walks the seam, the lid tumbles off, the design springs out, shards burst.
  // Same 620×620 layers, crack paths, keyframes — only the "pop" is the generated design.
  const hatchShards = [
    '--fx:-160%;--fy:-560%;--r:340deg','--fx:300%;--fy:-480%;--r:-290deg;animation-delay:.03s',
    '--fx:-460%;--fy:-260%;--r:260deg','--fx:520%;--fy:-180%;--r:-320deg;animation-delay:.05s',
    '--fx:-540%;--fy:90%;--r:300deg','--fx:480%;--fy:160%;--r:-260deg;animation-delay:.02s',
    '--fx:-240%;--fy:420%;--r:280deg;animation-delay:.04s','--fx:180%;--fy:480%;--r:-300deg',
    '--fx:40%;--fy:-620%;--r:250deg;animation-delay:.06s','--fx:-360%;--fy:-430%;--r:-270deg;animation-delay:.01s'
  ].map(s=>`<i class="hatch-shard" style="${s}"></i>`).join('');
  function eggScene(i){return `<div class="egg-cell"><div class="hhx" data-i="${i}">
    <span class="hatch-layer hatch-egg" aria-hidden="true"><img src="/egg-closed.webp" alt=""><svg class="hatch-cracks" viewBox="0 0 620 620" aria-hidden="true"><path class="hatch-c1" pathLength="1" d="M114,318 L146,302 L172,330 L200,296 L226,331 L245,301"/><path class="hatch-c2" pathLength="1" d="M245,301 L272,336 L308,290 L338,332 L375,302"/><path class="hatch-c3" pathLength="1" d="M375,302 L396,333 L420,298 L448,332 L474,300 L506,320"/></svg></span>
    <img class="hatch-layer hatch-cap" src="/egg-shell-clean.webp" alt="" aria-hidden="true">
    <img class="hatch-layer hatch-pop" alt="">
    <span class="hatch-layer hatch-burst" aria-hidden="true"><i class="hatch-flash"></i><i class="hatch-ring"></i>${hatchShards}</span>
  </div><span class="hatch-number">Design ${i+1}</span></div>`;}
  function hatchScreen(){const settled=state.slots.length&&state.slots.every(Boolean);return `<div class="stage hatch-zone"><span class="eyebrow">Hatching</span><h2>Hatching ${escapeHtml(state.name||'your agent')}…</h2><p>Three takes on your description are hatching now.</p><div class="hatch-row" aria-live="polite">${[0,1,2].map(eggScene).join('')}</div><div class="hatch-actions">${settled?button('Choose a design for '+escapeHtml(state.name||'your agent')+' →','choose'):`<p class="hatch-status">Hatching your designs…</p>`}</div></div>`;}
  function revealScreen(){const slots=state.slots;return `<div class="stage"><span class="eyebrow">Meet the clutch</span><h2>${escapeHtml(state.name)} hatched — pick your favourite</h2><p>Three takes on your description. Choose the one to use as ${escapeHtml(state.name)}’s avatar.</p><div class="choice-grid">${slots.map((slot,i)=>`<button class="generated-choice ${state.variant===i?'selected':''}" data-option="${i}" aria-pressed="${state.variant===i}">${slotVisual(slot,i)}<span class="pick-name">${escapeHtml(state.name)}</span><span class="pick-tag">${slot&&slot.image?'Generated design':variantLabels[i]}</span></button>`).join('')}</div><div class="actions">${button('Redesign','redesign',true)}${button('Use this avatar →','market')}</div></div>`;}
  function initials(str){return String(str||'AH').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
  const marketLoader='<div class="hatch-loader"><span class="loader-ring"></span><img class="loader-egg" src="/egg-closed.webp" alt=""><span class="loader-txt">Hatching…</span></div>';
  function willGenerate(agent){return (usePortraits&&config.marketPortraits!==false&&state.variant!==null)||!!(config.bakedMarket&&config.bakedMarket[agent.id]);}
  function agentCard(agent){const gen=state.marketImages[agent.id];const loading=!gen&&willGenerate(agent);const inner=gen?`<img src="${escapeHtml(gen)}" alt="${escapeHtml(agent.name)}">`:(loading?marketLoader:`<img src="${agent.portrait}" alt="${escapeHtml(agent.name)}" loading="lazy">`);return `<article class="p-card" data-agent="${agent.id}" data-search="${escapeHtml((agent.name+' '+agent.team).toLowerCase())}" tabindex="0"><div class="p-thumb thumb-${agent.id} ${gen?'is-generated':''} ${loading?'is-loading':''}" data-thumb="${agent.id}">${inner}</div><div class="p-meta"><div class="p-name">${agent.name} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(company)}</span><span class="p-tag">${agent.team}</span></div></div></article>`;}
  function hatchedCard(){const vis=state.selectedImage?`<img src="${escapeHtml(state.selectedImage)}" alt="${escapeHtml(state.name)}">`:`<div class="thumb-bot">${bot('v'+(state.variant||0))}</div>`;return `<article class="p-card is-yours"><div class="p-thumb thumb-new ${state.selectedImage?'is-generated':''}">${vis}</div><div class="p-meta"><div class="p-name">${escapeHtml(state.name||'Your agent')} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(company)}</span><span class="p-tag tag-new">Just hatched</span></div></div></article>`;}
  function profilesBoard(){
    const ranked=rankAgents().map(r=>r.agent);
    return `<div class="filter-bar">
        <div class="seg"><button class="seg-on">${ic.gallery}<span>Gallery</span></button><button data-noop="1">${ic.kanban}<span>Kanban</span></button></div>
        <button class="filter-pill" data-noop="1">Status: All ${ic.chev}</button><button class="filter-pill" data-noop="1">Team: All ${ic.chev}</button><button class="filter-pill" data-noop="1">Manager: All ${ic.chev}</button><button class="filter-pill sel" data-noop="1">Group by: Status ${ic.chev}</button>
        <div class="search-box">${ic.search}<input id="market-search" placeholder="Search profiles..." autocomplete="off"></div>
      </div>
      <div class="board" id="board">
        <section class="board-group g-active"><div class="group-head"><h3>Active</h3><span class="count">1</span></div><div class="p-grid">${hatchedCard()}</div></section>
        <section class="board-group g-rec"><div class="group-head"><h3>Recommended for ${escapeHtml(company)}</h3><span class="count">${ranked.length}</span></div><div class="p-grid">${ranked.map(agentCard).join('')}</div></section>
        <div class="board-empty" id="board-empty" hidden>No profiles match your search.</div>
      </div>`;
  }
  function agentAvatar(cls){return state.selectedImage?`<img class="${cls}" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+(state.variant||0)+' '+cls);}
  const avatarPool=()=>[state.selectedImage,...Object.values(state.marketImages)].filter(Boolean);
  const poolAv=i=>{const p=avatarPool();return p.length?`<img src="${escapeHtml(p[i%p.length])}" alt="">`:bot('v'+(i%3));};
  function chatsView(){
    const your=['Default','Auto SDR','Content Writer','CRM Manager','Document Generator','Email Assistant','Merch Bot','Research Agent',state.name||'Timeliner','Travel Assistant'];
    const other=['Bug Destroyer','Data Scientist','Hermes Helper','Hype Beast'];
    const all=[...your,...other];const active=Math.min(state.chatActive??8,all.length-1);const activeName=all[active];
    const extra=state.chatExtra[active]||[];
    const item=(n,i)=>`<button class="pf-item ${i===active?'on':''}" data-chat="${i}"><span class="pf-av">${poolAv(i)}<i class="pf-dot"></i></span><span class="pf-name">${escapeHtml(n)}</span></button>`;
    const renderMsg=([who,t])=>who==='pay'?`<div class="msg them"><div class="bubble paywall"><span class="pay-ic">${ci.key}</span><span>${escapeHtml(t)}</span><button class="btn pay-btn" data-noop="1">Unlock ${escapeHtml(activeName)}</button></div></div>`:`<div class="msg ${who}">${who==='them'?`<span class="msg-ava">${poolAv(active)}</span>`:''}<div class="bubble">${escapeHtml(t)}</div></div>`;
    return `<div class="chats3">
      <aside class="pf-side">
        <div class="pf-side-h"><b>Profiles</b> <span class="pf-count">${all.length}</span><span class="pf-plus">${ic.plus}</span></div>
        <div class="pf-search">${ic.search}<input placeholder="Search profiles..."></div>
        <div class="pf-sec">Your profiles</div>${your.map((n,i)=>item(n,i)).join('')}
        <div class="pf-sec">Other profiles</div>${other.map((n,i)=>item(n,your.length+i)).join('')}
      </aside>
      <aside class="chat-hist">
        <div class="chat-hist-h"><b>Chat history</b></div>
        <div class="pf-search hist"><input placeholder="Search messages..."></div>
      </aside>
      <section class="chat-empty">
        ${extra.length?`<div class="chat-thread" id="chat-thread">${extra.map(renderMsg).join('')}</div>`:`<div class="chat-empty-mid"><span class="chat-empty-av">${poolAv(active)}</span><div class="chat-empty-name">${escapeHtml(activeName)}</div></div>`}
        <div class="chat-input big"><input id="chat-box" placeholder="Message ${escapeHtml(activeName)}" autocomplete="off"><button class="chat-mic" data-noop="1">${micSvg}</button><button class="send-btn" data-action="chat-send" aria-label="Send">↑</button></div>
      </section>
    </div>`;
  }
  function areaChart(pts,ymax){const w=300,h=132,pad=8;const max=ymax||Math.max(...pts);const n=pts.length;const X=i=>pad+(i/(n-1))*(w-2*pad);const Y=v=>h-16-(v/(max||1))*(h-26);const line=pts.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');const area=`${line} L${X(n-1).toFixed(1)} ${h-16} L${X(0).toFixed(1)} ${h-16} Z`;return `<svg class="area-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path class="area-fill" d="${area}"/><path class="area-line" d="${line}"/></svg>`;}
  function analyticsView(){
    const nav=[['Usage',['Overview','Over time','Providers & sources','Models','Teams & profiles']],['Profiles',['Overview','Team, manager & workspace','Abilities per profile','Activity']],['Skills',['Overview','Adoption']],['Crons',['Overview','Growth over time','Ownership']]];
    const tiles=[['Total spend','$334','Billed cost, all sources'],['Total tokens','47M','All accounts, incl. auth / BYOK'],['Sessions','961','18 profiles'],['Messages','17k','Across the fleet'],['Profiles','18','Tracked agents']];
    const charts=[['Spend over time',[11.6,11.5,11.4,11.6,12.2,11.7,11.3,12.1,11.6,11.3,11.5,11.2]],['Tokens over time',[1.9,1.1,0.4,1.0,2.6,7.6,5.2,3.4,2.8,5.1,3.9,6.0]],['Messages over time',[1.1,0.7,0.4,0.9,1.9,3.2,2.6,1.7,1.9,2.6,1.6,2.4]],['Sessions over time',[40,22,18,28,52,120,70,44,52,90,60,110]],['Profiles over time',[10,11,12,12,13,14,15,16,16,17,17,18]],['Cost per session over time',[11.5,3,2.5,3,4,5,6,4.5,5,6.5,5.5,7]]];
    return `<div class="an-page">
      <aside class="an-side"><div class="an-side-h">On this page</div>${nav.map(([sec,items],si)=>`<div class="an-sec"><div class="an-sec-h ${si===0?'on':''}">${sec}</div>${items.map((it,i)=>`<div class="an-sub ${si===0&&i===0?'on':''}">${it}</div>`).join('')}</div>`).join('')}</aside>
      <div class="an-main">
        <div class="filter-bar an-filters">${['Status: All','Team: All','Manager: All','By day','Last 30 days'].map((l,i)=>`<button class="filter-pill ${i>2?'':''}" data-noop="1">${i===4?ci.cal:''}${l} ${ic.chev}</button>`).join('')}</div>
        <h2 class="an-h">Usage</h2>
        <div class="an-eyebrow">Overview</div>
        <div class="an-tiles">${tiles.map(([l,v,s])=>`<div class="an-tile"><div class="an-tile-l">${l}</div><div class="an-tile-v">${v}</div><div class="an-tile-s">${s}</div></div>`).join('')}</div>
        <div class="an-eyebrow">Over time</div>
        <div class="an-charts">${charts.map(([t,data])=>`<div class="an-chart-card"><div class="an-chart-h">${t}</div>${areaChart(data)}<div class="an-x">1 Aug<span>16 Aug</span>27 Aug</div></div>`).join('')}</div>
      </div></div>`;
  }
  const cfgIcons={Communications:ic.chats,Integrations:'<svg viewBox="0 0 24 24"><path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 01-10 0zM12 17v5"/></svg>',Models:'<svg viewBox="0 0 24 24"><path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v9"/></svg>',Users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0112 0M16 5a3.5 3.5 0 010 7M18 20a6 6 0 00-3-5"/></svg>',Permissions:'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/></svg>',Media:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-4 4 3 3-3 4 4"/></svg>',Branding:'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5.5-1.5 1.5-1.5H18a3 3 0 003-3c0-4-4-6-9-6z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/></svg>',Connection:ci.link};
  function configView(){
    const side=['Communications','Integrations','Models','Users','Permissions','Media','Branding','Connection'];
    const slackLogo='<svg viewBox="0 0 24 24" fill="none"><path d="M6 15a2 2 0 11-2-2h2zM7 15a2 2 0 014 0v5a2 2 0 01-4 0z" fill="#E01E5A"/><path d="M9 6a2 2 0 112 2H9zM9 7a2 2 0 010 4H4a2 2 0 010-4z" fill="#36C5F0"/><path d="M18 9a2 2 0 112 2h-2zM17 9a2 2 0 01-4 0V4a2 2 0 014 0z" fill="#2EB67D"/><path d="M15 18a2 2 0 11-2-2h2zM15 17a2 2 0 010-4h5a2 2 0 010 4z" fill="#ECB22E"/></svg>';
    const teamsLogo='<svg viewBox="0 0 24 24"><rect x="3" y="6" width="12" height="12" rx="2" fill="#5059C9"/><text x="9" y="15" font-size="9" fill="#fff" text-anchor="middle" font-family="Inter">T</text><circle cx="18" cy="8" r="3" fill="#7B83EB"/></svg>';
    const wsAv=state.selectedImage?`<img src="${escapeHtml(state.selectedImage)}">`:bot('v'+(state.variant||0));
    const workspaces=[['Agent-Hatchers','T0A8CMQN1PH'],[escapeHtml(company),'T0BJX6REVC2']];
    const channels=[['Agent-Hatchers','7 / 23 Channels Assigned'],[escapeHtml(company),'13 / 16 Channels Assigned']];
    return `<div class="cfg-page">
      <aside class="cfg-side">${side.map((n,i)=>`<div class="cfg-side-item ${i===0?'on':''}" data-noop="1"><span class="cfg-side-ic">${cfgIcons[n]}</span>${n}</div>`).join('')}</aside>
      <div class="cfg-main">
        <div class="cfg-head"><span class="cfg-head-ic">${ic.chats}</span><h2>Communications</h2></div>
        <div class="cfg-label">Chat platform</div>
        <div class="platform-row"><button class="platform sel" data-noop="1"><span class="pf-ic">${slackLogo}</span> Slack <span class="pf-ok">${ci.check}</span></button><button class="platform" data-noop="1"><span class="pf-ic">${teamsLogo}</span> Microsoft Teams <span class="pf-ok">${ci.check}</span></button></div>
        <div class="cfg-sub"><span><b>Workspaces</b> <span class="count">2</span></span><button class="btn cfg-connect" data-noop="1">${ic.plus}<span>Connect Workspace</span></button></div>
        ${workspaces.map(([n,id])=>`<div class="ws-row"><span class="ws-av2">${wsAv}</span><div class="ws-row-main"><b>${n}</b><div class="ws-id">${id}</div></div><div class="ws-actions"><button data-noop="1" aria-label="Edit">✎</button><button data-noop="1" aria-label="Delete">🗑</button></div></div>`).join('')}
        <div class="cfg-sub"><span><b>Channels</b> <span class="count">39</span></span></div>
        <div class="chan-filters"><button class="filter-pill" data-noop="1">All channels ${ic.chev}</button><button class="filter-pill" data-noop="1">All assignments ${ic.chev}</button><div class="search-box">${ic.search}<input placeholder="Search channels or agents..."></div></div>
        ${channels.map(([n,c])=>`<div class="chan-row"><span class="ws-av2">${wsAv}</span><b>${n}</b><span class="chan-count">${c} ${ic.chev}</span></div>`).join('')}
      </div></div>`;
  }
  function marketplaceView(){
    const ranked=rankAgents().map(r=>r.agent);
    return `<div class="mkt-page">
      <div class="mkt-head"><h2><span class="mkt-head-ic">${ic.market}</span>Marketplace</h2><div class="mkt-head-r"><button class="filter-pill" data-noop="1">All categories ${ic.chev}</button><div class="search-box">${ic.search}<input placeholder="Search agents..."></div></div></div>
      <div class="mkt-grid">${ranked.map((a,i)=>{const img=state.marketImages[a.id];const installed=recommended.has(a.id);return `<article class="mkt-card" data-agent="${a.id}" data-search="${escapeHtml((a.name+' '+a.team).toLowerCase())}" tabindex="0"><div class="mkt-thumb thumb-${a.id}">${img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(a.name)}">`:marketLoader}${installed?`<span class="mkt-installed">${ci.check}<span>Installed</span></span>`:''}</div><div class="mkt-body"><h3>${a.name}</h3><p>${a.summary}</p><div class="mkt-tags"><span class="p-tag">${a.team}</span><span class="mkt-skills">${a.outcomes.length} skills</span></div></div></article>`;}).join('')}</div>
    </div>`;
  }
  function marketScreen(){
    const tab=(k,label)=>`<button class="nav-tab ${state.tab===k?'active':''}" data-tab="${k}">${ic[k==='market'?'market':k]}<span>${label}</span></button>`;
    const body = state.tab==='chats'?chatsView():state.tab==='analytics'?analyticsView():state.tab==='config'?configView():state.tab==='market'?marketplaceView():profilesBoard();
    return `<div class="app">
      <header class="app-nav">
        <div class="ws"><img class="ws-logo ${state.selectedImage?'ws-avatar-img':''}" src="${state.selectedImage||'/agent-hatchers-logo.png'}" alt=""><span>${escapeHtml(company)}</span><i class="ws-chev">${ic.chev}</i></div>
        <nav class="nav-tabs">${tab('profiles','Profiles')}${tab('chats','Chats')}${tab('analytics','Analytics')}${tab('config','Config')}${tab('market','Marketplace')}</nav>
        <div class="nav-right"><button class="create-btn" data-noop="1">${ic.plus}<span>Create</span></button><span class="nav-avatar">${initials(company)}</span></div>
      </header>
      ${body}
      <div class="board-foot"><div class="foot-nav">${button('← Back','back',true)}${button('Start over','reset',true)}</div>${button('Connect your agent →','next')}</div>
    </div>`;
  }
  function connectScreen(){
    if(state.done){return `<main class="connect-shell"><section class="onboard-card"><div class="onboard-head"><span class="onboard-ic ok">${ci.check}</span><h2>Instance created</h2></div><p class="onboard-lead">Thanks, ${escapeHtml(company)}. Your dashboard is connected — we’ll be in touch to bring ${escapeHtml(state.name||'your agent')} online.</p><nav class="connect-nav center"><button class="btn cta-book" data-noop="1">Book a call</button>${button('Start over','reset',true)}</nav></section></main>`;}
    return `<main class="connect-shell">
      <section class="onboard-card">
        <div class="onboard-head"><span class="onboard-ic">${ci.server}</span><h2>Connect your Hermes instance</h2></div>
        <p class="onboard-lead">This dashboard talks to your Hermes box. Connect it and it can start reading your profiles, skills and sessions.</p>
        <p class="onboard-eyebrow">What you’ll need</p>
        <ul class="onboard-list">
          <li>${ci.link}<div><div class="req-label">Base URL</div><div class="req-detail">Your Hermes core API — the OpenAI-compatible server, port 8642 by default.</div></div></li>
          <li>${ci.key}<div><div class="req-label">API key</div><div class="req-detail">API_SERVER_KEY from ~/.hermes/.env on that box.</div></div></li>
          <li>${ci.server}<div><div class="req-label">Dashboard URL and session token <span class="opt">optional</span></div><div class="req-detail">Needed for profiles, skills and sessions — everything except chat.</div></div></li>
        </ul>
        <button class="btn onboard-btn" data-action="open-connect">Connect this instance ${ci.arrow}</button>
      </section>
      <div class="connect-cta"><span class="cta-left">${ci.cal} No agent yet? Let Agent Hatchers hatch one for you.</span><button class="btn cta-book" data-noop="1">Book Call</button></div>
      <nav class="connect-nav">${button('← Back','back',true)}</nav>
    </main>`;
  }
  // Faithful port of the dashboard's AddInstanceDialog: Name it → Connect → Dashboard.
  function openConnectDialog(){
    const STEPS=[
      {key:'name',title:'Name it',lead:'What should this Hermes box be called in the switcher?'},
      {key:'connect',title:'Connect',lead:'The core API this dashboard chats through. Both fields are needed.'},
      {key:'dashboard',title:'Dashboard',lead:'The dashboard backend serves profiles, skills and sessions. You can add it later.'}
    ];
    const d={step:0,name:state.name||'',baseUrl:'',apiKey:'',dashUrl:'',token:'',reveal:{},core:'',dash:''};
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';document.body.appendChild(backdrop);
    const cf=(id,ic,label,ph,val,secret)=>{const has=(val||'').length>0;const masked=secret&&!d.reveal[id]&&has;return `<div class="cf"><label class="cf-label" for="${id}">${ic}${label}</label><div class="cf-wrap"><input class="cf-input" id="${id}" type="${masked?'password':'text'}" placeholder="${escapeHtml(ph)}" value="${escapeHtml(val)}" autocomplete="off" spellcheck="false" autocapitalize="none">${secret?`<button type="button" class="cf-eye" data-eye="${id}" tabindex="-1" aria-label="Show ${label}">${d.reveal[id]?ci.eyeOff:ci.eye}</button>`:''}</div></div>`;};
    function read(){const g=id=>{const el=backdrop.querySelector('#'+id);return el?el.value:undefined;};let v;if((v=g('ci-name'))!==undefined)d.name=v;if((v=g('ci-base'))!==undefined)d.baseUrl=v;if((v=g('ci-key'))!==undefined)d.apiKey=v;if((v=g('ci-dash'))!==undefined)d.dashUrl=v;if((v=g('ci-token'))!==undefined)d.token=v;}
    function draw(){
      const s=STEPS[d.step],last=d.step===STEPS.length-1;
      const rail=STEPS.map((st,i)=>`<li class="rail-item ${i<d.step?'done':''} ${i===d.step?'active':''}"><span class="rail-dot">${i<d.step?ci.check:i+1}</span><span class="rail-title">${st.title}</span></li>`).join('');
      let body='';
      if(s.key==='name')body=`<div class="cf"><label class="cf-label plain" for="ci-name">Company name</label><input class="cf-input" id="ci-name" placeholder="work" value="${escapeHtml(d.name)}" maxlength="64" autocomplete="off" spellcheck="false"><p class="cf-hint">Only you see this. It labels the box in the instance menu.</p></div>`;
      if(s.key==='connect')body=`${cf('ci-base',ci.link,'Base URL','https://your-host.ts.net:8642',d.baseUrl)}<p class="cf-hint">Your Hermes core API — the OpenAI-compatible server, port 8642 by default.</p>${cf('ci-key',ci.key,'API key','hc_…',d.apiKey,true)}<p class="cf-hint">From <code>API_SERVER_KEY</code> in <code>~/.hermes/.env</code> on that box.</p><div class="cf-test"><button type="button" class="btn btn-outline" data-test="core">${d.core==='ok'?ci.check+' Connected':'Test Connection'}</button>${d.core==='ok'?'<span class="probe-ok">Connection successful.</span>':''}</div>`;
      if(s.key==='dashboard')body=`${cf('ci-dash',ci.server,'Dashboard URL','https://your-host.ts.net:9119',d.dashUrl)}<p class="cf-hint">Used for profiles, skills and sessions — everything except chat.</p>${cf('ci-token',ci.key,'Session token','dashboard session token',d.token,true)}<p class="cf-hint">From <code>window.__HERMES_SESSION_TOKEN__</code> in the Hermes dashboard page source.</p><div class="cf-test"><button type="button" class="btn btn-outline" data-test="dash">${d.dash==='ok'?ci.check+' Reachable':'Test Dashboard'}</button>${d.dash==='ok'?'<span class="probe-ok">Dashboard reachable.</span>':''}</div><p class="cf-note">The dashboard switches onto this instance once it is created.</p>`;
      backdrop.innerHTML=`<section class="modal connect-modal" role="dialog" aria-modal="true"><div class="modal-top"><ol class="step-rail">${rail}</ol><button class="close" aria-label="Close">×</button></div><p class="dlg-lead">${s.lead}</p><div class="dlg-form">${body}</div><div class="dlg-actions">${d.step>0?'<button type="button" class="btn btn-secondary" data-dlg="back">Back</button>':'<span></span>'}<button type="button" class="btn btn-primary" data-dlg="${last?'create':'next'}">${last?'Create instance':'Continue'}</button></div></section>`;
      backdrop.querySelector('.close').onclick=close;
      backdrop.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{read();d.reveal[b.dataset.eye]=!d.reveal[b.dataset.eye];draw();});
      backdrop.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>{read();b.textContent='Testing…';const which=b.dataset.test;setTimeout(()=>{d[which==='core'?'core':'dash']='ok';draw();},700);});
      backdrop.querySelectorAll('[data-dlg]').forEach(b=>b.onclick=()=>{read();const a=b.dataset.dlg;if(a==='back'){d.step=Math.max(0,d.step-1);draw();}else if(a==='next'){d.step=Math.min(STEPS.length-1,d.step+1);draw();}else if(a==='create'){close();state.name=d.name||state.name;state.done=true;render();celebrate();}});
    }
    function close(){backdrop.remove();}
    backdrop.onclick=e=>{if(e.target===backdrop)close();};
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);}},{once:true});
    draw();
  }
  function showAgent(id){const agent=catalog.find(a=>a.id===id);if(!agent)return;const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="agent-title"><div class="modal-top"><div><span class="eyebrow">Agent profile</span><h2 id="agent-title">${agent.name}</h2></div><button class="close" aria-label="Close agent profile">×</button></div><p>${agent.summary}</p><h3>What this agent can do for ${escapeHtml(company)}</h3><div class="checks">${agent.outcomes.map(o=>`<div class="check"><i>✓</i><span>${o}</span></div>`).join('')}</div><h3>Available MCP connections</h3><p>These secure connectors let the agent work with your existing systems while respecting approvals and permissions.</p><div class="mcp-list">${agent.mcps.map(m=>`<span class="mcp">${m}</span>`).join('')}</div></section>`;document.body.appendChild(backdrop);const close=()=>backdrop.remove();backdrop.querySelector('.close').onclick=close;backdrop.onclick=e=>{if(e.target===backdrop)close()};document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});}
  function celebrate(){const c=document.createElement('div');c.className='confetti';for(let i=0;i<38;i++){const s=document.createElement('span');s.style.left=`${Math.random()*100}%`;s.style.background=['#216bac','#c1dce8','#ffb36b','#59c6ad'][i%4];s.style.animationDelay=`${Math.random()*.5}s`;c.appendChild(s)}document.body.appendChild(c);setTimeout(()=>c.remove(),2400)}

  let activeRec=null;
  function startDictation(btn){
    const target=document.getElementById(btn.dataset.mic);
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR||!target){btn.title='Voice input is not supported in this browser';btn.classList.add('mic-off');return;}
    if(activeRec){try{activeRec.stop();}catch(e){} return;}
    try{
      const rec=new SR();activeRec=rec;rec.lang='en-US';rec.interimResults=false;rec.maxAlternatives=1;
      btn.classList.add('mic-live');
      rec.onresult=e=>{const t=e.results[0][0].transcript;target.value=(target.value.trim()?target.value.trim()+' ':'')+t;target.focus();};
      rec.onerror=()=>{btn.title='Microphone unavailable';};
      rec.onend=()=>{btn.classList.remove('mic-live');activeRec=null;};
      rec.start();
    }catch(e){btn.classList.remove('mic-live');activeRec=null;}
  }
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  async function fetchImage(params){
    if(!usePortraits) return null;
    try{
      const res = await fetch(portraitEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(params)});
      const body = await res.json().catch(()=>({}));
      if(res.ok && body && body.image) return String(body.image);
    }catch(e){/* fall through to simulated design */}
    return null;
  }
  async function fetchPortrait(variant){
    // Pinned avatars (config.bakedImages) win — lets a page show fixed designs or work
    // offline (e.g. a published artifact where external calls are blocked).
    const baked = Array.isArray(config.bakedImages) ? config.bakedImages[variant] : null;
    if(baked) return String(baked);
    const context = state.biz ? `an agent at a ${state.biz} company` : '';
    return fetchImage({brief:state.look,name:state.name,role:context,company,industry:industryLabel,variant});
  }
  // Re-skin every marketplace agent in the chosen look, each dressed for its own job.
  async function generateMarket(){
    if(state.marketStarted) return;
    const baked = config.bakedMarket||{};
    const useLive = usePortraits && config.marketPortraits!==false && state.variant!==null;
    if(!useLive && !Object.keys(baked).length) return;   // nothing to hatch; cards keep mascot
    state.marketStarted = true;
    const agents = rankAgents().map(r=>r.agent);
    const started = Date.now();
    await Promise.all(agents.map(async (agent,idx)=>{
      let img = baked[agent.id];
      if(!img && useLive) img = await fetchImage({brief:state.look,name:agent.name,role:agent.scene,image:state.selectedImage,company,industry:industryLabel,variant:state.variant||0});
      const minMs=1100+idx*500;const wait=Math.max(0,minMs-(Date.now()-started));if(wait)await sleep(wait);  // let the loader show
      if(!img) return;
      state.marketImages[agent.id]=img;
      const thumb = root.querySelector(`[data-thumb="${agent.id}"]`);
      if(thumb){thumb.innerHTML=`<img src="${escapeHtml(img)}" alt="${escapeHtml(agent.name)}">`;thumb.classList.remove('is-loading');thumb.classList.add('is-generated');}
    }));
  }
  // Exact homepage hero hatch (index.html): egg rocks, crack walks the seam, lid
  // shatters into shards, the design pops out. Runs when each design's image is ready.
  async function generateAgents(){
    const lookTa=document.getElementById('agent-look');if(lookTa&&lookTa.value.trim())state.look=lookTa.value.trim();
    state.slots=[null,null,null];state.variant=null;state.selectedImage='';state.step=2;render();
    await Promise.all([0,1,2].map(async i=>{
      const image=await fetchPortrait(i);
      state.slots[i]={status:'ready',image};
      const scene=root.querySelector(`.hhx[data-i="${i}"]`);
      if(scene){const pop=scene.querySelector('.hatch-pop');if(pop){pop.onload=()=>scene.classList.add('go');pop.src=image||'/hatchy-pop.webp';if(pop.complete)scene.classList.add('go');}}
      await sleep(5000);
    }));
    celebrate();
    const bar=root.querySelector('.hatch-actions');if(bar){bar.innerHTML=button('Choose a design for '+escapeHtml(state.name||'your agent')+' →','choose');bind();}
  }
  function bind(){
    root.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
      const a=el.dataset.action;
      if(a==='back'){state.step=Math.max(0,state.step-1);render()}
      if(a==='next'){state.step++;render()}
      if(a==='generate'){const input=document.getElementById('agent-name');const name=input.value.trim();if(!name){input.focus();input.setAttribute('aria-invalid','true');return}state.name=name;const bizIn=document.getElementById('agent-biz');state.biz=bizIn?bizIn.value.trim():'';const lookTa=document.getElementById('agent-look');state.look=(lookTa&&lookTa.value.trim())||'a friendly rounded robot in blue and white';generateAgents()}
      if(a==='choose'){if(state.variant===null)state.variant=0;state.step=3;render()}
      if(a==='redesign'){state.step=1;render()}
      if(a==='open-connect'){openConnectDialog()}
      if(a==='chat-send'){const box=document.getElementById('chat-box');const t=box?box.value.trim():'';if(!t)return;const i=state.chatActive??8;state.chatExtra[i]=(state.chatExtra[i]||[]).concat([['me',t],['pay','Please pay for your agent in order to continue talking.']]);render();const th=document.getElementById('chat-thread');if(th)th.scrollTop=th.scrollHeight;document.getElementById('chat-box')?.focus()}
      if(a==='market'){if(state.variant===null){state.variant=0;const s=state.slots[0];state.selectedImage=s&&s.image?s.image:''}document.querySelectorAll('.confetti').forEach(c=>c.remove());state.step=4;render();generateMarket()}
      if(a==='reset'){state.step=0;state.name='';state.biz='';state.look='';state.slots=[];state.variant=null;state.selectedImage='';state.done=false;state.marketImages={};state.marketStarted=false;state.tab='profiles';state.chatActive=8;state.chatExtra={};document.querySelectorAll('.confetti').forEach(c=>c.remove());render()}
    });
    root.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>{const i=+el.dataset.option;state.variant=i;const s=state.slots[i];state.selectedImage=s&&s.image?s.image:'';root.querySelectorAll('.generated-choice').forEach(c=>{const on=+c.dataset.option===i;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',on)});});
    root.querySelectorAll('[data-look-index]').forEach(el=>el.onclick=()=>{const ta=document.getElementById('agent-look');if(ta){ta.value=lookSeeds[+el.dataset.lookIndex].text;ta.focus()}});
    root.querySelectorAll('[data-mic]').forEach(btn=>btn.onclick=()=>startDictation(btn));
    root.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>{state.tab=el.dataset.tab;render();});
    root.querySelectorAll('[data-chat]').forEach(el=>el.onclick=()=>{state.chatActive=+el.dataset.chat;render();});
    const cb=document.getElementById('chat-box');if(cb)cb.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('[data-action="chat-send"]').click();}};
    root.querySelectorAll('[data-agent]').forEach(el=>{el.onclick=()=>showAgent(el.dataset.agent);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showAgent(el.dataset.agent)}};});
    const search=document.getElementById('market-search');if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();let visible=0;root.querySelectorAll('.p-card[data-search]').forEach(c=>{const show=!q||c.dataset.search.includes(q);c.hidden=!show;if(show)visible++;});const yours=root.querySelector('.p-card.is-yours');if(yours)yours.hidden=!!q;root.querySelectorAll('.board-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.p-card')].some(c=>!c.hidden);});const empty=document.getElementById('board-empty');if(empty)empty.hidden=visible>0;};
    const input=document.getElementById('agent-name');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('agent-biz')?.focus()}};
  }
  render();
})();
