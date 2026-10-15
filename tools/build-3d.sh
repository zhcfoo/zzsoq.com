#!/usr/bin/env bash
# 把 src/unicorn3d.js（用到 three.js）打包压缩成网页直接用的 js/unicorn3d.js
# 需要 Node.js：首次运行会在临时目录装 three 和 esbuild
set -euo pipefail
cd "$(dirname "$0")/.."
WORK="${TMPDIR:-/tmp}/zzsoq-build-3d"
mkdir -p "$WORK"
[ -d "$WORK/node_modules/three" ] || (cd "$WORK" && npm init -y >/dev/null && npm i three@0.186.1 esbuild@0.28.2 >/dev/null)
NODE_PATH="$WORK/node_modules" "$WORK/node_modules/.bin/esbuild" src/unicorn3d.js \
  --bundle --minify --format=iife --global-name=Unicorn3D --target=es2019 \
  --legal-comments=eof \
  --outfile=js/unicorn3d.js
ls -lh js/unicorn3d.js
