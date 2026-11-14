#!/usr/bin/env python3
"""Render one episode:  python3 make_video.py <episode-id> [--no-voice]
Writes out/<id>.mp4 (voice-over mixed in when OPENAI_API_KEY or ELEVEN_API_KEY is set),
out/<id>.jpg (poster) and out/<id>.json (caption + hashtags)."""
import json, os, shutil, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
eid = sys.argv[1]
ep = next(e for e in json.load(open("episodes.json")) if e["id"] == eid)
open("episode.js", "w").write("globalThis.EPISODE = " + json.dumps(ep) + ";\nif (typeof module!=='undefined') module.exports = globalThis.EPISODE;\n")
vo = subprocess.check_output(["node", "-e", "console.log(JSON.stringify(require('./score').vo))"]).decode()
open("voice.json", "w").write(vo)
os.makedirs("out", exist_ok=True)
for cmd in (["node", "song.js"], ["node", "engine/render.js", "video"], ["node", "engine/render.js", "mux"]):
    subprocess.run(cmd, check=True)
base, out = "out/explainer.mp4", f"out/{eid}.mp4"
if "--no-voice" not in sys.argv and (os.getenv("OPENAI_API_KEY") or os.getenv("ELEVEN_API_KEY")):
    subprocess.run([sys.executable, "voice_mix.py", base, "voice.json", out], check=True)
    voiced = True
else:
    shutil.copy(base, out); voiced = False; print("no TTS key: wrote music-only video")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "17.5", "-i", out, "-frames:v", "1", "-q:v", "3", f"out/{eid}.jpg"], check=True)
for k, ts in (("p2", "14.5"), ("p3", "25.0")):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", ts, "-i", out, "-frames:v", "1", "-q:v", "3", f"out/{eid}-{k}.jpg"], check=True)
json.dump({"id": eid, "bundle": ep["bundle"], "caption": ep["post"], "tags": ep["tags"], "voiced": voiced}, open(f"out/{eid}.json", "w"), indent=1)
print("done", out)
