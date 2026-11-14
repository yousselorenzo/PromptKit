// THE FILM (9:16): a store owner, an AI that writes boring ads, and PromptKit. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, UI = globalThis.UI, Subs = globalThis.Subs, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, clock } = S;
  const E = S.EP;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;

  const BR = { accent: '#7C5CFF', accent2: '#22C39A', navy: '#14122B', navy2: '#241F4D', warn: '#E5484D', gold: '#F5B83D', wall: '#F6EEDD', floor: '#DDB98E', desk: '#B98556', deskTop: '#D9A56F', paper: '#FFFFFF' };
  UI.setTheme({ accent: BR.accent, accent2: BR.accent2, ok: BR.accent2, ink: '#1B1A2E', muted: '#7A7690', app: '#FAF8FF' });
  const OWNER = { hairStyle: 'ponytail', hair: '#3A2418', skin: '#C98A62', outfit: 'hoodie', shirt: '#7C5CFF', bottoms: 'pants', shorts: '#2B2F45', build: 'regular' };
  globalThis.CAST = { owner: OWNER };

  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));
  const FONT = 'Patrick Hand';
  const txt = (ctx, s, x, y, o = {}) => G.text(ctx, s, x, y, Object.assign({ fam: 'Patrick Hand', weight: 400, boil: 0 }, o));

  // ---------- backgrounds ----------
  function office(ctx) {
    ctx.fillStyle = BR.wall; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = BR.floor; ctx.fillRect(0, 1300, W, H - 1300);
    // window
    G.rrect(ctx, 70, 300, 250, 330, 14, { fill: '#CFE8F7', lw: 0, seed: 1 });
    G.rrect(ctx, 70, 300, 250, 330, 14, { fill: 'transparent', lw: 8, stroke: '#FFFFFF', seed: 2 });
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(190, 300, 8, 330); ctx.fillRect(70, 460, 250, 8);
    // shelf with boxes (her little store)
    G.rrect(ctx, 80, 760, 250, 18, 6, { fill: BR.desk, lw: 0, seed: 3 });
    G.rrect(ctx, 100, 700, 70, 60, 8, { fill: '#F5B83D', lw: 0, seed: 4 });
    G.rrect(ctx, 185, 680, 60, 80, 8, { fill: '#E5484D', lw: 0, seed: 5 });
    G.rrect(ctx, 255, 710, 60, 50, 8, { fill: '#22C39A', lw: 0, seed: 6 });
  }

  function desk(ctx) {
    G.rrect(ctx, 420, 1018, 640, 40, 12, { fill: BR.deskTop, lw: 0, seed: 7 });
    G.rrect(ctx, 450, 1058, 30, 240, 8, { fill: BR.desk, lw: 0, seed: 8 });
    G.rrect(ctx, 1000, 1058, 30, 240, 8, { fill: BR.desk, lw: 0, seed: 9 });
  }

  // laptop whose screen is drawn by `screen(ctx)` in a 560x540 local box
  function laptop(ctx, t, screen) {
    const cx = 740, top = 420, w = 560, h = 540;
    G.rrect(ctx, cx - w / 2 - 16, top - 16, w + 32, h + 32, 26, { fill: '#2A2840', lw: 0, seed: 10 });
    ctx.save(); ctx.translate(cx - w / 2, top);
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, 14); ctx.clip();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h);
    screen(ctx, w, h);
    ctx.restore();
    G.rrect(ctx, cx - w / 2 - 50, top + h + 16, w + 100, 30, 14, { fill: '#3A3858', lw: 0, seed: 11 });
  }

  function chatScreen(ctx, t, w, h) {
    UI.text(ctx, 'AI Assistant', 24, 48, { size: 28, weight: 800, color: '#1B1A2E' });
    ctx.fillStyle = '#EEEAF8'; ctx.fillRect(0, 66, w, 3);
    // her request types in
    const ask = E.ask;
    const n = Math.floor(clamp((t - 0.9) / 1.8) * ask.length);
    if (n > 0) {
      const tw = UI.measure(ctx, ask.slice(0, n), 26, 600);
      const bw = Math.min(w - 60, tw + 44);
      ctx.fillStyle = BR.accent; ctx.beginPath(); ctx.roundRect(w - bw - 24, 96, bw, 62, 22); ctx.fill();
      UI.text(ctx, ask.slice(0, n), w - bw - 24 + 22, 136, { size: 26, weight: 600, color: '#FFFFFF' });
    }
    if (t >= 3.2 && t < ev.bad) { // thinking dots
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#B9B4D4'; ctx.beginPath(); ctx.arc(52 + i * 26, 214 + Math.sin(t * 9 + i) * 5, 8, 0, 7); ctx.fill(); }
    }
    if (t >= ev.bad) { // the boring answer
      const p = UI.pop(t, ev.bad, 0.3, 1.6);
      ctx.save(); ctx.translate(24, 190); ctx.scale(1, p);
      ctx.fillStyle = '#F0EEF6'; ctx.beginPath(); ctx.roundRect(0, 0, w - 90, 290, 22); ctx.fill();
      const lines = E.badLines;
      lines.forEach((l, i) => UI.text(ctx, l, 22, 56 + i * 56, { size: 28, weight: 500, color: '#8A86A0' }));
      ctx.restore();
    }
  }

  function promptScreenCard(ctx, t) {
    // the PromptKit prompt, drawn as a crisp app card
    const x = 70, y = 290, w = W - 140, h = 500;
    const p = UI.pop(t, ev.solve - 0.15, 0.4, 1.6);
    if (p <= 0) return;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(p, p); ctx.translate(-w / 2, -h / 2);
    UI.card(ctx, 0, 0, w, h, 34);
    ctx.fillStyle = BR.accent; ctx.beginPath(); ctx.roundRect(0, 0, w, 84, [34, 34, 0, 0]); ctx.fill();
    UI.text(ctx, E.promptTitle, 36, 56, { size: 36, weight: 800, color: '#FFFFFF' });
    const fills = E.rows.map((r) => r.value);
    const labels = E.rows.map((r) => r.label);
    const rows = E.rows.map((r, i) => [r.lead, i]);
    rows.forEach(([lead, k], i) => {
      const yy = 180 + i * 108;
      UI.text(ctx, lead, 36, yy, { size: 36, weight: 600, color: '#2A2840' });
      const lx = 36 + UI.measure(ctx, lead, 36, 600) + 16;
      const filled = t >= ev.fill[k];
      const label = filled ? fills[k] : labels[k];
      const cw = UI.measure(ctx, label, 34, 800) + 36;
      const pop = filled ? 1 + 0.12 * Math.max(0, 1 - (t - ev.fill[k]) / 0.25) : 1;
      ctx.save(); ctx.translate(lx + cw / 2, yy - 12); ctx.scale(pop, pop);
      ctx.fillStyle = filled ? '#E2FBF3' : '#F1ECFF';
      ctx.strokeStyle = filled ? BR.accent2 : BR.accent; ctx.lineWidth = 3;
      if (!filled) ctx.setLineDash([9, 7]);
      ctx.beginPath(); ctx.roundRect(-cw / 2, -34, cw, 66, 20); ctx.fill(); ctx.stroke();
      UI.text(ctx, label, 0, 10, { size: 34, weight: 800, color: filled ? '#0E7F63' : BR.accent, align: 'center' });
      ctx.restore();
    });
    ctx.restore();
  }

  function resultCard(ctx, t) {
    const p = UI.pop(t, ev.result, 0.4, 2.0);
    if (p <= 0) return;
    const x = 70, y = 910, w = 640, h = 320;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(p, p); ctx.translate(-w / 2, -h / 2);
    UI.card(ctx, 0, 0, w, h, 30);
    ctx.fillStyle = BR.accent2; ctx.beginPath(); ctx.arc(52, 56, 22, 0, 7); ctx.fill();
    { const u = clamp((t - ev.result - 0.1) / 0.3); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(42, 56); if (u > 0) ctx.lineTo(42 + 8 * Math.min(1, u * 2), 56 + 8 * Math.min(1, u * 2)); if (u > 0.5) ctx.lineTo(50 + 12 * (u - 0.5) * 2, 64 - 18 * (u - 0.5) * 2); ctx.stroke(); }
    UI.text(ctx, 'Ready to use', 92, 68, { size: 32, weight: 800, color: '#1B1A2E' });
    const lines = E.adLines;
    lines.forEach((l, i) => UI.text(ctx, l, 36, 142 + i * 52, { size: 33, weight: i === 0 ? 800 : 500, color: i === 0 ? BR.accent : '#2A2840' }));
    ctx.restore();
  }

  function orderPings(ctx, t) {
    ev.orders.forEach((t0, i) => {
      const a = t - t0; if (a < 0 || a > 1.6) return;
      const u = clamp(a / 1.6);
      const x = 760 + (i - 1) * 40, y = 1010 - ease.outCubic(u) * 330;
      ctx.save(); ctx.globalAlpha = Math.min(1, a * 6) * (1 - ease.inQuad(clamp((u - 0.6) / 0.4)));
      ctx.translate(x, y); ctx.scale(UI.pop(t, t0, 0.25, 2.2), UI.pop(t, t0, 0.25, 2.2));
      ctx.fillStyle = BR.accent2; ctx.beginPath(); ctx.roundRect(-96, -34, 192, 68, 34); ctx.fill();
      UI.text(ctx, '+1 order', 0, 11, { size: 32, weight: 800, color: '#FFFFFF', align: 'center' });
      ctx.restore();
    });
  }

  // ---------- the owner ----------
  function owner(ctx, t) {
    const o = { x: 230, y: 1290, s: 1.35, pose: 'stand', style: OWNER, eyes: 'normal', mouth: 'smile', look: 1, brows: 'neutral' };
    if (t < ev.bad) {
      o.y -= hop(t, 6); o.gesture = t < 3.0 ? 'think' : 'point'; o.mouth = 'smile';
    } else if (t < ev.sad) {
      o.eyes = 'wide'; o.mouth = 'o'; o.sweat = 1; o.brows = 'worried'; o.y -= 0; o.gesture = 'shrug';
    } else if (t < ev.turn) {
      o.gesture = 'facepalm'; o.mouth = 'wavy'; o.brows = 'worried'; o.sweat = 1; o.look = 0;
    } else if (t < ev.fill[0]) {
      o.x = 880; o.s = 1.0; o.y = 1290; o.gesture = 'think'; o.mouth = 'smile'; o.brows = 'up';
    } else if (t < ev.cheer) {
      o.x = 880; o.s = 1.0; o.y = 1290; o.gesture = 'point'; o.look = -0.6; o.mouth = 'grin'; o.brows = 'up';
    } else {
      o.x = 880; o.s = 1.0; o.y = 1290 - Math.abs(hop(t, 40)); o.gesture = 'cheer'; o.eyes = 'happy'; o.mouth = 'grin'; o.blush = 0.5; o.look = 0;
    }
    if (false) { o.x = 540; o.s = 1.0; o.y = 1370 - Math.abs(hop(t, 44)); o.gesture = 'cheer'; o.eyes = 'happy'; o.mouth = 'grin'; o.look = 0; }
    Ch.person(ctx, o);
  }

  // ---------- scenes ----------
  function sceneProblem(ctx, t) {
    office(ctx); desk(ctx);
    laptop(ctx, t, (c, w, h) => chatScreen(c, t, w, h));
    owner(ctx, t);
    if (t >= ev.bad) {
      UI.stat(ctx, 640, 1170, 270, 160, E.stat1.big, E.stat1.small, t, ev.bad + 0.9, { color: BR.warn, rot: -0.06 });
      UI.stat(ctx, 920, 1170, 270, 160, E.stat2.big, E.stat2.small, t, ev.bad + 1.7, { color: BR.warn, rot: 0.05 });
    }
  }

  function sceneBrand(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BR.navy2); g.addColorStop(1, BR.navy);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    brandMark(ctx, t, ev.logo, 640);
    const a = clamp((t - 11.0) / 0.4);
    if (a > 0) txt(ctx, E.tagline, W / 2, 940, { size: 68, color: '#CFC8FF', align: 'center', alpha: a });
  }

  function brandMark(ctx, t, t0, cy) {
    const p = UI.pop(t, t0, 0.5, 2.2);
    if (p <= 0) return;
    ctx.save(); ctx.translate(W / 2, cy); ctx.scale(p, p);
    G.rrect(ctx, -90, -200, 180, 180, 44, { fill: BR.accent, lw: 0, seed: 21 });
    G.star(ctx, 0, -110, 56, { fill: '#FFFFFF', seed: 22, lw: 0 });
    txt(ctx, 'PromptKit', 0, 80, { size: 150, weight: 400, color: '#FFFFFF', align: 'center', fam: 'Bungee' });
    ctx.restore();
  }

  function sceneSolve(ctx, t) {
    ctx.fillStyle = BR.wall; ctx.fillRect(0, 0, W, H);
    G.rrect(ctx, -60, 1330, W + 120, 700, 0, { fill: BR.floor, lw: 0, seed: 31 });
    promptScreenCard(ctx, t);
    const tapBtn = UI.pop(t, ev.solve + 0.4, 0.3, 1.8);
    if (tapBtn > 0 && t < ev.result + 0.2) {
      ctx.save(); ctx.translate(W / 2, 855); ctx.scale(tapBtn, tapBtn);
      UI.button(ctx, 0, 0, 640, 84, 'Copy and paste into any AI', t, { tTap: ev.paste, done: 'Pasted', size: 30 });
      ctx.restore();
      UI.tap(ctx, W / 2 + 120, 880, t, ev.paste - 0.15);
    }
    resultCard(ctx, t);
    orderPings(ctx, t);
    owner(ctx, t);
  }

  function sceneInside(ctx, t) {
    ctx.fillStyle = BR.wall; ctx.fillRect(0, 0, W, H);
    txt(ctx, E.insideTitle, W / 2, 400, { size: 64, color: '#1B1A2E', align: 'center', alpha: clamp((t - ev.cards[0] + 0.6) / 0.4) });
    const items = E.items.map((it, i) => [it.title, it.sub, [BR.accent, BR.accent2, '#F08A3C'][i]]);
    items.forEach(([title, sub, col], i) => {
      const t0 = ev.cards[i];
      const p = UI.pop(t, t0, 0.35, 2.0); if (p <= 0) return;
      const cy = 560 + i * 300;
      ctx.save(); ctx.translate(W / 2, cy); ctx.scale(p, p);
      UI.card(ctx, -440, -120, 880, 240, 34);
      G.rrect(ctx, -400, -78, 156, 156, 40, { fill: col, lw: 0, seed: 40 + i });
      if (i === 0) G.star(ctx, -322, 0, 52, { fill: '#FFFFFF', seed: 50, lw: 0 });
      if (i === 1) { for (let k = 0; k < 3; k++) G.rrect(ctx, -366, -34 + k * 28, 88 - k * 14, 14, 7, { fill: '#FFFFFF', lw: 0, seed: 51 + k }); }
      if (i === 2) { G.rrect(ctx, -366, -34, 88, 64, 10, { fill: '#FFFFFF', lw: 0, seed: 55 }); G.poly(ctx, [[-366, -34], [-322, 4], [-278, -34]], { fill: 'transparent', stroke: col, lw: 6, seed: 56 }); }
      UI.text(ctx, title, -210, -12, { size: 50, weight: 800, color: '#1B1A2E', maxW: 620 });
      UI.text(ctx, sub, -210, 52, { size: 32, weight: 500, color: '#7A7690', maxW: 620 });
      ctx.restore();
    });
  }

  function sceneCta(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BR.navy2); g.addColorStop(1, BR.navy);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // sunburst behind
    ctx.save(); ctx.translate(W / 2, 700); ctx.rotate((t - ev.cta) * 0.25); ctx.globalAlpha = 0.12;
    for (let i = 0; i < 20; i++) { ctx.fillStyle = i % 2 ? BR.accent : BR.accent2; const a0 = (i / 20) * 6.2832, a1 = ((i + 1) / 20) * 6.2832; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 1800, Math.sin(a0) * 1800); ctx.lineTo(Math.cos(a1) * 1800, Math.sin(a1) * 1800); ctx.fill(); }
    ctx.restore();
    brandMark(ctx, t, ev.cta + 0.02, 480);
    const pp = UI.pop(t, ev.price, 0.4, 2.2);
    if (pp > 0) {
      ctx.save(); ctx.translate(W / 2, 800); ctx.scale(pp, pp); ctx.rotate(-0.04);
      G.rrect(ctx, -330, -120, 660, 240, 40, { fill: BR.gold, lw: 0, seed: 61 });
      txt(ctx, E.price, -120, 60, { size: 210, color: '#1B1A2E', align: 'center', fam: 'Bungee' });
      txt(ctx, 'one-time', 150, 24, { size: 60, color: '#1B1A2E', align: 'center', weight: 700 });
      txt(ctx, 'no subscription', 150, 80, { size: 40, color: '#4A3A10', align: 'center', weight: 400 });
      ctx.restore();
    }
    const lb = UI.pop(t, ev.price + 0.6, 0.35, 2.0);
    if (lb > 0) {
      ctx.save(); ctx.translate(W / 2, 1060); ctx.scale(lb, lb);
      G.rrect(ctx, -250, -54, 500, 108, 54, { fill: BR.accent2, lw: 0, seed: 62 });
      txt(ctx, 'Link in bio', 0, 22, { size: 70, color: '#FFFFFF', align: 'center', weight: 700 });
      ctx.restore();
    }
    txt(ctx, 'Illustration. Results vary.', W / 2, 1250, { size: 34, color: '#9C97C0', align: 'center', alpha: clamp((t - ev.price - 1.0) / 0.5) });
    G.confetti(ctx, t, ev.cta, { n: 90, seed: 7, spawn: 1.6, until: ev.cta + 4 });
  }

  Studio.film({
    draw(ctx, t) {
      if (t < ev.cta) {
        const k = t < ev.bad ? 1 : 1 + 0.06 * ease.outCubic(clamp((t - ev.bad) / 2.4)); // slow push-in on the bad news
        ctx.save();
        if (t >= ev.bad && t < ev.turn) { ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2); }
        if (t < ev.turn) sceneProblem(ctx, t);
        else if (t < ev.solve - 0.2) sceneBrand(ctx, t);
        else if (t < ev.cards[0] - 0.3) sceneSolve(ctx, t);
        else sceneInside(ctx, t);
        ctx.restore();
      } else sceneCta(ctx, t);
      if (t >= ev.cta) { const f = 0.8 * Math.exp(-(t - ev.cta) * 14); if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } }
      Subs.draw(ctx, t, S.subtitles, { style: 'pop' });
      UI.iris(ctx, t, ev.turn, { color: BR.accent, dur: 0.3 });
      // wipe into the "solve" scene
      if (t >= ev.solve - 0.2 && t < ev.solve + 0.3) {
        const u = clamp((t - (ev.solve - 0.2)) / 0.5); ctx.fillStyle = BR.accent;
        ctx.fillRect(u < 0.5 ? 0 : (u - 0.5) * 2 * W, 0, u < 0.5 ? u * 2 * W : W, H);
      }
    },
    post: { paper: 0.15, vignette: 0.2, grain: 0.03 },
  });
})();
