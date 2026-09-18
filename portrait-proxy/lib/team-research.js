// Team research: work out which agents a specific business would actually want.
//
// Two stages, because a model asked to "pick six agents" in one breath reaches for the
// generic ones. Stage one RESEARCHES the business — its customers, the roles it hires for,
// what those people do all day, the software it runs on, where the hours and money leak —
// with a web search when one is available (and always when the prospect gave a website).
// Stage two DESIGNS six agents from that brief: each one is a named role for this business
// ("Recall & Rebooking Agent", "HICAPS Claims Agent"), not a catalog label, and is pinned to
// the closest catalog `base` so the prototype can dress it, connect it and hand work between
// agents the way it already does.
//
// Pure functions live here so they can be unit-tested with a fake model; the Vercel handler
// in api/prototype-team.js does HTTP and CORS only.

export const MAX_TEAM = 6;
// Ten more roles, just as specific, for the marketplace — the shelf the prospect browses after
// meeting the core six. Pinned to bases too (repeats allowed), never duplicating a team role.
export const MAX_MORE = 10;

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const list = (v, n, len) => (Array.isArray(v) ? v : []).map(x => clean(x).slice(0, len)).filter(Boolean).slice(0, n);

// Models wrap JSON in fences or prose more often than you'd like; dig the object out.
export function parseJson(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const a = cleaned.indexOf('{'), b = cleaned.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(cleaned.slice(a, b + 1)); } catch {} }
  return null;
}

// What the prospect told us, trimmed to sane sizes. `business` is their own words, `industry`
// the dropdown pick, `tools` the systems they said they already use, `website` optional.
export function normaliseInput(body) {
  body = body && typeof body === 'object' ? body : {};
  const website = clean(body.website).replace(/^https?:\/\//i, '').replace(/\/.*$/, '').slice(0, 120);
  return {
    business: clean(body.business).slice(0, 240),
    industry: clean(body.industry).slice(0, 60),
    company: clean(body.company).slice(0, 80),
    website: /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(website) ? website.toLowerCase() : '',
    tools: list(body.tools, 40, 30),
    connectors: list(body.connectors, 80, 30),
    roster: (Array.isArray(body.roster) ? body.roster : []).slice(0, 16).map(a => ({
      id: clean(a && a.id).slice(0, 30),
      name: clean(a && a.name).slice(0, 40),
      summary: clean(a && a.summary).slice(0, 200)
    })).filter(a => a.id && a.name)
  };
}

// Agent Hatchers sells to Australian businesses, and the prospect rarely says where they are.
// Without this, "Preston" becomes a Lancashire town and a plumber gets CP12 certificates,
// boilers and congestion charges instead of compliance certificates, hot-water units and tolls.
const LOCALE_NOTE = `Assume the business is in Australia unless the website or description clearly says otherwise: ` +
  `Australian place names, terms, regulators, health funds, awards, tax (BAS, GST, ATO), industry bodies, ` +
  `suppliers and software. Never assume the UK or the US.`;

function subject(input) {
  const who = input.company ? `"${input.company}"` : 'the prospect';
  const what = input.business ? `a ${input.business}` : (input.industry ? `a business in ${input.industry}` : 'a small business');
  return `${who}, ${what}${input.industry && input.business ? ` (${input.industry})` : ''}${input.website ? `, website ${input.website}` : ''}`;
}

// ---------- Stage 1: research the business ----------
export function buildResearchPrompt(input) {
  const system =
    `You are a researcher preparing a brief for an operations consultant who is about to design AI agents ` +
    `for one specific small business. Your job is to understand THAT business properly before anyone ` +
    `proposes anything. Think like someone who has worked a week inside it. ${LOCALE_NOTE}\n\n` +
    `Research and write down, concretely and specifically for this kind of business${input.website ? ' and, where you can find it, this actual company' : ''}:\n` +
    `- who its customers are and how they arrive (walk-in, referral, tender, online, repeat)\n` +
    `- what a normal week is made of: the recurring jobs, the admin behind each one, the busy and quiet times\n` +
    `- the roles it hires for or the owner ends up covering (receptionist, estimator, bookkeeper, dispatcher, ` +
    `practice manager, account manager, warehouse hand…): what each one does all day and which parts are ` +
    `repetitive, chased, copied between systems or forgotten\n` +
    `- the software and systems this kind of business genuinely runs on (industry-specific ones by name — ` +
    `practice management, job management, POS, claims portals, tender portals, property CRMs — as well as ` +
    `accounting, email and chat)\n` +
    `- where hours leak and where money leaks: no-shows, unquoted enquiries, quotes never followed up, ` +
    `late invoices, stock-outs, rework, compliance paperwork, reviews never asked for\n` +
    `- any regulation, compliance or reporting that creates recurring admin\n` +
    (input.website ? `- facts about this actual company from its website: services, locations, team size, who it serves, tone\n` : '') +
    `\nBe specific to this business type. A dentist's week is recalls, claims and sterilisation logs; a ` +
    `plumber's is quotes, job cards, parts and invoicing from the van; a freight forwarder's is bookings, ` +
    `customs docs and rate quotes. Do not describe a generic small business.\n\n` +
    `Return ONLY a JSON object, no prose, no markdown, shaped exactly like:\n` +
    `{"business":"one line saying what this business is","customers":"one or two sentences",` +
    `"week":["...","..."],"roles":[{"title":"...","day":"what they do all day","drudgery":"the repetitive or ` +
    `chased parts"}],"software":["..."],"leaks":["..."],"rules":["..."],"facts":["..."]}\n` +
    `Rules: 3-6 items in "week", 4-7 "roles", 4-10 "software" (real product names), 4-8 "leaks", 0-4 "rules", ` +
    `"facts" only for things you actually found about this company (else []). Everyday English, no marketing ` +
    `language, no mention of AI or agents.`;
  const user =
    `The business: ${subject(input)}.` +
    (input.tools.length ? `\nThey told us they already use: ${input.tools.join(', ')}.` : '') +
    (input.website ? `\nLook up ${input.website} and what a business like this deals with day to day.` : `\nLook into what a business like this deals with day to day.`);
  return { system, user };
}

export function validateBrief(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const roles = (Array.isArray(obj.roles) ? obj.roles : []).map(r => ({
    title: clean(r && r.title).slice(0, 60),
    day: clean(r && r.day).slice(0, 300),
    drudgery: clean(r && r.drudgery).slice(0, 300)
  })).filter(r => r.title && r.day).slice(0, 8);
  const brief = {
    business: clean(obj.business).slice(0, 200),
    customers: clean(obj.customers).slice(0, 400),
    week: list(obj.week, 8, 200),
    roles,
    software: list(obj.software, 12, 40),
    leaks: list(obj.leaks, 10, 200),
    rules: list(obj.rules, 6, 200),
    facts: list(obj.facts, 8, 200)
  };
  // A brief with no roles and no leaks tells the designer nothing — treat it as missing.
  if (brief.roles.length < 2 || brief.leaks.length < 2) return null;
  return brief;
}

export function briefToText(brief) {
  if (!brief) return '';
  const lines = [];
  if (brief.business) lines.push(`What it is: ${brief.business}`);
  if (brief.customers) lines.push(`Customers: ${brief.customers}`);
  if (brief.facts.length) lines.push(`Known about this company: ${brief.facts.join('; ')}`);
  if (brief.week.length) lines.push(`A normal week: ${brief.week.join('; ')}`);
  if (brief.roles.length) lines.push(`Roles and their days:\n` + brief.roles.map(r => `  - ${r.title}: ${r.day}${r.drudgery ? ` Repetitive/chased: ${r.drudgery}` : ''}`).join('\n'));
  if (brief.software.length) lines.push(`Systems it runs on: ${brief.software.join(', ')}`);
  if (brief.leaks.length) lines.push(`Where hours and money leak: ${brief.leaks.join('; ')}`);
  if (brief.rules.length) lines.push(`Compliance/admin: ${brief.rules.join('; ')}`);
  return lines.join('\n');
}

// ---------- Stage 2: design the agents from the brief ----------
export function buildDesignPrompt(input, brief) {
  const co = input.company || 'the business';
  const system =
    `You are a sharp operations consultant who has worked inside hundreds of small businesses. You are ` +
    `designing the AI agent team for ${subject(input)}. ${LOCALE_NOTE} ` +
    (brief ? `A researcher has already written a brief on this business — design from it, not from generalities.\n\n` +
      `RESEARCH BRIEF\n${briefToText(brief)}\n\n` :
      `No research brief is available, so reason carefully yourself about what this specific kind of business ` +
      `does all week, who it hires, what software it runs on and where its hours and money leak.\n\n`) +
    `Design the ${MAX_TEAM} agents that would make the biggest difference to THIS business, most valuable ` +
    `first, and then ${MAX_MORE} MORE agents for its marketplace — the next jobs down the list, each just as ` +
    `specific (a seasonal job, a compliance chore, a supplier, a channel, a report someone builds by hand). ` +
    `Each agent is a ROLE in this business — the job a person there is doing by hand today — not a ` +
    `department. Name it for that job, in words the owner would use. Good: "Recall & Rebooking Agent", ` +
    `"Quote Chaser Agent", "HICAPS Claims Agent", "Tender Deadline Agent", "Job Card Agent". Bad (too generic, ` +
    `never use these or anything like them): "Support Agent", "Operations Agent", "Sales Agent", "Marketing ` +
    `Agent", "Document Agent".\n\n` +
    `Every agent must be pinned to the closest BASE from this catalog (exact id — it decides the agent's ` +
    `artwork, category and which agents it hands work to; each base at most once within "team", repeats ` +
    `allowed in "more"):\n` +
    input.roster.map(a => `- id "${a.id}" — ${a.name}: ${a.summary}`).join('\n') +
    (input.tools.length ? `\n\n${co} already uses: ${input.tools.join(', ')}. Build around those — name them in "mcps" first and prefer them over rivals.` : '') +
    (input.connectors.length ? `\n\nConnectors the product already has logos for (use these exact names when one fits; add real industry-specific systems by name when the job needs them): ${input.connectors.join(', ')}` : '') +
    `\n\nReturn ONLY a JSON object, no prose, no markdown, shaped exactly like:\n` +
    `{"intro":"...","team":[{"base":"catalog id","name":"... Agent","does":"...","job":"...","outcomes":["...","...","...","...","..."],"mcps":["..."],"scene":"..."}],"more":[{...same shape...}]}\n` +
    `Rules:\n` +
    `- "intro": one sentence (max 28 words) that shows you understand this particular business — a concrete ` +
    `observation about its week, not a compliment, not generic.\n` +
    `- "team": exactly ${MAX_TEAM} entries, distinct bases, best first, no two agents doing the same job.\n` +
    `- "more": exactly ${MAX_MORE} further entries, same shape and same specificity, none overlapping a "team" ` +
    `role or each other. Spread them across the business's week: front desk, money, suppliers, staff, ` +
    `compliance, marketing channels, seasonal peaks, reporting.\n` +
    `- "name": 2-4 words ending in "Agent", specific to this business's work. Never the catalog names.\n` +
    `- "does": one sentence (max 22 words), plain everyday English, second person ("your"), naming the real ` +
    `customers, jobs, paperwork, stock or systems THIS business deals with. No jargon, no "AI", no "leverage".\n` +
    `- "job": 2-5 words, lowercase, present tense — the hand-off this agent owns (e.g. "chases the quotes", ` +
    `"fills the recall gaps").\n` +
    `- "outcomes": exactly 5, each one sentence (max 16 words), concrete things the agent will do for ${co}, ` +
    `naming the actual systems, documents, customers or moments from the brief. Not five ways of saying the ` +
    `same thing.\n` +
    `- "mcps": 3-5 systems it plugs into, most important first, as short real product names (max 3 words, ` +
    `e.g. "HICAPS", "CargoWise", "Dental4Windows") — industry-specific ones included, no brackets or ` +
    `explanations.\n` +
    `- "scene": one sentence starting "It is a" describing the agent as a small friendly robot dressed and ` +
    `equipped for THIS job in THIS business's setting — its outfit, one or two props, the place (e.g. "It is a ` +
    `recall agent wearing dental scrubs, holding a ringing phone and a stack of appointment cards at a bright ` +
    `clinic front desk"). Distinct outfit, props and place for each agent.`;
  const user = `Design the team for ${subject(input)}.`;
  return { system, user };
}

// One agent entry from the model → a clean record, or null. `usedNames` keeps names unique
// across team and more; `usedBases` (team only) keeps bases distinct.
function cleanAgent(t, byId, stockNames, usedNames, usedBases) {
  const id = clean(t && (t.base || t.id));
  const base = byId.get(id);
  if (!base || (usedBases && usedBases.has(id))) return null;
  let name = clean(t && t.name).replace(/[.!]+$/, '').slice(0, 44);
  if (name && !/agent$/i.test(name)) name = `${name} Agent`;
  const does = clean(t && t.does).slice(0, 170);
  const job = clean(t && t.job).replace(/\.$/, '').slice(0, 48);
  const outcomes = list(t && t.outcomes, 5, 140).filter(o => o.length > 8);
  const mcps = [...new Set(list(t && t.mcps, 5, 30))];
  const scene = clean(t && t.scene).slice(0, 300);
  // The whole point is a non-generic team: a stock label is not an answer.
  if (name.length < 6 || stockNames.has(name.toLowerCase()) || usedNames.has(name.toLowerCase())) return null;
  if (does.length <= 12 || job.length <= 2) return null;
  usedNames.add(name.toLowerCase());
  if (usedBases) usedBases.add(id);
  return { id, name, does, job, outcomes: outcomes.length >= 4 ? outcomes : [], mcps, scene: /^it is a/i.test(scene) ? scene : '' };
}

export function validateTeam(obj, roster) {
  if (!obj || !Array.isArray(obj.team)) return null;
  const byId = new Map(roster.map(a => [a.id, a]));
  const stockNames = new Set(roster.map(a => a.name.toLowerCase()));
  const usedNames = new Set(), usedBases = new Set();
  const team = [];
  for (const t of obj.team) {
    const a = cleanAgent(t, byId, stockNames, usedNames, usedBases);
    if (a) team.push(a);
    if (team.length >= MAX_TEAM) break;
  }
  if (team.length < 4) return null;
  // Marketplace extras: same bar, bases may repeat, never a team role again. Optional — a
  // short or missing list just means the marketplace shows the stock catalog after the team.
  const more = [];
  for (const t of (Array.isArray(obj.more) ? obj.more : [])) {
    const a = cleanAgent(t, byId, stockNames, usedNames, null);
    if (a) more.push({ ...a, base: a.id, id: `more-${more.length + 1}` });
    if (more.length >= MAX_MORE) break;
  }
  return { team, more, intro: clean(obj.intro).slice(0, 240) };
}

// ---------- Orchestration ----------
// `callModel({system, user, ...params})` → { ok, status, error, text }. Injected so tests
// can fake the model. `webSearch` adds OpenRouter's web plugin to the research call.
export async function researchTeam(input, { callModel, researchModel, designModel, webSearch = true, log = null }) {
  const trace = [];
  const note = (stage, r, valid) => trace.push({ stage, model: r.model, status: r.status, len: (r.text || '').length, error: r.error || null, valid: !!valid });

  // Stage 1 — research (web-grounded first, plain second). Failure here just means the
  // designer works without a brief; it never blocks a team.
  let brief = null;
  const research = buildResearchPrompt(input);
  // gemini-3.7-flash refuses `reasoning:{enabled:false}` ("Reasoning is mandatory"), so every
  // attempt keeps reasoning on at low effort and leaves budget for the thinking tokens.
  const researchAttempts = [];
  if (webSearch) researchAttempts.push({ model: researchModel, max_tokens: 8000, plugins: [{ id: 'web', max_results: 5 }], reasoning: { effort: 'low' } });
  researchAttempts.push({ model: researchModel, max_tokens: 8000, reasoning: { effort: 'low' }, response_format: { type: 'json_object' } });
  researchAttempts.push({ model: researchModel, max_tokens: 8000 });
  for (const params of researchAttempts) {
    let r;
    try { r = await callModel({ ...research, ...params }); } catch (e) { r = { ok: false, status: 0, error: String(e && e.message || e), text: '', model: params.model }; }
    brief = r.ok ? validateBrief(parseJson(r.text)) : null;
    note('research', { ...r, model: params.model }, brief);
    if (brief) break;
  }

  // Stage 2 — design. Reasoning models can spend the budget thinking and return nothing
  // visible, so escalate: strict JSON mode first, then plain, then default reasoning.
  const design = buildDesignPrompt(input, brief);
  const designAttempts = [
    { model: designModel, max_tokens: 14000, reasoning: { effort: 'low' }, response_format: { type: 'json_object' } },
    { model: designModel, max_tokens: 14000, reasoning: { effort: 'low' } },
    { model: designModel, max_tokens: 14000 }
  ];
  for (const params of designAttempts) {
    let r;
    try { r = await callModel({ ...design, ...params }); } catch (e) { r = { ok: false, status: 0, error: String(e && e.message || e), text: '', model: params.model }; }
    const out = r.ok ? validateTeam(parseJson(r.text), input.roster) : null;
    note('design', { ...r, model: params.model }, out);
    if (out) {
      if (log) log({ ok: true, trace });
      return { ok: true, ...out, brief, researched: !!brief, trace };
    }
  }
  if (log) log({ ok: false, trace });
  return { ok: false, trace };
}
