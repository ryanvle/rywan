(function () {
  const supportsHoverCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!supportsHoverCursor) {
    return;
  }

  const root = document.documentElement;
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML =
    '<div class="custom-cursor__ring"></div><div class="custom-cursor__dot"></div>';

  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;
  let rafId = 0;

  const interactiveSelector =
    'a, button, input, label, select, summary, textarea, video, [role="button"], .game-log-sort';

  function updateInteractiveState(target) {
    const interactiveTarget =
      target instanceof Element ? target.closest(interactiveSelector) : null;
    cursor.classList.toggle("is-active", Boolean(interactiveTarget));
  }

  function tick() {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    cursor.style.transform = "translate(" + currentX + "px, " + currentY + "px)";
    rafId = window.requestAnimationFrame(tick);
  }

  function showCursor() {
    if (!cursor.classList.contains("is-visible")) {
      cursor.classList.add("is-visible");
    }
  }

  function hideCursor() {
    cursor.classList.remove("is-visible", "is-active", "is-pressed");
  }

  root.classList.add("has-custom-cursor");
  document.body.appendChild(cursor);
  tick();

  window.addEventListener("pointermove", function (event) {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    targetX = event.clientX;
    targetY = event.clientY;
    showCursor();
    updateInteractiveState(event.target);
  });

  window.addEventListener("pointerdown", function (event) {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    cursor.classList.add("is-pressed");
  });

  window.addEventListener("pointerup", function () {
    cursor.classList.remove("is-pressed");
  });

  window.addEventListener("pointerleave", hideCursor);
  document.addEventListener("mouseleave", hideCursor);

  document.addEventListener("mouseover", function (event) {
    updateInteractiveState(event.target);
  });

  document.addEventListener("focusin", function (event) {
    updateInteractiveState(event.target);
  });

  document.addEventListener("focusout", function (event) {
    updateInteractiveState(event.relatedTarget);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      hideCursor();
    }
  });

  window.addEventListener("blur", hideCursor);
  window.addEventListener("beforeunload", function () {
    window.cancelAnimationFrame(rafId);
  });
})();
