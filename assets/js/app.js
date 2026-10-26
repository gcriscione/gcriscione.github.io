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

  document.getElementById("year").textContent = new Date().getFullYear();
})();
