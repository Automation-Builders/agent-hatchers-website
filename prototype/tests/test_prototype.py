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
        for stage in ("welcome", "nameScreen", "designScreen", "hatchScreen", "marketScreen", "connectScreen"):
            self.assertRegex(self.app, rf"function {stage}\(")
        self.assertNotIn("function revealScreen(", self.app)

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
        self.assertIn('src="../app.js"', self.demo)
        self.assertIn('href="../styles.css"', self.demo)

    def test_brand_tokens_and_reduced_motion_are_present(self):
        self.assertIn("--brand:#216bac", self.css.lower())
        self.assertIn("--brand-soft:#c1dce8", self.css.lower())
        self.assertIn("prefers-reduced-motion", self.css)

if __name__ == "__main__":
    unittest.main()
