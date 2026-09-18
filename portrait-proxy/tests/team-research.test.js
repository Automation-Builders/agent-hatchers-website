import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseInput, buildResearchPrompt, buildDesignPrompt, validateBrief, validateTeam, researchTeam, parseJson } from '../lib/team-research.js';

const ROSTER = [
  { id: 'logistics', name: 'Logistics Agent', summary: 'Tracks every order and shipment.' },
  { id: 'marketing', name: 'Marketing Agent', summary: 'Runs your campaigns end to end.' },
  { id: 'support', name: 'Support Agent', summary: 'Triages customer enquiries.' },
  { id: 'returns', name: 'Returns Agent', summary: 'Handles returns and refunds.' },
  { id: 'sales', name: 'Sales Agent', summary: 'Finds and follows up leads.' },
  { id: 'inventory', name: 'Inventory Agent', summary: 'Watches stock and reorders.' },
  { id: 'invoices', name: 'Invoice Agent', summary: 'Reads, checks and chases invoices.' },
  { id: 'documents', name: 'Document Agent', summary: 'Drafts and files documents.' },
  { id: 'website', name: 'Website Agent', summary: 'Keeps website content current.' },
  { id: 'operations', name: 'Operations Agent', summary: 'Keeps jobs on schedule.' }
];

const DENTAL_BRIEF = {
  business: 'A two-chair family dental clinic in suburban Melbourne',
  customers: 'Families and older regulars who arrive by recall, referral or Google, mostly bulk-billed kids and private adults.',
  week: ['30-40 check-ups and cleans a day across two chairs', 'recall list worked by the receptionist between calls', 'HICAPS claims at the desk after every appointment', 'sterilisation logs and stock counts on Fridays'],
  roles: [
    { title: 'Receptionist', day: 'Answers the phone, books and confirms appointments, works the recall list, processes HICAPS claims.', drudgery: 'Ringing overdue recalls, chasing no-shows, re-keying claims that bounce.' },
    { title: 'Practice manager', day: 'Rosters, supplier orders, health-fund reconciliations, complaints.', drudgery: 'Matching health-fund remittances to Xero, reordering consumables.' },
    { title: 'Treatment coordinator', day: 'Explains treatment plans, quotes and payment plans, follows up unaccepted plans.', drudgery: 'Chasing patients who never booked their crown.' }
  ],
  software: ['Dental4Windows', 'HICAPS', 'Xero', 'Gmail', 'Dentally'],
  leaks: ['Unaccepted treatment plans never followed up', 'No-shows on Monday mornings', 'Recall list only worked when the phone is quiet', 'Bounced HICAPS claims re-keyed by hand'],
  rules: ['Sterilisation batch logs kept for audit'],
  facts: []
};

const DENTAL_TEAM = {
  intro: 'Your receptionist only gets to the recall list when the phone goes quiet, and unaccepted crowns quietly walk out the door.',
  team: [
    { base: 'support', name: 'Recall & Rebooking Agent', does: 'Rings and texts your overdue recalls, fills Monday gaps and confirms every appointment the day before.', job: 'fills the recall gaps', outcomes: ['Text every patient due a recall from Dental4Windows', 'Fill same-day gaps from the waitlist', 'Confirm tomorrow’s appointments by SMS', 'Rebook no-shows the same day', 'Report recall rate each Friday'], mcps: ['Dental4Windows', 'Gmail', 'Google Calendar'], scene: 'It is a recall agent wearing dental scrubs, holding a ringing phone and a stack of appointment cards at a bright clinic front desk.' },
    { base: 'invoices', name: 'HICAPS Claims Agent', does: 'Lodges your health-fund claims, fixes the ones that bounce and matches remittances to Xero.', job: 'settles the claims', outcomes: ['Lodge each HICAPS claim after the appointment', 'Re-lodge bounced claims with the right item codes', 'Match health-fund remittances to Xero invoices', 'Flag patients whose gap payment is outstanding', 'Send a weekly claims summary'], mcps: ['HICAPS', 'Xero', 'Dental4Windows'], scene: 'It is a claims agent wearing a cardigan and reading glasses, holding a health-fund card reader in a tidy back office.' },
    { base: 'sales', name: 'Treatment Plan Agent', does: 'Follows up every quoted crown, implant or aligner plan your patients have not booked yet.', job: 'chases the treatment plans', outcomes: ['List every unaccepted plan older than two weeks', 'Send a friendly follow-up with payment-plan options', 'Book the first appointment when they say yes', 'Tell the dentist which plans went cold', 'Track acceptance rate by treatment'], mcps: ['Dental4Windows', 'Gmail', 'Stripe'], scene: 'It is a treatment-plan agent wearing a smart blazer, holding a tablet showing a tooth diagram in a consult room.' },
    { base: 'inventory', name: 'Consumables Agent', does: 'Counts your gloves, composites and anaesthetic each week and drafts the Henry Schein order before you run out.', job: 'keeps the drawers stocked', outcomes: ['Track weekly usage of consumables', 'Draft the supplier order every Friday', 'Warn when anaesthetic is two weeks from running out', 'Check deliveries against the order', 'Flag price rises on repeat items'], mcps: ['Henry Schein', 'Xero', 'Google Sheets'], scene: 'It is a consumables agent wearing a lab coat, carrying a tray of gloves and composite tubes in a clinic storeroom.' },
    { base: 'documents', name: 'Sterilisation Log Agent', does: 'Keeps your autoclave batch logs, consent forms and audit paperwork complete and filed.', job: 'keeps the logs audit-ready', outcomes: ['Log each autoclave cycle against the batch', 'Chase unsigned consent forms before the appointment', 'Build the audit folder each month', 'Warn when a log has a gap', 'Keep policies current'], mcps: ['Google Drive', 'Dental4Windows', 'DocuSign'], scene: 'It is a log agent wearing a mask and hair net, holding a clipboard next to a steaming autoclave.' },
    { base: 'marketing', name: 'Google Reviews Agent', does: 'Asks happy patients for a Google review after their visit and drafts replies to every review you get.', job: 'grows the reviews', outcomes: ['Text a review link after each completed visit', 'Draft replies to new Google reviews', 'Flag a bad review within an hour', 'Report new reviews each month', 'Keep the Google profile hours current'], mcps: ['Google Business Profile', 'Gmail', 'Dental4Windows'], scene: 'It is a reviews agent wearing a bright polo shirt, holding a giant five-star sign outside the clinic door.' }
  ]
};

function fakeModel(script) {
  const calls = [];
  const callModel = async (params) => {
    calls.push(params);
    const step = script[Math.min(calls.length - 1, script.length - 1)];
    return typeof step === 'function' ? step(params) : step;
  };
  return { calls, callModel };
}
const ok = obj => ({ ok: true, status: 200, error: null, text: JSON.stringify(obj) });
const fail = (status = 500) => ({ ok: false, status, error: 'boom', text: '' });

test('normaliseInput scrubs the website to a bare host and keeps the rest', () => {
  const i = normaliseInput({ business: '  two-chair  dental clinic ', industry: 'Health & wellness', website: 'https://Smile-Dental.com.au/about?x=1', tools: ['Xero', ' Gmail '], roster: ROSTER });
  assert.equal(i.business, 'two-chair dental clinic');
  assert.equal(i.website, 'smile-dental.com.au');
  assert.deepEqual(i.tools, ['Xero', 'Gmail']);
  assert.equal(normaliseInput({ website: 'not a site' }).website, '');
  assert.equal(normaliseInput({ website: 'javascript:alert(1)' }).website, '');
});

test('the research prompt asks about roles, systems and leaks for THIS business, and the website when given', () => {
  const p = buildResearchPrompt(normaliseInput({ business: 'dental clinic', industry: 'Health & wellness', website: 'smile.com.au', tools: ['Xero'] }));
  for (const must of ['roles it hires for', 'software and systems', 'where hours leak', 'Do not describe a generic small business', 'facts about this actual company']) assert.match(p.system, new RegExp(must));
  assert.match(p.user, /Look up smile\.com\.au/);
  assert.match(p.user, /already use: Xero/);
  const noSite = buildResearchPrompt(normaliseInput({ business: 'plumber' }));
  assert.doesNotMatch(noSite.system, /facts about this actual company/);
});

test('the design prompt carries the brief in and bans the generic catalog names', () => {
  const p = buildDesignPrompt(normaliseInput({ business: 'dental clinic', roster: ROSTER, tools: ['Xero'], connectors: ['Gmail', 'Xero'] }), validateBrief(DENTAL_BRIEF));
  assert.match(p.system, /RESEARCH BRIEF/);
  assert.match(p.system, /Receptionist: Answers the phone/);
  assert.match(p.system, /Dental4Windows, HICAPS/);
  assert.match(p.system, /never use these[^\n]*"Support Agent"/);
  assert.match(p.system, /id "support" — Support Agent/);
  assert.match(p.system, /already uses: Xero/);
  const bare = buildDesignPrompt(normaliseInput({ business: 'plumber', roster: ROSTER }), null);
  assert.match(bare.system, /No research brief is available/);
});

test('validateBrief needs real roles and leaks', () => {
  const b = validateBrief(DENTAL_BRIEF);
  assert.equal(b.roles.length, 3);
  assert.equal(b.software[0], 'Dental4Windows');
  assert.equal(validateBrief({ business: 'x', roles: [], leaks: ['a', 'b'] }), null);
  assert.equal(validateBrief({ roles: [{ title: 'a', day: 'b' }, { title: 'c', day: 'd' }], leaks: [] }), null);
});

test('validateTeam keeps bespoke roles, drops stock labels and duplicate bases', () => {
  const out = validateTeam({
    intro: 'ok',
    team: [
      ...DENTAL_TEAM.team.slice(0, 4),
      { base: 'support', name: 'Second Support Thing', does: 'Duplicate base, must be dropped from the team.', job: 'dupe', outcomes: [], mcps: [] },
      { base: 'operations', name: 'Operations Agent', does: 'Generic label, must be dropped from the team.', job: 'generic', outcomes: [], mcps: [] },
      { base: 'website', name: 'Clinic Hours', does: 'Keeps your clinic hours and fee page current on the website.', job: 'keeps the site right', outcomes: ['one', 'two'], mcps: ['WordPress'], scene: 'not the right shape' },
      { base: 'nope', name: 'Ghost Agent', does: 'Base is not in the catalog so it cannot be dressed.', job: 'ghost', outcomes: [], mcps: [] }
    ]
  }, ROSTER);
  assert.deepEqual(out.team.map(t => t.id), ['support', 'invoices', 'sales', 'inventory', 'website']);
  assert.equal(out.team[0].name, 'Recall & Rebooking Agent');
  assert.equal(out.team[0].outcomes.length, 5);
  assert.equal(out.team[0].scene.slice(0, 7), 'It is a');
  const hours = out.team[4];
  assert.equal(hours.name, 'Clinic Hours Agent');       // gets the suffix
  assert.deepEqual(hours.outcomes, []);                 // too few outcomes → client uses its own
  assert.equal(hours.scene, '');                        // malformed scene → base artwork scene
  assert.equal(validateTeam({ team: DENTAL_TEAM.team.slice(0, 3) }, ROSTER), null, 'fewer than four usable agents is not a team');
});

test('researchTeam researches with web search first, then designs from the brief', async () => {
  const { calls, callModel } = fakeModel([ok(DENTAL_BRIEF), ok(DENTAL_TEAM)]);
  const input = normaliseInput({ business: 'two-chair dental clinic', industry: 'Health & wellness', website: 'smile.com.au', roster: ROSTER });
  const out = await researchTeam(input, { callModel, researchModel: 'r-model', designModel: 'd-model', webSearch: true });
  assert.equal(out.ok, true);
  assert.equal(out.researched, true);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].plugins, [{ id: 'web', max_results: 5 }]);
  assert.equal(calls[0].model, 'r-model');
  assert.match(calls[0].user, /smile\.com\.au/);
  assert.equal(calls[1].model, 'd-model');
  assert.match(calls[1].system, /RESEARCH BRIEF[\s\S]*Bounced HICAPS claims/);
  assert.equal(out.team.length, 6);
  assert.deepEqual(out.team.map(t => t.name), ['Recall & Rebooking Agent', 'HICAPS Claims Agent', 'Treatment Plan Agent', 'Consumables Agent', 'Sterilisation Log Agent', 'Google Reviews Agent']);
  assert.equal(new Set(out.team.map(t => t.id)).size, 6);
  assert.equal(out.brief.software[1], 'HICAPS');
  assert.deepEqual(out.trace.map(t => [t.stage, t.valid]), [['research', true], ['design', true]]);
});

test('a generic first draft is rejected and the design step escalates', async () => {
  const generic = { intro: 'meh', team: ROSTER.slice(0, 6).map(a => ({ base: a.id, name: a.name, does: 'Does the generic thing for your business every day.', job: 'does things', outcomes: [], mcps: [] })) };
  const { calls, callModel } = fakeModel([ok(DENTAL_BRIEF), ok(generic), ok(DENTAL_TEAM)]);
  const out = await researchTeam(normaliseInput({ business: 'dental clinic', roster: ROSTER }), { callModel, researchModel: 'm', designModel: 'm', webSearch: false });
  assert.equal(out.ok, true);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].reasoning.effort, 'low');
  assert.equal(out.trace[1].valid, false);
  assert.equal(out.team[0].name, 'Recall & Rebooking Agent');
});

test('when research fails the designer still returns a team, flagged as unresearched', async () => {
  const { calls, callModel } = fakeModel([fail(502), fail(502), ok(DENTAL_TEAM)]);
  const out = await researchTeam(normaliseInput({ business: 'dental clinic', roster: ROSTER }), { callModel, researchModel: 'm', designModel: 'm', webSearch: true });
  assert.equal(out.ok, true);
  assert.equal(out.researched, false);
  assert.equal(out.brief, null);
  assert.equal(calls.length, 3);
  assert.equal(calls[1].plugins, undefined, 'second research attempt drops the web plugin');
  assert.match(calls[2].system, /No research brief is available/);
});

test('a model that throws or returns prose never crashes the pipeline', async () => {
  const { callModel } = fakeModel([() => { throw new Error('socket hang up'); }, { ok: true, status: 200, text: 'Sure! Here is the brief you asked for.' }, { ok: true, status: 200, text: 'I think you should get a Support Agent.' }, fail(), fail()]);
  const out = await researchTeam(normaliseInput({ business: 'dental clinic', roster: ROSTER }), { callModel, researchModel: 'm', designModel: 'm', webSearch: true });
  assert.equal(out.ok, false);
  assert.equal(out.trace.length, 5);
  assert.equal(parseJson('```json\n{"a":1}\n```').a, 1);
  assert.equal(parseJson('Here you go: {"a":2} hope that helps').a, 2);
});
