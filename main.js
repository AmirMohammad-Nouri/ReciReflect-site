// Builds the page from content.js. To change the content, edit that file, not this one.
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);

  function el(tag, props = {}, ...children) {
    const e = Object.assign(document.createElement(tag), props);
    e.append(...children);
    return e;
  }

  document.title = `${S.title}: ${S.tagline.charAt(0).toLowerCase()}${S.tagline.slice(1)}`;
  $("title").textContent = S.title;
  $("tagline").textContent = S.tagline;
  $("intro").textContent = S.intro;
  $("principle").textContent = S.principle;
  $("principle-detail").textContent = S.principleDetail;
  $("screenshot-note").textContent = S.screenshotNote || "";
  $("install-code").textContent = S.install.join("\n");

  // Buttons: the demo button only appears once content.js has an address for it.
  const external = { target: "_blank", rel: "noopener" };
  const actions = $("actions");
  if (S.demoUrl) actions.append(el("a", { className: "btn primary", href: S.demoUrl, textContent: "Try the live demo", ...external }));
  if (S.videos.length) actions.append(el("a", { className: "btn" + (S.demoUrl ? "" : " primary"), href: "#video", textContent: "Watch the video" }));
  actions.append(el("a", { className: "btn", href: "#screens", textContent: "See the screenshots" }));
  if (S.repoUrl) actions.append(el("a", { className: "btn", href: S.repoUrl, textContent: "Source code", ...external }));

  const shot = (s) => `media/screens/${s.file}`;
  if (S.screenshots.length) {
    $("hero-shot").src = shot(S.screenshots[0]);
    $("hero-shot").alt = `${S.title}: ${S.screenshots[0].title}`;
  } else {
    $("hero-shot").remove();
  }

  // Videos: a file in media/videos, or a YouTube id.
  function player(v) {
    if (v.youtube) {
      return el("iframe", {
        src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}`,
        title: v.title, loading: "lazy", allowFullscreen: true,
        allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture",
        referrerPolicy: "strict-origin-when-cross-origin",
      });
    }
    return el("video", { src: v.file, poster: v.poster || "", controls: true, preload: "metadata", playsInline: true, title: v.title });
  }
  if (!S.videos.length) $("video").remove();
  S.videos.forEach((v) => $("videos").append(
    el("figure", { className: "video" }, el("div", { className: "frame" }, player(v)),
      el("figcaption", {}, el("strong", { textContent: v.title }), el("span", { textContent: v.description || "" })))));

  // Gallery and full-size viewer.
  const viewer = $("viewer");
  let current = 0;
  function show(i) {
    current = (i + S.screenshots.length) % S.screenshots.length;
    const s = S.screenshots[current];
    $("vw-img").src = shot(s);
    $("vw-img").alt = s.title;
    $("vw-cap").replaceChildren(el("strong", { textContent: s.title }), ` ${s.text}`);
  }
  S.screenshots.forEach((s, i) => $("gallery").append(
    el("figure", { className: "shot" },
      el("button", { type: "button", ariaLabel: `Enlarge screenshot: ${s.title}`, onclick: () => { show(i); viewer.showModal(); } },
        el("img", { src: shot(s), alt: s.title, loading: "lazy", width: 1800, height: 1125 })),
      el("figcaption", {}, el("strong", { textContent: s.title }), el("span", { textContent: s.text })))));
  $("vw-close").onclick = () => viewer.close();
  $("vw-prev").onclick = () => show(current - 1);
  $("vw-next").onclick = () => show(current + 1);
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  S.features.forEach((f) => $("features").append(
    el("div", { className: "feature" }, el("h3", { textContent: f.title }), el("p", { textContent: f.text }))));

  $("footer").append(S.title, S.repoUrl ? " · " : "",
    S.repoUrl ? el("a", { href: S.repoUrl, textContent: "Source code" }) : "");
})();
