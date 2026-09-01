#!/usr/bin/env python3
"""Dev server for previewing the site/prototype locally.

Same as `python3 -m http.server 8799`, with one crucial difference: every
response carries `Cache-Control: no-store`, so the browser can never serve a
stale copy of app.js/styles.css/index.html from its cache. This ended a long
loop of "the new build isn't showing" during prototype reviews — plain
http.server sends Last-Modified and browsers heuristically cache on it.

Usage:  python3 serve.py          (serves the repo root on port 8799)
"""
import http.server


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    http.server.test(HandlerClass=NoCacheHandler, port=8799)
