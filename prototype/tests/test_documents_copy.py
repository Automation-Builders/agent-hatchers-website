"""Execute the shared capability generator and modal renderer with Node.js."""
import json
import subprocess
import unittest
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app.js"
EXPECTED = "Turn long paperwork into a one-page brief before you have to read it"


class DocumentsCopyTests(unittest.TestCase):
    def render_documents(self, business):
        source = APP.read_text()
        # Exercise production functions, not a duplicate template in the test.
        tailored = source[source.index("  const TAILORED="):source.index("  function celebrate()")]
        escape = next(line for line in source.splitlines() if "function escapeHtml(value)" in line)
        script = """
const state = {biz: BUSINESS, team: {}, marketImages: {}};
const co = () => 'Slow Poke & <friends>';
const catalog = [{id:'documents', name:'Documents', summary:'Documents', portrait:'', mcps:[]}];
const OTHER = 'Other', AGENT_CATS = {}, WORKS_WITH = {};
const mcpSection = () => '';
const document = {
  createElement: () => ({innerHTML:'', querySelector:()=>({}), querySelectorAll:()=>[], remove(){}}),
  body: {appendChild(el){ this.modal = el; }},
  addEventListener(){}
};
""".replace("BUSINESS", json.dumps(business))
        script += escape + "\n" + tailored + "\nshowAgent('documents');\n"
        script += "console.log(JSON.stringify({outcomes:tailoredOutcomes(catalog[0]), html:document.body.modal.innerHTML}));"
        result = subprocess.run(["node", "-e", script], check=True, capture_output=True, text=True)
        return json.loads(result.stdout)

    def test_generic_brief_for_all_business_descriptions(self):
        for business in (
            "Upmarket rooftop bar, pub food & cocktails, Collingwood VIC",
            "Upmarket rooftop bar, pub food &amp; cocktails, Collingwood VIC",
            '<img src=x onerror="alert(1)"> & catering ' * 20,
            "",
        ):
            with self.subTest(business=business):
                rendered = self.render_documents(business)
                self.assertEqual(rendered["outcomes"][1], EXPECTED)
                self.assertIn("<span>" + EXPECTED + "</span>", rendered["html"])
                self.assertEqual(len(rendered["outcomes"]), 5)

    def test_other_personalised_copy_remains_html_escaped(self):
        rendered = self.render_documents('<script>alert("x")</script> & catering')
        self.assertIn("Slow Poke &amp; &lt;friends&gt;", rendered["html"])
        self.assertIn("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; catering", rendered["html"])
        self.assertNotIn("<script>", rendered["html"])
        self.assertNotIn("<friends>", rendered["html"])


if __name__ == "__main__":
    unittest.main()
