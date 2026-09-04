import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class PrototypeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = (ROOT / "app.js").read_text()
        cls.demo = (ROOT / "demo" / "index.html").read_text()
        cls.css = (ROOT / "styles.css").read_text()
        cls.sessions = (ROOT / "sessions.html").read_text()
        cls.session_fn = (ROOT.parent / "portrait-proxy" / "api" / "prototype-session.js").read_text()

    def test_review_mode_is_read_only(self):
        # sessions.html → /prototype/?session=<sid> pours a saved snapshot into the dashboard;
        # it must never write back to the store, IndexedDB, or call the image/chat endpoints.
        self.assertIn("get('session')", self.app)
        self.assertIn("const captureOn = !REVIEW_SID &&", self.app)
        self.assertIn("async function writeSession(v){if(REVIEW_SID)return;", self.app)
        self.assertIn("if(!usePortraits||REVIEW_SID) return null;", self.app)
        self.assertIn("if(REVIEW_SID)reviewSession();", self.app)
        self.assertIn(".review-bar", self.css)

    def test_sessions_page_menu_and_audit_trail(self):
        self.assertIn("'?session='+encodeURIComponent(s.sid)", self.sessions)
        self.assertIn('data-del>Delete session', self.sessions)
        self.assertIn("'&by='+encodeURIComponent(by)", self.sessions)
        self.assertIn("'&log=1'", self.sessions)
        # the function refuses an anonymous delete and logs deletes + dashboard opens
        self.assertIn("if (!by) { res.status(400)", self.session_fn)
        self.assertIn("logAction('delete'", self.session_fn)
        self.assertIn("logAction('open'", self.session_fn)
        self.assertIn("sessions-log/", self.session_fn)

    def test_deletes_are_soft_and_restorable(self):
        self.assertIn("sessions-trash/", self.session_fn)
        self.assertIn("if (req.method === 'PUT')", self.session_fn)
        self.assertIn("logAction('restore'", self.session_fn)
        self.assertIn("'GET,POST,PUT,DELETE,OPTIONS'", self.session_fn)
        self.assertIn("{method:'PUT'}", self.sessions)
        self.assertIn("'&trash=1'", self.sessions)
        self.assertIn("'Undo'", self.sessions)

    def test_demo_is_unlisted_from_search_engines(self):
        self.assertIn('name="robots" content="noindex,nofollow,noarchive"', self.demo)

    def test_flow_contains_every_required_stage(self):
        # revealScreen was merged into hatchScreen (Aug 2026): designs are selected in
        # place as soon as they hatch, so the flow is 5 steps, not 6.
        # Sep 2026: two plain-English intro screens (welcome asks what the business does,
        # teamScreen answers) sit in front of the create step.
        for stage in ("welcome", "teamScreen", "nameScreen", "designScreen", "hatchScreen", "marketScreen", "connectScreen"):
            self.assertRegex(self.app, rf"function {stage}\(")
        self.assertNotIn("function revealScreen(", self.app)
        self.assertIn("[welcome,teamScreen,nameScreen,hatchScreen,marketScreen,connectScreen]", self.app)

    def test_every_catalog_agent_has_plain_english_copy(self):
        ids = re.findall(r"\{id:'([a-z]+)',icon:", self.app)
        self.assertGreaterEqual(len(ids), 10)
        plain = re.search(r"const PLAIN=\{(.*?)\n  \};", self.app, re.S).group(1)
        flow = re.search(r"const FLOW_ORDER=\[(.*?)\]", self.app).group(1)
        for agent_id in ids:
            self.assertRegex(plain, rf"\n    {agent_id}:\{{does:'[^']+',job:'[^']+',art:'/[^']+\.webp'\}}")
            self.assertIn(f"'{agent_id}'", flow)

    def test_other_chat_profiles_wear_the_hatched_character(self):
        # The Chats sidebar's "Other profiles" must never show stock art of a different
        # robot: they are generated in the prospect's look (with an egg while hatching).
        self.assertNotIn("[['Bug Destroyer','/hatchy-av-test.webp']", self.app)
        self.assertIn("EXTRA_PROFILES.map(async p=>", self.app)
        self.assertIn("state.marketImages[p.id]=img||state.selectedImage||p.portrait", self.app)

    def test_each_agent_has_exactly_five_outcomes(self):
        outcome_blocks = re.findall(r"outcomes:\[(.*?)\]\}", self.app)
        self.assertGreaterEqual(len(outcome_blocks), 5)
        for block in outcome_blocks:
            self.assertEqual(len(re.findall(r"'[^']+'", block)), 5, block)

    def test_each_agent_has_multiple_mcp_connections(self):
        mcp_blocks = re.findall(r"mcps:\[(.*?)\],outcomes", self.app)
        self.assertGreaterEqual(len(mcp_blocks), 5)
        for block in mcp_blocks:
            self.assertGreaterEqual(len(re.findall(r"'[^']+'", block)), 5, block)

    def test_first_screen_asks_which_tools_and_profiles_lead_with_them(self):
        # The intro asks for the company's tools; both agent modals split connections into
        # "Your tools" then "Other connections available"; the answer is saved and captured.
        self.assertIn("Which tools does your company use?", self.app)
        self.assertIn("${toolPicker()}", self.app)
        self.assertIn("Other connections available", self.app)
        self.assertEqual(self.app.count("mcpSection("), 3)   # definition + both modals
        self.assertEqual(self.app.count("tools:state.tools||[]"), 3)   # snapshot, capture, profile request
        # Every tool the picker offers has a REAL logo (sprite symbol, inline SVG or a vendored
        # site icon) — never a two-letter monogram — and a known category.
        tools = re.findall(r"\{n:'([^']+)',c:'([^']+)'\}", self.app)
        self.assertGreaterEqual(len(tools), 30)
        agent_cats = re.search(r"const AGENT_CATS=\{(.*?)\n  \};", self.app, re.S).group(1)
        icons = re.search(r"const MCP_ICONS=\{(.*?)\};", self.app).group(1)
        svgs = re.search(r"const MCP_SVGS=\{(.*?)\n  \};", self.app, re.S).group(1)
        imgs = dict(re.findall(r"'([^']+)':'([^']+)'", re.search(r"const MCP_IMGS=\{(.*?)\};", self.app).group(1)))
        for name, cat in tools:
            self.assertTrue(f"'{name}':" in icons or f"'{name}':" in svgs or name in imgs, f"{name} has no real logo")
            if name in imgs:
                self.assertTrue((ROOT / "assets" / "tools" / imgs[name]).is_file(), imgs[name])
            self.assertTrue(cat in ('email', 'chat', 'docs', 'sheets') or f"'{cat}'" in agent_cats, cat)

    def test_demo_uses_shared_assets_and_company_configuration(self):
        self.assertIn('window.PROTOTYPE_CONFIG', self.demo)
        # Assets carry a cache-busting ?v= so a stale cached stylesheet can never
        # pair with newer markup (that mismatch once rendered cracks as black shapes).
        self.assertRegex(self.demo, r'src="\.\./app\.js\?v=\d+"')
        self.assertRegex(self.demo, r'href="\.\./styles\.css\?v=\d+"')

    def test_brand_tokens_and_reduced_motion_are_present(self):
        self.assertIn("--brand:#216bac", self.css.lower())
        self.assertIn("--brand-soft:#c1dce8", self.css.lower())
        self.assertIn("prefers-reduced-motion", self.css)

    def test_rehatch_or_new_design_drops_the_old_characters_portraits(self):
        # Profile portraits are re-dressings of one hatched character. Hatching again, or going
        # back and picking a different design, must not keep cards wearing the previous robot.
        self.assertIn("state.selectedImage='';state.marketImages={};state.marketStarted=false;state.marketRefKey='';state.step=3", self.app)
        self.assertIn("if(state.marketRefKey&&state.marketRefKey!==refKey){state.marketImages={};}", self.app)
        self.assertIn("'marketImages','marketRefKey'", self.app)   # survives a saved session
        # Vendored tool icons are cache-busted by build so a redeploy never shows an old logo.
        self.assertIn("/prototype/assets/tools/${MCP_IMGS[name]}?v=${BUILD}", self.app)

if __name__ == "__main__":
    unittest.main()
