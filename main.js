// Builds the page from content.js and data.js. To change the content, edit content.js.
(function () {
  const S = window.SITE, D = window.FOODREC_DATA;
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, props = {}, ...children) {
    const e = Object.assign(document.createElement(tag), props);
    e.append(...children.filter((c) => c !== null && c !== undefined));
    return e;
  }
  const svgEl = (tag, attrs = {}, text) => {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  };

  // ---- text, header, links ------------------------------------------------------------
  document.title = `${S.title}: ${S.tagline.charAt(0).toLowerCase()}${S.tagline.slice(1)}`;
  $("brand").textContent = S.title;
  $("eyebrow").textContent = S.eyebrow || "";
  $("title").textContent = S.title;
  $("tagline").textContent = S.tagline;
  $("intro").textContent = S.intro;
  $("principle").textContent = S.principle;
  $("principle-detail").textContent = S.principleDetail;
  $("screenshot-note").textContent = S.screenshotNote || "";
  $("install-code").textContent = S.install.join("\n");

  const external = { target: "_blank", rel: "noopener" };
  const actions = $("actions");
  if (S.demoUrl) {
    $("nav-demo").append(el("a", { className: "btn primary small", href: S.demoUrl, textContent: "Live demo", ...external }));
    actions.append(el("a", { className: "btn primary", href: S.demoUrl, textContent: "Try the live demo", ...external }));
    $("cta").append(el("h2", { textContent: "Now try it with your own choices" }),
      el("p", { textContent: "The live demo runs the full system: rules, diversity, learned taste and the supervisor." }),
      el("a", { className: "btn primary", href: S.demoUrl, textContent: "Open the live demo", ...external }));
  } else { $("cta").remove(); }
  actions.append(el("a", { className: "btn", href: "#lab", textContent: "Ranking lab" }),
    el("a", { className: "btn", href: "#replay", textContent: "Supervisor replay" }),
    el("a", { className: "btn", href: "#video", textContent: "Watch the video" }));
  if (S.repoUrl) actions.append(el("a", { className: "btn", href: S.repoUrl, textContent: "Source code", ...external }));

  const shot = (s) => `media/screens/${s.file}`;
  $("hero-shot").src = shot(S.screenshots[0]);
  $("hero-shot").alt = `${S.title}: ${S.screenshots[0].title}`;

  // ---- video and chapters -------------------------------------------------------------
  function player(v) {
    if (v.youtube) {
      return el("iframe", { src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}`, title: v.title, loading: "lazy", allowFullscreen: true,
        allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture", referrerPolicy: "strict-origin-when-cross-origin" });
    }
    const video = el("video", { src: v.file, poster: v.poster || "", controls: true, preload: "metadata", playsInline: true, title: v.title });
    if (v.captions) video.append(el("track", { kind: "captions", src: v.captions, srclang: "en", label: "English" }));
    return video;
  }
  if (!S.videos.length) $("video").remove();
  S.videos.forEach((v) => $("videos").append(el("figure", { className: "video" }, el("div", { className: "frame" }, player(v)),
    el("figcaption", {}, el("strong", { textContent: v.title }), el("span", { textContent: v.description || "" })))));
  const mainVideo = document.querySelector("#videos video");
  const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const chapterBtns = (S.chapters || []).map((c) => {
    const b = el("button", { type: "button", onclick: () => { if (mainVideo) { mainVideo.currentTime = c.at; mainVideo.play().catch(() => {}); } } },
      el("time", { textContent: clock(c.at) }), el("span", { textContent: c.title }));
    $("chapters").append(el("li", {}, b));
    return b;
  });
  function markChapter() {
    if (!mainVideo) return;
    let cur = 0;
    (S.chapters || []).forEach((c, i) => { if (mainVideo.currentTime >= c.at) cur = i; });
    chapterBtns.forEach((b, i) => { b.classList.toggle("on", i === cur); if (i === cur) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  if (mainVideo) { mainVideo.addEventListener("timeupdate", markChapter); markChapter(); }

  // ---- shared tooltip for the ranking bars --------------------------------------------
  const tip = el("div", { className: "tip floating", hidden: true });
  document.body.append(tip);
  function showTip(e, lines) {
    tip.replaceChildren(...lines.map((l, i) => el(i ? "div" : "strong", { textContent: l })));
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, e.clientX + 14)) + "px";
    tip.style.top = Math.max(8, e.clientY - r.height - 12) + "px";
  }

  // ---- ranking lab --------------------------------------------------------------------
  const CRIT = [["h", "Healthiness"], ["s", "Sustainability"], ["t", "Convenience"]];
  const TASTE = 0.25;
  const lab = { w: { h: 40, s: 30, t: 30 }, meal: "breakfast", rows: new Map(), prev: [] };
  const shares = () => {
    const sum = lab.w.h + lab.w.s + lab.w.t;
    return sum ? { h: lab.w.h / sum, s: lab.w.s / sum, t: lab.w.t / sum } : { h: 1 / 3, s: 1 / 3, t: 1 / 3 };
  };
  const parts = (r, sh) => ({ p: TASTE * r.p, h: (1 - TASTE) * sh.h * r.h, s: (1 - TASTE) * sh.s * r.s, t: (1 - TASTE) * sh.t * r.t });
  const total = (c) => c.p + c.h + c.s + c.t;
  const NAMES = { p: "Taste", h: "Healthiness", s: "Sustainability", t: "Convenience" };

  ["breakfast", "lunch", "dinner"].forEach((m) => $("lab-meal").append(el("button", { type: "button", textContent: m[0].toUpperCase() + m.slice(1),
    onclick: (e) => { lab.meal = m; [...$("lab-meal").children].forEach((b) => { const on = b === e.currentTarget; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); lab.prev = []; renderLab(); } })));
  $("lab-meal").children[0].classList.add("on");
  $("lab-meal").children[0].setAttribute("aria-pressed", "true");

  const sliders = {};
  CRIT.forEach(([k, name]) => {
    const out = el("output", { className: "share" });
    const input = el("input", { type: "range", min: 0, max: 100, step: 1, value: lab.w[k], ariaLabel: name,
      oninput: (e) => { lab.w[k] = +e.target.value; markPreset(); renderLab(); } });
    input.dataset.k = k;
    input.style.setProperty("--c", `var(--s-${k})`);
    sliders[k] = { input, out };
    $("lab-sliders").append(el("label", { className: "slider" }, el("span", { className: "slider-top" }, el("span", { className: "sw", style: `background:var(--s-${k})` }), el("b", { textContent: name }), out), input));
  });
  const PRESETS = [
    { name: "Balanced default", w: { h: 40, s: 30, t: 30 } },
    { name: "Sara's goal", w: { h: 35, s: 50, t: 15 } },
    { name: "After her update", w: { h: 30, s: 42, t: 28 } },
    { name: "Convenience first", w: { h: 10, s: 10, t: 80 } },
  ];
  const presetBtns = PRESETS.map((p) => {
    const b = el("button", { type: "button", className: "chip", textContent: p.name, onclick: () => setWeights(p.w) });
    $("lab-presets").append(b);
    return b;
  });
  function markPreset() {
    PRESETS.forEach((p, i) => { const on = CRIT.every(([k]) => p.w[k] === lab.w[k]); presetBtns[i].classList.toggle("on", on); presetBtns[i].setAttribute("aria-pressed", on); });
  }
  function setWeights(w) {
    Object.assign(lab.w, w);
    CRIT.forEach(([k]) => { sliders[k].input.value = w[k]; });
    markPreset(); renderLab();
  }
  [["p", "Taste (fixed share)"], ...CRIT].forEach(([k, n]) => $("lab-legend").append(el("span", {}, el("i", { style: `background:var(--s-${k})` }), n)));
  $("lab-note").textContent = `Uses the real scores of ${D.recipes.length} recipes from ReciReflect's catalogue, with taste at its starting value of 0.50. This lab ranks by score alone: the full app also applies mandatory rules, keeps lists varied and learns taste, so its lists can differ.`;

  function renderLab() {
    const sh = shares();
    CRIT.forEach(([k]) => { sliders[k].out.textContent = `${Math.round(sh[k] * 100)}%`; sliders[k].input.style.setProperty("--pos", `${lab.w[k]}%`); });
    const ranked = D.recipes.filter((r) => r.meal === lab.meal).map((r) => ({ r, c: parts(r, sh) })).sort((a, b) => total(b.c) - total(a.c)).slice(0, 5);
    const list = $("lab-list");
    const before = new Map([...lab.rows].map(([id, e]) => [id, e.el.getBoundingClientRect().top]));
    const keep = new Set(ranked.map((x) => x.r.title));
    [...lab.rows.keys()].forEach((id) => { if (!keep.has(id)) { lab.rows.get(id).el.remove(); lab.rows.delete(id); } });
    ranked.forEach((x, i) => {
      let row = lab.rows.get(x.r.title);
      if (!row) {
        const rank = el("span", { className: "rank" }), move = el("span", { className: "move" }), score = el("b", { className: "score" });
        const bar = el("div", { className: "stack" }), detail = el("div", { className: "detail" });
        const segs = {};
        ["p", "h", "s", "t"].forEach((k) => {
          const s = el("span", { style: `background:var(--s-${k})` });
          s.addEventListener("pointermove", (e) => showTip(e, [x.r.title, `${NAMES[k]}: ${row.c[k].toFixed(2)} of ${total(row.c).toFixed(2)}`]));
          s.addEventListener("pointerleave", () => { tip.hidden = true; });
          segs[k] = s; bar.append(s);
        });
        const li = el("li", { className: "rankrow" }, rank, el("div", { className: "rank-main" },
          el("div", { className: "rank-title" }, el("strong", { textContent: x.r.title }), move),
          el("div", { className: "rank-meta", textContent: `${x.r.cuisine ? x.r.cuisine + " · " : ""}${x.r.n} ingredients · grade ${x.r.grade}` }), bar, detail), score);
        row = { el: li, rank, move, score, segs, detail, isNew: true };
        lab.rows.set(x.r.title, row);
      }
      row.c = x.c;
      list.append(row.el);
      row.rank.textContent = i + 1;
      row.score.textContent = total(x.c).toFixed(2);
      ["p", "h", "s", "t"].forEach((k) => { row.segs[k].style.width = `${x.c[k] * 100}%`; });
      row.detail.textContent = `Taste ${x.c.p.toFixed(2)} · Healthiness ${x.c.h.toFixed(2)} · Sustainability ${x.c.s.toFixed(2)} · Convenience ${x.c.t.toFixed(2)}`;
      const was = lab.prev.indexOf(x.r.title);
      row.move.textContent = !lab.prev.length ? "" : was < 0 ? "new" : was > i ? `↑ ${was - i}` : was < i ? `↓ ${i - was}` : "";
      row.move.className = "move" + (was < 0 ? " in" : "");
    });
    lab.prev = ranked.map((x) => x.r.title);
    if (!reduced) {
      lab.rows.forEach((row, id) => {
        const old = before.get(id), now = row.el.getBoundingClientRect().top;
        if (old === undefined) row.el.animate([{ opacity: 0, transform: "translateX(-12px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
        else if (old !== now) row.el.animate([{ transform: `translateY(${old - now}px)` }, { transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" });
      });
    }
  }
  renderLab(); markPreset();

  // ---- supervisor replay --------------------------------------------------------------
  const STEPS = D.steps, Q_AT = 4, ANSWER_AT = 5, P_AT = 11;
  const rp = { i: 0, answered: false, accepted: false, timer: null, hover: null };
  const awaiting = () => (rp.i === Q_AT && !rp.answered) || (rp.i === P_AT && !rp.accepted);
  function statusFor(i) {
    if (rp.accepted) return ["done", "Goal updated", "Only now has Sara's goal changed, because she accepted."];
    if (i === P_AT) return ["act", "Threshold 2 reached: a proposal", "The gap is above 0.15 with at least 6 informative reactions, and the waiting period is over."];
    if (i > Q_AT) { const n = i - ANSWER_AT; return ["wait", "Waiting period", `The gap keeps growing, but the supervisor does not raise an answered topic again until 6 feedback events have passed (${n} of 6 so far).`]; }
    if (i === Q_AT) return ["act", "Threshold 1 reached: a question", "The gap has passed 0.10 with at least 3 informative reactions. The supervisor asks, and changes nothing."];
    return ["quiet", "Supervisor is quiet", i === 0 ? "Press Play or Next reaction to begin." : "The gap is still below 0.10, so Sara simply gets her recommendations."];
  }
  function decisionCard() {
    const note = "In this replay you follow Sara's recorded choice. In the live demo, every option works.";
    const inert = (t) => el("button", { type: "button", className: "ctl", disabled: true, textContent: t });
    if (rp.i === Q_AT && !rp.answered) {
      return el("div", { className: "decision" }, el("span", { className: "tag", textContent: "Question" }),
        el("h4", { textContent: "When convenience and sustainability pull in different directions, which usually wins for you?" }),
        el("p", { textContent: "Your recent choices lean more towards convenience than your saved goal, but there is not yet enough evidence to suggest a change. None of these answers edits your saved goal." }),
        el("div", { className: "opts" }, el("button", { type: "button", className: "ctl primary", textContent: "Convenience usually wins", onclick: () => { rp.answered = true; advance(); } }),
          inert("Sustainability usually wins"), inert("Only today"), inert("Keep my goal")), el("p", { className: "small", textContent: note }));
    }
    if (rp.i === P_AT && !rp.accepted) {
      return el("div", { className: "decision" }, el("span", { className: "tag", textContent: "Proposal" }), el("h4", { textContent: "Give convenience more weight?" }),
        el("p", { textContent: "Your saved goal gives convenience 0.15, but your choices behave like 0.51 (11 events). Accepting moves it halfway, to 0.28." }),
        el("div", { className: "opts" }, el("button", { type: "button", className: "ctl primary", textContent: "Update my goal", onclick: () => { rp.accepted = true; stop(); renderReplay(); } }),
          inert("Only today"), inert("Keep my goal")), el("p", { className: "small", textContent: note }));
    }
    if (rp.accepted) {
      const row = (label, v) => el("div", { className: "goalrow" }, el("span", { textContent: label }),
        el("div", { className: "stack big" }, ...["h", "s", "t"].map((k) => el("span", { style: `background:var(--s-${k});width:${v[k]}%`, title: `${NAMES[k]} ${v[k]}%` }))),
        el("small", { textContent: `${v.h} / ${v.s} / ${v.t}` }));
      return el("div", { className: "decision" }, el("span", { className: "tag", textContent: "Goal version 2" }), el("h4", { textContent: "A new version is saved. The old one can be restored." }),
        row("Before", { h: 35, s: 50, t: 15 }), row("After", { h: 30, s: 42, t: 28 }), el("p", { className: "small", textContent: "Healthiness / sustainability / convenience, in percent." }),
        el("button", { type: "button", className: "ctl primary", textContent: "Try this goal in the ranking lab", onclick: () => { setWeights({ h: 30, s: 42, t: 28 }); $("lab").scrollIntoView(); } }));
    }
    return null;
  }
  function drawChart() {
    const host = $("rp-svg"), W = Math.max(280, host.clientWidth), H = W < 480 ? 270 : 330;
    const m = { l: 44, r: 16, t: 18, b: 38 }, Y = 0.4, X = STEPS.length - 1;
    const x = (i) => m.l + (i / X) * (W - m.l - m.r), y = (v) => m.t + (1 - v / Y) * (H - m.t - m.b);
    const svg = svgEl("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    [0, 0.1, 0.2, 0.3, 0.4].forEach((v) => {
      svg.append(svgEl("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: "grid" }), svgEl("text", { x: m.l - 8, y: y(v) + 4, "text-anchor": "end", class: "axis" }, v.toFixed(2)));
    });
    STEPS.forEach((s, i) => { if (W >= 480 || i % 2 === 1) svg.append(svgEl("text", { x: x(i), y: H - m.b + 18, "text-anchor": "middle", class: "axis" }, s.ev)); });
    svg.append(svgEl("text", { x: (m.l + W - m.r) / 2, y: H - 4, "text-anchor": "middle", class: "axis" }, "Informative reactions since the goal was saved"));
    [[0.1, "Question at 0.10, after 3 reactions"], [0.15, "Proposal at 0.15, after 6 reactions"]].forEach(([v, t]) => {
      svg.append(svgEl("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: "limit" }), svgEl("text", { x: W - m.r - 4, y: y(v) - 6, "text-anchor": "end", class: "limit-label" }, t));
    });
    const pts = STEPS.slice(0, rp.i + 1);
    svg.append(svgEl("path", { class: "gapline", d: pts.map((s, i) => `${i ? "L" : "M"}${x(i)},${y(s.gap)}`).join("") }));
    pts.forEach((s, i) => {
      const big = i === Q_AT || i === P_AT;
      svg.append(svgEl("circle", { cx: x(i), cy: y(s.gap), r: big ? 7 : i === rp.i ? 6 : 4, class: big ? "pt key" : "pt" }));
      if (big) svg.append(svgEl("text", { x: x(i) + (i === P_AT ? -12 : 0), y: y(s.gap) - 14, "text-anchor": i === P_AT ? "end" : "middle", class: "keylabel" }, i === Q_AT ? "Question" : "Proposal"));
    });
    if (rp.hover !== null) svg.append(svgEl("line", { x1: x(rp.hover), x2: x(rp.hover), y1: m.t, y2: H - m.b, class: "cross" }));
    host.replaceChildren(svg);
    host.onpointermove = (e) => {
      const r = host.getBoundingClientRect();
      const i = Math.max(0, Math.min(rp.i, Math.round(((e.clientX - r.left - m.l) / (W - m.l - m.r)) * X)));
      if (i !== rp.hover) { rp.hover = i; drawChart(); }
      chartTip(i, x(i), y(STEPS[i].gap));
    };
    host.onpointerleave = () => { rp.hover = null; $("rp-tip").hidden = true; drawChart(); };
    rp.place = (i) => chartTip(i, x(i), y(STEPS[i].gap));
  }
  function chartTip(i, px, py) {
    const s = STEPS[i], t = $("rp-tip");
    t.replaceChildren(el("strong", { textContent: `Reaction ${s.ev}: gap ${s.gap >= 0 ? "+" : ""}${s.gap.toFixed(2)}` }), el("div", { textContent: s.text }));
    t.hidden = false;
    const host = $("rp-svg"), w = host.clientWidth, tw = t.offsetWidth;
    t.style.left = host.offsetLeft + Math.max(0, Math.min(w - tw, px - tw / 2)) + "px";
    t.style.top = host.offsetTop + Math.max(0, py - t.offsetHeight - 14) + "px";
  }
  $("rp-svg").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const c = rp.hover === null ? rp.i : rp.hover;
    rp.hover = Math.max(0, Math.min(rp.i, c + (e.key === "ArrowLeft" ? -1 : 1)));
    drawChart(); rp.place(rp.hover);
  });
  $("rp-svg").addEventListener("blur", () => { rp.hover = null; $("rp-tip").hidden = true; drawChart(); });
  function renderReplay() {
    const s = STEPS[rp.i];
    $("rp-obs").textContent = s.observed.toFixed(2);
    $("rp-gap").textContent = (s.gap >= 0 ? "+" : "") + s.gap.toFixed(2);
    $("rp-ev").textContent = s.ev;
    const [cls, head, body] = statusFor(rp.i);
    $("rp-status").className = `status ${cls}`;
    $("rp-status").replaceChildren(el("strong", { textContent: head }), el("p", { textContent: body }), rp.i ? el("p", { className: "small", textContent: `Latest: ${s.text}` }) : null);
    $("rp-card").replaceChildren(...[decisionCard()].filter(Boolean));
    $("rp-next").disabled = rp.i >= P_AT || awaiting();
    $("rp-play").disabled = rp.i >= P_AT || awaiting();
    $("rp-play").textContent = rp.timer ? "Pause" : "Play";
    drawChart();
  }
  function stop() { clearInterval(rp.timer); rp.timer = null; }
  function advance() {
    if (rp.i >= P_AT || awaiting()) { stop(); renderReplay(); return; }
    rp.i += 1;
    if (awaiting()) stop();
    renderReplay();
  }
  $("rp-next").onclick = () => { stop(); advance(); };
  $("rp-play").onclick = () => {
    if (rp.timer) { stop(); renderReplay(); return; }
    rp.timer = setInterval(advance, reduced ? 1600 : 1000);
    advance();
  };
  $("rp-reset").onclick = () => { stop(); Object.assign(rp, { i: 0, answered: false, accepted: false, hover: null }); renderReplay(); };
  const tbl = $("rp-table");
  tbl.append(el("thead", {}, el("tr", {}, ...["Reaction", "What happened", "Her choices", "Gap"].map((t) => el("th", { scope: "col", textContent: t })))));
  tbl.append(el("tbody", {}, ...STEPS.map((s) => el("tr", {}, el("td", { textContent: s.ev }), el("td", { textContent: s.text }), el("td", { textContent: s.observed.toFixed(2) }), el("td", { textContent: s.gap.toFixed(2) })))));
  renderReplay();
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(drawChart, 120); });

  // ---- app tour -----------------------------------------------------------------------
  let cur = 0, active = 0;
  const railBtns = S.screenshots.map((s, i) => {
    const b = el("button", { type: "button", onclick: () => showScreen(i) }, el("span", { className: "num", textContent: String(i + 1).padStart(2, "0") }), el("span", { textContent: s.title }));
    $("tour-rail").append(b);
    return b;
  });
  function setNote(i) {
    active = i;
    document.querySelectorAll("#tour-img .dot").forEach((d, n) => { const on = n === i; d.classList.toggle("on", on); d.setAttribute("aria-pressed", on); });
    [...$("tour-notes").children].forEach((li, n) => li.classList.toggle("on", n === i));
  }
  function showScreen(i) {
    cur = (i + S.screenshots.length) % S.screenshots.length;
    const s = S.screenshots[cur], notes = s.notes || [];
    railBtns.forEach((b, n) => { const on = n === cur; b.classList.toggle("on", on); if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    const img = el("img", { src: shot(s), alt: s.title, width: 1800, height: 1125 });
    const dots = notes.map((n, k) => {
      const d = el("button", { type: "button", className: "dot", textContent: k + 1, ariaLabel: `${k + 1}: ${n.title}`, onclick: () => setNote(k), onpointerenter: () => setNote(k), onfocus: () => setNote(k) });
      d.style.left = `${n.x}%`; d.style.top = `${n.y}%`;
      return d;
    });
    $("tour-img").replaceChildren(img, ...dots);
    if (!reduced) img.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
    $("tour-title").textContent = s.title;
    $("tour-text").textContent = s.text;
    $("tour-notes").replaceChildren(...notes.map((n, k) => el("li", { onpointerenter: () => setNote(k), onclick: () => setNote(k) }, el("span", { className: "num", textContent: k + 1 }), el("div", {}, el("strong", { textContent: n.title }), el("p", { textContent: n.text })))));
    if (notes.length) setNote(0);
    const next = new Image(); next.src = shot(S.screenshots[(cur + 1) % S.screenshots.length]);
  }
  $("tour-prev").onclick = () => showScreen(cur - 1);
  $("tour-next").onclick = () => showScreen(cur + 1);
  showScreen(0);

  // ---- full-size viewer ---------------------------------------------------------------
  const viewer = $("viewer");
  let vw = 0;
  function view(i) {
    vw = (i + S.screenshots.length) % S.screenshots.length;
    const s = S.screenshots[vw];
    $("vw-img").src = shot(s); $("vw-img").alt = s.title;
    $("vw-cap").replaceChildren(el("strong", { textContent: s.title }), ` ${s.text}`);
  }
  $("tour-zoom").onclick = () => { view(cur); viewer.showModal(); };
  $("vw-close").onclick = () => viewer.close();
  $("vw-prev").onclick = () => view(vw - 1);
  $("vw-next").onclick = () => view(vw + 1);
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") view(vw - 1); if (e.key === "ArrowRight") view(vw + 1); });

  // ---- features, copy, footer ---------------------------------------------------------
  S.features.forEach((f) => $("features").append(el("div", { className: "feature" }, el("h3", { textContent: f.title }), el("p", { textContent: f.text }))));
  $("copy").onclick = async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(S.install.join("\n")); b.textContent = "Copied"; }
    catch { b.textContent = "Select and copy"; }
    setTimeout(() => { b.textContent = "Copy"; }, 1800);
  };
  $("footer").append(S.title, S.repoUrl ? " · " : "", S.repoUrl ? el("a", { href: S.repoUrl, textContent: "Source code" }) : "",
    S.demoUrl ? " · " : "", S.demoUrl ? el("a", { href: S.demoUrl, textContent: "Live demo" }) : "");

  // ---- scroll: progress bar, current section, gentle reveal ---------------------------
  const progress = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    $("progress").style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener("scroll", progress, { passive: true }); progress();
  const links = [...$("navlinks").children];
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${e.target.id}`));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); if (t) spy.observe(t); });
  if (!reduced) {
    const rv = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((r) => { r.classList.add("pre"); rv.observe(r); });
  }
})();
