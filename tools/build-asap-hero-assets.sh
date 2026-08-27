#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
output="$root/assets/images/animals/hero-v2"

build_set() {
  name=$1
  source=$2
  for width in 420 700 840 1260 1400 2100; do
    cwebp -quiet -q 92 -alpha_q 100 -m 6 -sharp_yuv -metadata none \
      -resize "$width" 0 "$root/$source" -o "$output/$name-$width.webp"
  done
}

build_set rodent-hero assets/images/animals/rat-navy.png
build_set mouse-rat-hero assets/images/wildlife-grid/mouse-rat.png
build_set squirrel-hero assets/images/animals/squirrel.webp
build_set raccoon-hero assets/images/wildlife-grid/raccoon.png
