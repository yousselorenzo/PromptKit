// THE SONG — "sad then bright" cartoon explainer. node song.js -> out/music.wav
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), fx = bus(), verb = bus(), dly = bus();

// ---------- act 1 (0-10 s): minor, sparse, a tired pizzicato and typing ----------
for (const c of sc.chords) {
  if (c.t0 >= ev.turn) continue;
  const t1 = Math.min(c.t1, ev.turn);
  for (const n of c.notes) { const { L, R } = I.padNote(n, t1 - c.t0, { cutoff: 800, attack: 0.6, release: 1.2 }); pad.addStereo(L, R, c.t0, 0.1); }
}
clock.eachStep(0, 5, 4, (t, b, s) => {
  if (t >= ev.turn - 0.1) return;
  const c = sc.chordAt(t); if (!c) return;
  const arp = [0, 1, 2, 1][s];
  const note = c.notes[arp];
  const pz = I.pizz ? I.pizz(note + 12, { seed: 40 + s }) : I.pluck(note + 12);
  keys.addMono(pz, t, 0.3, -0.2); verb.addMono(pz, t, 0.15);
});
// typing on the laptop: wood ticks, 0.8 - 4.6
for (let i = 0; i < 20; i++) { const t = 0.9 + i * 0.19 + ((i * 7) % 3) * 0.02; if (t < ev.bad - 0.3) fx.addMono(I.woodTick(0.9 + (i % 4) * 0.08), t, 0.22, 0.25); }
// the bad ad lands, then the sad trombone
fx.addMono(I.thud(70, 0.1), ev.bad, 0.4);
fx.addMono(I.bwomp(), ev.sad, 0.5);
for (let i = 0; i < 3; i++) fx.addMono(I.pop(1200 - i * 150, 30 + i), ev.sad + 1.1 + i * 0.55, 0.25, -0.2 + i * 0.2); // carts leaving, one pop each

// ---------- the turn (10 s): riser, boom, sparkle ----------
fx.addMono(I.noiseSweep(ev.turn - 8.4, 300, 7000, { q: 0.9, shape: (x) => x * x, pink: true }), 8.4, 0.35);
fx.addMono(I.subBoom(1.6), ev.turn, 0.6);
for (let i = 0; i < 4; i++) { const b = I.bell(m('C6') * 0 + 1046.5 * Math.pow(2, [0, 4, 7, 12][i] / 12), 0.5); fx.addMono(b, ev.turn + 0.08 + i * 0.07, 0.18, -0.3 + i * 0.2); verb.addMono(b, ev.turn + 0.08 + i * 0.07, 0.2); }

// ---------- act 2 (10-27 s): bright groove ----------
const K = I.kick(), CL = I.clap(), HC = [I.hat(false, 11), I.hat(false, 12)], SH = [I.shaker(1, 15), I.shaker(1, 16)];
const kicks = [];
clock.eachStep(5, 13.5, 16, (t, b, s) => {
  if (t < ev.turn || t >= ev.cta) return;
  if (s % 4 === 0) { drums.addMono(K, t, 0.8); kicks.push(t); }
  if (s % 8 === 4) { drums.addMono(CL, t, 0.5); verb.addMono(CL, t, 0.2); }
  if (s % 2 === 0) drums.addMono(s % 4 === 2 ? HC[0] : SH[s % 2], t, 0.15, s % 4 === 2 ? -0.3 : 0.3);
});
clock.eachStep(5, 13.5, 8, (t, b, s) => {
  if (t < ev.turn || t >= ev.cta) return;
  const c = sc.chordAt(t); if (!c) return;
  const R = c.bass + 12;
  if ([0, 3, 4, 6].includes(s)) bass.addMono(I.bass(s === 4 ? R + 7 : R, BEAT / 2 * 0.8, { sub: 0.8 }), t, 0.55);
});
for (const c of sc.chords) {
  if (c.t1 <= ev.turn || c.t0 >= ev.cta) continue;
  const t0 = Math.max(c.t0, ev.turn);
  for (const n of c.notes) { const { L, R } = I.padNote(n, Math.min(c.t1, ev.cta) - t0, { cutoff: 2200, attack: 0.05 }); pad.addStereo(L, R, t0, 0.07); }
}
// marimba arpeggio, one 8th at a time (sparser under the narrator)
clock.eachStep(5, 13.5, 8, (t, b, s) => {
  if (t < ev.turn + 0.5 || t >= ev.cta) return;
  const c = sc.chordAt(t); if (!c) return;
  if (s % 2 === 1 && s !== 3) return;
  const n = c.notes[(s >> 1) % c.notes.length] + 12;
  const x = I.marimba(n, { thock: 0.2 });
  keys.addMono(x, t, 0.28, ((s % 4) - 1.5) * 0.25); verb.addMono(x, t, 0.12);
});

// ---------- UI events: each one a note ----------
const pent = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'].map(m);
ev.fill.forEach((t, i) => { const b = I.bell(440 * Math.pow(2, (pent[i + 1] - 69) / 12), 0.3); fx.addMono(b, t, 0.2, -0.2 + i * 0.2); fx.addMono(I.pop(1800 + i * 200, 50 + i), t, 0.2); });
fx.addMono(I.pop(900, 61), ev.paste, 0.35);
fx.addMono(I.paperFwip(0.9, 5), ev.solve - 0.05, 0.25);
for (let i = 0; i < 3; i++) { const b = I.bell(440 * Math.pow(2, (pent[3 + i] - 69) / 12), 0.6); fx.addMono(b, ev.result + i * 0.09, 0.22); verb.addMono(b, ev.result + i * 0.09, 0.2); }
ev.orders.forEach((t, i) => { const b = I.bell(1318 + i * 220, 0.4); fx.addMono(b, t, 0.2, 0.3 - i * 0.2); verb.addMono(b, t, 0.15); });
ev.cards.forEach((t, i) => { fx.addMono(I.paperFwip(0.9, 20 + i), t - 0.03, 0.22); fx.addMono(I.pop(1400 + i * 250, 70 + i), t, 0.25); });

// ---------- the cut to the end card (27 s) ----------
fx.addMono(I.subBoom(2.0), ev.cta, 0.6);
for (let i = 0; i < 3; i++) { const b = I.bell(523 * Math.pow(2, [0, 4, 7][i] / 12) * 2, 1.2); fx.addMono(b, ev.cta + 0.02 + i * 0.12, 0.2); verb.addMono(b, ev.cta + 0.02 + i * 0.12, 0.3); }
for (const c of sc.chords) {
  if (c.t0 < ev.cta - 0.01) continue;
  for (const n of c.notes) { const { L, R } = I.padNote(n, DURATION - c.t0, { cutoff: 1800, attack: 0.1, release: 1.6 }); pad.addStereo(L, R, c.t0 < ev.cta ? ev.cta : c.t0, 0.07); }
}
bass.addMono(I.bass(m('F2'), 3.5, { bright: 0.3, sub: 1 }), ev.cta, 0.5);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks);
const stems = { drums, bass, pad, keys, fx, verb: reverb(verb, { room: 0.7, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.3, 3500) };
const GAIN = { drums: 0.4, bass: 0.7, pad: 2.4, keys: 0.9, fx: 0.9, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 22);
// duck the music under every voice-over line (smooth 0.12 s ramps) so the narrator sits on top
{
  const env = new Float32Array(mix.n).fill(1);
  const lvl = 0.5, ramp = Math.round(0.12 * SR);
  for (const l of sc.vo) {
    const a = Math.round(l.at * SR), b = Math.round((l.at + l.dur) * SR);
    for (let i = Math.max(0, a - ramp); i < Math.min(mix.n, b + ramp); i++) {
      const u = i < a ? (a - i) / ramp : i > b ? (i - b) / ramp : 0;
      env[i] = Math.min(env[i], lvl + (1 - lvl) * Math.min(1, u));
    }
  }
  for (let i = 0; i < mix.n; i++) { mix.L[i] *= env[i]; mix.R[i] *= env[i]; }
}
MIX.fadeOut(mix, DURATION - 1.4, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -16 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS` : ''})`);
