/* Rete neurale 3D nell'hero: proiezione prospettica su Canvas 2D, nessuna dipendenza. */
(() => {
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return;

  const root = document.documentElement;
  const hero = canvas.parentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isSmall = () => window.innerWidth < 620;

  // Generatore pseudo-casuale con seed: il layout è identico a ogni caricamento.
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  let nodes = [], edges = [], adj = [], pulses = [];
  let W = 0, H = 0, dpr = 1, scale = 1, cx = 0, cy = 0;
  let lineColor = "#7c9bc6", nodeColor = "#5a7684", pulseColor = "#395b50"; // valori di riserva: i veri colori vengono da palette.css
  let running = false, visible = true, last = 0;
  let spin = 0.6, rotX = 0.18, rotY = 0.6;
  const target = { x: 0.18, y: 0 };

  const readColors = () => {
    const css = getComputedStyle(root);
    lineColor = css.getPropertyValue("--net-line").trim() || lineColor;
    nodeColor = css.getPropertyValue("--net-node").trim() || nodeColor;
    pulseColor = css.getPropertyValue("--net-pulse").trim() || pulseColor;
  };

  const build = () => {
    seed = 11;
    const count = isSmall() ? 52 : 84;
    const golden = Math.PI * (3 - Math.sqrt(5));
    nodes = [];
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const k = 0.5 + rand() * 0.5;
      nodes.push({ x: Math.cos(golden * i) * r * k, y: y * k, z: Math.sin(golden * i) * r * k });
    }
    // Ogni nodo si collega ai 3 vicini più prossimi (le distanze 3D non cambiano ruotando).
    const seen = new Set();
    edges = [];
    adj = nodes.map(() => []);
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
        .filter(o => o.j !== i && o.d < 0.7)
        .sort((p, q) => p.d - q.d)
        .slice(0, 3)
        .forEach(o => {
          const key = i < o.j ? i + "-" + o.j : o.j + "-" + i;
          if (seen.has(key)) return;
          seen.add(key);
          adj[i].push(edges.length);
          adj[o.j].push(edges.length);
          edges.push({ a: i, b: o.j });
        });
    });
    pulses = [];
    for (let i = 0; i < (isSmall() ? 4 : 7); i++) pulses.push(newPulse());
  };

  const newPulse = () => ({ e: Math.floor(rand() * edges.length), t: rand(), dir: rand() < 0.5 ? 1 : -1 });

  const px = [], py = [], pd = [];
  const project = () => {
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const x1 = n.x * cosY + n.z * sinY, z1 = -n.x * sinY + n.z * cosY;
      const y2 = n.y * cosX - z1 * sinX, z2 = n.y * sinX + z1 * cosX;
      const p = 3 / (3 - z2);
      px[i] = cx + x1 * p * scale;
      py[i] = cy + y2 * p * scale;
      pd[i] = Math.min(1, Math.max(0, (z2 + 1.2) / 2.4));
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    project();
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColor;
    edges.forEach(({ a, b }) => {
      ctx.globalAlpha = 0.12 + 0.4 * ((pd[a] + pd[b]) / 2);
      ctx.beginPath();
      ctx.moveTo(px[a], py[a]);
      ctx.lineTo(px[b], py[b]);
      ctx.stroke();
    });
    ctx.fillStyle = nodeColor;
    for (let i = 0; i < nodes.length; i++) {
      ctx.globalAlpha = 0.18 + 0.6 * pd[i];
      ctx.beginPath();
      ctx.arc(px[i], py[i], 1.1 + 2.1 * pd[i], 0, 6.2832);
      ctx.fill();
    }
    ctx.fillStyle = pulseColor;
    pulses.forEach(p => {
      const { a, b } = edges[p.e];
      const t = p.dir > 0 ? p.t : 1 - p.t;
      const x = px[a] + (px[b] - px[a]) * t, y = py[a] + (py[b] - py[a]) * t;
      const d = pd[a] + (pd[b] - pd[a]) * t;
      ctx.globalAlpha = 0.18 + 0.12 * d;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.2832); ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const step = dt => {
    spin += dt * 0.1;
    rotY += (spin + target.y - rotY) * Math.min(1, dt * 3);
    rotX += (target.x - rotX) * Math.min(1, dt * 3);
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += dt * 0.7;
      if (p.t < 1) continue;
      const node = p.dir > 0 ? edges[p.e].b : edges[p.e].a;
      if (p.life !== undefined && --p.life <= 0) { pulses.splice(i, 1); continue; } // impulsi extra: si spengono dopo qualche salto
      const options = adj[node].filter(e => e !== p.e);
      if (!options.length || (p.life === undefined && rand() < 0.12)) {
        if (p.life !== undefined) pulses.splice(i, 1); else Object.assign(p, newPulse(), { t: 0 });
        continue;
      }
      const next = options[Math.floor(rand() * options.length)];
      p.dir = edges[next].a === node ? 1 : -1;
      p.e = next;
      p.t = 0;
    }
  };

  // Impulsi extra: partono da un nodo lungo tutte le sue connessioni e si spengono dopo `hops` salti.
  const MAX_PULSES = 30;
  const spawnFrom = (node, hops) => {
    adj[node].forEach(e => {
      if (pulses.length < MAX_PULSES) pulses.push({ e, t: 0, dir: edges[e].a === node ? 1 : -1, life: hops });
    });
  };
  const burst = (count, hops) => {
    for (let i = 0; i < count; i++) spawnFrom(Math.floor(Math.random() * nodes.length), hops);
  };

  const frame = now => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt);
    draw();
    requestAnimationFrame(frame);
  };

  const shouldRun = () => visible && !document.hidden && !reduceMotion.matches;
  const sync = () => {
    const run = shouldRun();
    if (run && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    else if (!run) { running = false; if (reduceMotion.matches) draw(); }
  };

  let wasSmall = isSmall();
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (isSmall() !== wasSmall) { wasSmall = isSmall(); build(); }
    // La rete si centra nell'area libera #hero-visual, senza sovrapporsi ad altri elementi.
    const area = document.getElementById("hero-visual");
    if (area) {
      const ar = area.getBoundingClientRect();
      cx = ar.left - rect.left + ar.width / 2;
      cy = ar.top - rect.top + ar.height / 2;
      scale = ar.width * 0.42;
    } else {
      cx = W / 2; cy = H / 2; scale = Math.min(W, H) * 0.4;
    }
    if (!running) draw();
  };

  window.addEventListener("pointermove", event => {
    if (!running) return;
    const r = hero.getBoundingClientRect();
    const mx = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
    const my = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height));
    target.y = (mx - 0.5) * 0.9;
    target.x = 0.18 + (my - 0.5) * 0.5;
  }, { passive: true });

  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const areaEl = document.getElementById("hero-visual");
  if (areaEl) resizeObserver.observe(areaEl);
  window.addEventListener("load", resize);
  document.addEventListener("visibilitychange", sync);
  reduceMotion.addEventListener("change", sync);
  // Cambio tema: nuovi colori e una raffica di impulsi.
  let lastTheme = root.dataset.theme;
  new MutationObserver(() => {
    readColors();
    if (root.dataset.theme !== lastTheme) { lastTheme = root.dataset.theme; if (running) burst(4, 5); }
    if (!running) draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  // Click sulla rete: il nodo più vicino spedisce impulsi lungo le sue connessioni.
  if (areaEl) {
    areaEl.addEventListener("click", event => {
      if (!running) return;
      const r = canvas.getBoundingClientRect();
      const x = event.clientX - r.left, y = event.clientY - r.top;
      let best = 0, bestD = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const d = (px[i] - x) ** 2 + (py[i] - y) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      spawnFrom(best, 6);
    });
  }

  readColors();
  build();
  resize();
  sync();
})();
