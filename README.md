# PromptKit

- `index.html`: the store (deployed by Vercel).
- `explainer/`: cartoon explainer generator. `python3 explainer/make_video.py ugc-01` renders one 32 s vertical video from `explainer/episodes.json`.
- `.github/workflows/daily-video.yml`: every day renders 3 videos (E-Commerce, Real Estate, UGC), uploads them to a Release and writes `queue/<tag>.json` (caption, hashtags, public video URL).
- Posting is done from the queue by a daily Claude scheduled task through Metricool (Facebook, Instagram, Threads, TikTok).

Secrets/variables: `OPENAI_API_KEY` (secret, voice-over), `TTS_VOICE` (variable, optional, e.g. nova).
