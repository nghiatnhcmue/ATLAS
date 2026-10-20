#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Build Production Zip for Free Hosting
Excludes heavy PDFs (>100MB) and test scripts to stay strictly under host limits.
"""
import os
import zipfile
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP_PATH = os.path.join(ROOT_DIR, "GeoAtlas_Production.zip")

EXCLUDED_DIRS = {".git", ".gemini", "node_modules", "scripts", "tmp", "docs"}
EXCLUDED_EXTS = {".pdf", ".py", ".pyc", ".zip"}

def should_include(rel_path):
    parts = rel_path.replace("\\", "/").split("/")
    if parts[0] == "data": # Top-level data dir, use public/data instead
        return False
    if any(p in EXCLUDED_DIRS for p in parts):
        return False
    ext = os.path.splitext(rel_path)[1].lower()
    if ext in EXCLUDED_EXTS:
        return False
    if rel_path.startswith("public/data/thumbs_"):
        return False
    return True

def build_zip():
    count = 0
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(ROOT_DIR):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR).replace("\\", "/")
                if should_include(rel_path):
                    z.write(abs_path, rel_path)
                    count += 1
    size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print(f"Created {ZIP_PATH} with {count} files ({size_mb:.2f} MB)")

if __name__ == "__main__":
    build_zip()
