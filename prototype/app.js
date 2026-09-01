(() => {
  const BUILD = 25;  // bump with ?v= in the pages — lets anyone confirm which build a browser is running
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
  const state = {step:0,name:'',biz:'',look:'',slots:[],variant:null,selectedImage:'',done:false,marketImages:{},marketStarted:false,tab:'profiles',chatActive:0,chatExtra:{},chatTyping:{},company:'',editUses:0,merch:{robot:'__you',product:'tee',color:0,size:'S',qty:1,basket:[],note:false}};
  const root = document.getElementById('prototype-app');
  const co = () => state.company || config.company || 'Your Company';
  const DESIGN_AXES={
    build:['a compact chibi build with a big round head and stubby limbs','a tall slender build with long thin limbs','a chunky sturdy build with a barrel chest and broad shoulders','a small hovering build with no legs, floating on a rounded base'],
    face:['two big expressive round eyes','a single friendly camera-lens eye','a wide glowing visor face','a pixel-matrix screen face with a smiley expression'],
    finish:['glossy ceramic-like panels','brushed metal with visible panel seams and rivets','a soft matte rubberised shell','clean moulded plastic like a premium toy'],
    style:['retro 1970s tin-toy robot styling','sleek near-future android styling','cute kitchen-appliance-inspired styling','sporty drone-inspired styling with fins']
  };
  const shuffle=a=>{const c=[...a];for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;};
  function dealDesignAxes(){state.axes={build:shuffle(DESIGN_AXES.build),face:shuffle(DESIGN_AXES.face),finish:shuffle(DESIGN_AXES.finish),style:shuffle(DESIGN_AXES.style)};}
  function designBrief(variant){
    const ax=state.axes||{};const pick=k=>((ax[k]||DESIGN_AXES[k])[variant%4]);
    return `${state.look}. This is design ${variant+1} of 3 and it must look clearly different from the other two: give it ${pick('build')}, ${pick('face')}, ${pick('finish')}, and ${pick('style')}.`;
  }

  const industry = config.industry || 'professional-services';
  const industryLabel = config.industryLabel || 'Your industry';
  // Real portrait generation. Point portraitEndpoint at a callable endpoint and it upgrades
  // automatically; until then each egg falls back to an on-brand simulated mascot so the
  // prospect experience is never broken. Set generatePortraits:false to skip the call entirely.
  const portraitEndpoint = config.portraitEndpoint || 'https://agent-hatchers-portrait-proxy.vercel.app/api/prototype-portrait';
  const usePortraits = config.generatePortraits !== false && !!portraitEndpoint;
  const chatEndpoint = config.chatEndpoint || portraitEndpoint.replace('prototype-portrait','prototype-chat');
  const recommended = new Set(config.recommendedAgents||[]);
  function rankAgents(){const text=`${state.name} ${state.biz} ${state.look} ${industryLabel}`.toLowerCase();return catalog.map((agent,index)=>{let score=0;agent.keywords.forEach(k=>{if(text.includes(k))score+=4});if(agent.industries.includes(industry))score+=2;if(recommended.has(agent.id))score+=1;return{agent,score,index};}).sort((a,b)=>b.score-a.score||a.index-b.index);}
  // The 6 best-matched agents for this business get generated portraits + the Recommended row.
  const topAgents = () => rankAgents().slice(0,6).map(r=>r.agent);
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
  const MCP_SPRITE="<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"display:none\" aria-hidden=\"true\"><symbol id=\"lg-gmail\" viewBox=\"52 42 88 66\">       <path fill=\"#4285f4\" d=\"M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6\"/>       <path fill=\"#34a853\" d=\"M120 108h14c3.32 0 6-2.69 6-6V59l-20 15\"/>       <path fill=\"#fbbc04\" d=\"M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2\"/>       <path fill=\"#ea4335\" d=\"M72 74V48l24 18 24-18v26L96 92\"/>       <path fill=\"#c5221f\" d=\"M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2\"/>     </symbol><symbol id=\"lg-slack\" viewBox=\"0 0 24 24\">       <path fill=\"#36C5F0\" d=\"M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z\"/>       <path fill=\"#2EB67D\" d=\"M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z\"/>       <path fill=\"#ECB22E\" d=\"M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z\"/>       <path fill=\"#E01E5A\" d=\"M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z\"/>     </symbol><symbol id=\"lg-teams\" viewBox=\"0 0 24 24\">       <path fill=\"#5059C9\" d=\"M16.8 8.4h4.62c.44 0 .78.35.78.78v4.05a2.79 2.79 0 0 1-5.58 0V8.4zm4.02-1.35a1.86 1.86 0 1 0 0-3.72 1.86 1.86 0 0 0 0 3.72z\"/>       <path fill=\"#7B83EB\" d=\"M12.9 7.05a2.55 2.55 0 1 0 0-5.1 2.55 2.55 0 0 0 0 5.1zm3.15 1.35H8.55c-.5.01-.9.43-.89.93v4.62a4.62 4.62 0 0 0 9.24.36V9.3c.01-.5-.39-.9-.85-.9z\"/>       <path fill=\"#000\" opacity=\".18\" d=\"M13.2 8.4H8.05v8.55c.55.13 1.12.16 1.68.09A4.62 4.62 0 0 0 13.2 12.6V8.4z\"/>       <path fill=\"#4B53BC\" d=\"M2.4 6h8.1c.66 0 1.2.54 1.2 1.2v8.1c0 .66-.54 1.2-1.2 1.2H2.4c-.66 0-1.2-.54-1.2-1.2V7.2C1.2 6.54 1.74 6 2.4 6z\"/>       <path fill=\"#fff\" d=\"M8.55 9.24H4.35v1.32h1.4v3.9h1.38v-3.9h1.42V9.24z\"/>     </symbol><symbol id=\"lg-hubspot\" viewBox=\"0 0 24 24\">       <path fill=\"#FF7A59\" d=\"M18.164 7.93V5.084a2.198 2.198 0 0 0 1.267-1.978v-.067A2.2 2.2 0 0 0 17.238.845h-.067a2.2 2.2 0 0 0-2.193 2.194v.067a2.196 2.196 0 0 0 1.252 1.973l.013.006v2.852a6.22 6.22 0 0 0-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 1 0 4.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 0 0-1.038 3.446c0 1.343.425 2.588 1.147 3.606l-.013-.02-2.342 2.343a1.968 1.968 0 0 0-.58-.095h-.002a2.033 2.033 0 1 0 2.033 2.033 1.978 1.978 0 0 0-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 1 0 4.782-11.134l-.036-.005zm-1.02 9.378a3.206 3.206 0 1 1 3.207-3.207 3.206 3.206 0 0 1-3.206 3.206z\"/>     </symbol><symbol id=\"lg-xero\" viewBox=\"0 0 24 24\">       <path fill=\"#13B5EA\" d=\"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.585 14.655c-1.485 0-2.69-1.206-2.69-2.689 0-1.485 1.207-2.691 2.69-2.691 1.485 0 2.69 1.207 2.69 2.691s-1.207 2.689-2.69 2.689zM7.53 14.644c-.099 0-.192-.041-.267-.116l-2.043-2.04-2.052 2.047c-.069.068-.16.108-.258.108-.202 0-.368-.166-.368-.368 0-.099.04-.191.111-.263l2.04-2.05-2.038-2.047c-.075-.069-.113-.162-.113-.261 0-.203.166-.366.368-.366.098 0 .188.037.258.105l2.055 2.048 2.048-2.045c.069-.071.162-.108.26-.108.211 0 .375.165.375.366 0 .098-.029.188-.104.258l-2.056 2.055 2.055 2.051c.068.069.104.16.104.258 0 .202-.165.368-.365.368h-.01zm8.017-4.591c-.796.101-.882.476-.882 1.404v2.787c0 .202-.165.366-.366.366-.203 0-.367-.165-.368-.366v-4.53c0-.204.16-.366.362-.366.166 0 .316.125.346.289.27-.209.6-.317.93-.317h.105c.195 0 .359.165.359.368 0 .201-.164.352-.375.359 0 0-.09 0-.164.008l.053-.002zm-3.091 2.205H8.625c0 .019.003.037.006.057.02.105.045.211.083.31.194.531.765 1.275 1.829 1.29.33-.003.631-.086.9-.229.21-.12.391-.271.525-.428.045-.058.09-.112.12-.168.18-.229.405-.186.54-.083.164.135.18.391.045.57l-.016.016c-.21.27-.435.495-.689.66-.255.164-.525.284-.811.345-.33.09-.645.104-.975.06-1.095-.135-2.01-.93-2.28-2.01-.06-.21-.09-.42-.09-.645 0-.855.421-1.695 1.125-2.205.885-.615 2.085-.66 3-.075.63.405 1.035 1.021 1.185 1.771.075.419-.21.794-.734.81l.068-.046zm6.129-2.223c-1.064 0-1.931.865-1.931 1.931 0 1.064.866 1.931 1.931 1.931s1.931-.867 1.931-1.931c0-1.065-.866-1.933-1.931-1.933v.002zm0 2.595c-.367 0-.666-.297-.666-.666 0-.367.3-.665.666-.665.367 0 .667.299.667.665 0 .369-.3.667-.667.666zm-8.04-2.603c-.91 0-1.672.623-1.886 1.466v.03h3.776c-.203-.855-.973-1.494-1.891-1.494v-.002z\"/>     </symbol><symbol id=\"lg-quickbooks\" viewBox=\"0 0 24 24\">       <path fill=\"#2CA01C\" d=\"M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm.642 4.1335c.9554 0 1.7296.776 1.7296 1.7332v9.0667h1.6c1.614 0 2.9275-1.3156 2.9275-2.933 0-1.6173-1.3136-2.9333-2.9276-2.9333h-.6654V7.3334h.6654c2.5722 0 4.6577 2.0897 4.6577 4.667 0 2.5774-2.0855 4.6666-4.6577 4.6666H12.642zM7.9837 7.333h3.3291v12.533c-.9555 0-1.73-.7759-1.73-1.7332V9.0662H7.9837c-1.6146 0-2.9277 1.316-2.9277 2.9334 0 1.6175 1.3131 2.9333 2.9277 2.9333h.6654v1.7332h-.6654c-2.5725 0-4.6577-2.0892-4.6577-4.6665 0-2.5771 2.0852-4.6666 4.6577-4.6666Z\"/>     </symbol><symbol id=\"lg-stripe\" viewBox=\"0 0 24 24\">       <rect width=\"24\" height=\"24\" rx=\"5\" fill=\"#635BFF\"/>       <path fill=\"#fff\" transform=\"translate(5.4,5.4) scale(0.55)\" d=\"M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z\"/>     </symbol><symbol id=\"lg-notion\" viewBox=\"0 0 24 24\">       <rect x=\"1.5\" y=\"1.5\" width=\"21\" height=\"21\" rx=\"3.5\" fill=\"#fff\" stroke=\"#16150F\" stroke-width=\"1.6\"/>       <text x=\"12\" y=\"17.2\" text-anchor=\"middle\" font-family=\"Georgia,'Times New Roman',serif\" font-weight=\"700\" font-size=\"14\" fill=\"#16150F\">N</text>     </symbol><symbol id=\"lg-zendesk\" viewBox=\"0 0 24 24\">       <path fill=\"#03363D\" d=\"M11.087 4.685v14.629H0L11.087 4.685zM11.087 0c0 3.062-2.482 5.544-5.544 5.544S0 3.062 0 0h11.087zM12.913 19.314c0-3.062 2.482-5.544 5.544-5.544S24 16.252 24 19.314H12.913zM12.913 14.629V0H24L12.913 14.629z\"/>     </symbol></svg>";
  document.body.insertAdjacentHTML('beforeend', MCP_SPRITE);
  // Real marks where the brand sprite has them; brand-coloured monograms for the rest.
  const MCP_ICONS={'Gmail':'lg-gmail','Slack':'lg-slack','Microsoft Teams':'lg-teams','HubSpot':'lg-hubspot','Xero':'lg-xero','QuickBooks':'lg-quickbooks','Stripe':'lg-stripe','Notion':'lg-notion','Zendesk':'lg-zendesk'};
  const MCP_MONO={'AfterShip':['AS','#FF6B2C'],'Asana':['as','#F06A6A'],'Canva':['C','#00C4CC'],'Cin7':['C7','#0B2E4F'],'Dropbox':['D','#0061FF'],'GitHub':['GH','#181717'],'Google Ads':['GA','#4285F4'],'Google Analytics':['An','#E37400'],'Google Drive':['GD','#1FA463'],'Google Sheets':['GS','#188038'],'Intercom':['IC','#1F8DED'],'Klaviyo':['K','#16120F'],'LinkedIn':['in','#0A66C2'],'Loop Returns':['L','#3D3AF2'],'MYOB':['M','#6100A5'],'Meta Ads':['M','#0081FB'],'Microsoft 365':['MS','#D83B01'],'Monday.com':['mo','#FF3D57'],'Salesforce':['SF','#00A1E0'],'ShipStation':['SS','#2E7FC0'],'Shopify':['S','#96BF48'],'Webflow':['W','#4353FF'],'WordPress':['W','#21759B']};
  // Which agents naturally hand work to each other — shown as a suggested team.
  const WORKS_WITH={logistics:['inventory','returns','support'],marketing:['website','sales','support'],support:['returns','logistics','sales'],returns:['logistics','invoices','support'],sales:['marketing','invoices','documents'],inventory:['logistics','invoices','operations'],invoices:['inventory','returns','operations'],documents:['sales','operations','invoices'],website:['marketing','support','sales'],operations:['inventory','documents','invoices']};
  // Hand-drawn brand marks for MCPs the homepage sprite doesn't carry.
  const MCP_SVGS={
    'Google Ads':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="9.8" y="2.6" width="4.6" height="16" rx="2.3" transform="rotate(30 12 10.6)" fill="#FBBC04"/><rect x="9.8" y="2.6" width="4.6" height="16" rx="2.3" transform="rotate(-30 12 10.6)" fill="#4285F4"/><circle cx="5.6" cy="18.4" r="3.2" fill="#34A853"/></svg>',
    'Google Analytics':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="15.6" y="3" width="5.2" height="18" rx="2.6" fill="#F9AB00"/><rect x="9.4" y="9.5" width="5.2" height="11.5" rx="2.6" fill="#E37400"/><circle cx="5.8" cy="18.4" r="2.6" fill="#E37400"/></svg>',
    'Google Drive':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M8.7 3h6.6l7 12.2H15.7Z" fill="#FFBA00"/><path d="M8.7 3 1.7 15.2l3.3 5.8 7-12.2Z" fill="#00AC47"/><path d="M5 21h13.9l3.4-5.8H8.4Z" fill="#2684FC"/></svg>',
    'Google Sheets':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="5" y="2.5" width="14" height="19" rx="2" fill="#188038"/><path d="M8.2 10.2h7.6v7.6H8.2Z M8.2 14h7.6 M12 10.2v7.6" fill="none" stroke="#fff" stroke-width="1.4"/></svg>',
    'Meta Ads':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M6.7 17.4c-2.1 0-3.5-1.9-3.5-4.4 0-3.6 2.3-6.4 5-6.4 2.8 0 4.5 2.7 5.8 5.7 1.3-3 2.6-5.7 5.4-5.7 2.4 0 4.4 2.4 4.4 5.7 0 2.9-1.5 5.1-3.7 5.1-2.6 0-4.1-2.9-5.4-5.8-1.4 2.9-3.1 5.8-6 5.8Z" fill="none" stroke="#0081FB" stroke-width="2.1"/></svg>',
    'LinkedIn':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="2" y="2" width="20" height="20" rx="3.5" fill="#0A66C2"/><circle cx="7.9" cy="8.4" r="1.7" fill="#fff"/><rect x="6.4" y="10.8" width="3" height="7.6" fill="#fff"/><path d="M11.5 10.8h2.9v1.2c.5-.8 1.6-1.5 3-1.5 2.2 0 3.5 1.5 3.5 3.9v4h-3v-3.6c0-1.2-.5-1.9-1.5-1.9s-1.9.7-1.9 2v3.5h-3Z" fill="#fff"/></svg>',
    'GitHub':'<svg viewBox="0 0 16 16" class="mcp-lg"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" fill="#181717"/></svg>',
    'Salesforce':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M7.4 9.2c.9-1.8 2.8-3 4.9-3 1.7 0 3.2.7 4.2 1.9.6-.3 1.3-.5 2-.5 2.6 0 4.7 2.1 4.7 4.7s-2.1 4.8-4.7 4.8H7.9C5.5 17.1 3.5 15.1 3.5 12.7c0-2.1 1.6-3.9 3.9-3.5Z" fill="#00A1E0"/></svg>',
    'Dropbox':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M7 2.6l5 3.2-5 3.2-5-3.2Zm10 0 5 3.2-5 3.2-5-3.2ZM2 12.2l5-3.2 5 3.2-5 3.2Zm15-3.2 5 3.2-5 3.2-5-3.2ZM7 16.6l5-3.2 5 3.2-5 3.2Z" fill="#0061FF"/></svg>',
    'Asana':'<svg viewBox="0 0 24 24" class="mcp-lg"><circle cx="12" cy="7.2" r="3.5" fill="#F06A6A"/><circle cx="6" cy="16.6" r="3.5" fill="#F06A6A"/><circle cx="18" cy="16.6" r="3.5" fill="#F06A6A"/></svg>',
    'Monday.com':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="3.4" y="6" width="4.6" height="12.4" rx="2.3" fill="#FF3D57"/><rect x="9.7" y="6" width="4.6" height="12.4" rx="2.3" fill="#FFCB00"/><rect x="16" y="6" width="4.6" height="12.4" rx="2.3" fill="#00D647"/></svg>',
    'Canva':'<svg viewBox="0 0 24 24" class="mcp-lg"><circle cx="12" cy="12" r="10" fill="#00C4CC"/><text x="12" y="16.4" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="12.5" fill="#fff">C</text></svg>',
    'WordPress':'<svg viewBox="0 0 24 24" class="mcp-lg"><circle cx="12" cy="12" r="10" fill="#21759B"/><text x="12" y="16" text-anchor="middle" font-family="Georgia,serif" font-size="11.5" fill="#fff">W</text></svg>',
    'Webflow':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="2" y="2" width="20" height="20" rx="5" fill="#4353FF"/><text x="12" y="16.2" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="800" font-style="italic" font-size="11" fill="#fff">W</text></svg>',
    'Shopify':'<svg viewBox="0 0 24 24" class="mcp-lg"><path d="M7.6 7.4l.9-3c.2-.7.8-1.2 1.5-1.2h4c.7 0 1.3.5 1.5 1.2l.9 3h2.1c.6 0 1 .4 1.1 1l1 11c.1.8-.5 1.5-1.3 1.5H4.7c-.8 0-1.4-.7-1.3-1.5l1-11c.1-.6.5-1 1.1-1Z" fill="#96BF48"/><text x="12" y="17.2" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-style="italic" font-size="9.5" fill="#fff">S</text></svg>',
    'Intercom':'<svg viewBox="0 0 24 24" class="mcp-lg"><rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="#1F8DED"/><rect x="6.1" y="7" width="1.7" height="7" rx=".85" fill="#fff"/><rect x="9.4" y="6.2" width="1.7" height="8.6" rx=".85" fill="#fff"/><rect x="12.7" y="6.2" width="1.7" height="8.6" rx=".85" fill="#fff"/><rect x="16" y="7" width="1.7" height="7" rx=".85" fill="#fff"/><path d="M6.5 17c3.6 2.4 7.4 2.4 11 0" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };
  function mcpChip(name){
    const sym=MCP_ICONS[name];
    const icon=sym?`<svg class="mcp-lg" aria-hidden="true"><use href="#${sym}"/></svg>`
      :(MCP_SVGS[name]||(MCP_MONO[name]?`<span class="mcp-mono" style="background:${MCP_MONO[name][1]}">${MCP_MONO[name][0]}</span>`:''));
    return `<span class="mcp">${icon}${escapeHtml(name)}</span>`;
  }
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function chip(){if(state.variant===null)return `<span class="private-pill">Private preview</span>`;const inner=state.selectedImage?`<img class="chip-img" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+state.variant+' chip');return `<span class="agent-chip">${inner}<span>${escapeHtml(state.name)}</span></span>`;}
  const layout = content => `<main class="shell"><header class="topbar"><div class="brand"><img src="/agent-hatchers-logo.png" alt=""><span>Agent Hatchers</span></div>${chip()}</header><section class="panel"><div class="progress" aria-label="Prototype progress"><span style="--progress:${Math.min(100,(state.step+1)/5*100)}%"></span></div><div class="step-label">Step ${state.step+1} of 5</div>${content}</section></main>`;

  function render(){
    const screens = [welcome,nameScreen,hatchScreen,marketScreen,connectScreen];
    const inner = screens[state.step]();
    root.innerHTML = state.step>=3 ? inner : layout(inner);
    bind();
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
  function welcome(){return `<div class="stage welcome-grid"><div><h1 class="welcome-title">Hatch your agent</h1><div class="actions">${button('Start →','next')}</div></div><div class="welcome-art" aria-hidden="true">${hatch5()}</div></div>`;}
  function nameScreen(){return `<div class="stage"><span class="eyebrow">Step 1 · Create a profile</span><h2>Create your agent</h2><p>Give it a name, tell us your type of company, and describe how it should look. You’ll pick specialist agents (sales, invoices, support…) from the marketplace next.</p><label class="field-label" for="agent-co">Company name</label><input class="name-field" id="agent-co" maxlength="40" autocomplete="off" placeholder="Company name — e.g. Tanssu" value="${escapeHtml(state.company||config.company||'')}" aria-label="Company name"><label class="field-label" for="agent-name">Agent name</label><input class="name-field" id="agent-name" maxlength="28" autocomplete="off" placeholder="Agent name — e.g. Pip, Scout or Atlas" value="${escapeHtml(state.name)}" aria-label="Agent name"><label class="field-label" for="agent-biz">Type of company</label><input class="name-field" id="agent-biz" maxlength="60" autocomplete="off" placeholder="e.g. e-commerce, agency, clinic, SaaS" value="${escapeHtml(state.biz)}" aria-label="Type of company"><label class="field-label" for="agent-look">Image description</label><div class="mic-field"><textarea class="look-field" id="agent-look" placeholder="e.g. a friendly rounded robot in blue and white, holding a suitcase" aria-label="Image description">${escapeHtml(state.look)}</textarea><button type="button" class="mic-btn" data-mic="agent-look" aria-label="Dictate image description">${micSvg}</button></div><div class="chips">${lookSeeds.map((s,i)=>`<button class="chip" data-look-index="${i}">${escapeHtml(s.label)}</button>`).join('')}</div><div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  function designScreen(){return `<div class="stage"><span class="eyebrow">Step 2 · Design the look</span><h2>Describe how ${escapeHtml(state.name)} should look</h2><p>Write a short, practical description and we’ll hatch three designs for you to choose from.</p><div class="mic-field"><textarea class="look-field" id="agent-look" maxlength="600" placeholder="e.g. a friendly rounded robot medic in blue and white, holding a checklist" aria-label="Describe the avatar">${escapeHtml(state.look)}</textarea><button type="button" class="mic-btn" data-mic="agent-look" aria-label="Dictate image description">${micSvg}</button></div><div class="chips">${lookSeeds.map((s,i)=>`<button class="chip" data-look-index="${i}">${escapeHtml(s.label)}</button>`).join('')}</div><div class="actions">${button('Back','back',true)}${button('Hatch 3 designs →','generate')}</div></div>`;}
  // The same continuous split-egg hatch as the welcome screen, one per design.
  // Rendered stateful: a slot that already hatched shows its design (.done skips the
  // animation on re-renders instead of resetting to a closed egg), and each hatched
  // design is clickable to select right away — no separate "pick" step.
  const HX6_CRACKS=`<svg class="hx6-cracks" viewBox="0 0 620 620"><path class="hx6-c1" d="M114,318 L146,302 L172,330 L200,296 L226,331 L245,301" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:198;stroke-dashoffset:198"/><path class="hx6-c2" d="M245,301 L272,336 L308,290 L338,332 L375,302" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:202;stroke-dashoffset:202"/><path class="hx6-c3" d="M375,302 L396,333 L420,298 L448,332 L474,300 L506,320" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:204;stroke-dashoffset:204"/></svg>`;
  const hx6Shell=extra=>`<div class="hx6 ${extra||''}"><img class="hx6-pop" alt=""><div class="hx6-wrap" aria-hidden="true"><img class="hx6-bottom" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 50.69%,${HX5_SEAM_UP},100% 51.01%,100% 100%,0 100%)"><img class="hx6-lid" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 0,100% 0,100% 51.61%,${HX5_SEAM},0 51.29%)">${HX6_CRACKS}</div></div>`;
  function eggScene(i){
    const slot=state.slots[i];const ready=!!(slot&&slot.status==='ready');const img=ready?(slot.image||'/hatchy-pop.webp'):'';const sel=state.variant===i;
    return `<div class="egg-cell ${ready?'is-ready':''} ${sel?'selected':''}" data-egg="${i}" role="button" tabindex="0" aria-pressed="${sel}"><div class="hx6 ${ready?'done':''}" data-i="${i}">
    <img class="hx6-pop" ${img?`src="${escapeHtml(img)}"`:''} alt="">
    <div class="hx6-wrap" aria-hidden="true">
      <img class="hx6-bottom" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 50.69%,${HX5_SEAM_UP},100% 51.01%,100% 100%,0 100%)">
      <img class="hx6-lid" src="/egg-closed.webp" alt="" style="clip-path:polygon(0 0,100% 0,100% 51.61%,${HX5_SEAM},0 51.29%)">
      <svg class="hx6-cracks" viewBox="0 0 620 620"><path class="hx6-c1" d="M114,318 L146,302 L172,330 L200,296 L226,331 L245,301" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:198;stroke-dashoffset:198"/><path class="hx6-c2" d="M245,301 L272,336 L308,290 L338,332 L375,302" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:202;stroke-dashoffset:202"/><path class="hx6-c3" d="M375,302 L396,333 L420,298 L448,332 L474,300 L506,320" fill="none" stroke="#1b1a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:204;stroke-dashoffset:204"/></svg>
    </div>
  </div><span class="hatch-number">Design ${i+1}</span><span class="egg-tick" aria-hidden="true">${ci.check}</span></div>`;}
  function hatchActionsBar(){
    const settled=state.slots.length&&state.slots.every(Boolean);
    const anyReady=state.slots.some(s=>s&&s.status==='ready');
    if(!anyReady) return `<p class="hatch-status">Hatching your designs… click your favourite as soon as it pops out.</p>`;
    return `${settled?button('Redesign','redesign',true):''}${button('Use this avatar →','market')}`;
  }
  function hatchScreen(){return `<div class="stage hatch-zone"><span class="eyebrow">Hatching</span><h2>Hatching ${escapeHtml(state.name||'your agent')}…</h2><p>Three takes on your description. Click your favourite — it becomes ${escapeHtml(state.name||'your agent')}’s avatar.</p><div class="hatch-row" aria-live="polite">${[0,1,2].map(eggScene).join('')}</div><div class="hatch-actions">${hatchActionsBar()}</div></div>`;}
  function initials(str){return String(str||'AH').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
  const marketLoader='<div class="hatch-loader"><img class="loader-egg" src="/egg-closed.webp" alt=""><span class="loader-txt">Hatching…</span></div>';
  function willGenerate(agent){return (usePortraits&&config.marketPortraits!==false&&state.variant!==null)||!!(config.bakedMarket&&config.bakedMarket[agent.id]);}
  function agentCard(agent){const gen=state.marketImages[agent.id];const loading=!gen&&willGenerate(agent);const inner=gen?`<img src="${escapeHtml(gen)}" alt="${escapeHtml(agent.name)}">`:(loading?marketLoader:`<img src="${agent.portrait}" alt="${escapeHtml(agent.name)}" loading="lazy">`);return `<article class="p-card" data-agent="${agent.id}" data-search="${escapeHtml((agent.name+' '+agent.team).toLowerCase())}" tabindex="0"><div class="p-thumb thumb-${agent.id} ${gen?'is-generated':''} ${loading?'is-loading':''}" data-thumb="${agent.id}">${inner}</div><div class="p-meta"><div class="p-name">${agent.name} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(co())}</span><span class="p-tag">${agent.team}</span></div></div></article>`;}
  function hatchedCard(){const vis=state.selectedImage?`<img src="${escapeHtml(state.selectedImage)}" alt="${escapeHtml(state.name)}">`:`<div class="thumb-bot">${bot('v'+(state.variant||0))}</div>`;return `<article class="p-card is-yours"><div class="p-thumb thumb-new ${state.selectedImage?'is-generated':''}">${vis}</div><div class="p-meta"><div class="p-name">${escapeHtml(state.name||'Your agent')} <i class="dot"></i></div><div class="p-sub"><span class="p-owner">${escapeHtml(co())}</span><span class="p-tag tag-new">Just hatched</span></div></div></article>`;}
  function profilesBoard(){
    const rec=topAgents();
    return `<div class="filter-bar">
        <div class="seg"><button class="seg-on">${ic.gallery}<span>Gallery</span></button><button data-noop="1">${ic.kanban}<span>Kanban</span></button></div>
        <button class="filter-pill" data-noop="1">Status: All ${ic.chev}</button><button class="filter-pill" data-noop="1">Team: All ${ic.chev}</button><button class="filter-pill" data-noop="1">Manager: All ${ic.chev}</button><button class="filter-pill sel" data-noop="1">Group by: Status ${ic.chev}</button>
        <div class="search-box">${ic.search}<input id="market-search" placeholder="Search profiles..." autocomplete="off"></div>
      </div>
      <div class="board" id="board">
        <section class="board-group g-active"><div class="group-head"><h3>Active</h3><span class="count">1</span></div><div class="p-grid">${hatchedCard()}</div></section>
        <section class="board-group g-rec"><div class="group-head"><h3>Recommended for ${escapeHtml(co())}</h3><span class="count">${rec.length}</span></div><div class="p-grid">${rec.map(agentCard).join('')}</div></section>
        <div class="board-empty" id="board-empty" hidden>No profiles match your search.</div>
      </div>`;
  }
  function agentAvatar(cls){return state.selectedImage?`<img class="${cls}" src="${escapeHtml(state.selectedImage)}" alt="">`:bot('v'+(state.variant||0)+' '+cls);}
  // The chat sidebar mirrors the Profiles board exactly: the hatched agent first, then
  // the six recommended agents (same names, same generated avatars). "Other profiles"
  // is workspace flavour using the stock Hatchy avatar art.
  function chatProfiles(){
    const you={name:state.name||'Your agent',img:state.selectedImage||'/hatchy-pop.webp'};
    const team=topAgents().map(a=>({name:a.name,img:state.marketImages[a.id]||a.portrait}));
    const other=[['Bug Destroyer','/hatchy-av-test.webp'],['Data Scientist','/hatchy-av-docs.webp'],['Hermes Helper','/hatchy-avatar.webp'],['Hype Beast','/hatchy-av-hype.webp'],['Meme Lord','/hatchy-av-meme.webp'],['Vibe Coder','/hatchy-av-web.webp']].map(([name,img])=>({name,img}));
    const your=[you,...team];
    return {your,other,all:[...your,...other]};
  }
  // The prospect's FIRST message in a chat gets a real answer (their sales free taste);
  // every later message meets the paywall.
  async function fetchChatReply(question,agentName,history,turn){
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
    const avOf=p=>`<img src="${escapeHtml(p.img)}" alt="">`;const activeAv=avOf(all[active]);
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
    const workspaces=[['Agent-Hatchers','T0A8CMQN1PH'],[escapeHtml(co()),'T0BJX6REVC2']];
    const channels=[['Agent-Hatchers','7 / 23 Channels Assigned'],[escapeHtml(co()),'13 / 16 Channels Assigned']];
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
      <div class="mkt-grid">${ranked.map((a,i)=>{const img=state.marketImages[a.id];const installed=topAgents().some(t=>t.id===a.id);const inner=img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(a.name)}">`:(willGenerate(a)?marketLoader:`<img src="${a.portrait}" alt="${escapeHtml(a.name)}" loading="lazy">`);return `<article class="mkt-card" data-agent="${a.id}" data-search="${escapeHtml((a.name+' '+a.team).toLowerCase())}" tabindex="0"><div class="mkt-thumb thumb-${a.id}">${inner}${installed?`<span class="mkt-installed">${ci.check}<span>Installed</span></span>`:''}</div><div class="mkt-body"><h3>${a.name}</h3><p>${a.summary}</p><div class="mkt-tags"><span class="p-tag">${a.team}</span><span class="mkt-skills">${a.outcomes.length} skills</span></div></div></article>`;}).join('')}</div>
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
    return `<div class="app">
      <header class="app-nav">
        <div class="ws"><img class="ws-logo ${state.selectedImage?'ws-avatar-img':''}" src="${state.selectedImage||'/agent-hatchers-logo.png'}" alt=""><span>${escapeHtml(co())}</span><i class="ws-chev">${ic.chev}</i></div>
        <nav class="nav-tabs">${tab('profiles','Profiles')}${tab('chats','Chats')}${tab('analytics','Analytics')}${tab('config','Config')}${tab('market','Marketplace')}${tab('merch','Merch')}</nav>
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

  function openEditLook(){
    if(!state.selectedImage) return;
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
    let lastText='';let newImg=null;let busy=false;
    const close=()=>backdrop.remove();
    function draw(phase){
      const name=escapeHtml(state.name||'Your agent');
      const left=Math.max(0,2-state.editUses);
      const inner=phase==='form'
        ? `<div class="el-body"><div class="el-current"><img src="${escapeHtml(state.selectedImage)}" alt=""><span>Current look</span></div>
           <div class="el-form"><p>Tweak the current design, or describe something new and hatch it fresh. <b class="el-left">${left} redesign${left===1?'':'s'} left</b></p>
           <textarea class="look-field" id="el-text" maxlength="400" placeholder="e.g. give it a red scarf and a captain’s hat — or describe a whole new look" ${left?'':'disabled'}>${escapeHtml(lastText)}</textarea>
           <div class="el-err" hidden>That didn’t hatch — please try again.</div>
           ${left?`<div class="actions"><button class="btn btn-secondary" data-el="edit">✎ Edit this photo</button><button class="btn btn-primary" data-el="new">✦ Hatch a new look</button></div>`
                 :`<div class="merch-pay">${ci.key} Please pay for your agent to keep redesigning its look.</div>`}</div></div>`
        : `<div class="el-hatch">${hx6Shell('el-egg')}<p class="el-note">Hatching the new look…</p>
           <div class="actions el-ready" style="display:none"><button class="btn btn-secondary" data-el="again">Try another</button><button class="btn btn-primary" data-el="apply">Use this look →</button></div></div>`;
      backdrop.innerHTML=`<section class="modal el-modal" role="dialog" aria-modal="true"><div class="modal-top"><div><span class="eyebrow">Your agent</span><h2>${name}’s look</h2></div><button class="close" aria-label="Close">×</button></div>${inner}</section>`;
      backdrop.querySelector('.close').onclick=close;backdrop.onclick=e=>{if(e.target===backdrop)close()};
      backdrop.querySelectorAll('[data-el]').forEach(b=>b.onclick=()=>act(b.dataset.el));
      const ta=backdrop.querySelector('#el-text');if(ta)ta.focus();
    }
    async function act(a){
      if(a==='again'){draw('form');return;}
      if(a==='apply'){
        if(!newImg)return;
        state.selectedImage=newImg;
        if(state.variant!==null&&state.slots[state.variant])state.slots[state.variant].image=newImg;
        // the whole marketplace re-dresses around the new character
        state.marketImages={};state.marketStarted=false;
        close();render();generateMarket();return;
      }
      if(busy)return;
      if(state.editUses>=2){draw('form');return;}
      const ta=backdrop.querySelector('#el-text');const text=(ta?ta.value.trim():'');
      if(text.length<4){if(ta){ta.focus();ta.setAttribute('aria-invalid','true');}return;}
      lastText=text;busy=true;newImg=null;
      draw('hatch');
      const img=a==='edit'
        ? await fetchImage({brief:text,role:`Apply this change while keeping everything else about the character the same: ${text}.`,image:state.selectedImage,name:state.name,company:co(),industry:industryLabel,variant:0})
        : await fetchImage({brief:`${text}. Give it ${DESIGN_AXES.build[Math.floor(Math.random()*4)]}, ${DESIGN_AXES.face[Math.floor(Math.random()*4)]} and ${DESIGN_AXES.style[Math.floor(Math.random()*4)]}.`,name:state.name,role:'',company:co(),industry:industryLabel,variant:0});
      busy=false;
      if(!backdrop.isConnected)return;
      if(!img){draw('form');const err=backdrop.querySelector('.el-err');if(err)err.hidden=false;return;}
      state.editUses++;   // a successful generation consumes one of the two redesigns
      newImg=img;
      const scene=backdrop.querySelector('.el-egg');const pop=scene&&scene.querySelector('.hx6-pop');
      if(pop){const arm=()=>{scene.classList.add('go');setTimeout(()=>{const r=backdrop.querySelector('.el-ready');const n=backdrop.querySelector('.el-note');if(r)r.style.display='flex';if(n)n.textContent='Hatched — keep it?';},5100);};
        pop.onload=arm;pop.onerror=()=>{draw('form');};pop.src=img;if(pop.complete&&pop.naturalWidth)arm();}
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
  function showAgent(id){const agent=catalog.find(a=>a.id===id);if(!agent)return;const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="agent-title"><div class="modal-top"><div><span class="eyebrow">Agent profile</span><h2 id="agent-title">${agent.name}</h2></div><button class="close" aria-label="Close agent profile">×</button></div><p>${agent.summary}</p><div class="profile-cols"><div><h3>What this agent can do for ${escapeHtml(co())}</h3><div class="checks">${agent.outcomes.map(o=>`<div class="check"><i>✓</i><span>${o}</span></div>`).join('')}</div></div><div class="profile-art"><img src="${escapeHtml(state.marketImages[agent.id]||agent.portrait)}" alt="${agent.name}"></div></div><h3>Available MCP connections</h3><p>These secure connectors let the agent work with your existing systems while respecting approvals and permissions.</p><div class="mcp-list">${agent.mcps.map(mcpChip).join('')}</div><h3>Works well with</h3><p>Agents that share hand-offs with ${agent.name} — hatch them together as a team.</p><div class="mate-row">${(WORKS_WITH[agent.id]||[]).map(mid=>{const m=catalog.find(a=>a.id===mid);if(!m)return '';const av=state.marketImages[m.id]||m.portrait;return `<button class="mate" data-mate="${m.id}"><span class="mate-ava"><img src="${escapeHtml(av)}" alt=""></span><span class="mate-meta"><b>${m.name}</b><i>${m.team}</i></span></button>`;}).join('')}</div></section>`;document.body.appendChild(backdrop);const close=()=>backdrop.remove();backdrop.querySelector('.close').onclick=close;backdrop.querySelectorAll('[data-mate]').forEach(b=>b.onclick=()=>{close();showAgent(b.dataset.mate);});backdrop.onclick=e=>{if(e.target===backdrop)close()};document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc)}},{once:true});}
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
    return fetchImage({brief:designBrief(variant),name:state.name,role:context,company:co(),industry:industryLabel,variant});
  }
  // Re-skin every marketplace agent in the chosen look, each dressed for its own job.
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
    await Promise.all(agents.map(async (agent,idx)=>{
      let img = baked[agent.id];
      if(!img && useLive) img = await fetchImage({brief:state.look,name:agent.name,role:agent.scene,image:ref,company:co(),industry:industryLabel,variant:state.variant||0});
      const minMs=1100+idx*500;const wait=Math.max(0,minMs-(Date.now()-started));if(wait)await sleep(wait);  // let the loader show
      if(!img){const thumb=root.querySelector(`[data-thumb="${agent.id}"]`);if(thumb){thumb.innerHTML=`<img src="${agent.portrait}" alt="${escapeHtml(agent.name)}">`;thumb.classList.remove('is-loading');}return;}
      state.marketImages[agent.id]=img;
      const thumb = root.querySelector(`[data-thumb="${agent.id}"]`);
      if(thumb){thumb.innerHTML=`<img src="${escapeHtml(img)}" alt="${escapeHtml(agent.name)}">`;thumb.classList.remove('is-loading');thumb.classList.add('is-generated');}
    }));
  }
  // Exact homepage hero hatch (index.html): egg rocks, crack walks the seam, lid
  // shatters into shards, the design pops out. Runs when each design's image is ready.
  async function generateAgents(){
    const lookTa=document.getElementById('agent-look');if(lookTa&&lookTa.value.trim())state.look=lookTa.value.trim();
    dealDesignAxes();
    state.slots=[null,null,null];state.variant=null;state.selectedImage='';state.step=2;render();
    const refreshBar=()=>{const bar=root.querySelector('.hatch-actions');if(bar){bar.innerHTML=hatchActionsBar();bind();}};
    await Promise.all([0,1,2].map(async i=>{
      const image=await fetchPortrait(i);
      state.slots[i]={status:'ready',image};
      const scene=root.querySelector(`.hx6[data-i="${i}"]`);
      if(scene){const pop=scene.querySelector('.hx6-pop');if(pop){
        const arm=()=>scene.classList.add('go');
        pop.onload=arm;
        pop.onerror=()=>{pop.onerror=null;pop.src='/hatchy-pop.webp';};  // never leave an egg stuck closed
        pop.src=image||'/hatchy-pop.webp';
        if(pop.complete&&pop.naturalWidth)arm();
      }}
      const cell=root.querySelector(`.egg-cell[data-egg="${i}"]`);if(cell)cell.classList.add('is-ready');
      refreshBar();               // selectable the moment the first design is out
      await sleep(5000);
    }));
    celebrate();
    refreshBar();
  }
  function bind(){
    root.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
      const a=el.dataset.action;
      if(a==='back'){state.step=Math.max(0,state.step-1);render()}
      if(a==='next'){state.step++;render()}
      if(a==='generate'){const input=document.getElementById('agent-name');const name=input.value.trim();if(!name){input.focus();input.setAttribute('aria-invalid','true');return}state.name=name;const coIn=document.getElementById('agent-co');if(coIn)state.company=coIn.value.trim();const bizIn=document.getElementById('agent-biz');state.biz=bizIn?bizIn.value.trim():'';const lookTa=document.getElementById('agent-look');state.look=(lookTa&&lookTa.value.trim())||'a friendly rounded robot in blue and white';generateAgents()}
      if(a==='redesign'){state.step=1;render()}
      if(a==='open-connect'){openConnectDialog()}
      if(a==='chat-send'){const box=document.getElementById('chat-box');const t=box?box.value.trim():'';if(!t)return;const i=state.chatActive??8;
        const FREE_TURNS=5;
        const prior=(state.chatExtra[i]||[]).filter(m=>m[0]==='me').length;
        const scrollFocus=()=>{const th=document.getElementById('chat-thread');if(th)th.scrollTop=th.scrollHeight;document.getElementById('chat-box')?.focus()};
        if(prior>=FREE_TURNS){state.chatExtra[i]=(state.chatExtra[i]||[]).concat([['me',t],['pay','Please pay for your agent in order to continue talking.']]);render();scrollFocus();return;}
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
        document.querySelectorAll('.confetti').forEach(c=>c.remove());state.step=3;render();generateMarket()}
      if(a==='reset'){state.step=0;state.name='';state.company='';state.biz='';state.look='';state.slots=[];state.variant=null;state.selectedImage='';state.done=false;state.marketImages={};state.marketStarted=false;state.tab='profiles';state.chatActive=0;state.chatExtra={};state.chatTyping={};state.editUses=0;state.merch={robot:'__you',product:'tee',color:0,size:'S',qty:1,basket:[],note:false};document.querySelectorAll('.confetti').forEach(c=>c.remove());render()}
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
    root.querySelectorAll('[data-look-index]').forEach(el=>el.onclick=()=>{const ta=document.getElementById('agent-look');if(ta){ta.value=lookSeeds[+el.dataset.lookIndex].text;ta.focus()}});
    root.querySelectorAll('[data-create]').forEach(el=>el.onclick=()=>{document.querySelectorAll('.create-pop').forEach(p=>p.remove());const pop=document.createElement('div');pop.className='create-pop';pop.innerHTML=`${ci.key}<span>Please pay for your agent to see what a new profile would look like.</span>`;document.body.appendChild(pop);setTimeout(()=>pop.classList.add('show'),10);setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>pop.remove(),300)},4600);});
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
    const cb=document.getElementById('chat-box');if(cb)cb.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('[data-action="chat-send"]').click();}};
    const yours=root.querySelector('.p-card.is-yours');if(yours){yours.style.cursor='pointer';yours.onclick=()=>openEditLook();yours.tabIndex=0;yours.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEditLook()}};}
    root.querySelectorAll('[data-agent]').forEach(el=>{el.onclick=()=>showAgent(el.dataset.agent);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showAgent(el.dataset.agent)}};});
    const search=document.getElementById('market-search');if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();let visible=0;root.querySelectorAll('.p-card[data-search]').forEach(c=>{const show=!q||c.dataset.search.includes(q);c.hidden=!show;if(show)visible++;});const yours=root.querySelector('.p-card.is-yours');if(yours)yours.hidden=!!q;root.querySelectorAll('.board-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.p-card')].some(c=>!c.hidden);});const empty=document.getElementById('board-empty');if(empty)empty.hidden=visible>0;};
    const input=document.getElementById('agent-name');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('agent-biz')?.focus()}};
  }
  root.dataset.build=BUILD;console.info('Agent Hatchers prototype · build '+BUILD);
  render();
})();
