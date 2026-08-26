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
  const state = {step:0,name:'',biz:'',look:'',slots:[],variant:null,selectedImage:'',done:false,marketImages:Object.assign({},config.bakedMarket||{}),marketStarted:false,tab:'profiles'};
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
  function hatchScreen(){const slots=state.slots.length?state.slots:[null,null,null];const settled=slots.every(Boolean);return `<div class="stage hatch-zone"><span class="eyebrow">Hatching</span><h2>Your clutch is hatching…</h2><p>${usePortraits?'Drawing three genuinely different designs from your description.':'Bringing three designs to life from your description.'} Each egg opens as it’s ready.</p><div class="hatch-row" aria-live="polite">${slots.map((slot,i)=>`<div class="hatch-card ${slot?'opened':''}" data-i="${i}"><div class="egg-mini v${i}"><svg class="crackline" viewBox="0 0 100 130" preserveAspectRatio="none"><path pathLength="100" d="M17 58 L29 50 L38 66 L49 54 L60 69 L71 56 L83 64"/></svg></div>${slot?`<div class="hatchling">${slotVisual(slot,i)}</div>`:''}<span class="hatch-number">Design ${i+1}</span></div>`).join('')}</div><div class="hatch-actions">${settled?button('Choose your agent →','choose'):`<p class="hatch-status">Hatching your designs…</p>`}</div></div>`;}
  function revealScreen(){const slots=state.slots;return `<div class="stage"><span class="eyebrow">Meet the clutch</span><h2>${escapeHtml(state.name)} hatched — pick your favourite</h2><p>Three takes on your description. Choose the one to use as ${escapeHtml(state.name)}’s avatar.</p><div class="choice-grid">${slots.map((slot,i)=>`<button class="generated-choice ${state.variant===i?'selected':''}" data-option="${i}" aria-pressed="${state.variant===i}">${slotVisual(slot,i)}<span class="pick-name">${escapeHtml(state.name)}</span><span class="pick-tag">${slot&&slot.image?'Generated design':variantLabels[i]}</span></button>`).join('')}</div><div class="actions">${button('Redesign','redesign',true)}${button('Use this avatar →','market')}</div></div>`;}
  function initials(str){return String(str||'AH').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
  function agentCard(agent){const gen=state.marketImages[agent.id];const pending=!gen&&!state.marketStarted&&state.variant!==null&&usePortraits&&config.marketPortraits!==false;return `<article class="p-card" data-agent="${agent.id}" data-search="${escapeHtml((agent.name+' '+agent.team).toLowerCase())}" tabindex="0"><div class="p-thumb thumb-${agent.id} ${gen?'is-generated':''} ${pending?'is-pending':''}"><img data-portrait="${agent.id}" src="${gen||agent.portrait}" alt="${escapeHtml(agent.name)}" loading="lazy"></div><div class="p-meta"><div class="p-name">${agent.name} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(company)}</span><span class="p-tag">${agent.team}</span></div></div></article>`;}
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
  function chatsView(){
    const convos=[[state.name||'Agent','Draft the Q3 outreach sequence','2m'],['Invoice Agent','3 invoices ready for approval','1h'],['Support Agent','Replied to 12 tickets','3h'],['Website Agent','Homepage copy updated','Yesterday']];
    const msgs=[['them',`Morning! I qualified 8 new leads overnight and drafted follow-ups for the 3 hottest. Want me to send them?`],['me',`Yes — send the top 3, hold the rest for review.`],['them',`Done ✅ Sent to the top 3 and scheduled a reminder for the others tomorrow at 9am. I also updated HubSpot.`]];
    return `<div class="chat-wrap">
      <aside class="chat-list"><div class="chat-list-head">${ic.search}<input placeholder="Search chats..."></div>${convos.map(([n,p,t],i)=>`<button class="chat-item ${i===0?'active':''}">${agentAvatar('chat-ava')}<div class="chat-item-main"><div class="chat-item-top"><b>${escapeHtml(n)}</b><span>${t}</span></div><div class="chat-item-sub">${escapeHtml(p)}</div></div></button>`).join('')}</aside>
      <section class="chat-main"><div class="chat-head">${agentAvatar('chat-ava')}<div><b>${escapeHtml(state.name||'Agent')}</b><span class="chat-status"><i class="dot"></i> Active</span></div></div>
        <div class="chat-thread">${msgs.map(([who,t])=>`<div class="msg ${who}">${who==='them'?agentAvatar('msg-ava'):''}<div class="bubble">${escapeHtml(t)}</div></div>`).join('')}</div>
        <div class="chat-input"><input placeholder="Message ${escapeHtml(state.name||'your agent')}…"><button class="send-btn" data-noop="1">${ic.arrowUp||'↑'}</button></div></section>
    </div>`;
  }
  function analyticsView(){
    const stats=[['Tasks completed','1,284','+18%'],['Hours saved','96','+12%'],['Messages handled','5,120','+7%'],['Approvals pending','4','']];
    const bars=[40,62,55,78,70,88,95];
    return `<div class="page-pad"><h2 class="page-h2">Analytics</h2><p class="page-sub">How ${escapeHtml(state.name||'your agent')} and the team performed this month.</p>
      <div class="stat-row">${stats.map(([l,v,d])=>`<div class="stat-tile"><div class="stat-label">${l}</div><div class="stat-val">${v}</div>${d?`<div class="stat-delta">${d}</div>`:''}</div>`).join('')}</div>
      <div class="chart-card"><div class="chart-head"><b>Weekly activity</b><span>Last 7 days</span></div><div class="bars">${bars.map(h=>`<span style="height:${h}%"></span>`).join('')}</div></div>
    </div>`;
  }
  function configView(){
    const toggles=[['Human approval before sending','on'],['Auto-research new leads','on'],['Post daily summary to Slack','on'],['Learn from my edits','off']];
    const conns=['HubSpot','Gmail','Slack','Google Drive','Xero'];
    return `<div class="page-pad cfg"><h2 class="page-h2">Configuration</h2><p class="page-sub">Make ${escapeHtml(state.name||'your agent')} yours.</p>
      <div class="cfg-grid">
        <section class="cfg-card"><h3>Identity</h3><div class="cfg-identity">${agentAvatar('cfg-ava')}<div class="cfg-fields"><label class="field-label">Name</label><input class="cf-input" value="${escapeHtml(state.name||'Agent')}"><label class="field-label">Company</label><input class="cf-input" value="${escapeHtml(company)}"></div></div></section>
        <section class="cfg-card"><h3>Behaviour</h3>${toggles.map(([l,s])=>`<div class="cfg-row"><span>${l}</span><span class="toggle ${s}"><i></i></span></div>`).join('')}</section>
        <section class="cfg-card"><h3>Connected tools</h3><div class="cfg-conns">${conns.map(c=>`<span class="mcp">${c}</span>`).join('')}<button class="btn btn-outline" data-noop="1">+ Add</button></div></section>
        <section class="cfg-card"><h3>Context &amp; knowledge</h3><p class="cfg-note">Files and notes ${escapeHtml(state.name||'your agent')} can draw on.</p><div class="ctx-list"><div class="ctx-item">${ci.server}Company handbook.pdf</div><div class="ctx-item">${ci.server}Brand voice.md</div><div class="ctx-item">${ci.server}Pricing.xlsx</div></div></section>
      </div></div>`;
  }
  function marketScreen(){
    const tab=(k,label)=>`<button class="nav-tab ${state.tab===k?'active':''}" data-tab="${k}">${ic[k==='market'?'market':k]}<span>${label}</span></button>`;
    const body = state.tab==='chats'?chatsView():state.tab==='analytics'?analyticsView():state.tab==='config'?configView():profilesBoard();
    return `<div class="app">
      <header class="app-nav">
        <div class="ws"><img class="ws-logo" src="/agent-hatchers-logo.png" alt=""><span>${escapeHtml(company)}</span><i class="ws-chev">${ic.chev}</i></div>
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
    if(state.marketStarted || !usePortraits || config.marketPortraits===false || state.variant===null) return;
    state.marketStarted = true;
    const agents = rankAgents().map(r=>r.agent);
    await Promise.all(agents.map(async agent=>{
      const img = await fetchImage({brief:state.look,name:agent.name,role:agent.scene,image:state.selectedImage,company,industry:industryLabel,variant:state.variant||0});
      if(!img) return;
      state.marketImages[agent.id] = img;
      const el = root.querySelector(`img[data-portrait="${agent.id}"]`);
      if(el){el.src=img;el.closest('.p-thumb')?.classList.add('is-generated');}
    }));
  }
  function openEgg(i){const card=root.querySelector(`.hatch-card[data-i="${i}"]`);if(!card||card.classList.contains('opened'))return;card.classList.add('opened');const wrap=document.createElement('div');wrap.className='hatchling';wrap.innerHTML=slotVisual(state.slots[i],i);card.appendChild(wrap);}
  async function generateAgents(){
    const lookTa=document.getElementById('agent-look');if(lookTa&&lookTa.value.trim())state.look=lookTa.value.trim();
    state.slots=[null,null,null];state.variant=null;state.selectedImage='';state.step=2;render();
    const started=Date.now();
    await Promise.all([0,1,2].map(async i=>{
      const image=await fetchPortrait(i);
      // Hold each egg for the full 5s crack (and until its image is ready), then open.
      const minMs=5000+i*300;const wait=Math.max(0,minMs-(Date.now()-started));if(wait)await sleep(wait);
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
      if(a==='generate'){const input=document.getElementById('agent-name');const name=input.value.trim();if(!name){input.focus();input.setAttribute('aria-invalid','true');return}state.name=name;const bizIn=document.getElementById('agent-biz');state.biz=bizIn?bizIn.value.trim():'';const lookTa=document.getElementById('agent-look');state.look=(lookTa&&lookTa.value.trim())||'a friendly rounded robot in blue and white';generateAgents()}
      if(a==='choose'){if(state.variant===null)state.variant=0;state.step=3;render()}
      if(a==='redesign'){state.step=1;render()}
      if(a==='open-connect'){openConnectDialog()}
      if(a==='market'){if(state.variant===null){state.variant=0;const s=state.slots[0];state.selectedImage=s&&s.image?s.image:''}document.querySelectorAll('.confetti').forEach(c=>c.remove());state.step=4;render();generateMarket()}
      if(a==='reset'){state.step=0;state.name='';state.biz='';state.look='';state.slots=[];state.variant=null;state.selectedImage='';state.done=false;state.marketImages=Object.assign({},config.bakedMarket||{});state.marketStarted=false;document.querySelectorAll('.confetti').forEach(c=>c.remove());render()}
    });
    root.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>{const i=+el.dataset.option;state.variant=i;const s=state.slots[i];state.selectedImage=s&&s.image?s.image:'';root.querySelectorAll('.generated-choice').forEach(c=>{const on=+c.dataset.option===i;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',on)});});
    root.querySelectorAll('[data-look-index]').forEach(el=>el.onclick=()=>{const ta=document.getElementById('agent-look');if(ta){ta.value=lookSeeds[+el.dataset.lookIndex].text;ta.focus()}});
    root.querySelectorAll('[data-mic]').forEach(btn=>btn.onclick=()=>startDictation(btn));
    root.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>{state.tab=el.dataset.tab;render();});
    root.querySelectorAll('[data-agent]').forEach(el=>{el.onclick=()=>showAgent(el.dataset.agent);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showAgent(el.dataset.agent)}};});
    const search=document.getElementById('market-search');if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();let visible=0;root.querySelectorAll('.p-card[data-search]').forEach(c=>{const show=!q||c.dataset.search.includes(q);c.hidden=!show;if(show)visible++;});const yours=root.querySelector('.p-card.is-yours');if(yours)yours.hidden=!!q;root.querySelectorAll('.board-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.p-card')].some(c=>!c.hidden);});const empty=document.getElementById('board-empty');if(empty)empty.hidden=visible>0;};
    const input=document.getElementById('agent-name');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('agent-biz')?.focus()}};
  }
  render();
})();
