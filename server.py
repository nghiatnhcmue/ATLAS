#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - High-Performance Development Web Server
Features:
- Multi-threaded (ThreadingHTTPServer)
- Zero DNS Lookup latency (instant response)
- CORS Header: Access-Control-Allow-Origin: *
- Proper MIME Types for .geojson, .json, .js, .css
- UTF-8 Charset headers
"""

import http.server
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class GeoAtlasHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def address_string(self):
        # Disable slow reverse DNS lookups on Windows/Localhost
        return self.client_address[0]

    def end_headers(self):
        # Enable CORS for all local and remote origins
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept")

        # Mirroring production Edge CDN Cache-Control headers
        path = getattr(self, 'path', '')
        if path.endswith(('.geojson', '.json')):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif path.endswith(('.js', '.css', '.png', '.jpg', '.woff2')):
            self.send_header("Cache-Control", "public, max-age=2592000, stale-while-revalidate=86400")
        elif path.endswith(('.html', '/')):
            self.send_header("Cache-Control", "public, max-age=0, must-revalidate")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")

        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def guess_type(self, path):
        # MIME types configuration
        if path.endswith(".geojson"):
            return "application/geo+json; charset=utf-8"
        if path.endswith(".json"):
            return "application/json; charset=utf-8"
        if path.endswith(".js"):
            return "application/javascript; charset=utf-8"
        if path.endswith(".css"):
            return "text/css; charset=utf-8"
        if path.endswith(".html"):
            return "text/html; charset=utf-8"
        return super().guess_type(path)

def run_server(port=PORT):
    handler = GeoAtlasHTTPRequestHandler
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    
    server_port = port
    while server_port < port + 10:
        try:
            with http.server.ThreadingHTTPServer(("", server_port), handler) as httpd:
                print(f"[+] GeoAtlas Multi-Threaded Web Server đang chạy tại: http://localhost:{server_port}/")
                print(f"[+] Root directory: {DIRECTORY}")
                print("[+] Đã cấu hình Header CORS: Access-Control-Allow-Origin: *")
                print("[+] Đã cấu hình MIME type chuẩn cho .geojson: application/geo+json")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 98 or e.errno == 10048:
                print(f"[!] Cổng {server_port} đang bận, thử cổng {server_port + 1}...")
                server_port += 1
            else:
                raise e

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(p)

