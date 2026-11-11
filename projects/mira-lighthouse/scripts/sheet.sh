#!/bin/bash
# usage: scripts/sheet.sh name frame1 frame2 ...  -> out/<name>.png contact sheet (preview scale 0.4)
set -e
cd "$(dirname "$0")/.."
export REMOTION_BROWSER=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/*/chrome-headless-shell 2>/dev/null | head -1)}
name=$1; shift
files=()
for fr in "$@"; do
  npx remotion still MiraLighthouse out/_f$fr.png --frame=$fr --scale=0.4 2>&1 | grep -E "Error" -A3 || true
  files+=(out/_f$fr.png)
done
python3 - "$name" "${files[@]}" <<'PY'
import sys
from PIL import Image
name, fs = sys.argv[1], sys.argv[2:]
ims=[Image.open(f) for f in fs]; w,h=ims[0].size
c=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims): c.paste(im,(i*w,0))
c.save(f'out/{name}.png')
PY
