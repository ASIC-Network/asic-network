#!/bin/sh
# Encodes the rendered frames into the hero files in assets/ (run from the repository root
# after render.js has written frames-land/ and frames-port/). 24 fps, 24 s, loops seamlessly.
set -e
A=assets
ffmpeg -y -framerate 24 -i frames-land/f%04d.png -c:v libx264 -preset slow -crf 29 -aq-mode 3 -pix_fmt yuv420p -profile:v high -level 4.1 -g 48 -movflags +faststart -an $A/hero-1080.mp4
ffmpeg -y -framerate 24 -i frames-port/f%04d.png -c:v libx264 -preset slow -crf 28 -aq-mode 3 -pix_fmt yuv420p -profile:v high -level 4.1 -g 48 -movflags +faststart -an $A/hero-mobile.mp4
ffmpeg -y -framerate 24 -i frames-land/f%04d.png -vf scale=1280:720:flags=lanczos -c:v libvpx-vp9 -b:v 0 -crf 37 -deadline good -cpu-used 2 -row-mt 1 -g 48 -pix_fmt yuv420p -an $A/hero-720.webm
ffmpeg -y -i frames-land/f0000.png -q:v 3 $A/hero-poster.jpg
ffmpeg -y -i frames-port/f0000.png -q:v 3 $A/hero-poster-mobile.jpg
