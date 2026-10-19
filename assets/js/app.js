(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const menuButton = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("portfolio-theme"); } catch (_) {}
  const setTheme = (theme, save = false) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    themeButton.setAttribute("aria-label", theme === "dark" ? "Attiva tema chiaro" : "Attiva tema scuro");
    themeButton.querySelector("span").textContent = theme === "dark" ? "☀" : "◐";
    if (save) { savedTheme = theme; try { localStorage.setItem("portfolio-theme", theme); } catch (_) {} }
  };
  setTheme(savedTheme || (systemDark.matches ? "dark" : "light"));
  themeButton.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark", true));
  systemDark.addEventListener("change", event => { if (!savedTheme) setTheme(event.matches ? "dark" : "light"); });
  const closeMenu = () => { nav.classList.remove("is-open"); menuButton.setAttribute("aria-expanded", "false"); menuButton.setAttribute("aria-label", "Apri menu"); };
  menuButton.addEventListener("click", () => { const open = menuButton.getAttribute("aria-expanded") !== "true"; nav.classList.toggle("is-open", open); menuButton.setAttribute("aria-expanded", String(open)); menuButton.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu"); });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  document.getElementById("year").textContent = new Date().getFullYear();
})();
