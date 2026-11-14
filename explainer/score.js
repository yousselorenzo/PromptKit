// PromptKit explainer: "Boring AI copy -> PromptKit" (E-Commerce bundle). 9:16, 32 s.
// One timeline drives the music (song.js), the picture (film.js) and the voice-over slots (tts_mix).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const EP = node ? require('./episode') : globalThis.EPISODE;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0 }); // 1 beat = 0.5 s, 1 bar = 2 s
  const { T, BEAT } = clock;
  const DURATION = 32;

  // ---------- story (seconds) ----------
  const ev = {
    problem: 0,          // owner asks the AI for an ad
    bad: 5.0,            // the generic result, no clicks, carts leave
    sad: 7.6,            // sad trombone
    turn: 10.0,          // circle wipe to the brand
    logo: 10.25,         // PromptKit pops in
    solve: 12.0,         // wipe open: the structured prompt
    fill: [13.2, 14.1, 15.0],   // brackets fill in
    paste: 16.1,         // paste button tap
    result: 16.7,        // the good ad appears
    orders: [18.2, 19.0, 19.8], // symbolic "new order" pings
    cheer: 17.4,
    cards: [21.9, 23.1, 24.3],  // what is inside
    cta: 27.0,           // hard cut to the end card
    price: 28.3,
  };

  const S = {
    problem: [0, 5], bad: [5, 10], turn: [10, 12], solve: [12, 21], inside: [21, 27], cta: [27, DURATION],
  };

  // ---------- music: minor/sad first half, bright second half ----------
  const { chords, chordAt } = makeChords(clock, {
    Dm: { notes: ['A3', 'D4', 'F4'], bass: 'D2' }, Bb: { notes: ['Bb3', 'D4', 'F4'], bass: 'Bb1' },
    F: { notes: ['A3', 'C4', 'F4'], bass: 'F2' }, C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' },
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Fmaj7: { notes: ['A3', 'C4', 'E4', 'G4'], bass: 'F1' },
  }, [
    [0, 0, 4, 'Dm'], [1, 0, 4, 'Bb'], [2, 0, 4, 'Dm'], [3, 0, 4, 'Bb'], [4, 0, 4, 'Dm'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'Am'], [8, 0, 4, 'F'], [9, 0, 4, 'C'], [10, 0, 4, 'G'], [11, 0, 4, 'C'],
    [12, 0, 4, 'F'], [13, 0, 4, 'C'], [14, 0, 4, 'F'], [15, 0, 4, 'Fmaj7'], [16, 0, 4, 'Fmaj7'],
  ]);

  // ---------- voice-over slots (the voice is generated from these exact lines and fitted into each slot) ----------
  const VOT = EP.vo;
  const vo = [
    { at: 0.8, dur: 4.2 }, { at: 5.4, dur: 3.9 }, { at: 10.3, dur: 1.5 }, { at: 12.3, dur: 4.7 }, { at: 17.5, dur: 4.2 }, { at: 21.9, dur: 3.5 }, { at: 27.3, dur: 3.2 },
  ].map((l, i) => Object.assign(l, { text: VOT[i] }));

  // captions: chunks of <= 4 words, times shared out by word length inside each slot
  const subtitles = [];
  for (const l of vo) {
    const ws = l.text.split(/\s+/);
    const chunks = [];
    let cur = [];
    for (const w of ws) {
      cur.push(w);
      if (cur.length >= 4 || /[.!?]$/.test(w)) { chunks.push(cur); cur = []; }
    }
    if (cur.length) chunks.push(cur);
    const weight = (c) => c.reduce((a, w) => a + w.length + 2, 0);
    const total = chunks.reduce((a, c) => a + weight(c), 0);
    let t = l.at;
    for (const c of chunks) {
      const d = (l.dur * 0.96 * weight(c)) / total;
      subtitles.push({ t, end: t + d + 0.05, text: c.join(' ') });
      t += d;
    }
  }

  const markers = {
    turn: { t: ev.turn, sync: 'a' },     // circle wipe closes + whoosh/boom
    solve: ev.solve,
    result: ev.result,
    cta: { t: ev.cta, sync: 'av' },       // hard cut to the end card + hit
  };

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, subtitles, markers, EP };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
