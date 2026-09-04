(() => {
  const BUILD = 59;  // bump with ?v= in the pages — lets anyone confirm which build a browser is running
  const config = window.PROTOTYPE_CONFIG || {};
  // Each agent has a keyword set tuned to the kinds of businesses that genuinely need it
  // (typed "type of company" text drives the ranking) and a deliberately DISTINCT scene —
  // its own outfit, props and environment — so the generated marketplace portraits don't
  // all end up in the same room wearing the same thing.
  const catalog = [
    {id:'logistics',icon:'▣',name:'Logistics Agent',industries:['retail','all'],keywords:['e-commerce','ecommerce','shipping','delivery','logistics','warehouse','freight','courier','luggage','travel','orders','tracking','parcel','auspost','carrier','shopify','fulfilment','fulfillment','supply','store','shop'],summary:'Tracks every order and shipment, chases carriers and keeps customers informed.',portrait:'/hatchy-routing.webp',team:'Logistics',scene:'It is a logistics agent wearing a hi-vis orange safety vest and holding a barcode scanner, standing in a busy warehouse aisle between tall shelves of labelled parcels, with a conveyor belt of boxes and a shipping-routes wall map behind it.',mcps:['Shopify','ShipStation','AfterShip','Gmail','Slack'],outcomes:['Track every order from checkout to doorstep','Chase carriers on late or stuck shipments','Send customers proactive delivery updates','Flag lost parcels before customers complain','Prepare daily fulfilment summaries']},
    {id:'marketing',icon:'✦',name:'Marketing Agent',industries:['retail','technology','all'],keywords:['e-commerce','ecommerce','marketing','ads','advertising','paid','ppc','seo','social','brand','growth','shop','store','d2c','retail','campaign'],summary:'Runs your campaigns end to end — paid ads, SEO and social — and reports what actually converts.',portrait:'/hatchy-website.webp',team:'Marketing',scene:'It is a marketing agent wearing a stylish beret and round glasses, holding a colour-swatch tablet in a bright creative studio, surrounded by mood boards, a ring light, and floating holographic ad-campaign dashboards with rising graphs.',mcps:['Google Ads','Meta Ads','Google Analytics','Klaviyo','Canva'],outcomes:['Draft and schedule ad campaigns','Rebalance spend toward what converts','Prepare weekly performance reports','Keep product listings search-friendly','Draft on-brand social and email content']},
    {id:'support',icon:'◉',name:'Support Agent',industries:['retail','healthcare','technology','all'],keywords:['support','enquiry','ticket','customer service','help desk','reply','triage','complaint','inbox','customer'],summary:'Triages customer enquiries, drafts helpful replies and escalates what matters.',portrait:'/hatchy-support.webp',team:'Support',scene:'It is a customer support agent wearing an over-ear headset with a boom microphone, sitting at a cosy help-desk pod with a warm desk lamp, a mug, and a wall of floating chat bubbles and five-star reviews behind it.',mcps:['Zendesk','Intercom','Gmail','Slack','Microsoft Teams'],outcomes:['Classify every inbound enquiry','Draft replies in your support voice','Surface urgent or sensitive cases','Find answers from your knowledge base','Track recurring customer issues']},
    {id:'returns',icon:'⇄',name:'Returns Agent',industries:['retail','all'],keywords:['e-commerce','ecommerce','returns','refund','exchange','warranty','rma','store','shop','retail','luggage'],summary:'Handles returns and exchanges end to end — labels, refunds and restocking.',portrait:'/hatchy-invoice.webp',team:'Support',scene:'It is a returns agent wearing a red apron and holding a tape gun, standing at a returns counter stacked with open parcels and bubble wrap, scanning a prepaid return label under a big hanging RETURNS & EXCHANGES sign.',mcps:['Shopify','Loop Returns','Stripe','Gmail','Slack'],outcomes:['Issue return labels automatically','Approve straightforward refunds instantly','Spot serial refunders and fraud patterns','Route damaged-item claims with photos','Report the top reasons items come back']},
    {id:'sales',icon:'↗',name:'Sales Agent',industries:['professional-services','technology','all'],keywords:['sales','lead','prospect','crm','outreach','follow up','pipeline','revenue','deal','b2b','wholesale'],summary:'Qualifies opportunities, researches prospects and keeps every follow-up moving.',portrait:'/hatchy-sales.webp',team:'Sales',scene:'It is a sales agent wearing a sharp navy blazer and a wireless earpiece, leaning on a standing desk on a glass-walled sales floor at golden hour, with a big screen of pipeline deal cards and a ringing phone beside it.',mcps:['HubSpot','Salesforce','Gmail','Slack','LinkedIn'],outcomes:['Research every new lead automatically','Score and prioritise opportunities','Draft outreach in your company voice','Schedule timely follow-ups','Keep your CRM records current']},
    {id:'inventory',icon:'▤',name:'Inventory Agent',industries:['retail','construction','all'],keywords:['inventory','stock','sku','restock','warehouse','product','e-commerce','ecommerce','retail','store','shop','supplier'],summary:'Watches stock levels, predicts sell-outs and drafts purchase orders in time.',portrait:'/hatchy-document.webp',team:'Operations',scene:'It is an inventory agent wearing work gloves and a tool belt with a clipboard holster, counting labelled crates on steel shelving in a stockroom, with a glowing stock-level dashboard on a wall-mounted tablet beside it.',mcps:['Shopify','Cin7','Xero','Google Sheets','Slack'],outcomes:['Watch stock levels across every channel','Predict sell-outs before they happen','Draft purchase orders for approval','Reconcile deliveries against orders','Flag slow movers tying up cash']},
    {id:'invoices',icon:'$',name:'Invoice Agent',industries:['professional-services','retail','construction','all'],keywords:['invoice','finance','accounts','payment','expense','bookkeeping','xero','billing','purchase order','accounting'],summary:'Reads invoices, checks records, flags anomalies and prepares approvals.',portrait:'/hatchy-invoice.webp',team:'Finance',scene:'It is a finance agent wearing a green accountant’s visor and sleeve garters, seated at a tidy desk with a receipt printer, a vintage calculator and neat stacks of invoices, in front of a softly glowing ledger screen.',mcps:['Xero','MYOB','QuickBooks','Gmail','Google Drive'],outcomes:['Capture invoice data automatically','Match invoices to business records','Flag duplicates and unusual amounts','Prepare approval queues','Produce scheduled finance summaries']},
    {id:'documents',icon:'▥',name:'Document Agent',industries:['professional-services','legal','construction','all'],keywords:['document','proposal','contract','report','brief','policy','pdf','draft','legal','template','law','agency','consult'],summary:'Turns briefs and source material into polished documents using your templates.',portrait:'/hatchy-document.webp',team:'Documents',scene:'It is a document agent wearing a smart tweed waistcoat and half-moon reading glasses, stamping a thick contract with a wax seal in a wood-panelled library office, beside tall shelves of colour-coded binders and a brass desk lamp.',mcps:['Google Drive','Microsoft 365','Notion','Dropbox','Slack'],outcomes:['Create proposals from approved templates','Summarise long source documents','Prepare client-ready reports','Maintain consistent tone and branding','Route drafts for human approval']},
    {id:'website',icon:'◇',name:'Website Agent',industries:['all'],keywords:['website','content','publish','webflow','wordpress','page','blog','copy','web','online'],summary:'Keeps website content accurate, on-brand and ready for approval before publishing.',portrait:'/hatchy-website.webp',team:'Marketing',scene:'It is a website agent wearing a comfy hoodie and headphones around its neck, at a dual-monitor desk in a loft studio at night editing a colourful online storefront, with sticky notes on the window and a small cactus by the keyboard.',mcps:['GitHub','Webflow','WordPress','Google Drive','Slack'],outcomes:['Draft new website pages','Update approved copy and details','Check pages for stale information','Prepare search-friendly metadata','Publish only after human approval']},
    {id:'operations',icon:'✓',name:'Operations Agent',industries:['professional-services','construction','healthcare','all'],keywords:['operations','workflow','project','task','deadline','schedule','coordination','process','compliance','ops','clinic','manufacturing'],summary:'Coordinates repeatable workflows and keeps teams informed when work changes state.',portrait:'/hatchy-routing.webp',team:'Operations',scene:'It is an operations agent wearing a project-manager lanyard and holding a marker, standing at a wall-sized kanban board covered in swim-lanes and sticky notes in a bright planning room, with interlocking gears drawn on a whiteboard behind it.',mcps:['Monday.com','Asana','Notion','Slack','Microsoft Teams'],outcomes:['Turn requests into structured work','Monitor deadlines and blockers','Prepare daily operating summaries','Chase missing information','Escalate exceptions to the right person']}
  ];
  const state = {step:0,name:'',biz:'',industry:'',tools:[],toolsOpen:false,look:'',team:null,teamBusy:false,refPhoto:'',brand:null,refBusy:false,refError:'',slots:[],variant:null,selectedImage:'',done:false,marketImages:{},marketRefKey:'',marketStarted:false,added:[],tab:'profiles',chatActive:0,chatExtra:{},chatTyping:{},company:'',editUses:0,profiles:[],sid:'',startedAt:0,merch:{robot:'__you',product:'tee',color:0,size:'S',qty:1,basket:[],note:false}};
  const root = document.getElementById('prototype-app');
  const co = () => state.company || config.company || 'Your Company';
  const DESIGN_AXES={
    build:['a compact chibi build with a big round head and stubby limbs','a tall slender build with long thin limbs','a chunky sturdy build with a barrel chest and broad shoulders','a small hovering build with no legs, floating on a rounded base'],
    face:['two big expressive round eyes','a single friendly camera-lens eye','a wide glowing visor face','a pixel-matrix screen face with a smiley expression'],
    finish:['glossy ceramic-like panels','brushed metal with visible panel seams and rivets','a soft matte rubberised shell','clean moulded plastic like a premium toy'],
    style:['retro 1970s tin-toy robot styling','sleek near-future android styling','cute kitchen-appliance-inspired styling','sporty drone-inspired styling with fins']
  };
  const shuffle=a=>{const c=[...a];for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;};
  // With a reference photo the three designs must ALL be recognisably that person, so the
  // body/face axes above (which would give them a hovering ball body or a single camera eye)
  // are not used; only the robot styling varies between designs.
  const PHOTO_STYLES=[
    'a sleek humanoid android with human proportions, smooth panelled skin and glowing seams',
    'a cute chibi robot caricature with a big head and small body, features exaggerated but still recognisable',
    'a chunky retro tin-toy robot with boxy panels, rivets and a warm vintage finish'
  ];
  function dealDesignAxes(){state.axes={build:shuffle(DESIGN_AXES.build),face:shuffle(DESIGN_AXES.face),finish:shuffle(DESIGN_AXES.finish),style:shuffle(DESIGN_AXES.style),photoStyle:shuffle(PHOTO_STYLES)};}
  function designBrief(variant){
    const ax=state.axes||{};
    if(state.refPhoto){
      // Likeness first, the prospect's own words last: the proxy trims the brief at 600 chars.
      const style=(ax.photoStyle||PHOTO_STYLES)[variant%3];
      return `A robot version of the person in the reference photo. It must be instantly recognisable as them: same face shape and expression, same hairstyle and hair colour, same skin tone (as the face-plate tone), and the same clothing colours and style, all rebuilt from robot parts. Copy their glasses or facial hair only if the photo actually shows them; never add any. Render it as ${style}. ${state.look}`;
    }
    const pick=k=>((ax[k]||DESIGN_AXES[k])[variant%4]);
    return `${state.look}. Show ONE robot only. Make this one distinctive: give it ${pick('build')}, ${pick('face')}, ${pick('finish')}, and ${pick('style')}.`;
  }

  const industry = config.industry || 'professional-services';
  const industryLabel = config.industryLabel || 'Your industry';
  // Real portrait generation. Point portraitEndpoint at a callable endpoint and it upgrades
  // automatically; until then each egg falls back to an on-brand simulated mascot so the
  // prospect experience is never broken. Set generatePortraits:false to skip the call entirely.
  const portraitEndpoint = config.portraitEndpoint || 'https://agent-hatchers-portrait-proxy.vercel.app/api/prototype-portrait';
  const usePortraits = config.generatePortraits !== false && !!portraitEndpoint;
  const chatEndpoint = config.chatEndpoint || portraitEndpoint.replace('prototype-portrait','prototype-chat');
  const brandEndpoint = config.brandEndpoint || portraitEndpoint.replace('prototype-portrait','prototype-brand');
  const teamEndpoint = config.teamEndpoint || portraitEndpoint.replace('prototype-portrait','prototype-team');
  const profileEndpoint = config.profileEndpoint || portraitEndpoint.replace('prototype-portrait','prototype-profile');
  const recommended = new Set(config.recommendedAgents||[]);
  function rankAgents(){const text=`${state.name} ${state.biz} ${state.industry} ${state.look} ${industryLabel}`.toLowerCase();const boost=bizBoost(text);return catalog.map((agent,index)=>{let score=boost[agent.id]||0;agent.keywords.forEach(k=>{if(text.includes(k))score+=4});if(agent.industries.includes(industry))score+=2;if(recommended.has(agent.id))score+=1;return{agent,score,index};}).sort((a,b)=>b.score-a.score||a.index-b.index);}
  // The 6 best-matched agents for this business get generated portraits + the Recommended row.
  // The researched/ranked six, plus anything the prospect added from the Marketplace.
  const topAgents = () => {
    const base=(state.team&&state.team.ids.length)?state.team.ids.map(id=>catalog.find(a=>a.id===id)).filter(Boolean):rankAgents().slice(0,6).map(r=>r.agent);
    (state.added||[]).forEach(id=>{const a=catalog.find(x=>x.id===id);if(a&&!base.includes(a))base.push(a);});
    return base;
  };
  // "Add to your team" on a Marketplace card: the portrait is already drawn, so joining is
  // free and instant — the card turns green and the agent shows up under Profiles and Chats.
  function addAgent(id){
    const agent=catalog.find(a=>a.id===id);if(!agent||topAgents().includes(agent))return;
    state.added=[...(state.added||[]),id];celebrate();render();
    document.querySelectorAll('.create-pop').forEach(p=>p.remove());
    const pop=document.createElement('div');pop.className='create-pop wb-pop';pop.innerHTML=`${ci.check}<span><b>${escapeHtml(agent.name)}</b> joined your team — it’s now under Profiles and Chats.</span>`;
    document.body.appendChild(pop);setTimeout(()=>pop.classList.add('show'),10);setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>pop.remove(),300)},4600);
  }
  // ---------- Team research: a model reasons about THIS business before we show a team ----------
  async function researchTeam(biz,research=biz){
    state.team=null;state.teamBusy=true;
    const started=Date.now();const mine=biz;
    const roster=catalog.map(a=>({id:a.id,name:a.name,summary:a.summary}));
    let result=null;
    for(let attempt=0;attempt<2&&!result;attempt++){
      if(attempt) await sleep(600);
      try{
        const res=await fetch(teamEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({business:research,roster})});
        const body=await res.json().catch(()=>({}));
        if(res.ok&&body&&Array.isArray(body.team)&&body.team.length>=4){
          const lines={};const ids=[];
          body.team.forEach(t=>{const a=catalog.find(x=>x.id===t.id);if(a&&!ids.includes(a.id)){ids.push(a.id);lines[a.id]={does:String(t.does||PLAIN[a.id].does),job:String(t.job||PLAIN[a.id].job)};}});
          if(ids.length>=4) result={ids:ids.slice(0,6),lines,intro:String(body.intro||''),source:'ai'};
        }
        if(res.status===400) break;
      }catch(e){/* retry then fall back */}
    }
    if(!result){
      // Keyword ranking with the stock lines — the page still works if the proxy is down.
      state.team=null;const ids=rankAgents().slice(0,6).map(r=>r.agent.id);
      result={ids,lines:Object.fromEntries(ids.map(id=>[id,{does:PLAIN[id].does,job:PLAIN[id].job}])),intro:'',source:'fallback'};
    }
    // Let the research read as research — never flash the answer in under two seconds.
    const wait=Math.max(0,2400-(Date.now()-started));if(wait) await sleep(wait);
    if(state.biz!==mine) return;   // they changed their mind mid-think
    state.team=result;state.teamBusy=false;
  }

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
  const MCP_SPRITE="<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"display:none\" aria-hidden=\"true\"><symbol id=\"lg-gmail\" viewBox=\"52 42 88 66\">       <path fill=\"#4285f4\" d=\"M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6\"/>       <path fill=\"#34a853\" d=\"M120 108h14c3.32 0 6-2.69 6-6V59l-20 15\"/>       <path fill=\"#fbbc04\" d=\"M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2\"/>       <path fill=\"#ea4335\" d=\"M72 74V48l24 18 24-18v26L96 92\"/>       <path fill=\"#c5221f\" d=\"M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2\"/>     </symbol><symbol id=\"lg-slack\" viewBox=\"0 0 24 24\">       <path fill=\"#36C5F0\" d=\"M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z\"/>       <path fill=\"#2EB67D\" d=\"M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z\"/>       <path fill=\"#ECB22E\" d=\"M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z\"/>       <path fill=\"#E01E5A\" d=\"M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z\"/>     </symbol><symbol id=\"lg-teams\" viewBox=\"0 0 2228.833 2073.333\"><path fill=\"#5059C9\" d=\"M1554.637,777.5h575.713c54.391,0,98.483,44.092,98.483,98.483v524.398c0,199.901-162.051,361.952-361.952,361.952h-1.711c-199.901,0.028-361.975-162-362.004-361.901V828.971C1503.167,800.544,1526.211,777.5,1554.637,777.5z\"/><path fill=\"#5059C9\" d=\"M1943.75,207.333a233.25,233.25 0 1 1 0,466.5a233.25,233.25 0 1 1 0,-466.5z\"/><path fill=\"#7B83EB\" d=\"M1218.083,0a336.917,336.917 0 1 1 0,673.834a336.917,336.917 0 1 1 0,-673.834z\"/><path fill=\"#7B83EB\" d=\"M1667.323,777.5H717.01c-53.743,1.33-96.257,45.931-95.01,99.676v598.105c-7.505,322.519,247.657,590.16,570.167,598.053c322.51-7.893,577.671-275.534,570.167-598.053V877.176C1763.579,823.431,1721.066,778.83,1667.323,777.5z\"/><path fill=\"#000000\" opacity=\"0.2\" d=\"M1192.167,777.5v786.312c-0.395,52.223-42.632,94.46-94.855,94.855h-447.84c-18.144-59.476-27.402-121.307-27.472-183.49V877.02c-1.246-53.659,41.198-98.19,94.855-99.52H1192.167z\"/><path fill=\"#000000\" opacity=\"0.2\" d=\"M1192.167,561.355v111.442c-17.496-1.161-34.848-3.937-51.833-8.293c-104.963-24.857-191.679-98.469-233.25-198.003h190.228C1149.616,466.699,1191.968,509.051,1192.167,561.355z\"/><path fill=\"#4B53BC\" d=\"M95.01,466.5h950.312c52.473,0,95.01,42.538,95.01,95.01v950.312c0,52.473-42.538,95.01-95.01,95.01H95.01c-52.473,0-95.01-42.538-95.01-95.01V561.51C0,509.038,42.538,466.5,95.01,466.5z\"/><path fill=\"#FFFFFF\" d=\"M820.211,828.193H630.241v517.297H509.211V828.193H320.123V727.844h500.088V828.193z\"/></symbol><symbol id=\"lg-hubspot\" viewBox=\"0 0 24 24\">       <path fill=\"#FF7A59\" d=\"M18.164 7.93V5.084a2.198 2.198 0 0 0 1.267-1.978v-.067A2.2 2.2 0 0 0 17.238.845h-.067a2.2 2.2 0 0 0-2.193 2.194v.067a2.196 2.196 0 0 0 1.252 1.973l.013.006v2.852a6.22 6.22 0 0 0-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 1 0 4.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 0 0-1.038 3.446c0 1.343.425 2.588 1.147 3.606l-.013-.02-2.342 2.343a1.968 1.968 0 0 0-.58-.095h-.002a2.033 2.033 0 1 0 2.033 2.033 1.978 1.978 0 0 0-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 1 0 4.782-11.134l-.036-.005zm-1.02 9.378a3.206 3.206 0 1 1 3.207-3.207 3.206 3.206 0 0 1-3.206 3.206z\"/>     </symbol><symbol id=\"lg-xero\" viewBox=\"0 0 24 24\">       <path fill=\"#13B5EA\" d=\"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.585 14.655c-1.485 0-2.69-1.206-2.69-2.689 0-1.485 1.207-2.691 2.69-2.691 1.485 0 2.69 1.207 2.69 2.691s-1.207 2.689-2.69 2.689zM7.53 14.644c-.099 0-.192-.041-.267-.116l-2.043-2.04-2.052 2.047c-.069.068-.16.108-.258.108-.202 0-.368-.166-.368-.368 0-.099.04-.191.111-.263l2.04-2.05-2.038-2.047c-.075-.069-.113-.162-.113-.261 0-.203.166-.366.368-.366.098 0 .188.037.258.105l2.055 2.048 2.048-2.045c.069-.071.162-.108.26-.108.211 0 .375.165.375.366 0 .098-.029.188-.104.258l-2.056 2.055 2.055 2.051c.068.069.104.16.104.258 0 .202-.165.368-.365.368h-.01zm8.017-4.591c-.796.101-.882.476-.882 1.404v2.787c0 .202-.165.366-.366.366-.203 0-.367-.165-.368-.366v-4.53c0-.204.16-.366.362-.366.166 0 .316.125.346.289.27-.209.6-.317.93-.317h.105c.195 0 .359.165.359.368 0 .201-.164.352-.375.359 0 0-.09 0-.164.008l.053-.002zm-3.091 2.205H8.625c0 .019.003.037.006.057.02.105.045.211.083.31.194.531.765 1.275 1.829 1.29.33-.003.631-.086.9-.229.21-.12.391-.271.525-.428.045-.058.09-.112.12-.168.18-.229.405-.186.54-.083.164.135.18.391.045.57l-.016.016c-.21.27-.435.495-.689.66-.255.164-.525.284-.811.345-.33.09-.645.104-.975.06-1.095-.135-2.01-.93-2.28-2.01-.06-.21-.09-.42-.09-.645 0-.855.421-1.695 1.125-2.205.885-.615 2.085-.66 3-.075.63.405 1.035 1.021 1.185 1.771.075.419-.21.794-.734.81l.068-.046zm6.129-2.223c-1.064 0-1.931.865-1.931 1.931 0 1.064.866 1.931 1.931 1.931s1.931-.867 1.931-1.931c0-1.065-.866-1.933-1.931-1.933v.002zm0 2.595c-.367 0-.666-.297-.666-.666 0-.367.3-.665.666-.665.367 0 .667.299.667.665 0 .369-.3.667-.667.666zm-8.04-2.603c-.91 0-1.672.623-1.886 1.466v.03h3.776c-.203-.855-.973-1.494-1.891-1.494v-.002z\"/>     </symbol><symbol id=\"lg-quickbooks\" viewBox=\"0 0 24 24\">       <path fill=\"#2CA01C\" d=\"M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm.642 4.1335c.9554 0 1.7296.776 1.7296 1.7332v9.0667h1.6c1.614 0 2.9275-1.3156 2.9275-2.933 0-1.6173-1.3136-2.9333-2.9276-2.9333h-.6654V7.3334h.6654c2.5722 0 4.6577 2.0897 4.6577 4.667 0 2.5774-2.0855 4.6666-4.6577 4.6666H12.642zM7.9837 7.333h3.3291v12.533c-.9555 0-1.73-.7759-1.73-1.7332V9.0662H7.9837c-1.6146 0-2.9277 1.316-2.9277 2.9334 0 1.6175 1.3131 2.9333 2.9277 2.9333h.6654v1.7332h-.6654c-2.5725 0-4.6577-2.0892-4.6577-4.6665 0-2.5771 2.0852-4.6666 4.6577-4.6666Z\"/>     </symbol><symbol id=\"lg-stripe\" viewBox=\"0 0 24 24\">       <rect width=\"24\" height=\"24\" rx=\"5\" fill=\"#635BFF\"/>       <path fill=\"#fff\" transform=\"translate(5.4,5.4) scale(0.55)\" d=\"M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z\"/>     </symbol><symbol id=\"lg-notion\" viewBox=\"0 0 24 24\">       <rect x=\"1.5\" y=\"1.5\" width=\"21\" height=\"21\" rx=\"3.5\" fill=\"#fff\" stroke=\"#16150F\" stroke-width=\"1.6\"/>       <text x=\"12\" y=\"17.2\" text-anchor=\"middle\" font-family=\"Georgia,'Times New Roman',serif\" font-weight=\"700\" font-size=\"14\" fill=\"#16150F\">N</text>     </symbol><symbol id=\"lg-zendesk\" viewBox=\"0 0 24 24\">       <path fill=\"#03363D\" d=\"M11.087 4.685v14.629H0L11.087 4.685zM11.087 0c0 3.062-2.482 5.544-5.544 5.544S0 3.062 0 0h11.087zM12.913 19.314c0-3.062 2.482-5.544 5.544-5.544S24 16.252 24 19.314H12.913zM12.913 14.629V0H24L12.913 14.629z\"/>     </symbol></svg>";
  document.body.insertAdjacentHTML('beforeend', MCP_SPRITE);
  // Real marks where the brand sprite has them; brand-coloured monograms for the rest.
  // Brands with no clean vector mark to hand: their own site icons, served from the repo.
  const MCP_IMGS={'DocuSign':'docusign.png','Pipedrive':'pipedrive.png','Freshdesk':'freshdesk.png','Loop Returns':'loop-returns.ico','ShipStation':'shipstation.png','Cin7':'cin7.jpg','Klaviyo':'klaviyo.png','Deputy':'deputy.png','Cliniko':'cliniko.png','WooCommerce':'woocommerce.png'};
  const MCP_ICONS={'Gmail':'lg-gmail','Slack':'lg-slack','Microsoft Teams':'lg-teams','HubSpot':'lg-hubspot','Xero':'lg-xero','QuickBooks':'lg-quickbooks','Stripe':'lg-stripe','Notion':'lg-notion','Zendesk':'lg-zendesk','Xero Payroll':'lg-xero'};
  const MCP_MONO={'AfterShip':['AS','#FF6B2C'],'Asana':['as','#F06A6A'],'Canva':['C','#00C4CC'],'Cin7':['C7','#0B2E4F'],'Dropbox':['D','#0061FF'],'GitHub':['GH','#181717'],'Google Ads':['GA','#4285F4'],'Google Analytics':['An','#E37400'],'Google Drive':['GD','#1FA463'],'Google Sheets':['GS','#188038'],'Intercom':['IC','#1F8DED'],'Klaviyo':['K','#16120F'],'LinkedIn':['in','#0A66C2'],'Loop Returns':['L','#3D3AF2'],'MYOB':['M','#6100A5'],'Meta Ads':['M','#0081FB'],'Microsoft 365':['MS','#D83B01'],'Monday.com':['mo','#FF3D57'],'Salesforce':['SF','#00A1E0'],'ShipStation':['SS','#2E7FC0'],'Shopify':['S','#96BF48'],'Webflow':['W','#4353FF'],'WordPress':['W','#21759B'],'Pipedrive':['P','#017737'],'Freshdesk':['F','#25C16F'],'Square':['Sq','#3E4348'],'WooCommerce':['Wo','#7F54B3'],'Mailchimp':['MC','#241C15'],'Trello':['T','#0052CC'],'Jira':['J','#0052CC'],'Calendly':['C','#006BFF'],'Google Calendar':['GC','#4285F4'],'DocuSign':['DS','#4C00FF'],'Xero Payroll':['XP','#13B5EA'],'Deputy':['D','#E7412B'],'Airtable':['At','#18BFFF'],'Zoom':['Z','#0B5CFF'],'Cliniko':['Cl','#2E8B57']};
  // Which agents naturally hand work to each other — shown as a suggested team.
  // Plain-English intro (welcome + team screens), written for people who have never used
  // an AI agent: one sentence of what it does for you, a short "job" for the hand-off flow,
  // and a unique stock Hatchy so the pre-hatch list never repeats a picture.
  const PLAIN={
    logistics:{does:'Watches every delivery and tells your customers where their order is.',job:'tracks the delivery',art:'/assets/agents/hatchy-lib-logistics.webp'},
    marketing:{does:'Runs your ads and social posts, and tells you what actually brings customers in.',job:'brings customers in',art:'/assets/agents/hatchy-lib-marketing.webp'},
    support:{does:'Answers customer questions and passes the tricky ones to you.',job:'answers their questions',art:'/assets/agents/hatchy-lib-support.webp'},
    returns:{does:'Sorts out returns and refunds without you lifting a finger.',job:'handles any returns',art:'/hatchy-sec-approve.webp'},
    sales:{does:'Finds new customers and keeps following up so no lead goes cold.',job:'wins the customer',art:'/assets/agents/hatchy-lib-sales.webp'},
    inventory:{does:'Keeps an eye on stock and reorders before you run out.',job:'keeps stock topped up',art:'/hatchy-sec-storage.webp'},
    invoices:{does:'Reads your invoices, checks them and gets them ready to pay.',job:'sends and checks the bills',art:'/assets/agents/hatchy-lib-invoice.webp'},
    documents:{does:'Writes your proposals, reports and contracts from your own templates.',job:'writes the paperwork',art:'/assets/agents/hatchy-lib-docs.webp'},
    website:{does:'Keeps your website up to date and asks you before anything goes live.',job:'keeps the website fresh',art:'/assets/agents/hatchy-lib-web.webp'},
    operations:{does:'Keeps every job on schedule and chases anything running late.',job:'keeps the job on track',art:'/hatchy-sec-training.webp'}
  };
  // The order agents hand work to each other across a typical business day.
  // Everyday business words → the agents that matter most for that kind of business. The
  // catalog keywords are tool-ish ("crm", "sku"); a dentist or a café types neither.
  const BIZ_HINTS=[
    [/dent|clinic|doctor|medic|physio|chiro|health|\bvet|pharm|optom|psych|therap|\bgp\b|hospital|nurs|allied/,['operations','support','invoices','documents','marketing']],
    [/caf|coffee|restaurant|\bbar\b|\bpub\b|bakery|food|catering|hospitality|hotel|motel|airbnb|takeaway|pizza|winery|brew/,['inventory','marketing','support','operations','invoices']],
    [/plumb|electric|builder|build|construct|carpent|roof|paint|landscap|trade|tradie|hvac|air.?con|renovat|fencing|concret|handyman|tiler|mechanic|\bauto\b|garage|solar/,['operations','invoices','documents','sales','support']],
    [/real.?estate|property|realtor|rental|mortgage|broker|strata/,['sales','documents','marketing','support','operations']],
    [/account|bookkeep|\btax|\bcpa\b|financ|payroll|advis|wealth/,['invoices','documents','operations','sales','support']],
    [/\blaw|legal|solicitor|lawyer|conveyanc|barrister/,['documents','operations','invoices','sales','support']],
    [/shop|store|retail|ecommerce|e-commerce|online|boutique|clothing|fashion|brand|\bsell|etsy|shopify|amazon|product|florist|flower|gift|jewel|furniture/,['logistics','support','returns','marketing','inventory']],
    [/gym|fitness|yoga|pilates|coach|personal.?train|sport|\bclub|dance|martial/,['marketing','support','operations','invoices','website']],
    [/salon|hair|beauty|barber|\bspa\b|nail|tattoo|massage/,['support','marketing','operations','invoices','website']],
    [/school|tutor|educat|training|course|childcare|daycare|kindy|college|academy/,['support','operations','documents','marketing','invoices']],
    [/agency|consult|market|design|creative|studio|freelanc|media|\bpr\b|advertis|photograph|architect/,['sales','documents','marketing','invoices','operations']],
    [/software|saas|\btech|\bapp\b|startup|\bit\b|developer|\bdev\b|cloud|\bdata/,['support','sales','marketing','documents','operations']],
    [/wholesale|manufactur|factory|supplier|distribut|import|export|warehouse|logistic|freight|transport|courier|truck/,['logistics','inventory','invoices','operations','sales']],
    [/clean|pest|removal|security|maintenance|facility|garden|lawn|pool/,['operations','sales','invoices','support','marketing']],
    [/charity|non.?profit|church|community|council|association/,['documents','support','marketing','operations','invoices']],
    [/recruit|staffing|\bhr\b|labour|labor/,['documents','sales','operations','support','invoices']]
  ];
  function bizBoost(text){const boost={};BIZ_HINTS.forEach(([re,ids])=>{if(re.test(text))ids.forEach((id,i)=>{boost[id]=Math.max(boost[id]||0,(5-i)*2)})});return boost;}
  // "Other profiles" in Chats: workspace flavour, but every portrait is the prospect's OWN
  // hatched character re-dressed for the role (generated right after the marketplace batch),
  // never stock art of a different robot. While they hatch, the row shows a closed egg.
  const EXTRA_PROFILES=[
    {id:'x-bug',name:'Bug Destroyer',portrait:'/hatchy-av-test.webp',scene:'It is a bug-destroyer agent wearing a pest-control jumpsuit and goggles, swinging an electric bug-zapper racket at cartoon bugs crawling over a giant wall screen of code in a dim server room.'},
    {id:'x-data',name:'Data Scientist',portrait:'/hatchy-av-docs.webp',scene:'It is a data-scientist agent wearing a white lab coat and safety glasses, pointing at floating holographic scatter plots and bar charts in a bright research lab full of monitors.'},
    {id:'x-hermes',name:'Hermes Helper',portrait:'/hatchy-avatar.webp',scene:'It is a messenger agent wearing a winged golden helmet and winged sandals, sprinting with a leather satchel full of letters along a sunlit marble colonnade above the clouds.'},
    {id:'x-hype',name:'Hype Beast',portrait:'/hatchy-av-hype.webp',scene:'It is a hype agent wearing a puffer jacket, bucket hat and chunky sneakers, shouting into a megaphone at a neon-lit product launch with confetti falling.'},
    {id:'x-meme',name:'Meme Lord',portrait:'/hatchy-av-meme.webp',scene:'It is a meme-lord agent wearing a gold crown and sunglasses, lounging on a throne built from laptops with laughing-face emoji balloons floating around a colourful gaming den.'},
    {id:'x-vibe',name:'Vibe Coder',portrait:'/hatchy-av-web.webp',scene:'It is a vibe-coder agent wearing an oversized hoodie and neon headphones, typing on a glowing mechanical keyboard in a dim bedroom studio lit by purple RGB light strips.'}
  ];
  const WORKS_WITH={logistics:['inventory','returns','support'],marketing:['website','sales','support'],support:['returns','logistics','sales'],returns:['logistics','invoices','support'],sales:['marketing','invoices','documents'],inventory:['logistics','invoices','operations'],invoices:['inventory','returns','operations'],documents:['sales','operations','invoices'],website:['marketing','support','sales'],operations:['inventory','documents','invoices']};
  // Hand-drawn brand marks for MCPs the homepage sprite doesn't carry.
  const MCP_SVGS={
    'Microsoft 365':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="2" y="2" width="9.3" height="9.3" fill="#F25022"/><rect x="12.7" y="2" width="9.3" height="9.3" fill="#7FBA00"/><rect x="2" y="12.7" width="9.3" height="9.3" fill="#00A4EF"/><rect x="12.7" y="12.7" width="9.3" height="9.3" fill="#FFB900"/></svg>',
    'Google Ads':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="9.8" y="2.6" width="4.6" height="16" rx="2.3" transform="rotate(30 12 10.6)" fill="#FBBC04"/><rect x="9.8" y="2.6" width="4.6" height="16" rx="2.3" transform="rotate(-30 12 10.6)" fill="#4285F4"/><circle cx="5.6" cy="18.4" r="3.2" fill="#34A853"/></svg>',
    'Google Analytics':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="15.6" y="3" width="5.2" height="18" rx="2.6" fill="#F9AB00"/><rect x="9.4" y="9.5" width="5.2" height="11.5" rx="2.6" fill="#E37400"/><circle cx="5.8" cy="18.4" r="2.6" fill="#E37400"/></svg>',
    'Google Drive':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M8.7 3h6.6l7 12.2H15.7Z" fill="#FFBA00"/><path d="M8.7 3 1.7 15.2l3.3 5.8 7-12.2Z" fill="#00AC47"/><path d="M5 21h13.9l3.4-5.8H8.4Z" fill="#2684FC"/></svg>',
    'Google Sheets':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="5" y="2.5" width="14" height="19" rx="2" fill="#188038"/><path d="M8.2 10.2h7.6v7.6H8.2Z M8.2 14h7.6 M12 10.2v7.6" fill="none" stroke="#fff" stroke-width="1.4"/></svg>',
    'LinkedIn':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="2" y="2" width="20" height="20" rx="3.5" fill="#0A66C2"/><circle cx="7.9" cy="8.4" r="1.7" fill="#fff"/><rect x="6.4" y="10.8" width="3" height="7.6" fill="#fff"/><path d="M11.5 10.8h2.9v1.2c.5-.8 1.6-1.5 3-1.5 2.2 0 3.5 1.5 3.5 3.9v4h-3v-3.6c0-1.2-.5-1.9-1.5-1.9s-1.9.7-1.9 2v3.5h-3Z" fill="#fff"/></svg>',
    'Salesforce':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M7.4 9.2c.9-1.8 2.8-3 4.9-3 1.7 0 3.2.7 4.2 1.9.6-.3 1.3-.5 2-.5 2.6 0 4.7 2.1 4.7 4.7s-2.1 4.8-4.7 4.8H7.9C5.5 17.1 3.5 15.1 3.5 12.7c0-2.1 1.6-3.9 3.9-3.5Z" fill="#00A1E0"/></svg>',
    'Monday.com':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="3.4" y="6" width="4.6" height="12.4" rx="2.3" fill="#FF3D57"/><rect x="9.7" y="6" width="4.6" height="12.4" rx="2.3" fill="#FFCB00"/><rect x="16" y="6" width="4.6" height="12.4" rx="2.3" fill="#00D647"/></svg>',
    'Canva':'<svg viewBox="0 0 24 24" class="mcp-lg"><circle cx="12" cy="12" r="10" fill="#00C4CC"/><text x="12" y="16.4" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="12.5" fill="#fff">C</text></svg>',
    // Single-colour brand marks from Simple Icons (CC0), brand hex as fill.
    'Zoom':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#0B5CFF" aria-hidden="true"><path d="M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z"/></svg>',
    'Airtable':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#18BFFF" aria-hidden="true"><path d="M11.992 1.966c-.434 0-.87.086-1.28.257L1.779 5.917c-.503.208-.49.908.012 1.116l8.982 3.558a3.266 3.266 0 0 0 2.454 0l8.982-3.558c.503-.196.503-.908.012-1.116l-8.957-3.694a3.255 3.255 0 0 0-1.272-.257zM23.4 8.056a.589.589 0 0 0-.222.045l-10.012 3.877a.612.612 0 0 0-.38.564v8.896a.6.6 0 0 0 .821.552L23.62 18.1a.583.583 0 0 0 .38-.551V8.653a.6.6 0 0 0-.6-.596zM.676 8.095a.644.644 0 0 0-.48.19C.086 8.396 0 8.53 0 8.69v8.355c0 .442.515.737.908.54l6.27-3.006.307-.147 2.969-1.436c.466-.22.43-.908-.061-1.092L.883 8.138a.57.57 0 0 0-.207-.044z"/></svg>',
    'MYOB':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#7B14EF" aria-hidden="true"><path d="m11.276 9.347-1.254 3.346a366.37 366.37 0 0 1-1.325-3.346H7.275l2.038 5.132-.86 2.063h1.38l2.845-7.195ZM5.083 10.46c.551 0 .818.33.818 1.01v3.112h1.314v-3.259c0-1.241-.853-2.108-2.075-2.108-.588 0-1.127.206-1.516.58l-.016.015-.016-.015c-.39-.374-.926-.58-1.512-.58-1.225 0-2.08.867-2.08 2.108v3.26h1.314V11.47c0-.68.267-1.01.818-1.01.552 0 .819.33.819 1.01v3.112h1.314V11.47c0-.68.267-1.01.819-1.01zm18.2-.398c-.494-.547-1.191-.849-1.962-.849a2.56 2.56 0 0 0-1.521.497V7.458h-1.315v4.51c0 .721.258 1.396.725 1.9.512.553 1.215.846 2.035.846.819 0 1.52-.293 2.03-.845.467-.505.725-1.18.725-1.9a2.83 2.83 0 0 0-.717-1.908Zm-2.039 3.405c-.937 0-1.446-.772-1.446-1.499 0-.726.51-1.509 1.446-1.509.937 0 1.442.778 1.442 1.51 0 .73-.505 1.498-1.442 1.498m-5.965 1.248c1.788 0 2.753-1.418 2.753-2.753 0-1.334-.965-2.752-2.753-2.752-1.789 0-2.753 1.418-2.753 2.753 0 1.335.964 2.753 2.753 2.753zm.001-1.248c-.936 0-1.445-.773-1.445-1.5 0-.728.509-1.511 1.445-1.511s1.441.778 1.441 1.51c0 .733-.505 1.501-1.441 1.501"/></svg>',
    'Square':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#3E4348" aria-hidden="true"><path d="M4.01 0A4.01 4.01 0 000 4.01v15.98c0 2.21 1.8 4 4.01 4.01h15.98C22.2 24 24 22.2 24 19.99V4A4.01 4.01 0 0019.99 0H4zm1.62 4.36h12.74c.7 0 1.26.57 1.26 1.27v12.74c0 .7-.56 1.27-1.26 1.27H5.63c-.7 0-1.26-.57-1.26-1.27V5.63a1.27 1.27 0 011.26-1.27zm3.83 4.35a.73.73 0 00-.73.73v5.09c0 .4.32.72.72.72h5.1a.73.73 0 00.73-.72V9.44a.73.73 0 00-.73-.73h-5.1Z"/></svg>',
    'AfterShip':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#FF6B2B" aria-hidden="true"><path d="M22.549 9.604a10.462 10.462 0 0 0-3.388-6.838A10.632 10.632 0 0 0 12 0a10.64 10.64 0 0 0-7.16 2.764 10.465 10.465 0 0 0-3.428 7.74c0 2.371.81 4.672 2.298 6.529a10.617 10.617 0 0 0 5.895 3.698L12 24l2.395-3.27a10.593 10.593 0 0 0 5.895-3.697 10.442 10.442 0 0 0 2.26-7.43zm-11.306 6.28a.26.26 0 0 1-.034.125.254.254 0 0 1-.347.092l-3.906-2.237a1.005 1.005 0 0 1-.505-.865V8.624a.26.26 0 0 1 .033-.126.254.254 0 0 1 .347-.092l3.907 2.237c.152.089.281.214.368.366.09.151.135.324.135.5v4.372zM12 9.48c-.176 0-.35-.047-.503-.133L7.5 7.057a.241.241 0 0 1-.09-.092.249.249 0 0 1 .09-.342l3.997-2.289a1.025 1.025 0 0 1 1.007 0l3.996 2.29a.24.24 0 0 1 .09.092.247.247 0 0 1 0 .25.271.271 0 0 1-.09.092l-3.997 2.289A1.005 1.005 0 0 1 12 9.48ZM17.546 13a.996.996 0 0 1-.503.866l-3.908 2.237a.254.254 0 0 1-.38-.218V11.51c0-.175.047-.348.135-.501.089-.152.216-.28.368-.366l3.907-2.238a.254.254 0 0 1 .38.219z"/></svg>',
    'Mailchimp':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#FFE01B" aria-hidden="true"><path d="M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873zm3.286 3.273c.04-.002.06.05.028.074-.143.11-.299.26-.413.414a.04.04 0 0 0 .031.064c.659.004 1.587.235 2.192.574.041.023.012.103-.034.092-.915-.21-2.414-.369-3.97.01-1.39.34-2.45.863-3.224 1.426-.04.028-.086-.023-.055-.06.896-1.035 1.999-1.935 2.987-2.44.034-.018.07.019.052.052-.079.143-.23.447-.278.678-.007.035.032.063.062.042.615-.42 1.684-.868 2.622-.926zm3.023 3.205l.056.001a.896.896 0 0 1 .456.146c.534.355.61 1.216.638 1.845.015.36.059 1.229.074 1.478.034.571.184.651.487.751.17.057.33.098.563.164.706.198 1.125.4 1.39.658.157.162.23.333.253.497.083.608-.472 1.36-1.942 2.041-1.607.746-3.557.935-4.904.785l-.471-.053c-1.078-.145-1.693 1.247-1.046 2.201.417.615 1.552 1.015 2.688 1.015 2.604 0 4.605-1.111 5.35-2.072a.987.987 0 0 0 .06-.085c.036-.055.006-.085-.04-.054-.608.416-3.31 2.069-6.2 1.571 0 0-.351-.057-.672-.182-.255-.1-.788-.344-.853-.891 2.333.72 3.801.039 3.801.039a.072.072 0 0 0 .042-.072.067.067 0 0 0-.074-.06s-1.911.283-3.718-.378c.197-.64.72-.408 1.51-.345a11.045 11.045 0 0 0 3.647-.394c.818-.234 1.892-.697 2.727-1.356.281.618.38 1.299.38 1.299s.219-.04.4.073c.173.106.299.326.213.895-.176 1.063-.628 1.926-1.387 2.72a5.714 5.714 0 0 1-1.666 1.244c-.34.18-.704.334-1.087.46-2.863.935-5.794-.093-6.739-2.3a3.545 3.545 0 0 1-.189-.522c-.403-1.455-.06-3.2 1.008-4.299.065-.07.132-.153.132-.256 0-.087-.055-.179-.102-.243-.374-.543-1.669-1.466-1.409-3.254.187-1.284 1.31-2.189 2.357-2.135.089.004.177.01.266.015.453.027.85.085 1.223.1.625.028 1.187-.063 1.853-.618.225-.187.405-.35.71-.401.028-.005.092-.028.215-.028zm.022 2.18a.42.42 0 0 0-.06.005c-.335.054-.347.468-.228 1.04.068.32.187.595.32.765.175-.02.343-.022.498 0 .089-.205.104-.557.024-.942-.112-.535-.261-.872-.554-.868zm-3.66 1.546a1.724 1.724 0 0 0-1.016.326c-.16.117-.311.28-.29.378.008.032.031.056.088.063.131.015.592-.217 1.122-.25.374-.023.684.094.923.2.239.104.386.173.443.113.037-.038.026-.11-.031-.204-.118-.192-.36-.387-.618-.497a1.601 1.601 0 0 0-.621-.129zm4.082.81c-.171-.003-.313.186-.317.42-.004.236.131.43.303.432.172.003.314-.185.318-.42.004-.236-.132-.429-.304-.432zm-3.58.172c-.05 0-.102.002-.155.008-.311.05-.483.152-.593.247-.094.082-.152.173-.152.237a.075.075 0 0 0 .075.076c.07 0 .228-.063.228-.063a1.98 1.98 0 0 1 1.001-.104c.157.018.23.027.265-.026.01-.016.022-.049-.01-.1-.063-.103-.311-.269-.66-.275zm2.26.4c-.127 0-.235.051-.283.148-.075.154.035.363.246.466.21.104.443.063.52-.09.075-.155-.035-.364-.246-.467a.542.542 0 0 0-.237-.058zm-11.635.024c.048 0 .098 0 .149.003.73.04 1.806.6 2.052 2.19.217 1.41-.128 2.843-1.449 3.069-.123.02-.248.029-.374.026-1.22-.033-2.539-1.132-2.67-2.435-.145-1.44.591-2.548 1.894-2.811.117-.024.252-.04.398-.042zm-.07.927a1.144 1.144 0 0 0-.847.364c-.38.418-.439.988-.366 1.19.027.073.07.094.1.098.064.008.16-.039.22-.2a1.2 1.2 0 0 0 .017-.052 1.58 1.58 0 0 1 .157-.37.689.689 0 0 1 .955-.199c.266.174.369.5.255.81-.058.161-.154.469-.133.721.043.511.357.717.64.738.274.01.466-.143.515-.256.029-.067.005-.107-.011-.125-.043-.053-.113-.037-.18-.021a.638.638 0 0 1-.16.022.347.347 0 0 1-.294-.148c-.078-.12-.073-.3.013-.504.011-.028.025-.058.04-.092.138-.308.368-.825.11-1.317-.195-.37-.513-.602-.894-.65a1.135 1.135 0 0 0-.138-.01z"/></svg>',
    'Trello':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#0052CC" aria-hidden="true"><path d="M21.147 0H2.853A2.86 2.86 0 000 2.853v18.294A2.86 2.86 0 002.853 24h18.294A2.86 2.86 0 0024 21.147V2.853A2.86 2.86 0 0021.147 0zM10.34 17.287a.953.953 0 01-.953.953h-4a.954.954 0 01-.954-.953V5.38a.953.953 0 01.954-.953h4a.954.954 0 01.953.953zm9.233-5.467a.944.944 0 01-.953.947h-4a.947.947 0 01-.953-.947V5.38a.953.953 0 01.953-.953h4a.954.954 0 01.953.953z"/></svg>',
    'Jira':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#0052CC" aria-hidden="true"><path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"/></svg>',
    'Calendly':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#006BFF" aria-hidden="true"><path d="M19.655 14.262c.281 0 .557.023.828.064 0 .005-.005.01-.005.014-.105.267-.234.534-.381.786l-1.219 2.106c-1.112 1.936-3.177 3.127-5.411 3.127h-2.432c-2.23 0-4.294-1.191-5.412-3.127l-1.218-2.106a6.251 6.251 0 0 1 0-6.252l1.218-2.106C6.736 4.832 8.8 3.641 11.035 3.641h2.432c2.23 0 4.294 1.191 5.411 3.127l1.219 2.106c.147.252.271.519.381.786 0 .004.005.009.005.014-.267.041-.543.064-.828.064-1.816 0-2.501-.607-3.291-1.306-.764-.676-1.711-1.517-3.44-1.517h-1.029c-1.251 0-2.387.455-3.2 1.278-.796.805-1.233 1.904-1.233 3.099v1.411c0 1.196.437 2.295 1.233 3.099.813.823 1.949 1.278 3.2 1.278h1.034c1.729 0 2.676-.841 3.439-1.517.791-.703 1.471-1.306 3.287-1.301Zm.005-3.237c.399 0 .794-.036 1.179-.11-.002-.004-.002-.01-.002-.014-.073-.414-.193-.823-.349-1.218.731-.12 1.407-.396 1.986-.819 0-.004-.005-.013-.005-.018-.331-1.085-.832-2.101-1.489-3.03-.649-.915-1.435-1.719-2.331-2.395-1.867-1.398-4.088-2.138-6.428-2.138-1.448 0-2.855.28-4.175.841-1.273.543-2.423 1.315-3.407 2.299S2.878 6.552 2.341 7.83c-.557 1.324-.842 2.726-.842 4.175 0 1.448.281 2.855.842 4.174.542 1.274 1.314 2.423 2.298 3.407s2.129 1.761 3.407 2.299c1.324.556 2.727.841 4.175.841 2.34 0 4.561-.74 6.428-2.137a10.815 10.815 0 0 0 2.331-2.396c.652-.929 1.158-1.949 1.489-3.03 0-.004.005-.014.005-.018-.579-.423-1.255-.699-1.986-.819.161-.395.276-.804.349-1.218.005-.009.005-.014.005-.023.869.166 1.692.506 2.404 1.035.685.505.552 1.075.446 1.416C22.184 20.437 17.619 24 12.221 24c-6.625 0-12-5.375-12-12s5.37-12 12-12c5.398 0 9.963 3.563 11.471 8.464.106.341.239.915-.446 1.421-.717.529-1.535.873-2.404 1.034.128.716.128 1.45 0 2.166-.387-.074-.782-.11-1.182-.11-4.184 0-3.968 2.823-6.736 2.823h-1.029c-1.899 0-3.15-1.357-3.15-3.095v-1.411c0-1.738 1.251-3.094 3.15-3.094h1.034c2.768 0 2.552 2.823 6.731 2.827Z"/></svg>',
    'Google Calendar':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#4285F4" aria-hidden="true"><path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z"/></svg>',
    'Dropbox':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#0061FF" aria-hidden="true"><path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/></svg>',
    'GitHub':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#181717" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    'Webflow':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#146EF5" aria-hidden="true"><path d="m24 4.515-7.658 14.97H9.149l3.205-6.204h-.144C9.566 16.713 5.621 18.973 0 19.485v-6.118s3.596-.213 5.71-2.435H0V4.515h6.417v5.278l.144-.001 2.622-5.277h4.854v5.244h.144l2.72-5.244H24Z"/></svg>',
    'WordPress':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#21759B" aria-hidden="true"><path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0"/></svg>',
    'Asana':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#F06A6A" aria-hidden="true"><path d="M18.78 12.653c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.34 5.22-5.22-2.336-5.22-5.22-5.22zm-13.56 0c-2.88 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.336-5.22-5.22-5.22zm12-6.525c0 2.883-2.337 5.22-5.22 5.22-2.882 0-5.22-2.337-5.22-5.22 0-2.88 2.338-5.22 5.22-5.22 2.883 0 5.22 2.34 5.22 5.22z"/></svg>',
    'Shopify':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#7AB55C" aria-hidden="true"><path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z"/></svg>',
    'Intercom':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#6AFDEF" aria-hidden="true"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.658 1.343 3 3 3h18c1.658 0 3-1.342 3-3V3c0-1.657-1.342-3-3-3zm-5.801 4.399c0-.44.36-.8.802-.8.44 0 .8.36.8.8v10.688c0 .442-.36.801-.8.801-.443 0-.802-.359-.802-.801V4.399zM11.2 3.994c0-.44.357-.799.8-.799s.8.359.8.799v11.602c0 .44-.357.8-.8.8s-.8-.36-.8-.8V3.994zm-4 .405c0-.44.359-.8.799-.8.443 0 .802.36.802.8v10.688c0 .442-.36.801-.802.801-.44 0-.799-.359-.799-.801V4.399zM3.199 6c0-.442.36-.8.802-.8.44 0 .799.358.799.8v7.195c0 .441-.359.8-.799.8-.443 0-.802-.36-.802-.8V6zM20.52 18.202c-.123.105-3.086 2.593-8.52 2.593-5.433 0-8.397-2.486-8.521-2.593-.335-.288-.375-.792-.086-1.128.285-.334.79-.375 1.125-.09.047.041 2.693 2.211 7.481 2.211 4.848 0 7.456-2.186 7.479-2.207.334-.289.839-.25 1.128.086.289.336.25.84-.086 1.128zm.281-5.007c0 .441-.36.8-.801.8-.441 0-.801-.36-.801-.8V6c0-.442.361-.8.801-.8.441 0 .801.357.801.8v7.195z"/></svg>',
    'Meta Ads':'<svg viewBox="0 0 24 24" class="mcp-lg" fill="#0467DF" aria-hidden="true"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>'
  };
  function mcpIcon(name){
    const sym=MCP_ICONS[name];
    if(sym)return `<svg class="mcp-lg" aria-hidden="true"><use href="#${sym}"/></svg>`;
    if(MCP_SVGS[name])return MCP_SVGS[name];
    if(MCP_IMGS[name])return `<img class="mcp-lg mcp-img" src="/prototype/assets/tools/${MCP_IMGS[name]}?v=${BUILD}" alt="" aria-hidden="true">`;
    // Anything typed in by the prospect gets a neutral two-letter mark.
    const mono=MCP_MONO[name]||[name.replace(/[^A-Za-z0-9]/g,'').slice(0,2)||'?','#5b6b7a'];
    return `<span class="mcp-mono" style="background:${mono[1]}">${escapeHtml(mono[0])}</span>`;
  }
  function mcpChip(name,mine){return `<span class="mcp${mine?' is-mine':''}">${mcpIcon(name)}${escapeHtml(name)}${mine?'<i class="mcp-tick" aria-hidden="true">✓</i>':''}</span>`;}

  // ---------- "Which tools does your company use?" ----------
  // Asked on the first screen, next to the industry. Every tool has a category and every
  // catalog agent lists the categories it can genuinely use, so an agent's profile leads with
  // the prospect's OWN tools that fit the job ("Your tools") and only then lists its usual
  // connectors ("Other connections available"). Email, chat, docs and sheets fit every agent.
  // Tools the prospect types in themselves are shown to every agent — we can't categorise them.
  const TOOLS=[
    {n:'Gmail',c:'email'},{n:'Microsoft 365',c:'email'},{n:'Slack',c:'chat'},{n:'Microsoft Teams',c:'chat'},{n:'Zoom',c:'chat'},
    {n:'Google Drive',c:'docs'},{n:'Dropbox',c:'docs'},{n:'Notion',c:'docs'},{n:'DocuSign',c:'docs'},{n:'Google Sheets',c:'sheets'},{n:'Airtable',c:'sheets'},
    {n:'HubSpot',c:'crm'},{n:'Salesforce',c:'crm'},{n:'Pipedrive',c:'crm'},{n:'Zendesk',c:'support'},{n:'Intercom',c:'support'},{n:'Freshdesk',c:'support'},
    {n:'Xero',c:'accounting'},{n:'MYOB',c:'accounting'},{n:'QuickBooks',c:'accounting'},{n:'Stripe',c:'payments'},{n:'Square',c:'payments'},
    {n:'Shopify',c:'ecommerce'},{n:'WooCommerce',c:'ecommerce'},{n:'Loop Returns',c:'ecommerce'},{n:'ShipStation',c:'shipping'},{n:'AfterShip',c:'shipping'},{n:'Cin7',c:'inventory'},
    {n:'Google Ads',c:'ads'},{n:'Meta Ads',c:'ads'},{n:'Google Analytics',c:'analytics'},{n:'Klaviyo',c:'marketing'},{n:'Mailchimp',c:'marketing'},{n:'Canva',c:'design'},{n:'LinkedIn',c:'social'},
    {n:'GitHub',c:'dev'},{n:'Webflow',c:'cms'},{n:'WordPress',c:'cms'},{n:'Monday.com',c:'projects'},{n:'Asana',c:'projects'},{n:'Trello',c:'projects'},{n:'Jira',c:'projects'},
    {n:'Calendly',c:'calendar'},{n:'Google Calendar',c:'calendar'},{n:'Deputy',c:'people'},{n:'Xero Payroll',c:'people'},{n:'Cliniko',c:'bookings'}
  ];
  const TOOL_CAT=Object.fromEntries(TOOLS.map(t=>[t.n,t.c]));
  // Shown before "More tools" is pressed — the ones a small business most often has.
  const POPULAR_TOOLS=new Set(['Gmail','Microsoft 365','Slack','Microsoft Teams','Google Drive','Notion','Google Sheets','HubSpot','Xero','MYOB','Shopify','Zendesk','Stripe','Canva']);
  const UNIVERSAL_CATS=new Set(['email','chat','docs','sheets']);
  const AGENT_CATS={
    logistics:['ecommerce','shipping','inventory','bookings'],
    marketing:['ads','analytics','marketing','design','social','cms'],
    support:['support','crm','ecommerce','bookings','calendar'],
    returns:['ecommerce','payments','shipping','support'],
    sales:['crm','calendar','social','marketing'],
    inventory:['ecommerce','inventory','accounting','shipping'],
    invoices:['accounting','payments','ecommerce'],
    documents:['docs','projects','crm'],
    website:['cms','dev','analytics','design'],
    operations:['projects','calendar','people','bookings']
  };
  const toolCat=n=>TOOL_CAT[n]||'custom';
  const hasTool=n=>(state.tools||[]).some(x=>x.toLowerCase()===String(n).toLowerCase());
  function yourTools(cats){const c=new Set(cats||[]);return (state.tools||[]).filter(n=>{const k=toolCat(n);return k==='custom'||UNIVERSAL_CATS.has(k)||c.has(k);});}
  const andList=a=>a.length<2?a.join(''):`${a.slice(0,-1).join(', ')} and ${a[a.length-1]}`;
  function toolsBlurb(){const t=state.tools||[];if(!t.length)return 'the tools you already use';if(t.length<=3)return escapeHtml(andList(t));return `${escapeHtml(t.slice(0,3).join(', '))} and ${t.length-3} more`;}
  function mcpSection(who,mcps,cats){
    const yours=yourTools(cats);
    const low=new Set(yours.map(n=>n.toLowerCase()));
    const others=mcps.filter(m=>!low.has(m.toLowerCase()));
    if(!yours.length)return `<h3>Available MCP connections</h3><p>These secure connectors let ${who} work with your existing systems while respecting approvals and permissions.</p><div class="mcp-list">${mcps.map(m=>mcpChip(m)).join('')}</div>`;
    return `<h3>Available MCP connections</h3><p class="tailored-note"><span class="tailored-pill">Your tools</span>${who} plugs straight into what ${escapeHtml(co())} already uses, with approvals and permissions respected.</p><div class="mcp-list">${yours.map(n=>mcpChip(n,true)).join('')}</div>${others.length?`<h4 class="mcp-sub">Other connections available</h4><div class="mcp-list">${others.map(m=>mcpChip(m)).join('')}</div>`:''}`;
  }
  // One dropdown instead of a wall of chips: a selector with search + logos, chosen tools
  // shown as small removable chips underneath. Typing a tool we don't list and pressing
  // Enter adds it as a custom one.
  function toolPicker(){
    const tools=state.tools||[];
    const custom=tools.filter(n=>!TOOL_CAT[n]);
    const opt=n=>`<li class="intro-option tool-option${hasTool(n)?' is-on':''}" role="option" tabindex="-1" aria-selected="${hasTool(n)}" data-tool="${escapeHtml(n)}">${mcpIcon(n)}<span>${escapeHtml(n)}</span></li>`;
    return `<span class="intro-label" id="tool-label">Which tools does your company use? <span class="intro-optional">(optional)</span></span><div class="intro-select-wrap tool-wrap" id="tool-pick"><button type="button" class="name-field intro-select${tools.length?'':' is-empty'}" id="tool-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="tool-label tool-btn">${tools.length?`${tools.length} tool${tools.length===1?'':'s'} selected`:'Choose your tools…'}</button><div class="intro-menu tool-menu" id="tool-menu" hidden><input class="tool-search" id="tool-search" maxlength="30" autocomplete="off" placeholder="Search, or type another and press Enter" aria-label="Search tools"><ul class="tool-list" role="listbox" aria-labelledby="tool-label" aria-multiselectable="true">${TOOLS.map(t=>opt(t.n)).join('')}${custom.map(opt).join('')}</ul></div></div><div class="tool-chosen" id="tool-chosen">${toolChips()}</div>`;
  }
  const toolChips=()=>(state.tools||[]).map(n=>`<span class="tool-chip is-on tool-sel">${mcpIcon(n)}<span>${escapeHtml(n)}</span><button type="button" data-tool-remove="${escapeHtml(n)}" aria-label="Remove ${escapeHtml(n)}">×</button></span>`).join('');
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function chip(){if(state.variant===null)return `<span class="private-pill">Private preview</span>`;const inner=state.selectedImage?`<img class="chip-img" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+state.variant+' chip');return `<span class="agent-chip">${inner}<span>${escapeHtml(state.name)}</span></span>`;}
  // Both intro screens (ask + team) count as step 1; create is 2, hatch is 3.
  const stepNo = () => Math.max(1,state.step);
  const layout = content => `<main class="shell"><section class="panel"><div class="progress" aria-label="Prototype progress"><span style="--progress:${Math.min(100,stepNo()/5*100)}%"></span></div><header class="topbar"><div class="brand"><img src="/agent-hatchers-logo.png" alt=""><span>Agent Hatchers</span></div><div class="topbar-right">${chip()}<span class="step-label">Step ${stepNo()} of 5</span></div></header>${content}</section></main>`;

  // ---------- Session capture: a small copy of each hatch goes to our store ----------
  // So the team can see what prospects actually did: business, team, chosen look, marketplace
  // portraits, created profiles and chat turns — all images as ~240–320px JPEG thumbnails, and
  // never the person's reference photo. Throttled to one upload per 12s; failures are silent.
  const sessionEndpoint = config.sessionEndpoint || portraitEndpoint.replace('prototype-portrait','prototype-session');
  // Review mode: the team opens a saved session from sessions.html as /prototype/?session=<sid>.
  // The stored snapshot (thumbnails and all) is poured into the dashboard read-only — nothing
  // is written back to the store or IndexedDB, and no image or chat call is made.
  const REVIEW_SID=(()=>{try{const v=new URLSearchParams(location.search).get('session')||'';return /^[a-z0-9-]{8,64}$/i.test(v)?v:'';}catch(e){return '';}})();
  const captureOn = !REVIEW_SID && config.saveSessions!==false && /^https?:/.test(sessionEndpoint);
  const cleanTools=t=>Array.isArray(t)?[...new Set(t.map(x=>String(x).replace(/\s+/g,' ').trim().slice(0,30)).filter(Boolean))].slice(0,40):[];
  const uid=()=>(crypto.randomUUID?crypto.randomUUID():'s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
  const thumbCache=new Map();
  async function thumb(src,max=320){if(!src||!/^data:/.test(src))return '';const k=max+':'+src.slice(0,80)+src.length;if(thumbCache.has(k))return thumbCache.get(k);const t=await downscale(src,max,true);thumbCache.set(k,t);return t;}
  let syncTimer=null,lastSync=0,syncing=false,syncDirty=false;
  function syncSession(){
    if(!captureOn||state.step<1||!state.sid)return;
    syncDirty=true;clearTimeout(syncTimer);
    syncTimer=setTimeout(pushSession,Math.max(0,12000-(Date.now()-lastSync)));
  }
  async function pushSession(){
    if(syncing){syncDirty=true;return;}
    syncing=true;syncDirty=false;lastSync=Date.now();
    try{const payload=await buildCapture();await fetch(sessionEndpoint,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)});}catch(e){}
    syncing=false;if(syncDirty)syncSession();
  }
  async function buildCapture(){
    const slots=await Promise.all(state.slots.map(s=>s&&s.image?thumb(s.image):Promise.resolve('')));
    const market={};for(const [k,v] of Object.entries(state.marketImages||{})){const t=await thumb(v,240);if(t)market[k]=t;}
    const profiles=await Promise.all(state.profiles.filter(p=>p.status==='complete'||p.status==='deleted').map(async p=>({name:p.name,desc:p.desc,status:p.status,img:await thumb(p.img,240),profile:p.profile||null})));
    let chatNames=[];try{chatNames=chatProfiles().all.map(x=>x.name);}catch(e){}
    return {sid:state.sid,v:1,build:BUILD,page:location.pathname,startedAt:state.startedAt,savedAt:Date.now(),ua:navigator.userAgent.slice(0,160),
      company:co(),name:state.name,biz:state.biz,industry:state.industry,tools:state.tools||[],look:state.look,step:state.step,tab:state.tab,done:state.done,editUses:state.editUses,
      brand:state.brand?{name:state.brand.name,url:state.brand.url,colors:state.brand.colors}:null,hadPhoto:!!state.refPhoto,
      team:state.team?{ids:state.team.ids,intro:state.team.intro,source:state.team.source,lines:state.team.lines}:null,
      variant:state.variant,selectedImage:await thumb(state.selectedImage),slots,market,profiles,chats:state.chatExtra||{},chatNames};
  }

  // ---------- Session persistence: come back to the hatch you left ----------
  // Everything a prospect has hatched (designs, marketplace portraits, new profiles) is kept
  // in IndexedDB per page, so a click-away or refresh resumes where they were. "Start over"
  // wipes it. Images are data URIs, which is why this is IndexedDB and not localStorage.
  const SESSION_KEY=location.pathname;
  function idb(){return new Promise((ok,bad)=>{if(!window.indexedDB)return bad(new Error('no idb'));const r=indexedDB.open('ah-prototype',1);r.onupgradeneeded=()=>r.result.createObjectStore('session');r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);});}
  async function loadSession(){try{const db=await idb();return await new Promise((ok,bad)=>{const q=db.transaction('session','readonly').objectStore('session').get(SESSION_KEY);q.onsuccess=()=>ok(q.result||null);q.onerror=()=>bad(q.error);});}catch(e){return null;}}
  async function writeSession(v){if(REVIEW_SID)return;try{const db=await idb();await new Promise((ok,bad)=>{const t=db.transaction('session','readwrite');if(v===null)t.objectStore('session').delete(SESSION_KEY);else t.objectStore('session').put(v,SESSION_KEY);t.oncomplete=ok;t.onerror=()=>bad(t.error);});}catch(e){}}
  let saveTimer=null;
  function saveSession(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      if(state.step<1){return;}
      if(!state.sid){state.sid=uid();state.startedAt=Date.now();}
      const snap={v:1,build:BUILD,sid:state.sid,startedAt:state.startedAt,savedAt:Date.now(),step:state.step,name:state.name,company:state.company,biz:state.biz,industry:state.industry,tools:state.tools||[],look:state.look,team:state.team,axes:state.axes||null,refPhoto:state.refPhoto,brand:state.brand,
        slots:state.slots.map(s=>s&&s.status==='ready'?{status:'ready',image:s.image||''}:null),variant:state.variant,selectedImage:state.selectedImage,done:state.done,
        marketImages:state.marketImages,marketRefKey:state.marketRefKey,added:state.added||[],tab:state.tab,chatActive:state.chatActive,chatExtra:state.chatExtra,editUses:state.editUses,
        profiles:state.profiles.filter(p=>p.status==='complete'||p.status==='deleted').map(p=>({id:p.id,name:p.name,desc:p.desc,img:p.img,step:p.step,status:p.status,profile:p.profile||null,dismissed:!!p.dismissed}))};
      writeSession(snap);
      syncSession();
    },400);
  }
  function clearSession(){clearTimeout(saveTimer);writeSession(null);}
  async function restoreSession(){
    const snap=await loadSession();
    if(!snap||snap.v!==1||!(snap.step>=1))return false;
    const fields=['sid','startedAt','name','company','biz','industry','tools','look','team','axes','refPhoto','brand','variant','selectedImage','done','marketImages','marketRefKey','added','tab','chatActive','chatExtra','editUses'];
    fields.forEach(k=>{if(snap[k]!==undefined)state[k]=snap[k];});
    state.tools=cleanTools(state.tools);
    state.slots=(snap.slots||[]).map(s=>s&&s.status==='ready'?{status:'ready',image:s.image||''}:null);
    state.profiles=(snap.profiles||[]).map(p=>({...p,cancelled:false}));
    cpSeq=state.profiles.reduce((m,p)=>Math.max(m,parseInt(String(p.id).replace('np',''),10)||0),0);
    const ready=state.slots.some(Boolean);
    // A hatch that was still running can't be resumed — back to the create screen with everything typed.
    state.step=snap.step===3&&!ready?2:(snap.step>=3&&!ready?2:snap.step);
    if(state.step===1)state.step=0;
    state.teamBusy=false;state.refBusy=false;state.refError='';
    state.marketStarted=false;
    // Images hatched before the one-robot fix (or anything that isn't square) would be copied
    // into every new portrait as the reference — drop them and let the prospect re-hatch.
    if(state.step>=3&&await staleImages(snap)){
      state.slots=[];state.variant=null;state.selectedImage='';state.marketImages={};state.done=false;state.tab='profiles';
      state.profiles=state.profiles.filter(p=>p.status!=='complete');state.step=2;state.rehatch=true;
    }
    return true;
  }
  async function staleImages(snap){
    if((snap.build||0)<44)return true;
    const src=state.selectedImage||((state.slots.find(x=>x&&x.image)||{}).image)||'';
    if(!src)return false;
    try{const im=await loadImg(src);const r=im.naturalWidth/im.naturalHeight;return !(r>0.85&&r<1.18);}catch(e){return false;}
  }
  async function reviewSession(){
    let key='',by='';try{key=localStorage.getItem('ah-sessions-key')||'';by=localStorage.getItem('ah-sessions-by')||'';}catch(e){}
    if(!key){key=(prompt('Sessions key (the one you use on the sessions page)')||'').trim();try{if(key)localStorage.setItem('ah-sessions-key',key);}catch(e){}}
    const bar=document.createElement('div');bar.className='review-bar';bar.innerHTML='<span>Loading the saved session…</span>';document.body.prepend(bar);
    const fail=msg=>{bar.classList.add('bad');bar.innerHTML=`<span>${escapeHtml(msg)}</span><a href="/prototype/sessions.html">Back to sessions</a>`;render();};
    if(!key)return fail('No sessions key — open the sessions page, enter the key, then come back.');
    let d;
    try{const r=await fetch(`${sessionEndpoint}?key=${encodeURIComponent(key)}&sid=${encodeURIComponent(REVIEW_SID)}&view=1&by=${encodeURIComponent(by)}`,{cache:'no-store'});if(!r.ok)throw new Error(r.status===401?'wrong sessions key':r.status===404?'it has been deleted':'HTTP '+r.status);d=await r.json();}
    catch(e){return fail('Could not load this session: '+e.message);}
    ['name','company','biz','industry','tools','look','team','brand','variant','selectedImage','editUses'].forEach(k=>{if(d[k]!==undefined&&d[k]!==null)state[k]=d[k];});
    state.tools=cleanTools(state.tools);
    state.sid=d.sid||REVIEW_SID;state.startedAt=Number(d.startedAt)||0;
    state.slots=(d.slots||[]).map(im=>im?{status:'ready',image:im}:null);
    state.marketImages=Object.assign({},d.market||{});state.marketStarted=true;   // never regenerate on the team's behalf
    state.profiles=(d.profiles||[]).map((q,i)=>({id:'np'+(i+1),name:q.name||'',desc:q.desc||'',img:q.img||'',step:CP_STEPS.length-1,status:q.status||'complete',profile:q.profile||null,cancelled:false,dismissed:true}));
    cpSeq=state.profiles.length;
    state.chatExtra=d.chats&&typeof d.chats==='object'?d.chats:{};state.chatActive=0;state.chatTyping={};
    state.tab=['profiles','chats','analytics','market'].includes(d.tab)?d.tab:'profiles';
    state.done=false;   // the dashboard is what the team wants to see, even if they went on to connect
    state.step=(d.step>=4||state.slots.some(Boolean))?4:Math.min(Number(d.step)||0,2);
    if(state.step===1)state.step=0;
    render();
    bar.innerHTML=`<span>Reviewing <b>${escapeHtml(d.company||'an unnamed company')}</b>${d.name?` · ${escapeHtml(d.name)}`:''} — read-only: nothing here is saved, generated or counted</span><a href="/prototype/sessions.html">Back to sessions</a>`;
  }
  function welcomeBack(){
    const pop=document.createElement('div');pop.className='create-pop wb-pop';pop.innerHTML=state.rehatch?`${ci.check}<span>Welcome back${state.name?`, ${escapeHtml(state.name)} is still here`:''}. Your earlier designs were made before a fix, so hatch them again — one press.</span>`:`${ci.check}<span>Picked up where you left off${state.name?` with ${escapeHtml(state.name)}`:''}. <b>Start over</b> is in the footer if you want a fresh hatch.</span>`;
    document.body.appendChild(pop);setTimeout(()=>pop.classList.add('show'),10);
    setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>pop.remove(),300)},6000);
  }

  function render(){
    // Index 1 was the "team we'd hatch" screen — removed (Sep 2026, Noah). The research still
    // runs behind the create step so the dashboard team fits the business; step 1 is never shown.
    const screens = [welcome,welcome,nameScreen,hatchScreen,marketScreen,connectScreen];
    const inner = screens[state.step]();
    root.innerHTML = state.step>=4 ? inner : layout(inner);
    bind();
    if(typeof drawNotifs==='function')drawNotifs();
    if(state.step===3)applyCutouts(root);
    ensureTeamPalette();
    saveSession();
  }
  const ic = {
    profiles:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>',
    chats:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 3z" fill="none" stroke-width="2"/></svg>',
    analytics:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke-width="2"/></svg>',
    config:'<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke-width="2"/><circle cx="16" cy="7" r="2.4" fill="none" stroke-width="2"/><circle cx="8" cy="17" r="2.4" fill="none" stroke-width="2"/></svg>',
    market:'<svg viewBox="0 0 24 24"><path d="M4 9l1-4h14l1 4M4 9h16v10H4zM4 9a3 3 0 006 0 3 3 0 006 0 3 3 0 004 0" fill="none" stroke-width="2"/></svg>',
    merch:'<svg viewBox="0 0 24 24"><path d="M8 4l-5 3 2.5 4L8 10v10h8V10l2.5 1L21 7l-5-3a4 4 0 01-8 0z" fill="none" stroke-width="2"/></svg>',
    gallery:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg>',
    kanban:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1.4"/><rect x="10" y="4" width="5" height="11" rx="1.4"/><rect x="17" y="4" width="4" height="14" rx="1.4"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke-width="2"/><path d="M20 20l-4-4" stroke-width="2"/></svg>',
    plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-width="2.4"/></svg>',
    chev:'<svg viewBox="0 0 24 24"><path d="M8 10l4 4 4-4" fill="none" stroke-width="2"/></svg>'
  };
  // Welcome hatch: ONE continuous 5s animation, no layer swaps. The egg is two
  // clip-path halves of the same egg-closed.webp split along the crack seam, so the
  // lid that tumbles off IS the egg's top; Hatchy rises from behind the bottom shell
  // on the same clock and the last keyframe simply holds (fill-mode: both).
  const HX5_SEAM='81.61% 51.61%,76.45% 48.39%,72.26% 53.55%,67.74% 48.06%,63.87% 53.71%,60.48% 48.71%,54.52% 53.55%,49.68% 46.77%,43.87% 54.19%,39.52% 48.55%,36.45% 53.39%,32.26% 47.74%,27.74% 53.23%,23.55% 48.71%,18.39% 51.29%';
  const HX5_SEAM_UP='18.39% 50.69%,23.55% 48.11%,27.74% 52.63%,32.26% 47.14%,36.45% 52.79%,39.52% 47.95%,43.87% 53.59%,49.68% 46.17%,54.52% 52.95%,60.48% 48.11%,63.87% 53.11%,67.74% 47.46%,72.26% 52.95%,76.45% 47.79%,81.61% 51.01%';
  function hatch5(){return `<div class="hx5 run" data-hatch5 aria-hidden="true">
    <img class="hx5-robot" src="/hatchy-success.webp" alt="">
    <div class="hx5-egg">
      <img class="hx5-bottom" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 50.69%,${HX5_SEAM_UP},100% 51.01%,100% 100%,0 100%)">
      <img class="hx5-lid" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 0,100% 0,100% 51.61%,${HX5_SEAM},0 51.29%)">
      <svg class="hx5-cracks" viewBox="0 0 620 620"><path class="hx5-c1" d="M114,318 L146,302 L172,330 L200,296 L226,331 L245,301" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:198;stroke-dashoffset:198"/><path class="hx5-c2" d="M245,301 L272,336 L308,290 L338,332 L375,302" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:202;stroke-dashoffset:202"/><path class="hx5-c3" d="M375,302 L396,333 L420,298 L448,332 L474,300 L506,320" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:204;stroke-dashoffset:204"/></svg>
    </div>
  </div>`;}
  // Screen 1 — for people who have never used an AI agent: one question, one box.
  // Step 1 asks for an industry first (so it reads as "we cater to everyone"), then for the
  // specifics in the prospect's own words. `noun` is how the copy refers to the business when
  // they pick an industry but skip the write-in; `eg` steers the write-in placeholder.
  const OTHER='Something else';
  const INDUSTRIES=[
    {label:'Retail & e-commerce',noun:'retail business',eg:'e.g. online clothing shop, florist, gift store'},
    {label:'Hospitality',noun:'hospitality business',eg:'e.g. café, restaurant, boutique hotel'},
    {label:'Trades & construction',noun:'trades business',eg:'e.g. plumber, electrician, builder'},
    {label:'Health & wellness',noun:'health practice',eg:'e.g. dental clinic, physio, gym'},
    {label:'Financial services',noun:'financial services firm',eg:'e.g. mortgage broker, accountant, financial adviser'},
    {label:'Legal & professional services',noun:'professional services firm',eg:'e.g. law firm, consultancy, recruitment agency'},
    {label:'Real estate',noun:'real estate agency',eg:'e.g. sales agency, property management, strata'},
    {label:'Education & training',noun:'education provider',eg:'e.g. tutoring centre, RTO, childcare'},
    {label:'Technology & software',noun:'tech company',eg:'e.g. SaaS startup, IT support, app studio'},
    {label:'Manufacturing & logistics',noun:'manufacturing business',eg:'e.g. wholesaler, freight company, factory'},
    {label:'Marketing & creative',noun:'creative agency',eg:'e.g. design studio, ad agency, photographer'},
    {label:OTHER,noun:'',eg:'Tell us what your business does'}
  ];
  const industryOf=label=>INDUSTRIES.find(i=>i.label===label)||null;
  function welcome(){
    const ind=industryOf(state.industry);const other=ind&&ind.label===OTHER;
    // A custom listbox (not a native <select>): the open list renders in the site font too.
    const options=INDUSTRIES.map(i=>`<li class="intro-option${i.label===state.industry?' is-on':''}" role="option" tabindex="-1" aria-selected="${i.label===state.industry}" data-industry="${escapeHtml(i.label)}">${escapeHtml(i.label)}</li>`).join('');
    const fieldLabel=other?'What does your business do?':ind?'Anything more specific? <span class="intro-optional">(optional)</span>':'Or just tell us what you do';
    const placeholder=ind?ind.eg:'e.g. dental clinic, online clothing shop, plumber';
    return `<div class="stage welcome-grid intro"><div><span class="eyebrow">Agent Hatchers</span><h1 class="welcome-title intro-title">What can our agents do for you?</h1><p class="intro-lead">Tell us what your business does and we’ll work out which agents would actually help.</p><span class="intro-label" id="biz-industry-label">Your industry</span><div class="intro-select-wrap" id="biz-industry"><button type="button" class="name-field intro-select${ind?'':' is-empty'}" id="biz-industry-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="biz-industry-label biz-industry-btn">${escapeHtml(ind?ind.label:'Choose your industry…')}</button><ul class="intro-menu" id="biz-industry-menu" role="listbox" aria-labelledby="biz-industry-label" hidden>${options}</ul></div><label class="intro-label" for="biz-intro">${fieldLabel}</label><div class="mic-field intro-field"><input class="name-field" id="biz-intro" maxlength="60" autocomplete="off" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(state.biz)}" aria-label="What your business does"><button type="button" class="mic-btn" data-mic="biz-intro" aria-label="Dictate what your business does">${micSvg}</button></div>${toolPicker()}<div class="actions">${button('Next →','team')}</div></div><div class="welcome-art" aria-hidden="true">${hatch5()}</div></div>`;
  }
  // Screen 2 — the agents for that business, what each does, and how they hand work on.
  function nameScreen(){return `<div class="stage"><span class="eyebrow">Create a profile</span><h2>Create your agent</h2><p>Give it a name, tell us your type of company, and describe how it should look. You’ll pick specialist agents (sales, invoices, support…) from the marketplace next.</p><label class="field-label" for="agent-co">Company name</label><input class="name-field" id="agent-co" maxlength="40" autocomplete="off" placeholder="Company name — e.g. Tanssu" value="${escapeHtml(state.company||config.company||'')}" aria-label="Company name"><label class="field-label" for="agent-name">Agent name</label><input class="name-field" id="agent-name" maxlength="28" autocomplete="off" placeholder="Agent name — e.g. Pip, Scout or Atlas" value="${escapeHtml(state.name)}" aria-label="Agent name"><label class="field-label" for="agent-biz">Type of company</label><input class="name-field" id="agent-biz" maxlength="60" autocomplete="off" placeholder="e.g. dental clinic, online clothing shop, plumber" value="${escapeHtml(state.biz)}" aria-label="Type of company"><label class="field-label" for="agent-look">Image description</label><div class="mic-field"><textarea class="look-field" id="agent-look" placeholder="e.g. a friendly rounded robot holding a suitcase — or leave it to the photo / website below" aria-label="Image description">${escapeHtml(state.look)}</textarea><button type="button" class="mic-btn" data-mic="agent-look" aria-label="Dictate image description">${micSvg}</button></div>${referenceBlock()}<div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  function designScreen(){return `<div class="stage"><span class="eyebrow">Design the look</span><h2>Describe how ${escapeHtml(state.name)} should look</h2><p>Write a short, practical description and we’ll hatch three designs for you to choose from.</p><div class="mic-field"><textarea class="look-field" id="agent-look" maxlength="600" placeholder="e.g. a friendly rounded robot medic in blue and white, holding a checklist" aria-label="Describe the avatar">${escapeHtml(state.look)}</textarea><button type="button" class="mic-btn" data-mic="agent-look" aria-label="Dictate image description">${micSvg}</button></div>${referenceBlock()}<div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  // The same continuous split-egg hatch as the welcome screen, one per design.
  // Rendered stateful: a slot that already hatched shows its design (.done skips the
  // animation on re-renders instead of resetting to a closed egg), and each hatched
  // design is clickable to select right away — no separate "pick" step.
  // The crack is ONE continuous path (the three legs of the homepage hero seam joined up)
  // and, unlike the hero, it is not on a fixed clock: while a design is generating, JS
  // creeps it along like a loading bar (crackStart/crackTick), and the moment the image is
  // ready it rushes to the end (crackFinish) and the shell pops. `p` is 0..1 drawn so far.
  const CRACK_D='M114,318 L146,302 L172,330 L200,296 L226,331 L245,301 L272,336 L308,290 L338,332 L375,302 L396,333 L420,298 L448,332 L474,300 L506,320';
  const CRACK_LEN=604;   // path length (≈602) rounded up so p=0 hides every pixel of it
  const hx6Cracks=p=>`<svg class="hx6-cracks" viewBox="0 0 620 620"><path class="hx6-glow" d="${CRACK_D}" fill="none" stroke="#3f8fd6" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:16 2000;stroke-dashoffset:${(16-CRACK_LEN*p).toFixed(1)};opacity:${p>0.01?1:0}"/><path class="hx6-crack" d="${CRACK_D}" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:${CRACK_LEN};stroke-dashoffset:${(CRACK_LEN*(1-p)).toFixed(1)}"/></svg>`;
  // Crack progress per egg. Progress is an estimate — we don't know how long the model will
  // take — so it eases towards ~90% (never "done" on its own) in small uneven steps, the way a
  // real crack creeps, and only reaches the end when the image has actually arrived.
  const cracks=new Map();
  let crackRaf=0;
  function crackDraw(el,p){if(!el)return;const c=el.querySelector('.hx6-crack'),g=el.querySelector('.hx6-glow');if(c)c.style.strokeDashoffset=(CRACK_LEN*(1-p)).toFixed(1);if(g){g.style.strokeDashoffset=(16-CRACK_LEN*p).toFixed(1);g.style.opacity=p>0.01?1:0;}}
  function crackStart(key,getEl,reset){
    if(reset||!cracks.has(key))cracks.set(key,{t0:performance.now(),T:9000+Math.random()*5000,shown:0,next:0,missing:0,getEl});
    else cracks.get(key).getEl=getEl;
    crackTick();
  }
  const crackShown=key=>{const c=cracks.get(key);return c?c.shown:0;};
  function crackStop(key){cracks.delete(key);}
  function crackTick(){
    if(crackRaf)return;
    crackRaf=requestAnimationFrame(()=>{
      crackRaf=0;const now=performance.now();
      cracks.forEach((c,key)=>{
        const el=c.getEl();
        if(!el){c.missing=c.missing||now;if(now-c.missing>4000)cracks.delete(key);return;}   // screen left — tidy up
        c.missing=0;
        const target=0.9*(1-Math.exp(-(now-c.t0)/c.T));
        if(now>=c.next){c.shown=Math.min(target,c.shown+0.015+Math.random()*0.045);c.next=now+140+Math.random()*420;crackDraw(el,c.shown);}
      });
      if(cracks.size)crackTick();
    });
  }
  // Image is here: run the crack to the end (.rush slows the stroke transition so it reads as
  // one final split) and tell the caller how long to wait before popping the lid.
  const RUSH_MS=650, HATCH_MS=2800;   // .go plays the last 2.8s of the 5s hx6 timeline (see styles.css)
  function crackFinish(key,el){cracks.delete(key);if(el){el.classList.add('rush');crackDraw(el,1);}return RUSH_MS;}
  // ---------- Background remover: the hatched design pops out as a cut-out, not a white card ----------
  // Portraits are asked for on a plain studio backdrop, so a flood fill from the picture's edges
  // through background-coloured pixels (and, on a light backdrop, the neutral grey floor
  // shadow) finds the character. Edge pixels get a soft alpha and their backdrop tint removed
  // so there's no halo. Anything that isn't a plain backdrop — a busy scene, a picture the
  // fill would swallow whole — comes back untouched, so the original is always the fallback.
  const cutDone=new Map(),cutPending=new Map();
  function cutout(src){
    if(!src||!/^data:image\//.test(src))return Promise.resolve(src);
    if(cutDone.has(src))return Promise.resolve(cutDone.get(src));
    if(cutPending.has(src))return cutPending.get(src);
    const p=removeBackground(src).catch(()=>src).then(r=>{cutDone.set(src,r||src);cutPending.delete(src);return r||src;});
    cutPending.set(src,p);return p;
  }
  async function removeBackground(src){
    const im=await loadImg(src);const MAX=768;const k=Math.min(1,MAX/Math.max(im.naturalWidth,im.naturalHeight));
    const w=Math.max(1,Math.round(im.naturalWidth*k)),h=Math.max(1,Math.round(im.naturalHeight*k));
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,w,h);
    const id=ctx.getImageData(0,0,w,h),d=id.data,N=w*h;
    // backdrop colour = median of a two-pixel ring around the edge; a ring that isn't mostly
    // one colour means a real scene, which we leave alone
    const ring=[];const grab=(x,y)=>{const i=(y*w+x)*4;ring.push([d[i],d[i+1],d[i+2]]);};
    for(let x=0;x<w;x+=2){grab(x,0);grab(x,1);grab(x,h-1);grab(x,h-2);}for(let y=2;y<h-2;y+=2){grab(0,y);grab(1,y);grab(w-1,y);grab(w-2,y);}
    const med=ch=>{const a=ring.map(p=>p[ch]).sort((a,b)=>a-b);return a[a.length>>1];};
    const B=[med(0),med(1),med(2)];const dist=(r,g,b)=>Math.sqrt((r-B[0])**2+(g-B[1])**2+(b-B[2])**2);
    if(ring.filter(p=>dist(p[0],p[1],p[2])<40).length/ring.length<0.8)return src;
    const lightBg=(B[0]*.299+B[1]*.587+B[2]*.114)>200;
    // per-pixel "is backdrop" threshold: tight for anything with colour in it, loose for
    // neutral light greys on a light backdrop (that's the character's soft floor shadow)
    const limit=i=>{const r=d[i*4],g=d[i*4+1],b=d[i*4+2];const chroma=Math.max(r,g,b)-Math.min(r,g,b);return lightBg&&chroma<26?96:46;};
    const dd=new Float32Array(N);for(let i=0;i<N;i++)dd[i]=dist(d[i*4],d[i*4+1],d[i*4+2]);
    const gone=new Uint8Array(N);const stack=[];
    const seed=i=>{if(!gone[i]&&dd[i]<limit(i)){gone[i]=1;stack.push(i);}};
    for(let x=0;x<w;x++){seed(x);seed((h-1)*w+x);}for(let y=0;y<h;y++){seed(y*w);seed(y*w+w-1);}
    let removed=0;
    while(stack.length){const i=stack.pop();removed++;const x=i%w;if(x>0)seed(i-1);if(x<w-1)seed(i+1);if(i>=w)seed(i-w);if(i+w<N)seed(i+w);}
    if(removed/N>0.97||removed/N<0.05)return src;   // ate everything, or there was nothing to take
    // kept bounding box must still be a sensible character, not a sliver
    let minX=w,maxX=0,minY=h,maxY=0;for(let i=0;i<N;i++){if(gone[i])continue;const x=i%w,y=(i-x)/w;if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
    if(maxX-minX<w*0.15||maxY-minY<h*0.15)return src;
    for(let i=0;i<N;i++){
      if(gone[i]){d[i*4+3]=0;continue;}
      const x=i%w;const edge=(x>0&&gone[i-1])||(x<w-1&&gone[i+1])||(i>=w&&gone[i-w])||(i+w<N&&gone[i+w]);
      if(!edge)continue;
      // anti-aliased rim: how far from the backdrop it is says how much character is in it;
      // un-blend the backdrop tint so a dark robot doesn't wear a pale fringe
      const a=Math.min(1,Math.max(0.12,dd[i]/150));
      for(let ch=0;ch<3;ch++){const v=(d[i*4+ch]-B[ch]*(1-a))/a;d[i*4+ch]=Math.max(0,Math.min(255,Math.round(v)));}
      d[i*4+3]=Math.round(a*255);
    }
    ctx.putImageData(id,0,0);
    return c.toDataURL('image/png');
  }
  // Shared hatch arming: cut the backdrop off the image, load it into the egg, finish the crack,
  // pop the lid. `getScene` is re-queried so a re-render in between can't strand a closed egg.
  function armHatch(getScene,key,image,fallback,onHatched){
    cutout(image).then(cut=>{
      const scene=getScene();const pop=scene&&scene.querySelector('.hx6-pop');if(!pop)return;
      let armed=false;
      const go=()=>{if(armed)return;armed=true;const s=getScene();const wait=crackFinish(key,s);
        setTimeout(()=>{const sc=getScene();if(!sc)return;sc.classList.add('go');if(onHatched)setTimeout(onHatched,HATCH_MS+150);},wait);};
      const isCut=!!cut&&cut!==image;pop.classList.toggle('is-cut',isCut);
      pop.onload=go;
      pop.onerror=()=>{pop.onerror=null;pop.classList.remove('is-cut');pop.src=fallback;};   // never leave an egg stuck closed
      pop.src=cut||image||fallback;
      if(pop.complete&&pop.naturalWidth)go();
    });
  }
  // Eggs that are already hatched (re-render, restored or reviewed session) show the cut-out
  // too, swapped in once it's ready.
  function applyCutouts(scope){
    scope.querySelectorAll('.hx6.done .hx6-pop[data-orig]').forEach(pop=>{const orig=pop.dataset.orig;cutout(orig).then(cut=>{if(!pop.isConnected||cut===orig)return;pop.classList.add('is-cut');pop.src=cut;});});
  }
  const hx6Shell=(extra,p)=>`<div class="hx6 ${extra||''}"><img class="hx6-pop" alt=""><div class="hx6-wrap" aria-hidden="true"><img class="hx6-bottom" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 50.69%,${HX5_SEAM_UP},100% 51.01%,100% 100%,0 100%)"><img class="hx6-lid" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 0,100% 0,100% 51.61%,${HX5_SEAM},0 51.29%)">${hx6Cracks(p||0)}</div></div>`;
  function eggScene(i){
    const slot=state.slots[i];const ready=!!(slot&&slot.status==='ready');const img=ready?(slot.image||'/hatchy-pop.webp'):'';const sel=state.variant===i;
    const cut=img&&cutDone.get(img);const shown=cut&&cut!==img?cut:img;
    return `<div class="egg-cell ${ready?'is-ready':''} ${sel?'selected':''}" data-egg="${i}" role="button" tabindex="0" aria-pressed="${sel}"><div class="hx6 ${ready?'done':''}" data-i="${i}">
    <img class="hx6-pop ${shown!==img?'is-cut':''}" ${img?`src="${escapeHtml(shown)}" data-orig="${escapeHtml(img)}"`:''} alt="">
    <div class="hx6-wrap" aria-hidden="true">
      <img class="hx6-bottom" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 50.69%,${HX5_SEAM_UP},100% 51.01%,100% 100%,0 100%)">
      <img class="hx6-lid" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 0,100% 0,100% 51.61%,${HX5_SEAM},0 51.29%)">
      ${hx6Cracks(ready?1:crackShown('d'+i))}
    </div>
  </div><span class="hatch-number">Design ${i+1}</span><span class="egg-tick" aria-hidden="true">${ci.check}</span></div>`;}
  function hatchActionsBar(){
    const settled=state.slots.length&&state.slots.every(Boolean);
    const anyReady=state.slots.some(s=>s&&s.status==='ready');
    if(!anyReady) return `<p class="hatch-status">Hatching your designs… click your favourite as soon as it pops out.</p>`;
    // A picked design can be tweaked right here ("nearly there, but…") before it becomes the avatar.
    const picked=state.variant!==null&&state.slots[state.variant]&&state.slots[state.variant].status==='ready';
    return `${settled?button('Redesign','redesign',true):''}${picked?button('✎ Tweak this design','edit-look',true):''}${button('Use this avatar →','market')}`;
  }
  function hatchScreen(){return `<div class="stage hatch-zone"><span class="eyebrow">Hatching</span><h2>Hatching ${escapeHtml(state.name||'your agent')}…</h2><p>Three takes on your description. Click your favourite — it becomes ${escapeHtml(state.name||'your agent')}’s avatar.</p><div class="hatch-row" aria-live="polite">${[0,1,2].map(eggScene).join('')}</div><div class="hatch-actions">${hatchActionsBar()}</div></div>`;}
  function initials(str){return String(str||'AH').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
  const marketLoader='<div class="hatch-loader"><img class="loader-egg" src="/egg-closed.webp" alt=""><span class="loader-txt">Hatching…</span></div>';
  function willGenerate(agent){if(REVIEW_SID)return false;   // review mode shows what was stored, no egg loaders
    return (usePortraits&&config.marketPortraits!==false&&state.variant!==null)||!!(config.bakedMarket&&config.bakedMarket[agent.id]);}
  function agentCard(agent,running=false){const gen=state.marketImages[agent.id];const loading=!gen&&willGenerate(agent);const inner=gen?`<img src="${escapeHtml(gen)}" alt="${escapeHtml(agent.name)}">`:(loading?marketLoader:`<img src="${agent.portrait}" alt="${escapeHtml(agent.name)}" loading="lazy">`);return `<article class="p-card" data-agent="${agent.id}" data-search="${escapeHtml((agent.name+' '+agent.team).toLowerCase())}" tabindex="0"><div class="p-thumb thumb-${agent.id} ${gen?'is-generated':''} ${loading?'is-loading':''}" data-thumb="${agent.id}">${inner}</div><div class="p-meta"><div class="p-name">${agent.name} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(co())}</span>${teamTag(agent.team)}${running?'<span class="p-tag tag-run"><i></i>Running</span>':''}</div></div></article>`;}
  function hatchedCard(){const vis=state.selectedImage?`<img src="${escapeHtml(state.selectedImage)}" alt="${escapeHtml(state.name)}">`:`<div class="thumb-bot">${bot('v'+(state.variant||0))}</div>`;return `<article class="p-card is-yours"><div class="p-thumb thumb-new ${state.selectedImage?'is-generated':''}">${vis}</div><div class="p-meta"><div class="p-name">${escapeHtml(state.name||'Your agent')} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(co())}</span><span class="p-tag tag-new">Just hatched</span></div></div></article>`;}
  // Two of the recommended agents are already switched on for the prospect's company, so the
  // board shows what "running" looks like next to the freshly hatched one.
  const RUNNING=['documents','sales'];
  const runningAgents=()=>RUNNING.map(id=>catalog.find(a=>a.id===id)).filter(Boolean);
  function profilesBoard(){
    const running=runningAgents();
    const rec=topAgents().filter(a=>!RUNNING.includes(a.id));
    return `<div class="filter-bar">
        <div class="search-box">${ic.search}<input id="market-search" placeholder="Search profiles..." autocomplete="off"></div>
      </div>
      <div class="board" id="board">
        <section class="board-group g-active"><div class="group-head"><h3>Active</h3><span class="count">${1+running.length+liveProfiles().length}</span></div><div class="p-grid">${hatchedCard()}${liveProfiles().map(profileCard).join('')}${running.map(a=>agentCard(a,true)).join('')}</div></section>
        <section class="board-group g-rec"><div class="group-head"><h3>Recommended for ${escapeHtml(co())}</h3><span class="count">${rec.length}</span></div><div class="p-grid">${rec.map(a=>agentCard(a)).join('')}</div></section>
        <div class="board-empty" id="board-empty" hidden>No profiles match your search.</div>
      </div>`;
  }
  function agentAvatar(cls){return state.selectedImage?`<img class="${cls}" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+(state.variant||0)+' '+cls);}
  // The chat sidebar mirrors the Profiles board exactly: the hatched agent first, then
  // the six recommended agents (same names, same generated avatars). "Other profiles"
  // is workspace flavour using the stock Hatchy avatar art.
  function chatProfiles(){
    const you={name:state.name||'Your agent',img:state.selectedImage||'/hatchy-pop.webp'};
    const team=[...runningAgents(),...topAgents().filter(a=>!RUNNING.includes(a.id))].map(a=>({name:a.name,img:state.marketImages[a.id]||a.portrait}));
    const live=!REVIEW_SID&&usePortraits&&config.marketPortraits!==false&&state.variant!==null;
    const other=EXTRA_PROFILES.map(p=>{const gen=state.marketImages[p.id];return {id:p.id,name:p.name,img:gen||(live?'/egg-closed.webp':(state.selectedImage||p.portrait)),egg:!gen&&live};});
    const mine=state.profiles.filter(p=>p.status==='complete').map(p=>({name:p.name,img:p.img}));
    const your=[you,...mine,...team];
    return {your,other,all:[...your,...other]};
  }
  // The prospect's FIRST message in a chat gets a real answer (their sales free taste);
  // every later message meets the paywall.
  async function fetchChatReply(question,agentName,history,turn){
    if(REVIEW_SID)return 'This is a saved session in review — chat is switched off here.';
    const roster=catalog.map(a=>({name:a.name,summary:a.summary,mcps:a.mcps}));
    for(let attempt=0;attempt<2;attempt++){
      if(attempt) await sleep(700);
      try{
        const res=await fetch(chatEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,agent:agentName,company:co(),business:state.biz,roster,history:history||[],turn:turn||1})});
        const body=await res.json().catch(()=>({}));
        if(res.ok&&body&&body.reply)return String(body.reply);
        if(res.status===400)break;
      }catch(e){/* retry then fall back */}
    }
    return fallbackReply(question);
  }
  function fallbackReply(question){
    const text=question.toLowerCase();
    const scored=catalog.map(a=>({a,s:a.keywords.reduce((n,k)=>n+(text.includes(k)?1:0),0)})).sort((x,y)=>y.s-x.s);
    const picks=scored.filter(x=>x.s>0).slice(0,2).map(x=>x.a);
    const mates=picks.length?picks:catalog.slice(0,2);
    const names=mates.map(m=>m.name).join(' and ');
    const tools=[...new Set(mates.flatMap(m=>m.mcps))].slice(0,4).join(', ');
    return `Good question — here is how I would run it down. First I would pull the full context from your connected systems (${tools}) so we are not guessing, then send the customer a clear answer with the exact link or next step, and log the fix so nobody has to ask twice. For this one I would loop in ${names} — this is exactly their lane, and they would pick it up from me mid-thread. If I were fully connected to ${co()}'s stack, the answer would already be on its way back to your customer.`;
  }
  function chatsView(){
    const {your,other,all}=chatProfiles();
    const active=Math.min(state.chatActive??0,all.length-1);const activeName=all[active].name;
    const avOf=p=>`<img src="${escapeHtml(p.img)}" alt="" ${p.id?`data-xav="${p.id}"`:''} ${p.egg?'class="egg"':''}>`;const activeAv=avOf(all[active]);
    const extra=(state.chatExtra[active]||[]).concat(state.chatTyping[active]?[['typing','']]:[]);
    const item=(p,i)=>`<button class="pf-item ${i===active?'on':''}" data-chat="${i}"><span class="pf-av">${avOf(p)}<i class="pf-dot"></i></span><span class="pf-name">${escapeHtml(p.name)}</span></button>`;
    const renderMsg=([who,t])=>{
      if(who==='pay')return `<div class="msg them"><div class="bubble paywall"><span class="pay-ic">${ci.key}</span><span>${escapeHtml(t)}</span><button class="btn pay-btn" data-noop="1">Unlock ${escapeHtml(activeName)}</button></div></div>`;
      if(who==='typing')return `<div class="msg them"><span class="msg-ava">${activeAv}</span><div class="bubble typing"><i></i><i></i><i></i></div></div>`;
      if(who==='them'){
        const mentioned=catalog.filter(a=>t.includes(a.name));
        const chips=mentioned.length?`<div class="chat-recs">${mentioned.map(a=>`<button class="chat-rec" data-agent="${a.id}"><img src="${escapeHtml(state.marketImages[a.id]||a.portrait)}" alt="">${a.name}</button>`).join('')}</div>`:'';
        return `<div class="msg them"><span class="msg-ava">${activeAv}</span><div class="bubble-wrap"><div class="bubble">${escapeHtml(t).replace(/\n/g,'<br>')}</div>${chips}</div></div>`;
      }
      return `<div class="msg ${who}"><div class="bubble">${escapeHtml(t)}</div></div>`;
    };
    return `<div class="chats3">
      <aside class="pf-side">
        <div class="pf-side-h"><b>Profiles</b> <span class="pf-count">${all.length}</span><span class="pf-plus">${ic.plus}</span></div>
        <div class="pf-search">${ic.search}<input placeholder="Search profiles..."></div>
        <div class="pf-sec">Your profiles</div>${your.map((p,i)=>item(p,i)).join('')}
        <div class="pf-sec">Other profiles</div>${other.map((p,i)=>item(p,your.length+i)).join('')}
      </aside>
      <aside class="chat-hist">
        <div class="chat-hist-h"><b>Chat history</b></div>
        <div class="pf-search hist"><input placeholder="Search messages..."></div>
      </aside>
      <section class="chat-empty">
        ${extra.length?`<div class="chat-thread" id="chat-thread">${extra.map(renderMsg).join('')}</div>`:`<div class="chat-empty-mid"><span class="chat-empty-av">${activeAv}</span><div class="chat-empty-name">${escapeHtml(activeName)}</div></div>`}
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
    const slackLogo='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#lg-slack"/></svg>';   // the real marks from the homepage sprite
    const teamsLogo='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#lg-teams"/></svg>';
    const wsAv=state.selectedImage?`<img src="${escapeHtml(state.selectedImage)}">`:bot('v'+(state.variant||0));
    const workspaces=[[escapeHtml(co()),'T0BJX6REVC2']];
    const channels=[[escapeHtml(co()),'13 / 16 Channels Assigned']];
    return `<div class="cfg-page">
      <aside class="cfg-side">${side.map((n,i)=>`<div class="cfg-side-item ${i===0?'on':''}" data-noop="1"><span class="cfg-side-ic">${cfgIcons[n]}</span>${n}</div>`).join('')}</aside>
      <div class="cfg-main">
        <div class="cfg-head"><span class="cfg-head-ic">${ic.chats}</span><h2>Communications</h2></div>
        <div class="cfg-label">Chat platform</div>
        <div class="platform-row"><button class="platform sel" data-noop="1"><span class="pf-ic">${slackLogo}</span> Slack <span class="pf-ok">${ci.check}</span></button><button class="platform" data-noop="1"><span class="pf-ic">${teamsLogo}</span> Microsoft Teams <span class="pf-ok">${ci.check}</span></button></div>
        <div class="cfg-sub"><span><b>Workspaces</b> <span class="count">${workspaces.length}</span></span><button class="btn cfg-connect" data-noop="1">${ic.plus}<span>Connect Workspace</span></button></div>
        ${workspaces.map(([n,id])=>`<div class="ws-row"><span class="ws-av2">${wsAv}</span><div class="ws-row-main"><b>${n}</b><div class="ws-id">${id}</div></div><div class="ws-actions"><button data-noop="1" aria-label="Edit">✎</button><button data-noop="1" aria-label="Delete">🗑</button></div></div>`).join('')}
        <div class="cfg-sub"><span><b>Channels</b> <span class="count">16</span></span></div>
        <div class="chan-filters"><button class="filter-pill" data-noop="1">All channels ${ic.chev}</button><button class="filter-pill" data-noop="1">All assignments ${ic.chev}</button><div class="search-box">${ic.search}<input placeholder="Search channels or agents..."></div></div>
        ${channels.map(([n,c])=>`<div class="chan-row"><span class="ws-av2">${wsAv}</span><b>${n}</b><span class="chan-count">${c} ${ic.chev}</span></div>`).join('')}
      </div></div>`;
  }
  function marketplaceView(){
    const ranked=rankAgents().map(r=>r.agent);
    return `<div class="mkt-page">
      <div class="mkt-head"><h2><span class="mkt-head-ic">${ic.market}</span>Marketplace</h2><div class="mkt-head-r"><button class="filter-pill" data-noop="1">All categories ${ic.chev}</button><div class="search-box">${ic.search}<input placeholder="Search agents..."></div></div></div>
      <div class="mkt-grid">${ranked.map((a,i)=>{const img=state.marketImages[a.id];const installed=topAgents().some(t=>t.id===a.id)||RUNNING.includes(a.id);const inner=img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(a.name)}">`:(willGenerate(a)?marketLoader:`<img src="${a.portrait}" alt="${escapeHtml(a.name)}" loading="lazy">`);return `<article class="mkt-card${installed?' is-installed':''}" data-agent="${a.id}" data-search="${escapeHtml((a.name+' '+a.team).toLowerCase())}" tabindex="0"><div class="mkt-thumb thumb-${a.id}">${inner}${installed?`<span class="mkt-installed">${ci.check}<span>Installed</span></span>`:`<span class="mkt-free">Free to add</span>`}</div><div class="mkt-body"><h3>${a.name}</h3><p>${a.summary}</p><div class="mkt-tags">${teamTag(a.team)}<span class="mkt-skills">${a.outcomes.length} skills</span></div>${installed?'':`<button type="button" class="mkt-add" data-add="${a.id}"><b>+</b>Add to your team</button>`}</div></article>`;}).join('')}</div>
    </div>`;
  }

  // ── Merch tab — mirrors the real dashboard's Printful page ──
  const MERCH_PRODUCTS=[
    {id:'tee',name:'T-shirt',price:11.92,code:'3001',desc:'Classic unisex tee with the robot printed front and centre.'},
    {id:'jumper',name:'Jumper',price:19.17,code:'18500',desc:'Heavyweight hooded jumper with the robot printed front and centre.'},
    {id:'socks',name:'Socks',price:null,code:'Crew',desc:'Crew socks with an all-over robot pattern.'},
    {id:'hat',name:'Hat',price:14.94,code:'Snapback',desc:'Structured snapback with the robot embroidered on the front.'}
  ];
  const MERCH_COLORS=[['Aqua','#1D9FBF'],['Army','#5F5E44'],['Ash','#F2F1EC'],['Asphalt','#54514E'],['Athletic Heather','#CBCBCB'],['Autumn','#C85313'],['Baby Blue','#CDE0F2'],['Berry','#C4265E'],['Black','#101010'],['Black Heather','#1E1C1C'],['Brown','#4E3629'],['Burnt Orange','#D9773B'],['Cardinal','#9A1B2F'],['Charity Pink','#F67599'],['Charcoal','#3C3B3D'],['Dark Grey','#575959'],['Forest','#1C4230'],['Gold','#F2A93B'],['Ocean Blue','#1D9FBF'],['Toast','#B4653A'],['Clay','#9A5B44'],['Lavender Blue','#C4CFF0'],['Terracotta','#A85341'],['True Royal','#3E5EBF'],['Steel Blue','#4C6E8B'],['Cream','#EDE4D3'],['Evergreen','#1E4E36'],['Kelly','#2E8B57'],['Leaf','#5C9346'],['Mint','#DFF5EC'],['Teal','#12A29B'],['Mauve','#C77E8F'],['Navy','#1F2A44'],['Sage','#C9E5C5'],['Ivory','#F5EEDF'],['Deep Heather','#3F4149'],['Olive','#5B5B33'],['Coral','#F26D5B'],['Dusty Pink','#E1A9B8'],['Seafoam','#BFE3D5'],['Ice Blue','#D4EEF2'],['Pink','#F3B8CF'],['Spring Green','#A9D9A2'],['Red','#C8102E'],['Scarlet','#E23A3A'],['Slate','#5E7079'],['Lilac','#B78BD1'],['Indigo','#5A6BB0'],['Yellow','#F3C13A'],['Kelly Green','#28A05C'],['Soft Pink','#F2C6D8'],['Maroon','#6E1F32'],['Rose','#D4707E'],['Moss','#7C8449'],['Light Green','#C4EDB2'],['Butter','#F6E27F'],['Midnight','#232A5C'],['Sky','#BEE3F2'],['Olive Drab','#6B7031'],['Tangerine','#EE7B3C'],['Cocoa','#7A5643'],['Blush','#F6D7DC'],['True Red','#D31F2C'],['Sea Green','#7FBFA0'],['Stone','#D6D2C4'],['Turquoise','#37C2C8'],['Plum','#3B2A50'],['Amber','#E0932F'],['Royal','#2450B5'],['Aqua Blue','#59CBE8'],['Onyx','#232323'],['Snow','#FBFBFB'],['White','#FFFFFF'],['Lemon','#F5E15C']];
  const MERCH_SIZES=['S','M','L','XL','2XL','3XL','4XL'];
  function merchRobots(){
    const you={id:'__you',name:state.name||'Your agent',img:state.selectedImage||'/hatchy-pop.webp'};
    return [you,...catalog.map(a=>({id:a.id,name:a.name.replace(' Agent','').toLowerCase()+'-agent',img:state.marketImages[a.id]||a.portrait}))];
  }
  function merchRobotImg(){const r=merchRobots().find(r=>r.id===state.merch.robot)||merchRobots()[0];return r.img;}
  function garmentSvg(kind,color){
    const g=escapeHtml(color);
    if(kind==='tee')return `<svg viewBox="0 0 100 100" class="g-svg"><path d="M20 18 L38 9 C42 16 58 16 62 9 L80 18 L93 33 L79 41 L79 90 L21 90 L21 41 L7 33 Z" style="fill:${g}" stroke="rgba(16,16,40,.18)" stroke-width="1.5"/></svg>`;
    if(kind==='jumper')return `<svg viewBox="0 0 100 100" class="g-svg"><path d="M22 16 L39 8 C43 14 57 14 61 8 L78 16 L92 58 L79 62 L79 90 L21 90 L21 62 L8 58 Z" style="fill:${g}" stroke="rgba(16,16,40,.18)" stroke-width="1.5"/><path d="M39 8 C43 14 57 14 61 8 L58 16 C54 20 46 20 42 16 Z" style="fill:rgba(16,16,40,.12)"/></svg>`;
    if(kind==='socks')return `<svg viewBox="0 0 100 100" class="g-svg"><path d="M36 8 h26 v42 c0 6 4 11 10 15 l7 5 c7 5 3 18 -8 18 h-15 c-11 0 -20 -9 -20 -20 Z" style="fill:${g}" stroke="rgba(16,16,40,.18)" stroke-width="1.5"/><path d="M36 8 h26 v8 h-26 Z" style="fill:rgba(16,16,40,.12)"/></svg>`;
    return `<svg viewBox="0 0 100 100" class="g-svg"><path d="M22 56 a28 28 0 0 1 56 0 v4 h-56 Z" style="fill:${g}" stroke="rgba(16,16,40,.18)" stroke-width="1.5"/><path d="M20 60 h72 a7 7 0 0 1 -5 11 h-67 Z" style="fill:${g}" stroke="rgba(16,16,40,.18)" stroke-width="1.5"/></svg>`;
  }
  function merchMock(kind,color,img,cls){
    const print=kind==='socks'
      ? `<img class="g-print sock1" src="${escapeHtml(img)}" alt=""><img class="g-print sock2" src="${escapeHtml(img)}" alt="">`
      : `<img class="g-print ${kind}" src="${escapeHtml(img)}" alt="">`;
    return `<div class="mock ${cls||''}">${garmentSvg(kind,color)}${print}</div>`;
  }
  function merchView(){
    const m=state.merch;const robots=merchRobots();const img=merchRobotImg();
    const prod=MERCH_PRODUCTS.find(p=>p.id===m.product)||MERCH_PRODUCTS[0];
    const colorHex=m.product==='hat'?'#16150F':MERCH_COLORS[m.color][1];
    const basket=m.basket;
    return `<div class="merch-page">
      <div class="merch-head"><h2><span class="merch-ic">${ic.merch}</span>Merch</h2><span class="merch-sub">Your robots, printed and shipped by Printful</span></div>
      <div class="merch-note">Browsing only — merch ordering unlocks with your live workspace.</div>
      <h3 class="merch-step">1 · Pick a robot</h3>
      <div class="mr-row">${robots.map(r=>`<button class="mr ${m.robot===r.id?'on':''}" data-merch-robot="${r.id}"><span class="mr-ava"><img src="${escapeHtml(r.img)}" alt=""></span><span class="mr-name">${escapeHtml(r.id==='__you'?'default':r.name)}</span></button>`).join('')}</div>
      <h3 class="merch-step">2 · Pick the merch</h3>
      <div class="merch-prods">${MERCH_PRODUCTS.map(p=>`<button class="merch-prod ${m.product===p.id?'on':''} ${p.price===null?'is-off':''}" data-merch-prod="${p.id}" ${p.price===null?'disabled':''}>${merchMock(p.id,p.id==='hat'?'#16150F':(p.id==='tee'?MERCH_COLORS[m.color][1]:'#F4F2EC'),img)}<b>${p.name}</b><span>${p.price===null?'unavailable':'from $'+p.price.toFixed(2)}</span></button>`).join('')}</div>
      <div class="merch-detail">
        ${merchMock(prod.id,colorHex,img,'big')}
        <div class="merch-conf">
          <b class="merch-code">${prod.code}</b>
          <p>${prod.desc}</p>
          ${prod.id!=='hat'?`<div class="merch-label">Colour · ${MERCH_COLORS[m.color][0]}</div>
          <div class="swatches">${MERCH_COLORS.map((c,i)=>`<button class="sw ${i===m.color?'on':''}" style="background:${c[1]}" data-merch-color="${i}" title="${c[0]}" aria-label="${c[0]}"></button>`).join('')}</div>`:''}
          <div class="merch-label">Size</div>
          <div class="sizes">${(prod.id==='hat'?['One size']:MERCH_SIZES).map(s=>`<button class="size ${m.size===s?'on':''}" data-merch-size="${s}">${s}</button>`).join('')}</div>
          <div class="merch-buy"><b>$${(prod.price||0).toFixed(2)}</b><span class="qty"><button data-merch-qty="-1">−</button><i>${m.qty}</i><button data-merch-qty="1">+</button></span><button class="basket-btn" data-merch-add="1">${ci.check} Add to basket</button></div>
        </div>
      </div>
      <h3 class="merch-step">3 · Basket</h3>
      ${basket.length?`<div class="basket">${basket.map((b,i)=>`<div class="basket-row">${merchMock(b.prod,b.color,b.img,'mini')}<span class="basket-desc"><b>${b.name}</b> · ${escapeHtml(b.colorName)} · ${b.size} ×${b.qty}</span><b>$${(b.price*b.qty).toFixed(2)}</b></div>`).join('')}<div class="basket-row total"><span>Total</span><b>$${basket.reduce((t,b)=>t+b.price*b.qty,0).toFixed(2)}</b></div>${m.note?`<div class="merch-pay">${ci.key} Please pay for your agent in order to order merch.</div>`:`<button class="btn btn-primary" data-merch-checkout="1">Checkout →</button>`}</div>`:`<p class="merch-empty">Nothing yet — add something above.</p>`}
    </div>`;
  }
  function marketScreen(){
    const tab=(k,label)=>`<button class="nav-tab ${state.tab===k?'active':''}" data-tab="${k}">${ic[k==='market'?'market':k]}<span>${label}</span></button>`;
    const body = state.tab==='chats'?chatsView():state.tab==='analytics'?analyticsView():state.tab==='config'?configView():state.tab==='market'?marketplaceView():state.tab==='merch'?merchView():profilesBoard();
    return `<div class="app${state.tab==='chats'?' is-chats':''}">
      <header class="app-nav">
        <div class="ws"><img class="ws-logo ${state.selectedImage?'ws-avatar-img':''}" src="${state.selectedImage||'/agent-hatchers-logo.png'}" alt=""><span>${escapeHtml(co())}</span><i class="ws-chev">${ic.chev}</i></div>
        <nav class="nav-tabs">${tab('profiles','Profiles')}${tab('chats','Chats')}${tab('analytics','Analytics')}${tab('market','Marketplace')}</nav>
        <div class="nav-right"><button class="create-btn" data-create="1">${ic.plus}<span>Create</span></button><span class="nav-avatar">${initials(co())}</span></div>
      </header>
      ${body}
      <div class="board-foot"><div class="foot-nav">${button('← Back','back',true)}${button('Start over','reset',true)}</div>${button('Connect your agent →','next')}</div>
    </div>`;
  }
  function connectScreen(){
    if(state.done){return `<main class="connect-shell"><section class="onboard-card"><div class="onboard-head"><span class="onboard-ic ok">${ci.check}</span><h2>Instance created</h2></div><p class="onboard-lead">Thanks, ${escapeHtml(co())}. Your dashboard is connected — we’ll be in touch to bring ${escapeHtml(state.name||'your agent')} online.</p><nav class="connect-nav center"><button class="btn cta-book" data-noop="1">Book a call</button>${button('Start over','reset',true)}</nav></section></main>`;}
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

  // ---------- Create ▾ → "Create a Profile" → Notifications tray → hatched reveal ----------
  // Mirrors the real dashboard's create flow. A new profile walks five steps in the
  // Notifications tray; the Illustrating step genuinely draws the hatched character doing the
  // described job (same proxy call as the marketplace), then the finished profile pops into
  // the middle of the screen with the purple swirl before settling into the Active group.
  const CP_STEPS=[['Planning','Planning the agent…'],['Drafting','Drafting agent…'],['Equipping','Wiring up its tools…'],['Configuring','Configuring…'],['Illustrating','Drawing its portrait…']];
  const cpi={
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v5M9.5 10.5h5"/></svg>',
    profile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18"/></svg>',
    skill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.4 2.4-2.6-2.6z"/></svg>',
    integration:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 01-10 0zM12 16v5"/></svg>',
    spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
    open:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 13v6H5V6h6"/></svg>',
    tick:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    tray:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/><circle cx="12" cy="12" r="3"/></svg>'
  };
  let cpSeq=0, notifOpen=true, notifHidden=false;
  // Every hatch, look-redesign and new profile costs real image generations, so a browser
  // gets three of each, ever — the counts live in localStorage so "Start over" (which wipes
  // the IndexedDB session) doesn't hand out three more.
  const FREE=3, FREE_PROFILES=FREE, PROFILES_KEY='ah-new-profiles', HATCH_KEY='ah-hatches', LOOK_KEY='ah-look-edits';
  // Team bypass: open /prototype/?unlimited=1 once and THIS browser keeps no free-use caps
  // (hatches, redesigns, new profiles, chat turns); ?unlimited=0 puts them back. Prospects
  // never see the flag, so the paywall still gates token spend for everyone else.
  const UNLIMITED_KEY='ah-unlimited';
  (()=>{try{const v=new URLSearchParams(location.search).get('unlimited');if(v==null)return;const on=!(v==='0'||v==='off');if(on)localStorage.setItem(UNLIMITED_KEY,'1');else localStorage.removeItem(UNLIMITED_KEY);
    setTimeout(()=>{document.querySelectorAll('.create-pop').forEach(p=>p.remove());const pop=document.createElement('div');pop.className='create-pop wb-pop';pop.innerHTML=`${ci.check}<span><b>Free-use limits ${on?'off':'back on'}</b> in this browser${on?' — hatch, redesign, add profiles and chat without caps.':'.'}</span>`;document.body.appendChild(pop);setTimeout(()=>pop.classList.add('show'),10);setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>pop.remove(),300)},5200);},900);
  }catch(e){}})();
  const unlimited=()=>{try{return localStorage.getItem(UNLIMITED_KEY)==='1';}catch(e){return false;}};
  const usage=k=>{if(unlimited())return 0;try{return parseInt(localStorage.getItem(k),10)||0;}catch(e){return 0;}};
  const bumpUsage=k=>{try{localStorage.setItem(k,String(usage(k)+1));}catch(e){}};
  const profilesUsed=()=>usage(PROFILES_KEY);
  const noteProfileUsed=()=>bumpUsage(PROFILES_KEY);
  const hatchesLeft=()=>Math.max(0,FREE-usage(HATCH_KEY));
  const looksUsed=()=>unlimited()?0:Math.max(state.editUses,usage(LOOK_KEY));
  const hatchPop=()=>payPop(`You’ve used your ${FREE} free hatches — please pay for your agent to keep designing.`);
  const liveProfiles=()=>state.profiles.filter(p=>p.status==='running'||p.status==='complete');
  const runningJobs=()=>state.profiles.filter(p=>p.status==='running');
  function payPop(msg){
    document.querySelectorAll('.create-pop').forEach(p=>p.remove());
    const pop=document.createElement('div');pop.className='create-pop';pop.innerHTML=`${ci.key}<span>${escapeHtml(msg)}</span>`;
    document.body.appendChild(pop);setTimeout(()=>pop.classList.add('show'),10);
    setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>pop.remove(),300)},4600);
  }
  function profileCard(p){
    if(p.status==='running'){
      return `<article class="p-card p-new is-busy" data-profile="${p.id}"><div class="p-thumb thumb-new is-loading"><div class="hatch-loader"><img class="loader-egg" src="/egg-closed.webp" alt=""><span class="loader-txt" data-profile-txt="${p.id}">${CP_STEPS[p.step][0]}…</span></div></div><div class="p-meta"><div class="p-name">${escapeHtml(p.name)} <i class="dot dot-wait"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(co())}</span><span class="p-tag tag-new">Hatching</span></div></div></article>`;
    }
    return `<article class="p-card p-new" data-profile="${p.id}" tabindex="0"><div class="p-thumb thumb-new is-generated"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}"></div><div class="p-meta"><div class="p-name">${escapeHtml(p.name)} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(co())}</span>${teamTag(p.profile?.team||'Operations')}<span class="p-tag tag-new">New</span></div></div></article>`;
  }
  function openCreateMenu(btn){
    const old=document.querySelector('.create-menu');if(old){old.remove();return;}
    const menu=document.createElement('div');menu.className='create-menu';menu.setAttribute('role','menu');
    menu.innerHTML=[['chat','New Chat'],['profile','New Profile'],['skill','New Skill'],['integration','New Integration']].map(([k,l])=>`<button type="button" role="menuitem" data-cm="${k}">${cpi[k]}<span>${l}</span></button>`).join('');
    btn.parentElement.appendChild(menu);
    const close=()=>{menu.remove();document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',esc);};
    const outside=e=>{if(!menu.contains(e.target)&&e.target!==btn&&!btn.contains(e.target))close();};
    const esc=e=>{if(e.key==='Escape')close();};
    document.addEventListener('mousedown',outside);document.addEventListener('keydown',esc);
    menu.querySelectorAll('[data-cm]').forEach(b=>b.onclick=()=>{const k=b.dataset.cm;close();
      if(k==='profile'){if(profilesUsed()>=FREE_PROFILES)payPop(`You’ve hatched your ${FREE_PROFILES} free profiles — please pay for your agent to add more.`);else openCreateProfile();}
      else if(k==='chat'){state.tab='chats';render();}
      else payPop(`Please pay for your agent to add a new ${k}.`);
    });
    menu.querySelector('button').focus();
  }
  function openCreateProfile(){
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
    const ava=state.selectedImage||'/hatchy-pop.webp';
    backdrop.innerHTML=`<section class="modal cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-title"><button class="close cp-close" aria-label="Close">×</button>
      <div class="cp-ava"><img src="${escapeHtml(ava)}" alt=""></div>
      <h2 id="cp-title">Create a Profile</h2>
      <label class="cp-label" for="cp-name">What should we call this agent?</label>
      <input class="name-field cp-field" id="cp-name" maxlength="40" autocomplete="off" placeholder="e.g. Research Assistant">
      <label class="cp-label" for="cp-desc">What is this agent going to do?</label>
      <div class="mic-field cp-mic"><textarea class="look-field cp-field cp-area" id="cp-desc" maxlength="500" placeholder="e.g. A research assistant that reads PDFs in my downloads folder and summarizes them into weekly briefings."></textarea><button type="button" class="mic-btn" data-mic="cp-desc" aria-label="Dictate what this agent will do">${micSvg}</button></div>
      <button type="button" class="btn btn-primary cp-submit" id="cp-submit" disabled>Create Profile</button></section>`;
    document.body.appendChild(backdrop);
    const close=()=>backdrop.remove();
    const name=backdrop.querySelector('#cp-name'),desc=backdrop.querySelector('#cp-desc'),submit=backdrop.querySelector('#cp-submit');
    const check=()=>{submit.disabled=!name.value.trim();};name.oninput=check;desc.oninput=check;
    backdrop.querySelector('.cp-close').onclick=close;backdrop.onclick=e=>{if(e.target===backdrop)close()};
    backdrop.querySelectorAll('[data-mic]').forEach(b=>b.onclick=()=>startDictation(b));
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});
    name.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(name.value.trim())submit.click();}};
    submit.onclick=()=>{const n=name.value.trim();if(!n){name.focus();return;}
      const p={id:'np'+(++cpSeq),name:n,desc:desc.value.trim(),img:'',step:0,status:'running',cancelled:false};
      state.profiles.push(p);noteProfileUsed();close();
      notifHidden=false;notifOpen=true;drawNotifs();
      if(state.step===4&&state.tab==='profiles')render();
      runProfileJob(p);
    };
    name.focus();
  }
  function notifCard(p){
    const x=`<button class="nc-x" data-nc-x="${p.id}" aria-label="Dismiss">${cpi.x}</button>`;
    if(p.status==='running'){
      const rail=CP_STEPS.map((s,i)=>{const st=i<p.step?'done':i===p.step?'now':'todo';return `${i?`<i class="nc-line ${i<=p.step?'on':''}"></i>`:''}<span class="nc-dot ${st}">${st==='done'?cpi.tick:''}</span>${st==='now'?`<b class="nc-lbl">${s[0]}</b>`:''}`;}).join('');
      const pct=Math.round(((p.step+.85)/CP_STEPS.length)*100);
      return `<div class="nc nc-run" data-nc="${p.id}"><span class="nc-ic"><i class="nc-spin"></i></span><div class="nc-body"><b class="nc-name">${escapeHtml(p.name)}</b><span class="nc-status">${CP_STEPS[p.step][1]}</span><div class="nc-bar"><i style="width:${pct}%"></i></div><div class="nc-rail">${rail}</div><button class="nc-cancel" data-nc-cancel="${p.id}">Cancel</button></div>${x}</div>`;
    }
    if(p.status==='complete')return `<div class="nc nc-done" data-nc="${p.id}"><span class="nc-ic nc-spark">${cpi.spark}</span><div class="nc-body"><b class="nc-name">${escapeHtml(p.name)}</b><span class="nc-ok">Complete</span><button class="nc-open" data-nc-open="${p.id}">${cpi.open}<span>Click to open</span></button></div>${x}</div>`;
    if(p.status==='deleted')return `<div class="nc nc-del" data-nc="${p.id}"><span class="nc-ic nc-okic">${cpi.tick}</span><div class="nc-body"><b class="nc-name">${escapeHtml(p.name)}</b><span class="nc-ok">Agent deleted</span></div>${x}</div>`;
    return '';
  }
  function drawNotifs(){
    let tray=document.getElementById('notif');
    const cards=state.profiles.filter(p=>!p.dismissed&&p.status!=='cancelled');
    if(notifHidden||!cards.length||state.step!==4){if(tray)tray.remove();return;}
    if(!tray){tray=document.createElement('aside');tray.id='notif';tray.className='notif';document.body.appendChild(tray);}
    const jobs=runningJobs();
    if(!notifOpen){
      const pct=jobs.length?Math.round(((jobs[0].step+.85)/CP_STEPS.length)*100):100;
      tray.className='notif is-mini';
      tray.innerHTML=`<div class="notif-mini"><button class="nm-x" data-nt="hide" aria-label="Hide notifications">${cpi.x}</button><b>${jobs.length?'Creating agent…':'Notifications'}</b><span class="nm-count">${cards.length}</span><button class="nm-tog" data-nt="open" aria-label="Open notifications">${cpi.chev}</button></div>${jobs.length?`<div class="nc-bar nm-bar"><i style="width:${pct}%"></i></div>`:''}`;
    }else{
      tray.className='notif';
      tray.innerHTML=`<div class="notif-head"><span class="notif-ic">${cpi.tray}</span><b>Notifications</b><button class="notif-clear" data-nt="clear">Clear All</button><button class="notif-tog" data-nt="mini" aria-label="Collapse notifications">${cpi.chev}</button></div><div class="notif-list">${cards.map(notifCard).join('')}</div>`;
    }
    tray.querySelectorAll('[data-nt]').forEach(b=>b.onclick=()=>{const k=b.dataset.nt;
      if(k==='mini')notifOpen=false;if(k==='open')notifOpen=true;if(k==='hide')notifHidden=true;
      if(k==='clear')state.profiles.forEach(p=>{if(p.status!=='running')p.dismissed=true;});
      drawNotifs();});
    tray.querySelectorAll('[data-nc-x]').forEach(b=>b.onclick=()=>{const p=state.profiles.find(q=>q.id===b.dataset.ncX);if(!p)return;if(p.status==='running')cancelProfile(p);else p.dismissed=true;drawNotifs();});
    tray.querySelectorAll('[data-nc-cancel]').forEach(b=>b.onclick=()=>{const p=state.profiles.find(q=>q.id===b.dataset.ncCancel);if(p)cancelProfile(p);drawNotifs();});
    tray.querySelectorAll('[data-nc-open]').forEach(b=>b.onclick=()=>{const p=state.profiles.find(q=>q.id===b.dataset.ncOpen);if(p)showProfile(p);});
  }
  function cancelProfile(p){p.cancelled=true;p.status='cancelled';if(state.step===4&&state.tab==='profiles')render();}
  // What a new profile can do, which connectors it needs and who it hands work to — a text
  // model reasons about the description (prototype-profile), else a keyword-built profile.
  const MCP_HINTS=[[/\b(e-?mail|inbox|gmail|newsletter)\b/,'Gmail'],[/\bslack\b/,'Slack'],[/\bteams?\b/,'Microsoft Teams'],[/\b(pdf|document|docs?|file|folder|drive|download|report)s?\b/,'Google Drive'],[/\b(sheet|spreadsheet|csv|excel|table|data)s?\b/,'Google Sheets'],[/\b(notion|notes?|wiki|knowledge)\b/,'Notion'],[/\b(invoice|xero|bookkeep|accounts?)\b/,'Xero'],[/\bquickbooks\b/,'QuickBooks'],[/\b(payment|stripe|subscription|billing)s?\b/,'Stripe'],[/\b(shopify|store|orders?|product|stock|inventory)\b/,'Shopify'],[/\b(crm|leads?|sales|pipeline|prospect)s?\b/,'HubSpot'],[/\b(support|ticket|complaint|customer service|helpdesk)s?\b/,'Zendesk'],[/\b(linkedin|social|post|followers?)\b/,'LinkedIn'],[/\b(ads?|advertis|campaign)/,'Google Ads'],[/\b(design|graphic|video|sing|song|music|creative|brand|logo|poster|art)/,'Canva'],[/\b(code|github|bug|deploy|repo)/,'GitHub'],[/\b(word|outlook|excel|powerpoint|office|microsoft)\b/,'Microsoft 365'],[/\b(dropbox)\b/,'Dropbox'],[/\b(analytics|traffic|website|seo)\b/,'Google Analytics'],[/\b(shipping|parcel|courier|delivery)\b/,'ShipStation']];
  function fallbackProfile(p){
    const text=`${p.name} ${p.desc}`.toLowerCase();
    const scored=catalog.map((a,index)=>{let s=0;a.keywords.forEach(k=>{if(text.includes(k))s+=4});a.summary.toLowerCase().split(/\W+/).forEach(w=>{if(w.length>4&&text.includes(w))s+=1});return {a,s,index};}).sort((x,y)=>y.s-x.s||x.index-y.index);
    let mates=scored.filter(x=>x.s>0).slice(0,3).map(x=>x.a);
    if(!mates.length)mates=topAgents().slice(0,3);
    const mcps=yourTools(mates.flatMap(a=>AGENT_CATS[a.id]||[])).slice(0,4);MCP_HINTS.forEach(([re,m])=>{if(re.test(text)&&!hasTool(m)&&!mcps.includes(m))mcps.push(m);});
    mates.forEach(a=>a.mcps.forEach(m=>{if(mcps.length<5&&!mcps.includes(m))mcps.push(m);}));
    if(!mcps.includes('Slack')&&!mcps.includes('Microsoft Teams'))mcps.splice(Math.min(mcps.length,4),0,'Slack');
    const chatTool=(state.tools||[]).find(n=>toolCat(n)==='chat')||'Slack or Teams';
    const c=co();const d=p.desc?p.desc.replace(/\.$/,''):'';const dl=d?d.charAt(0).toLowerCase()+d.slice(1):'';
    const ask=dl.replace(/^(i want (this|the|an?) agent to|i want it to|it should|should|please|to)\s+/,'');const first=ask?`Does what you asked for: ${ask}`:`Handles the job you give it for ${c}`;
    const outcomes=[first,`Runs it on a schedule or whenever someone at ${c} asks in ${chatTool}`,`Keeps ${c} posted with a short summary every time it finishes`,`Asks a person at ${c} before anything is sent, changed or paid`,`Hands work to ${mates.slice(0,2).map(a=>a.name).join(' and ')} when it crosses into their patch`];
    const summary=`${p.name} is a new agent for ${c}, built around what you asked for below.`;
    return {summary,outcomes,mcps:mcps.slice(0,6),mates:mates.map(a=>a.id),team:mates[0]?mates[0].team:'Operations',source:'fallback'};
  }
  async function researchProfile(p){
    const roster=catalog.map(a=>({id:a.id,name:a.name,summary:a.summary}));
    const connectors=[...new Set(catalog.flatMap(a=>a.mcps).concat(Object.keys(MCP_MONO)))];
    for(let attempt=0;attempt<2;attempt++){
      if(p.cancelled)return null;
      if(attempt)await sleep(600);
      try{
        const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),25000);
        const res=await fetch(profileEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:p.name,description:p.desc,company:co(),business:state.biz,roster,connectors,tools:state.tools||[]}),signal:ctl.signal});
        clearTimeout(t);
        const body=await res.json().catch(()=>({}));
        if(res.ok&&body&&Array.isArray(body.outcomes)&&body.outcomes.length>=4){
          const mates=(body.mates||[]).filter(id=>catalog.some(a=>a.id===id)).slice(0,3);
          if(!mates.length)mates.push(...fallbackProfile(p).mates);
          return {summary:String(body.summary||''),outcomes:body.outcomes.map(String).slice(0,5),mcps:(body.mcps||[]).map(String).slice(0,6),mates,team:String(body.team||'Operations'),source:'ai'};
        }
        if(res.status===400||res.status===404)break;
      }catch(e){/* retry then fall back */}
    }
    return null;
  }
  async function runProfileJob(p){
    const ref=state.selectedImage||((state.slots.find(s=>s&&s.image)||{}).image)||'';
    const live=usePortraits&&config.marketPortraits!==false&&state.variant!==null&&!!ref;
    // The portrait starts drawing straight away so the Illustrating step rarely has to wait.
    const job=p.desc?`Its job: ${p.desc.slice(0,140)}. Shown mid-task with fitting outfit and props.`:`It is ${p.name}, shown mid-task with fitting outfit and props.`;
    const art=live?fetchImage({brief:state.look,name:p.name,role:job,image:ref,company:co(),industry:industryLabel,variant:state.variant||0}):Promise.resolve(null);
    const research=researchProfile(p).catch(()=>null);
    for(let i=0;i<CP_STEPS.length;i++){
      if(p.cancelled)return;
      p.step=i;drawNotifs();
      const txt=root.querySelector(`[data-profile-txt="${p.id}"]`);if(txt)txt.textContent=CP_STEPS[i][0]+'…';
      if(i===3){const t0=Date.now();p.profile=(await research)||fallbackProfile(p);if(p.cancelled)return;const wait=Math.max(0,1900-(Date.now()-t0));if(wait)await sleep(wait);}
      else if(i<CP_STEPS.length-1)await sleep(1700+Math.random()*900);
      else{const t0=Date.now();const img=await art.catch(()=>null);if(p.cancelled)return;p.img=img||state.selectedImage||'/hatchy-pop.webp';const wait=Math.max(0,2600-(Date.now()-t0));if(wait)await sleep(wait);}
    }
    if(p.cancelled)return;
    p.status='complete';drawNotifs();saveSession();
    if(state.step===4&&state.tab==='profiles')render();
    revealProfile(p);
  }
  function revealProfile(p){
    document.querySelectorAll('.cp-reveal').forEach(r=>r.remove());
    const el=document.createElement('div');el.className='cp-reveal';
    el.innerHTML=`<div class="cp-swirl"></div><div class="cp-swirl cp-swirl2"></div><div class="cp-reveal-art"><img src="${escapeHtml(p.img)}" alt=""></div><div class="cp-reveal-card"><span class="cp-reveal-eyebrow">New profile</span><b>${escapeHtml(p.name)}</b><span>Hatched and ready to work</span></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    const go=()=>{el.classList.remove('show');el.classList.add('out');setTimeout(()=>el.remove(),500);};
    el.onclick=()=>{go();showProfile(p);};
    setTimeout(()=>{if(el.isConnected)go();},4200);
  }
  function showProfile(p){
    const pr=p.profile||fallbackProfile(p);
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
    const mates=pr.mates.map(mid=>{const m=catalog.find(a=>a.id===mid);if(!m)return '';const av=state.marketImages[m.id]||m.portrait;return `<button class="mate" data-mate="${m.id}"><span class="mate-ava"><img src="${escapeHtml(av)}" alt=""></span><span class="mate-meta"><b>${m.name}</b><i>${m.team}</i></span></button>`;}).join('');
    backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="np-title"><div class="modal-top"><div><span class="eyebrow">Agent profile</span><h2 id="np-title">${escapeHtml(p.name)}</h2></div><button class="close" aria-label="Close">×</button></div>
      <p>${escapeHtml(pr.summary)}</p>
      <div class="profile-cols"><div><h3>What this agent can do for ${escapeHtml(co())}</h3><p class="tailored-note"><span class="tailored-pill">Tailored</span>Worked out from your description${pr.source==='ai'?' by a model that read it':''}.</p><div class="checks">${pr.outcomes.map(o=>`<div class="check"><i>✓</i><span>${escapeHtml(o)}</span></div>`).join('')}</div></div><div class="profile-art"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}"></div></div>
      ${mcpSection(escapeHtml(p.name),pr.mcps,[...pr.mates.flatMap(id=>AGENT_CATS[id]||[]),...pr.mcps.map(toolCat)])}
      <h3>Works well with</h3><p>Agents that share hand-offs with ${escapeHtml(p.name)} — hatch them together as a team.</p><div class="mate-row">${mates}</div>
      <div class="actions np-actions"><button type="button" class="btn btn-primary" data-np="chat">Open chat →</button><button type="button" class="btn btn-secondary" data-np="delete">Delete profile</button></div></section>`;
    document.body.appendChild(backdrop);
    const close=()=>backdrop.remove();
    backdrop.querySelector('.close').onclick=close;backdrop.onclick=e=>{if(e.target===backdrop)close()};
    backdrop.querySelectorAll('[data-mate]').forEach(b=>b.onclick=()=>{close();showAgent(b.dataset.mate);});
    backdrop.querySelectorAll('[data-np]').forEach(b=>b.onclick=()=>{close();
      if(b.dataset.np==='chat'){state.tab='chats';state.chatActive=1+state.profiles.filter(q=>q.status==='complete').indexOf(p);render();}
      else{p.status='deleted';p.dismissed=false;notifHidden=false;drawNotifs();if(state.step===4)render();}
    });
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});
  }

  function openEditLook(){
    if(!state.selectedImage) return;
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
    let lastText='';let newImg=null;let busy=false;
    const close=()=>backdrop.remove();
    function draw(phase){
      const name=escapeHtml(state.name||'Your agent');
      const left=Math.max(0,FREE-looksUsed());
      const inner=phase==='form'
        ? `<div class="el-body"><div class="el-current"><img src="${escapeHtml(state.selectedImage)}" alt=""><span>Current look</span></div>
           <div class="el-form"><p>${state.step===3?'Nearly there? Say what to change and it’s re-hatched in place — or describe something new.':'Tweak the current design, or describe something new and hatch it fresh.'} <b class="el-left">${left} redesign${left===1?'':'s'} left</b></p>
           <textarea class="look-field" id="el-text" maxlength="400" placeholder="e.g. give it a red scarf and a captain’s hat — or describe a whole new look" ${left?'':'disabled'}>${escapeHtml(lastText)}</textarea>
           <div class="el-err" hidden>That didn’t hatch — please try again.</div>
           ${left?`<div class="actions"><button class="btn btn-secondary" data-el="edit">✎ Edit this photo</button><button class="btn btn-primary" data-el="new">✦ Hatch a new look</button></div>`
                 :`<div class="merch-pay">${ci.key} Please pay for your agent to keep redesigning its look.</div>`}</div></div>`
        : `<div class="el-hatch">${hx6Shell('el-egg',crackShown('el'))}<p class="el-note">Hatching the new look…</p>
           <div class="actions el-ready" style="display:none"><button class="btn btn-secondary" data-el="again">Try another</button><button class="btn btn-primary" data-el="apply">Use this look →</button></div></div>`;
      backdrop.innerHTML=`<section class="modal el-modal" role="dialog" aria-modal="true"><div class="modal-top"><div><span class="eyebrow">Your agent</span><h2>${name}’s look</h2></div><button class="close" aria-label="Close">×</button></div>${inner}</section>`;
      backdrop.querySelector('.close').onclick=close;backdrop.onclick=e=>{if(e.target===backdrop)close()};
      backdrop.querySelectorAll('[data-el]').forEach(b=>b.onclick=()=>act(b.dataset.el));
      const ta=backdrop.querySelector('#el-text');if(ta)ta.focus();
    }
    async function act(a){
      if(a==='again'){crackStop('el');draw('form');return;}
      if(a==='apply'){
        if(!newImg)return;
        state.selectedImage=newImg;
        if(state.variant!==null&&state.slots[state.variant])state.slots[state.variant].image=newImg;
        // the whole marketplace re-dresses around the new character — on the hatch page that
        // happens when "Use this avatar" is pressed; here the egg just shows the tweaked design
        state.marketImages={};state.marketStarted=false;state.marketRefKey='';
        close();render();if(state.step===4)generateMarket();return;
      }
      if(busy)return;
      if(looksUsed()>=FREE){draw('form');return;}
      const ta=backdrop.querySelector('#el-text');const text=(ta?ta.value.trim():'');
      if(text.length<4){if(ta){ta.focus();ta.setAttribute('aria-invalid','true');}return;}
      lastText=text;busy=true;newImg=null;
      draw('hatch');
      const elScene=()=>backdrop.querySelector('.el-egg');
      crackStart('el',elScene,true);
      const img=a==='edit'
        ? await fetchImage({brief:text,role:`Apply this change while keeping everything else about the character the same: ${text}.`,image:state.selectedImage,name:state.name,company:co(),industry:industryLabel,variant:0})
        : await fetchImage({brief:`${text}. Give it ${DESIGN_AXES.build[Math.floor(Math.random()*4)]}, ${DESIGN_AXES.face[Math.floor(Math.random()*4)]} and ${DESIGN_AXES.style[Math.floor(Math.random()*4)]}.`,name:state.name,role:'',company:co(),industry:industryLabel,variant:0});
      busy=false;
      if(!backdrop.isConnected)return;
      if(!img){crackStop('el');draw('form');const err=backdrop.querySelector('.el-err');if(err)err.hidden=false;return;}
      state.editUses++;bumpUsage(LOOK_KEY);   // a successful generation consumes one of the three redesigns
      newImg=img;
      armHatch(elScene,'el',img,state.selectedImage||'/hatchy-pop.webp',()=>{const r=backdrop.querySelector('.el-ready');const n=backdrop.querySelector('.el-note');if(r)r.style.display='flex';if(n)n.textContent='Hatched — keep it?';});
    }
    document.body.appendChild(backdrop);draw('form');
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});
  }
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
  // "What this agent can do for <company>" — the same five promises every agent makes, but
  // written around the prospect's company name and the kind of business they told us about.
  const TAILORED={
    documents:(c,b)=>[`Draft ${c}'s proposals, quotes and contracts from your own templates`,`Turn long ${b} paperwork into a one-page brief before you have to read it`,`Prepare client-ready reports in ${c}'s tone and branding`,`Route every draft to the right person at ${c} for sign-off before it goes out`,`Keep one tidy, searchable library of everything ${c} has sent`],
    sales:(c,b)=>[`Research every new lead that comes into ${c} before anyone picks up the phone`,`Score and prioritise ${b} opportunities so the hottest get called first`,`Draft outreach and follow-ups in ${c}'s voice, ready to send`,`Chase quotes ${c} hasn't heard back on, at the right moment`,`Keep ${c}'s CRM current without anyone retyping notes`],
    marketing:(c,b)=>[`Plan and draft ${c}'s posts, emails and campaigns around what a ${b} actually sells`,`Keep a steady publishing rhythm without ${c} writing every word`,`Report which channels bring ${c} real customers`,`Flag anything off-brand before it goes live`,`Reuse ${c}'s best-performing content instead of starting from scratch`],
    website:(c,b)=>[`Keep ${c}'s website current — hours, prices, services and team`,`Write and refresh the pages a ${b}'s customers actually search for`,`Spot broken links and stale content on ${c}'s site`,`Ask ${c} before anything goes live`,`Report what visitors do on ${c}'s site each week`],
    operations:(c,b)=>[`Keep every ${b} job at ${c} on schedule`,`Chase anything running late before the customer notices`,`Give ${c} a morning rundown of what's due today`,`Hand work to the right person or agent at ${c}`,`Keep ${c}'s checklists and handovers up to date`],
    inventory:(c,b)=>[`Watch ${c}'s stock levels and warn before you run out`,`Draft reorders for what a ${b} sells most`,`Reconcile deliveries against what ${c} ordered`,`Flag slow-moving stock tying up ${c}'s cash`,`Keep ${c}'s product list consistent everywhere it's sold`],
    logistics:(c,b)=>[`Track every ${c} shipment and warn about delays early`,`Book couriers and prepare labels for ${c}'s orders`,`Answer "where's my order?" for ${c}'s customers`,`Compare carrier costs for a ${b} like ${c}`,`Log every delivery so ${c} never chases a courier twice`],
    invoices:(c,b)=>[`Read ${c}'s incoming invoices and check them against what was ordered`,`Chase overdue ${b} invoices politely and on time`,`Get bills ready to pay with ${c}'s approval`,`Match payments to invoices so ${c}'s books stay tidy`,`Send ${c}'s accountant a clean month-end pack`],
    returns:(c,b)=>[`Handle ${c}'s return and refund requests end to end`,`Apply ${c}'s returns policy the same way every time`,`Spot the products a ${b} gets sent back most`,`Keep customers updated so nobody has to chase ${c}`,`Turn returns into a short weekly report for ${c}`],
    support:(c,b)=>[`Answer ${c}'s customers' common questions instantly, day or night`,`Know a ${b}'s hours, pricing and policies by heart`,`Escalate the tricky ones to a person at ${c} with full context`,`Follow up until each ${c} customer is actually sorted`,`Track what ${c}'s customers keep asking about`]
  };
  function tailoredOutcomes(agent){const fn=TAILORED[agent.id];return fn?fn(co(),state.biz||'your business'):agent.outcomes;}
  function showAgent(id){const agent=catalog.find(a=>a.id===id);if(!agent)return;const tailoredLead=state.team?.lines?.[agent.id]?.does||'';const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="agent-title"><div class="modal-top"><div><span class="eyebrow">Agent profile</span><h2 id="agent-title">${agent.name}</h2></div><button class="close" aria-label="Close agent profile">×</button></div><p>${agent.summary}</p><div class="profile-cols"><div><h3>What this agent can do for ${escapeHtml(co())}</h3><p class="tailored-note"><span class="tailored-pill">Tailored</span>Written for a ${escapeHtml(state.biz||'business')}${state.industry&&state.industry!==OTHER?` in ${escapeHtml(state.industry.toLowerCase())}`:''}.${tailoredLead?` <b>${escapeHtml(tailoredLead)}</b>`:''}</p><div class="checks">${tailoredOutcomes(agent).map(o=>`<div class="check"><i>✓</i><span>${escapeHtml(o)}</span></div>`).join('')}</div></div><div class="profile-art"><img src="${escapeHtml(state.marketImages[agent.id]||agent.portrait)}" alt="${agent.name}"></div></div>${mcpSection(escapeHtml(agent.name),agent.mcps,AGENT_CATS[agent.id])}<h3>Works well with</h3><p>Agents that share hand-offs with ${agent.name} — hatch them together as a team.</p><div class="mate-row">${(WORKS_WITH[agent.id]||[]).map(mid=>{const m=catalog.find(a=>a.id===mid);if(!m)return '';const av=state.marketImages[m.id]||m.portrait;return `<button class="mate" data-mate="${m.id}"><span class="mate-ava"><img src="${escapeHtml(av)}" alt=""></span><span class="mate-meta"><b>${m.name}</b><i>${m.team}</i></span></button>`;}).join('')}</div></section>`;document.body.appendChild(backdrop);const close=()=>backdrop.remove();backdrop.querySelector('.close').onclick=close;backdrop.querySelectorAll('[data-mate]').forEach(b=>b.onclick=()=>{close();showAgent(b.dataset.mate);});backdrop.onclick=e=>{if(e.target===backdrop)close()};document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});}
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

  // ---------- Reference: drop a photo, or paste a website for its brand colours ----------
  const hasReference = () => !!(state.refPhoto || state.brand);
  // What the portrait proxy gets alongside the brief. Images are already downscaled.
  function inspiration(){
    if(!hasReference()) return undefined;
    const b=state.brand;
    return {photo:state.refPhoto||undefined,brand:b?{name:b.name,colors:b.colors,logo:b.logo||undefined,hero:b.hero||undefined}:undefined};
  }
  const loadImg = src => new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=bad;im.src=src;});
  // Shrink to `max` px on the long edge so a phone photo doesn't ship 8 MB to the proxy.
  async function downscale(src,max=768,jpeg=false){
    try{
      const im=await loadImg(src);const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));
      const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      return jpeg?c.toDataURL('image/jpeg',.86):c.toDataURL('image/png');
    }catch(e){return src;}
  }
  // Dominant non-grey colours of an image (logo pixels beat CSS guesses for the true brand colour).
  async function dominantColors(src,n=3){
    try{
      const im=await loadImg(src);const c=document.createElement('canvas');const S=48;c.width=S;c.height=S;
      const ctx=c.getContext('2d');ctx.drawImage(im,0,0,S,S);const d=ctx.getImageData(0,0,S,S).data;
      const groups=[];
      for(let i=0;i<d.length;i+=4){
        const a=d[i+3];if(a<128)continue;const r=d[i],g=d[i+1],b=d[i+2];
        const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/510,sat=mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1))/255;
        if(l<.13||l>.9||sat<.22)continue;
        const g2=groups.find(x=>Math.hypot(x.r-r,x.g-g,x.b-b)<42);
        if(g2){g2.n++;}else groups.push({r,g,b,n:1});
      }
      return groups.sort((a,b)=>b.n-a.n).slice(0,n).map(x=>'#'+[x.r,x.g,x.b].map(v=>v.toString(16).padStart(2,'0')).join(''));
    }catch(e){return [];}
  }
  const mergeColors=(...lists)=>{const out=[];lists.flat().forEach(h=>{if(!h)return;const rgb=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));if(!out.some(o=>Math.hypot(o.rgb[0]-rgb[0],o.rgb[1]-rgb[1],o.rgb[2]-rgb[2])<42))out.push({h,rgb});});return out.slice(0,5).map(o=>o.h);};
  // ---- Team tag colours ----
  // Every team pill (Operations, Sales, Marketing…) gets its own tint, but all of them are
  // drawn from the hatched character's own colours (sampled from the chosen design, falling
  // back to the pasted website's brand colours) so the dashboard reads as one palette.
  // Up to three sampled colours act as anchors. Teams fall into five colour groups (Documents
  // sits with Finance, Logistics with Operations) and each group claims its own hue: the
  // main sampled colour first, the others snapping to the nearest of five slots spaced 72°
  // around the wheel, so five pale pill tints read as five plainly different colours rather
  // than a pink next to a pinker pink. No palette yet → the stock green pill.
  const TEAM_GROUPS=[['Operations','Logistics'],['Sales'],['Marketing'],['Support'],['Finance','Documents']];
  const TEAM_HUE_GAP=360/TEAM_GROUPS.length;                   // 72° — five slots fill the wheel
  let teamPalette={key:'',colors:[]};
  let teamHueCache={key:'',hues:null};
  function hexToHsl(h){const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;if(mx===mn)return [0,0,l];const d=mx-mn,s=l>.5?d/(2-mx-mn):d/(mx+mn);const hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;return [hh*60,s,l];}
  const hslCss=(h,s,l)=>`hsl(${Math.round(((h%360)+360)%360)} ${Math.round(s*100)}% ${Math.round(l*100)}%)`;
  const hueDist=(a,b)=>{const d=Math.abs(((a%360)+360)%360-((b%360)+360)%360);return Math.min(d,360-d);};
  // One [hue, saturation] per colour group — deterministic, so pills never shuffle. Five slots
  // 72° apart starting at the main anchor fill the wheel exactly; the other sampled colours
  // claim whichever free slot sits nearest their own hue, remaining groups take what's left.
  function assignTeamHues(anchors){
    const [h0,s0]=anchors[0];
    const slots=TEAM_GROUPS.map((_,i)=>({h:h0+i*TEAM_HUE_GAP,s:s0,claimed:false}));
    anchors.slice(1,3).forEach(([h,s])=>{
      const free=slots.slice(1).filter(x=>!x.claimed);if(!free.length)return;
      const best=free.reduce((a,b)=>hueDist(b.h,h)<hueDist(a.h,h)?b:a);best.s=s;best.claimed=true;
    });
    const claimed=slots.slice(1).filter(x=>x.claimed),rest=slots.slice(1).filter(x=>!x.claimed);
    return TEAM_GROUPS.map((_,i)=>{const sl=i===0?slots[0]:(claimed.shift()||rest.shift());return [sl.h,sl.s];});
  }
  function teamColors(team){
    const raw=teamPalette.colors.length?teamPalette.colors:((state.brand&&state.brand.colors)||[]);
    if(!raw.length)return null;
    const key=raw.join(',');
    if(teamHueCache.key!==key){
      // two shades of the same orange are one anchor, not two — keep anchors at least 25° apart
      const anchors=[];raw.map(hexToHsl).forEach(c=>{if(!anchors.some(o=>hueDist(o[0],c[0])<25))anchors.push(c);});
      teamHueCache={key,hues:assignTeamHues(anchors)};
    }
    const i=Math.max(0,TEAM_GROUPS.findIndex(g=>g.includes(team)));
    const [h,s]=teamHueCache.hues[i];
    const sat=Math.min(.72,Math.max(.42,s));
    return {fg:hslCss(h,sat,.34),bg:hslCss(h,Math.min(.9,sat+.15),.93)};
  }
  function teamTag(team){const c=teamColors(team);return `<span class="p-tag tag-team"${c?` style="color:${c.fg};background:${c.bg}"`:''}>${escapeHtml(team)}</span>`;}
  async function ensureTeamPalette(){
    const src=state.selectedImage||'';const key=src?src.length+':'+src.slice(-48):'';
    if(key===teamPalette.key)return;
    teamPalette={key,colors:[]};
    if(!src)return;
    const colors=await dominantColors(src,3);
    if(teamPalette.key!==key)return;                               // the look changed mid-sample
    teamPalette.colors=colors;
    if(colors.length&&state.step>=4)render();
  }
  async function attachPhoto(file){
    if(!file||!/^image\//.test(file.type)){state.refError='That file isn’t an image.';renderReference();return;}
    state.refError='';state.refBusy=true;renderReference();
    try{
      const raw=await new Promise((ok,bad)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=bad;r.readAsDataURL(file);});
      state.refPhoto=await downscale(raw,768,true);
    }catch(e){state.refError='We couldn’t read that image.';}
    state.refBusy=false;renderReference();
  }
  async function attachWebsite(url){
    url=String(url||'').trim();if(!url)return;
    state.refError='';state.refBusy=true;renderReference();
    try{
      const res=await fetch(brandEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
      const body=await res.json().catch(()=>({}));
      if(!res.ok||!body||!body.name)throw new Error((body&&body.error)||'lookup failed');
      const logo=body.logo?await downscale(body.logo,512):'';
      const hero=body.hero?await downscale(body.hero,768,true):'';
      const fromLogo=logo?await dominantColors(logo,3):[];
      state.brand={url:body.url||url,name:body.name,description:body.description||'',colors:mergeColors(fromLogo,body.colors||[]),logo,hero};
      const coIn=document.getElementById('agent-co');if(coIn&&!coIn.value.trim()){coIn.value=body.name;state.company=body.name;}
    }catch(e){state.refError=(e&&e.message&&!/failed to fetch|lookup failed/i.test(e.message))?e.message:'We couldn’t read that website — try another address, or drop a screenshot of it instead.';}
    state.refBusy=false;renderReference();
  }
  function referenceBlock(){
    const b=state.brand;
    const cards=[
      state.refPhoto?`<div class="ref-card"><img src="${escapeHtml(state.refPhoto)}" alt="Reference photo"><div class="ref-card-body"><strong>Photo</strong><span>The robot will take after this person</span></div><button type="button" class="ref-x" data-ref-remove="photo" aria-label="Remove photo">×</button></div>`:'',
      b?`<div class="ref-card">${b.logo?`<img src="${escapeHtml(b.logo)}" alt="" class="ref-logo">`:(b.hero?`<img src="${escapeHtml(b.hero)}" alt="">`:`<div class="ref-glyph">◇</div>`)}<div class="ref-card-body"><strong>${escapeHtml(b.name)}</strong><span class="ref-swatches">${b.colors.length?b.colors.map(c=>`<i style="background:${escapeHtml(c)}" title="${escapeHtml(c)}"></i>`).join(''):'No brand colours found — we’ll work from the logo'}</span></div><button type="button" class="ref-x" data-ref-remove="brand" aria-label="Remove website">×</button></div>`:''
    ].join('');
    return `<label class="field-label">Reference <span class="opt">optional</span></label><div class="ref-wrap" id="ref-wrap">
      <div class="ref-zone${state.refBusy?' is-busy':''}" id="ref-zone">
        <input type="file" id="ref-file" accept="image/*" hidden>
        <div class="ref-drop" tabindex="0" role="button" aria-label="Add a photo"><span class="ref-ico">📷</span><div><strong>Drop in a photo</strong> of someone, or <button type="button" class="ref-browse" data-ref-browse>browse</button> — pasting works too<br><span class="ref-sub">We’ll hatch a robot version of them.</span></div></div>
        <div class="ref-or">or</div>
        <div class="ref-url"><span class="ref-ico">🌐</span><input type="text" id="ref-url" placeholder="Paste a website — e.g. tanssu.com" autocomplete="off" aria-label="Website address" ${state.refBusy?'disabled':''}><button type="button" class="btn btn-secondary ref-go" data-ref-go ${state.refBusy?'disabled':''}>${state.refBusy?'Reading…':'Use its brand'}</button></div>
        <div class="ref-sub ref-url-sub">We’ll pull its brand colours and logo and match the look.</div>
      </div>
      ${state.refError?`<div class="ref-error">${escapeHtml(state.refError)}</div>`:''}
      ${cards?`<div class="ref-cards">${cards}</div>`:''}
    </div>`;
  }
  // Re-render just the reference block so typing in the other fields is never lost.
  function renderReference(){
    const wrap=document.getElementById('ref-wrap');if(!wrap)return;
    const urlIn=document.getElementById('ref-url');const typed=urlIn?urlIn.value:'';
    const tmp=document.createElement('div');tmp.innerHTML=referenceBlock();
    wrap.replaceWith(tmp.querySelector('#ref-wrap'));
    const again=document.getElementById('ref-url');if(again&&!state.brand)again.value=typed;
    bindReference();
  }
  let pasteBound=false;
  function bindReference(){
    const zone=document.getElementById('ref-zone');if(!zone)return;
    const file=document.getElementById('ref-file');const drop=zone.querySelector('.ref-drop');
    root.querySelectorAll('[data-ref-browse]').forEach(b=>b.onclick=e=>{e.stopPropagation();file.click();});
    file.onchange=()=>{if(file.files&&file.files[0])attachPhoto(file.files[0]);};
    drop.onclick=e=>{if(!e.target.closest('button'))file.click();};
    drop.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target===drop){e.preventDefault();file.click();}};
    zone.ondragover=e=>{e.preventDefault();zone.classList.add('is-over');};
    zone.ondragleave=()=>zone.classList.remove('is-over');
    zone.ondrop=e=>{e.preventDefault();zone.classList.remove('is-over');
      const f=e.dataTransfer.files&&e.dataTransfer.files[0];if(f){attachPhoto(f);return;}
      const t=(e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain')||'').trim();
      if(/^https?:\/\//i.test(t)){const u=document.getElementById('ref-url');if(u)u.value=t;attachWebsite(t);}};
    const go=()=>{const u=document.getElementById('ref-url');if(u&&u.value.trim())attachWebsite(u.value);};
    root.querySelectorAll('[data-ref-go]').forEach(b=>b.onclick=go);
    const urlIn=document.getElementById('ref-url');if(urlIn)urlIn.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go();}};
    root.querySelectorAll('[data-ref-remove]').forEach(b=>b.onclick=()=>{if(b.dataset.refRemove==='photo')state.refPhoto='';else state.brand=null;state.refError='';renderReference();});
    if(!pasteBound){pasteBound=true;document.addEventListener('paste',e=>{
      if(!document.getElementById('ref-zone'))return;
      const items=[...((e.clipboardData&&e.clipboardData.items)||[])];const img=items.find(i=>i.type&&i.type.startsWith('image/'));
      if(img){e.preventDefault();attachPhoto(img.getAsFile());}
    });}
  }
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  async function fetchImage(params){
    if(!usePortraits||REVIEW_SID) return null;
    // Up to 3 attempts: a single cold start / provider hiccup must not cost a prospect
    // their design (a failed hero portrait cascades into blob avatars + mismatched market).
    for(let attempt=0;attempt<3;attempt++){
      if(attempt) await sleep(900*attempt);
      try{
        const res = await fetch(portraitEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(params)});
        const body = await res.json().catch(()=>({}));
        if(res.ok && body && body.image) return String(body.image);
        if(res.status===400) break; // bad input won't improve with retries
      }catch(e){/* retry */}
    }
    return null;
  }
  async function fetchPortrait(variant){
    // Pinned avatars (config.bakedImages) win — lets a page show fixed designs or work
    // offline (e.g. a published artifact where external calls are blocked).
    const baked = Array.isArray(config.bakedImages) ? config.bakedImages[variant] : null;
    if(baked) return String(baked);
    const context = state.biz ? `an agent at a ${state.biz} company` : '';
    return fetchImage({brief:designBrief(variant),name:state.name,role:context,company:co(),industry:industryLabel,variant,inspiration:inspiration()});
  }
  // Re-skin every marketplace agent in the chosen look, each dressed for its own job.
  // Cheap fingerprint of a data URI — enough to tell one hatched character from another.
  function imageKey(src){src=String(src||'');let h=5381;for(let i=0;i<src.length;i+=7)h=((h*33)^src.charCodeAt(i))>>>0;return src.length+':'+h.toString(36);}
  async function generateMarket(){
    if(state.marketStarted) return;
    const baked = config.bakedMarket||{};
    const useLive = usePortraits && config.marketPortraits!==false && state.variant!==null;
    if(!useLive && !Object.keys(baked).length) return;   // nothing to hatch; cards keep mascot
    state.marketStarted = true;
    // Every catalog agent gets a portrait in the hatched character's style — recommended
    // six first, the rest right behind — so no card ever mixes in off-style stock art.
    const agents = rankAgents().map(r=>r.agent);
    const started = Date.now();
    // Always re-dress the SAME hatched character: use the chosen design as the edit
    // reference, falling back to any hatched design rather than generating strangers.
    const ref = state.selectedImage || ((state.slots.find(s=>s&&s.image)||{}).image) || '';
    // Portraits are re-dressings of ONE character. If the prospect went back and picked a
    // different design (or hatched again), anything made for the previous character is stale —
    // drop it so no card keeps an older robot.
    const refKey=imageKey(ref);
    if(state.marketRefKey&&state.marketRefKey!==refKey){state.marketImages={};}
    state.marketRefKey=refKey;
    await Promise.all(agents.map(async (agent,idx)=>{
      let img = state.marketImages[agent.id] || baked[agent.id];
      if(!img && useLive) img = await fetchImage({brief:state.look,name:agent.name,role:agent.scene,image:ref,company:co(),industry:industryLabel,variant:state.variant||0});
      const minMs=1100+idx*500;const wait=Math.max(0,minMs-(Date.now()-started));if(wait)await sleep(wait);  // let the loader show
      if(!img){const thumb=root.querySelector(`[data-thumb="${agent.id}"]`);if(thumb){thumb.innerHTML=`<img src="${agent.portrait}" alt="${escapeHtml(agent.name)}">`;thumb.classList.remove('is-loading');}return;}
      state.marketImages[agent.id]=img;saveSession();
      const thumb = root.querySelector(`[data-thumb="${agent.id}"]`);
      if(thumb){thumb.innerHTML=`<img src="${escapeHtml(img)}" alt="${escapeHtml(agent.name)}">`;thumb.classList.remove('is-loading');thumb.classList.add('is-generated');}
    }));
    // Then the six "Other profiles" for the Chats sidebar, same character, each in its own
    // costume. A failed call settles on the prospect's own avatar — never a stranger.
    await Promise.all(EXTRA_PROFILES.map(async p=>{
      let img=state.marketImages[p.id]||baked[p.id];
      if(!img&&useLive) img=await fetchImage({brief:state.look,name:p.name,role:p.scene,image:ref,company:co(),industry:industryLabel,variant:state.variant||0});
      state.marketImages[p.id]=img||state.selectedImage||p.portrait;saveSession();
      root.querySelectorAll(`[data-xav="${p.id}"]`).forEach(el=>{el.src=state.marketImages[p.id];el.classList.remove('egg');});
    }));
  }
  // Exact homepage hero hatch (index.html): egg rocks, crack walks the seam, lid
  // shatters into shards, the design pops out. Runs when each design's image is ready.
  async function generateAgents(){
    if(!hatchesLeft()){hatchPop();return;}
    bumpUsage(HATCH_KEY);   // three images per hatch; three hatches per browser
    const lookTa=document.getElementById('agent-look');if(lookTa&&lookTa.value.trim())state.look=lookTa.value.trim();
    dealDesignAxes();
    state.slots=[null,null,null];state.variant=null;state.selectedImage='';state.marketImages={};state.marketStarted=false;state.marketRefKey='';state.step=3;render();
    const refreshBar=()=>{const bar=root.querySelector('.hatch-actions');if(bar){bar.innerHTML=hatchActionsBar();bind();}};
    const sceneOf=i=>()=>root.querySelector(`.hx6[data-i="${i}"]`);
    [0,1,2].forEach(i=>crackStart('d'+i,sceneOf(i),true));   // the crack creeps while the model draws
    await Promise.all([0,1,2].map(async i=>{
      const image=await fetchPortrait(i);
      state.slots[i]={status:'ready',image};saveSession();
      let hatched=false;const done=()=>{hatched=true;};
      armHatch(sceneOf(i),'d'+i,image||'/hatchy-pop.webp','/hatchy-pop.webp',done);
      const cell=root.querySelector(`.egg-cell[data-egg="${i}"]`);if(cell)cell.classList.add('is-ready');
      refreshBar();               // selectable the moment the first design is out
      for(let t=0;t<40&&!hatched;t++)await sleep(150);   // cut-out + rush + pop, whichever comes first
    }));
    celebrate();
    refreshBar();
  }
  function bind(){
    root.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
      const a=el.dataset.action;
      if(a==='back'){state.step=state.step===2?0:Math.max(0,state.step-1);render()}
      if(a==='next'){state.step++;render()}
      if(a==='team'){const input=document.getElementById('biz-intro');const text=input?input.value.trim():'';const ind=industryOf(state.industry);const biz=text||(ind&&ind.noun)||'';if(!biz){input?.focus();input?.setAttribute('aria-invalid','true');return}state.biz=biz;state.step=2;researchTeam(biz,text&&ind&&ind.noun?`${text} (${ind.label.toLowerCase()})`:biz);render()}
      if(a==='generate'){const input=document.getElementById('agent-name');const name=input.value.trim();if(!name){input.focus();input.setAttribute('aria-invalid','true');return}state.name=name;const coIn=document.getElementById('agent-co');if(coIn)state.company=coIn.value.trim();const bizIn=document.getElementById('agent-biz');state.biz=bizIn?bizIn.value.trim():'';const lookTa=document.getElementById('agent-look');state.look=(lookTa&&lookTa.value.trim())||(hasReference()?'a friendly robot mascot':'a friendly rounded robot in blue and white');generateAgents()}
      if(a==='redesign'){if(hatchesLeft()){state.step=2;render()}else hatchPop()}
      if(a==='edit-look'){openEditLook()}
      if(a==='open-connect'){openConnectDialog()}
      if(a==='chat-send'){const box=document.getElementById('chat-box');const t=box?box.value.trim():'';if(!t)return;const i=state.chatActive??8;
        const FREE_TURNS=5;
        const prior=(state.chatExtra[i]||[]).filter(m=>m[0]==='me').length;
        const scrollFocus=()=>{const th=document.getElementById('chat-thread');if(th)th.scrollTop=th.scrollHeight;document.getElementById('chat-box')?.focus()};
        if(!unlimited()&&prior>=FREE_TURNS){state.chatExtra[i]=(state.chatExtra[i]||[]).concat([['me',t],['pay','Please pay for your agent in order to continue talking.']]);render();scrollFocus();return;}
        const history=(state.chatExtra[i]||[]).filter(m=>m[0]==='me'||m[0]==='them').map(m=>({role:m[0]==='me'?'user':'assistant',content:m[1]}));
        state.chatExtra[i]=(state.chatExtra[i]||[]).concat([['me',t]]);state.chatTyping[i]=true;render();scrollFocus();
        const agentName=(chatProfiles().all[i]||{}).name||state.name||'your agent';
        fetchChatReply(t,agentName,history,prior+1).then(reply=>{state.chatTyping[i]=false;state.chatExtra[i]=(state.chatExtra[i]||[]).concat([['them',reply]]);if(state.tab==='chats'){render();scrollFocus();}});
      }
      if(a==='market'){
        // No explicit pick → default to the first design that actually has an image, and
        // always fall back to ANY generated image so the avatar/logo/market ref never go blank.
        if(state.variant===null){const i=state.slots.findIndex(s=>s&&s.image);state.variant=i>=0?i:0}
        const s=state.slots[state.variant];
        state.selectedImage=(s&&s.image)||state.selectedImage||((state.slots.find(x=>x&&x.image)||{}).image)||'';
        document.querySelectorAll('.confetti').forEach(c=>c.remove());state.step=4;render();generateMarket()}
      if(a==='reset'){state.step=0;state.name='';state.company='';state.biz='';state.industry='';state.tools=[];state.toolsOpen=false;state.look='';state.team=null;state.teamBusy=false;state.refPhoto='';state.brand=null;state.refBusy=false;state.refError='';state.slots=[];state.variant=null;state.selectedImage='';state.done=false;state.marketImages={};state.marketStarted=false;state.added=[];state.tab='profiles';state.chatActive=0;state.chatExtra={};state.chatTyping={};state.editUses=0;state.profiles=[];state.sid='';state.startedAt=0;notifHidden=false;drawNotifs();clearSession();state.merch={robot:'__you',product:'tee',color:0,size:'S',qty:1,basket:[],note:false};document.querySelectorAll('.confetti').forEach(c=>c.remove());render()}
    });
    root.querySelectorAll('[data-egg]').forEach(el=>{
      // Select a design the moment it's hatched — direct DOM updates only, so picking
      // one egg never restarts the others' hatch animations.
      const pick=()=>{const i=+el.dataset.egg;const s=state.slots[i];if(!s||s.status!=='ready')return;
        state.variant=i;state.selectedImage=s.image||'';
        root.querySelectorAll('[data-egg]').forEach(c=>{const on=+c.dataset.egg===i;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',on)});
        const bar=root.querySelector('.hatch-actions');if(bar){bar.innerHTML=hatchActionsBar();bind();}};
      el.onclick=pick;
      el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}};
    });
        const indBtn=document.getElementById('biz-industry-btn'),indMenu=document.getElementById('biz-industry-menu');
    if(indBtn&&indMenu){
      const opts=[...indMenu.querySelectorAll('[data-industry]')];
      // Keep the open list inside the viewport: cap its height to the room below the field,
      // or flip it above when there is more room up there.
      const fitMenu=()=>{const r=indBtn.getBoundingClientRect();const pad=16,gap=8;const below=window.innerHeight-r.bottom-gap-pad,above=r.top-gap-pad;const up=below<240&&above>below;indMenu.classList.toggle('is-up',up);indMenu.style.maxHeight=Math.max(140,Math.min(420,up?above:below))+'px';};
      const setOpen=open=>{indMenu.hidden=!open;indBtn.setAttribute('aria-expanded',String(open));if(open){fitMenu();(opts.find(o=>o.classList.contains('is-on'))||opts[0]).focus({preventScroll:true});}};
      window.addEventListener('resize',()=>{if(!indMenu.hidden)fitMenu();});
      const choose=label=>{const input=document.getElementById('biz-intro');if(input)state.biz=input.value.trim();state.industry=label;render();(label===OTHER?document.getElementById('biz-intro'):document.getElementById('biz-industry-btn'))?.focus();};
      indBtn.onclick=()=>setOpen(indMenu.hidden);
      indBtn.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}};
      opts.forEach((o,i)=>{o.onclick=()=>choose(o.dataset.industry);o.onkeydown=e=>{
        if(e.key==='ArrowDown'){e.preventDefault();opts[Math.min(i+1,opts.length-1)].focus();}
        else if(e.key==='ArrowUp'){e.preventDefault();opts[Math.max(i-1,0)].focus();}
        else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(o.dataset.industry);}
        else if(e.key==='Escape'||e.key==='Tab'){setOpen(false);if(e.key==='Escape'){e.preventDefault();indBtn.focus();}}
      };});
      if(root._closeIndustry)document.removeEventListener('pointerdown',root._closeIndustry);   // one listener across re-renders
      root._closeIndustry=e=>{if(!indMenu.hidden&&!e.target.closest('#biz-industry'))setOpen(false);};
      document.addEventListener('pointerdown',root._closeIndustry);
    }
    const bizIntro=document.getElementById('biz-intro');if(bizIntro)bizIntro.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('[data-action="team"]')?.click()}};
    const pick=document.getElementById('tool-pick');
    if(pick){
      const btn=document.getElementById('tool-btn'),menu=document.getElementById('tool-menu'),search=document.getElementById('tool-search'),list=menu.querySelector('.tool-list');
      // Updates happen in place — a re-render would drop the caret from the business box.
      const sync=()=>{const n=(state.tools||[]).length;btn.textContent=n?`${n} tool${n===1?'':'s'} selected`:'Choose your tools…';btn.classList.toggle('is-empty',!n);document.getElementById('tool-chosen').innerHTML=toolChips();bindRemove();};
      const setTool=(n,on)=>{const rest=(state.tools||[]).filter(x=>x!==n);state.tools=on?[...rest,n]:rest;const o=list.querySelector(`[data-tool="${CSS.escape(n)}"]`);if(o){o.classList.toggle('is-on',on);o.setAttribute('aria-selected',String(on));}sync();};
      const bindRemove=()=>document.querySelectorAll('[data-tool-remove]').forEach(x=>x.onclick=()=>setTool(x.dataset.toolRemove,false));
      bindRemove();
      const fitMenu=()=>{const r=btn.getBoundingClientRect();const pad=16,gap=8;const below=window.innerHeight-r.bottom-gap-pad,above=r.top-gap-pad;const up=below<260&&above>below;menu.classList.toggle('is-up',up);menu.style.maxHeight=Math.max(180,Math.min(400,up?above:below))+'px';};
      const setOpen=open=>{menu.hidden=!open;btn.setAttribute('aria-expanded',String(open));if(open){fitMenu();search.value='';filter();search.focus({preventScroll:true});}};
      const filter=()=>{const q=search.value.trim().toLowerCase();list.querySelectorAll('[data-tool]').forEach(o=>{o.hidden=!!q&&!o.dataset.tool.toLowerCase().includes(q);});};
      btn.onclick=()=>setOpen(menu.hidden);
      list.querySelectorAll('[data-tool]').forEach(o=>o.onclick=()=>setTool(o.dataset.tool,!o.classList.contains('is-on')));
      search.oninput=filter;
      search.onkeydown=e=>{
        if(e.key==='Escape'){e.preventDefault();setOpen(false);btn.focus();return;}
        if(e.key!=='Enter')return;e.preventDefault();
        const raw=search.value.replace(/\s+/g,' ').trim().slice(0,30);if(!raw)return;
        const known=TOOLS.find(t=>t.n.toLowerCase()===raw.toLowerCase())||(state.tools||[]).map(n=>({n})).find(t=>t.n.toLowerCase()===raw.toLowerCase());
        const visible=[...list.querySelectorAll('[data-tool]')].filter(o=>!o.hidden);
        const n=known?known.n:(visible.length===1?visible[0].dataset.tool:raw);
        if(!list.querySelector(`[data-tool="${CSS.escape(n)}"]`)){const li=document.createElement('li');li.className='intro-option tool-option';li.setAttribute('role','option');li.dataset.tool=n;li.innerHTML=`${mcpIcon(n)}<span>${escapeHtml(n)}</span>`;li.onclick=()=>setTool(n,!li.classList.contains('is-on'));list.appendChild(li);}
        setTool(n,true);search.value='';filter();
      };
      window.addEventListener('resize',()=>{if(!menu.hidden)fitMenu();});
      if(root._closeTools)document.removeEventListener('pointerdown',root._closeTools);
      root._closeTools=e=>{if(!menu.hidden&&!e.target.closest('#tool-pick'))setOpen(false);};
      document.addEventListener('pointerdown',root._closeTools);
    }
    bindReference();
    root.querySelectorAll('[data-create]').forEach(el=>el.onclick=()=>openCreateMenu(el));
    root.querySelectorAll('[data-profile]').forEach(el=>{const p=state.profiles.find(q=>q.id===el.dataset.profile);if(!p||p.status!=='complete')return;el.onclick=()=>showProfile(p);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showProfile(p)}};});
    root.querySelectorAll('[data-merch-robot]').forEach(el=>el.onclick=()=>{state.merch.robot=el.dataset.merchRobot;render();});
    root.querySelectorAll('[data-merch-prod]').forEach(el=>el.onclick=()=>{state.merch.product=el.dataset.merchProd;state.merch.size=el.dataset.merchProd==='hat'?'One size':'S';render();});
    root.querySelectorAll('[data-merch-color]').forEach(el=>el.onclick=()=>{state.merch.color=+el.dataset.merchColor;render();});
    root.querySelectorAll('[data-merch-size]').forEach(el=>el.onclick=()=>{state.merch.size=el.dataset.merchSize;render();});
    root.querySelectorAll('[data-merch-qty]').forEach(el=>el.onclick=()=>{state.merch.qty=Math.max(1,state.merch.qty + +el.dataset.merchQty);render();});
    root.querySelectorAll('[data-merch-add]').forEach(el=>el.onclick=()=>{const m=state.merch;const p=MERCH_PRODUCTS.find(x=>x.id===m.product);if(!p||p.price===null)return;m.basket.push({prod:p.id,name:p.name,price:p.price,size:m.size,qty:m.qty,color:p.id==='hat'?'#16150F':MERCH_COLORS[m.color][1],colorName:p.id==='hat'?'Black':MERCH_COLORS[m.color][0],img:merchRobotImg()});m.qty=1;render();});
    root.querySelectorAll('[data-merch-checkout]').forEach(el=>el.onclick=()=>{state.merch.note=true;render();});
    root.querySelectorAll('[data-hatch5]').forEach(el=>el.onclick=()=>{el.classList.remove('run');void el.offsetWidth;el.classList.add('run');});
    root.querySelectorAll('[data-mic]').forEach(btn=>btn.onclick=()=>startDictation(btn));
    root.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>{state.tab=el.dataset.tab;render();});
    root.querySelectorAll('[data-chat]').forEach(el=>el.onclick=()=>{state.chatActive=+el.dataset.chat;render();});
    const th=document.getElementById('chat-thread');if(th)th.scrollTop=th.scrollHeight;
    const cb=document.getElementById('chat-box');if(cb)cb.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('[data-action="chat-send"]').click();}};
    const yours=root.querySelector('.p-card.is-yours');if(yours){yours.style.cursor='pointer';yours.onclick=()=>openEditLook();yours.tabIndex=0;yours.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEditLook()}};}
    root.querySelectorAll('[data-add]').forEach(b=>{b.onclick=e=>{e.stopPropagation();addAgent(b.dataset.add);};b.onkeydown=e=>e.stopPropagation();});
    root.querySelectorAll('[data-agent]').forEach(el=>{el.onclick=()=>showAgent(el.dataset.agent);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showAgent(el.dataset.agent)}};});
    const search=document.getElementById('market-search');if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();let visible=0;root.querySelectorAll('.p-card[data-search]').forEach(c=>{const show=!q||c.dataset.search.includes(q);c.hidden=!show;if(show)visible++;});const yours=root.querySelector('.p-card.is-yours');if(yours)yours.hidden=!!q;root.querySelectorAll('.board-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.p-card')].some(c=>!c.hidden);});const empty=document.getElementById('board-empty');if(empty)empty.hidden=visible>0;};
    const input=document.getElementById('agent-name');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('agent-biz')?.focus()}};
  }
  root.dataset.build=BUILD;console.info('Agent Hatchers prototype · build '+BUILD);
  if(REVIEW_SID)reviewSession();
  else restoreSession().then(back=>{render();if(back){welcomeBack();if(state.step===4)generateMarket();}});
})();
