window.PROTOTYPE_DATA = {
  prospects: {
    demo: {
      company: "Demo Company",
      industry: "Construction & Property",
      market: "construction",
      welcome: "Build your first agent together, hatch it live, then explore a marketplace shaped around construction and property workflows."
    }
  },
  designs: [
    { id: "blue", name: "Orbit", description: "Calm, capable and precise", image: "/hatchy-sales.webp", filter: "none" },
    { id: "aqua", name: "Ripple", description: "Bright, curious and quick", image: "/hatchy-support.webp", filter: "hue-rotate(18deg) saturate(1.08)" },
    { id: "violet", name: "Cosmo", description: "Creative and considered", image: "/hatchy-document.webp", filter: "hue-rotate(72deg) saturate(1.16)" },
    { id: "sunset", name: "Spark", description: "Warm, energetic and bold", image: "/hatchy-website.webp", filter: "hue-rotate(158deg) saturate(1.22)" }
  ],
  agents: {
    lead: {
      name: "Lead Scout", category: "Sales", image: "/hatchy-sales.webp",
      summary: "Researches new enquiries, qualifies the opportunity and prepares a relevant first response before the lead goes cold.",
      mcps: ["HubSpot", "Salesforce", "LinkedIn", "Apollo", "Gmail", "Slack"],
      capabilities: ["Research every new prospect automatically", "Score leads against your ideal customer profile", "Draft outreach in your company voice", "Create and update CRM records", "Schedule follow-ups and flag hot opportunities"]
    },
    documents: {
      name: "Document Builder", category: "Documents", image: "/hatchy-document.webp",
      summary: "Turns project information into polished proposals, reports and client documents using your approved templates.",
      mcps: ["Google Drive", "Microsoft 365", "Notion", "Dropbox", "DocuSign", "Slack"],
      capabilities: ["Create proposals from approved templates", "Turn meeting notes into project briefs", "Maintain consistent tone and formatting", "Route drafts to the right approver", "Export finished documents as PDF or DOCX"]
    },
    invoices: {
      name: "Invoice Checker", category: "Finance", image: "/hatchy-invoice.webp",
      summary: "Reads invoices, matches them to records, flags unusual charges and prepares clean approval queues.",
      mcps: ["Xero", "MYOB", "QuickBooks", "Google Drive", "Gmail", "Microsoft Teams"],
      capabilities: ["Extract supplier and line-item details", "Match invoices against purchase records", "Detect duplicates and unusual charges", "Code costs to the correct project", "Prepare an approval queue with source links"]
    },
    support: {
      name: "Client Concierge", category: "Customer service", image: "/hatchy-support.webp",
      summary: "Triages client enquiries, drafts helpful answers and makes sure urgent or sensitive requests reach a human quickly.",
      mcps: ["Zendesk", "Intercom", "Gmail", "Outlook", "Slack", "Microsoft Teams"],
      capabilities: ["Classify and prioritise every enquiry", "Draft replies using your knowledge base", "Detect urgency and client sentiment", "Escalate sensitive cases to a human", "Summarise recurring issues and trends"]
    },
    website: {
      name: "Website Keeper", category: "Marketing", image: "/hatchy-website.webp",
      summary: "Prepares safe website updates from plain-English requests, with a preview and approval step before publishing.",
      mcps: ["WordPress", "Webflow", "GitHub", "Google Analytics", "Search Console", "Slack"],
      capabilities: ["Draft new pages and content updates", "Apply brand voice and SEO standards", "Preview every proposed website change", "Wait for approval before publishing", "Report traffic and conversion changes"]
    },
    projects: {
      name: "Project Pulse", category: "Operations", image: "/hatchy-routing.webp",
      summary: "Keeps work moving by monitoring milestones, preparing status updates and surfacing blockers before they become delays.",
      mcps: ["Procore", "Autodesk", "Monday.com", "Asana", "Jira", "Microsoft Teams"],
      capabilities: ["Compile live project status summaries", "Track milestones, owners and due dates", "Surface blockers and overdue actions", "Prepare stakeholder progress reports", "Route new work to the right team member"]
    },
    compliance: {
      name: "Compliance Monitor", category: "Risk", image: "/hatchy-success.webp",
      summary: "Checks documents and workflows against your rules, records evidence and highlights anything that needs human review.",
      mcps: ["SharePoint", "Google Drive", "Notion", "DocuSign", "Jira", "Slack"],
      capabilities: ["Check records against defined requirements", "Flag missing or expired documentation", "Maintain an auditable evidence trail", "Prepare recurring compliance summaries", "Escalate exceptions to the responsible owner"]
    },
    scheduling: {
      name: "Schedule Coordinator", category: "Operations", image: "/hatchy-routing.webp",
      summary: "Coordinates people, appointments and resources while keeping calendars and project systems aligned.",
      mcps: ["Google Calendar", "Outlook", "Deputy", "ServiceM8", "Monday.com", "Microsoft Teams"],
      capabilities: ["Find workable times across busy calendars", "Assign jobs using skills and availability", "Send confirmations and reminders", "Detect clashes before they affect delivery", "Keep schedules and project records in sync"]
    }
  },
  markets: {
    construction: ["projects", "documents", "invoices", "scheduling", "compliance", "lead"],
    professional: ["lead", "documents", "support", "invoices", "scheduling", "website"],
    retail: ["support", "lead", "invoices", "website", "documents", "scheduling"],
    healthcare: ["scheduling", "documents", "support", "compliance", "invoices", "projects"]
  }
};
