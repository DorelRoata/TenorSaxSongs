@echo off
title Music.CarbonShop.us - 5-Piece Quintet + Band Sync Server
cd /d "%~dp0"
echo Starting local Band Sync server on port 8790...
start "TenorSaxSongs Server (8790)" cmd /k "node server.js"
echo Starting Cloudflare Tunnel for https://music.carbonshop.us ...
npx --yes cloudflared tunnel --config "C:\Users\buzzm\.cloudflared\config-gex.yml" run
