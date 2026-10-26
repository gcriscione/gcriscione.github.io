(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const menuButton = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const STORAGE_KEY = "portfolio-theme";
  const BAR_COLOR = { light: "#f4f7fc", dark: "#111b21" }; // uguali a --bg in palette.css

  // Tema: scelta salvata, altrimenti preferenza del sistema.
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const next = theme === "dark" ? "chiaro" : "scuro";
    themeButton.setAttribute("aria-label", "Attiva tema " + next);
    themeButton.setAttribute("title", "Attiva tema " + next);
    if (themeMeta) themeMeta.content = BAR_COLOR[theme];
    if (persist) {
      saved = theme;
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
    }
  };

  applyTheme(root.dataset.theme || saved || (systemDark.matches ? "dark" : "light"));
  themeButton.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true));
  systemDark.addEventListener("change", event => { if (!saved) applyTheme(event.matches ? "dark" : "light"); });

  // Menu mobile.
  const setMenu = open => {
    nav.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
  };
  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => { if (event.key === "Escape") setMenu(false); });
  document.addEventListener("click", event => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });

  // Sezione attiva nel menu e barra di avanzamento della lettura.
  const MIN_EXTRA_SCREENS = 1.5; // la barra compare se oltre la prima schermata restano almeno 1,5 schermate da scorrere
  const progress = document.getElementById("progress");
  const bar = progress.firstElementChild;
  const sections = Array.from(nav.querySelectorAll("a[href^='#']"))
    .map(link => ({ link, section: document.querySelector(link.getAttribute("href")) }))
    .filter(item => item.section);
  let activeLink = null, ticking = false;

  const update = () => {
    ticking = false;
    const max = root.scrollHeight - window.innerHeight;
    const showBar = max >= window.innerHeight * MIN_EXTRA_SCREENS;
    progress.hidden = !showBar;
    if (showBar) bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, window.scrollY / max)) + ")";

    const probe = window.innerHeight * 0.35;
    let current = null;
    sections.forEach(item => { if (item.section.getBoundingClientRect().top <= probe) current = item.link; });
    if (max > 0 && window.scrollY >= max - 4) current = sections[sections.length - 1].link; // in fondo alla pagina
    if (current !== activeLink) {
      if (activeLink) activeLink.removeAttribute("aria-current");
      if (current) current.setAttribute("aria-current", "true");
      activeLink = current;
    }
  };
  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  // Foto intera sull'avatar: al passaggio del mouse (CSS) o con un tocco su schermi senza hover.
  const avatarWrap = document.querySelector(".avatar-wrap");
  const avatarButton = document.getElementById("avatar-button");
  if (avatarWrap && avatarButton) {
    let closeTimer;
    const setAvatar = open => {
      avatarWrap.classList.toggle("is-open", open);
      clearTimeout(closeTimer);
      if (open) closeTimer = setTimeout(() => setAvatar(false), 3500);
    };
    avatarButton.addEventListener("click", () => {
      if (window.matchMedia("(hover: hover)").matches) return; // col mouse basta il passaggio
      setAvatar(!avatarWrap.classList.contains("is-open"));
    });
    document.addEventListener("click", event => { if (!avatarWrap.contains(event.target)) setAvatar(false); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") setAvatar(false); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
