(function () {
  "use strict";

  const views = {
    menu: document.getElementById("view-menu"),
    paint: document.getElementById("view-paint"),
    animation: document.getElementById("view-animation"),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      const active = key === name;
      el.classList.toggle("is-active", active);
      if (active) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });

    if (name === "paint" && window.PaintApp) {
      requestAnimationFrame(() => PaintApp.init());
    }
    if (name === "animation" && window.AnimationApp) {
      requestAnimationFrame(() => AnimationApp.init());
    }
    if (name === "menu" && window.AnimationApp) {
      AnimationApp.stop();
    }
  }

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.open));
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => showView("menu"));
  });

  showView("menu");
})();
