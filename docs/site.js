"use strict";

const gallery = document.querySelector("[data-gallery]");
gallery.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-preview]");
  if (!button) return;
  for (const choice of gallery.querySelectorAll("button[data-preview]")) {
    const active = choice === button;
    choice.setAttribute("aria-pressed", String(active));
    document.getElementById("preview-" + choice.dataset.preview).hidden = !active;
  }
});
