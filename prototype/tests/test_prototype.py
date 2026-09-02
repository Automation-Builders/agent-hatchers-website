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

if __name__ == "__main__":
    unittest.main()
