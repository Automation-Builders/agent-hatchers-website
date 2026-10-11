"""Browser regression: real application with an isolated saved-session response.
Run with uv run --with playwright python prototype/tests/check_review_banner.py BASE_URL.
No real session credentials, writes or generation calls are used.
"""
import json
import sys
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8879'
with sync_playwright() as p:
    browser = p.chromium.launch()
    for width, height in [(1440, 900), (390, 844)]:
        page = browser.new_page(viewport={'width': width, 'height': height})
        errors, calls = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script("localStorage.setItem('ah-sessions-key','isolated-test');")
        def api(route):
            calls.append((route.request.method, route.request.url))
            if '/api/prototype-session?' in route.request.url:
                route.fulfill(json={'company': 'Banner test', 'name': 'Test agent', 'step': 4, 'tab': 'profiles', 'industry': 'technology'})
            else:
                route.abort()
        page.route('**/api/**', api)
        page.goto(base + '/prototype/demo/?session=banner-test', wait_until='networkidle')
        close = page.get_by_role('button', name='Dismiss review banner')
        close.wait_for()
        box = page.locator('.review-bar').bounding_box()
        assert box['x'] == 0 and box['width'] <= min(560, width)
        page.locator('[data-agent]').first.click()
        page.locator('#agent-title').wait_for()
        assert page.locator('#agent-title').evaluate('e => {const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}')
        page.locator('.dx-peek-x').click()
        close.focus()
        page.keyboard.press('Enter')
        assert page.locator('.review-bar').count() == 0
        page.locator('[data-agent]').first.click()
        assert page.locator('#agent-title').is_visible()
        assert not errors, errors
        assert len(calls) == 1 and calls[0][0] == 'GET', calls
        print(json.dumps({'viewport': [width, height], 'banner': box, 'dismiss': 'PASS', 'drawer_heading_unobscured': 'PASS', 'api_calls': len(calls), 'errors': errors}))
        page.close()
    browser.close()
