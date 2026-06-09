#!/bin/bash
cd "$(dirname "$0")"
echo "Starting animation gallery server on http://localhost:3333"
echo "Open: http://localhost:3333"
python3 -m http.server 3333
