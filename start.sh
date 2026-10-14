#!/usr/bin/env bash
# FonoBase: static frontend. Build dist/ inside the project, publish
# deployment output metadata, then serve the built directory in the foreground.
set -euo pipefail
time -p cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
/usr/bin/time -p test -f index.html
PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p mkdir -p "$PROJECT_DIR/dist"
if /usr/bin/time -p test -f "$PROJECT_DIR/package.json"; then
  /usr/bin/time -p npm ci --no-audit --no-fund --prefix "$PROJECT_DIR"
  if /usr/bin/time -p test -f "$PROJECT_DIR/package.json"; then
    /usr/bin/time -p npm run --prefix "$PROJECT_DIR" build --if-present
  fi
else
  echo "No package.json: skipping dependency install and build step." >&2
fi
/usr/bin/time -p rm -rf "$PROJECT_DIR/dist"
/usr/bin/time -p mkdir -p "$PROJECT_DIR/dist"
/usr/bin/time -p cp -r "$PROJECT_DIR/index.html" "$PROJECT_DIR/assets" "$PROJECT_DIR/dist/"
/usr/bin/time -p test -f "$PROJECT_DIR/dist/index.html"
/usr/bin/time -p env "PROJECT_DIR=$PROJECT_DIR" "WEB_DIR=$WEB_DIR" node -e 'const fs=require("fs"),path=require("path");fs.writeFileSync(path.join(process.env.WEB_DIR,"deployment-output.json"),JSON.stringify({project:process.env.PROJECT_DIR,directory:path.join(process.env.PROJECT_DIR,"dist")}))'
/usr/bin/time -p cat "$WEB_DIR/deployment-output.json"
/usr/bin/time -p echo ""
exec /usr/bin/time -p python3 -m http.server "$PORT" --directory "$PROJECT_DIR/dist"
