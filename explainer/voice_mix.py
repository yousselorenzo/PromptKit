#!/usr/bin/env python3
"""Add a voice-over to the rendered cartoon.

For every line in voice.json ({at, dur, text}) it asks a TTS API for speech, fits the clip into its
time slot (speeds it up with ffmpeg atempo when it is too long, never slows it below 0.9x), delays it to
the line's start, mixes it over the music, and muxes the result into the final mp4.

  OPENAI_API_KEY=... python3 voice_mix.py out/pk-ecom-explainer.mp4 voice.json out/final.mp4
  python3 voice_mix.py ... --fake     # no network: sine-tone placeholders, to test the mixing only

Env: TTS_PROVIDER=openai|elevenlabs (default openai), TTS_VOICE (openai: alloy/nova/shimmer..., elevenlabs: voice id),
     TTS_MODEL (default gpt-4o-mini-tts / eleven_multilingual_v2), ELEVEN_API_KEY.
"""
import json, os, subprocess, sys, tempfile, urllib.request

def sh(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out)

def tts(text, out_mp3, fake=False, seconds=2.0):
    if fake:
        sh("ffmpeg", "-y", "-f", "lavfi", "-i", f"sine=frequency=220:duration={seconds}", out_mp3)
        return
    prov = os.getenv("TTS_PROVIDER", "openai")
    if prov == "elevenlabs":
        vid = os.getenv("TTS_VOICE", "21m00Tcm4TlvDq8ikWAM")
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{vid}",
            data=json.dumps({"text": text, "model_id": os.getenv("TTS_MODEL", "eleven_multilingual_v2")}).encode(),
            headers={"xi-api-key": os.environ["ELEVEN_API_KEY"], "Content-Type": "application/json", "Accept": "audio/mpeg"})
    else:
        req = urllib.request.Request(
            "https://api.openai.com/v1/audio/speech",
            data=json.dumps({"model": os.getenv("TTS_MODEL", "gpt-4o-mini-tts"), "voice": os.getenv("TTS_VOICE", "nova"),
                             "input": text, "instructions": "Warm, upbeat, friendly explainer voice. Clear and natural pace.",
                             "response_format": "mp3"}).encode(),
            headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"], "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r, open(out_mp3, "wb") as f:
        f.write(r.read())

def atempo_chain(r):
    parts = []
    while r > 2.0: parts.append("atempo=2.0"); r /= 2.0
    parts.append(f"atempo={r:.4f}")
    return ",".join(parts)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    fake = "--fake" in sys.argv
    video, vjson, final = args
    lines = json.load(open(vjson))
    tmp = tempfile.mkdtemp()
    inputs, filters, labels = [], [], []
    for i, l in enumerate(lines):
        raw = os.path.join(tmp, f"l{i}.mp3"); fit = os.path.join(tmp, f"l{i}.wav")
        tts(l["text"], raw, fake, seconds=l["dur"] * (1.2 if i % 2 else 0.8))
        d = dur(raw); slot = l["dur"]
        r = d / slot if d > slot else 1.0              # speed up only when it overflows its slot
        if r > 1.35: print(f"warning: line {i} needs {r:.2f}x speed-up; shorten the text", file=sys.stderr)
        sh("ffmpeg", "-y", "-i", raw, "-af", atempo_chain(r) + ",aresample=48000", "-ac", "2", fit)
        inputs += ["-i", fit]
        ms = int(l["at"] * 1000)
        filters.append(f"[{i + 1}:a]adelay={ms}|{ms},volume=1.6[v{i}]"); labels.append(f"[v{i}]")
    fc = ";".join(filters) + f";[0:a]{''.join(labels)}amix=inputs={len(lines) + 1}:normalize=0:duration=first,alimiter=limit=0.95[a]"
    sh("ffmpeg", "-y", "-i", video, *inputs, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
       "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", final)
    print("wrote", final)

if __name__ == "__main__":
    main()
