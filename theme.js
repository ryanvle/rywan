(function () {
  const STORAGE_KEY = "rywan-theme";
  const root = document.documentElement;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  let pullCord = null;
  let pullButton = null;
  let isPointerPulling = false;
  let pullStartY = 0;
  let pullDistance = 0;
  let suppressClick = false;
  const PULL_TRIGGER_DISTANCE = 28;
  const PULL_MAX_DISTANCE = 44;

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      return;
    }
  }

  function resolveTheme() {
    const storedTheme = getStoredTheme();

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return mediaQuery.matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }

  function updatePullCord() {
    const activeTheme = root.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = activeTheme === "dark" ? "light" : "dark";

    if (!pullCord || !pullButton) {
      return;
    }

    pullCord.dataset.theme = activeTheme;
    pullButton.setAttribute("aria-pressed", String(activeTheme === "dark"));
    pullButton.setAttribute("aria-label", "Pull to switch to " + nextTheme + " mode");
    pullButton.title = "Pull to switch to " + nextTheme + " mode";
  }

  function toggleTheme() {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
    updatePullCord();
  }

  function handlePreferenceChange(event) {
    const storedTheme = getStoredTheme();

    if (storedTheme === "light" || storedTheme === "dark") {
      return;
    }

    applyTheme(event.matches ? "dark" : "light");
    updatePullCord();
  }

  function setPullDistance(distance) {
    if (!pullCord) {
      return;
    }

    pullDistance = Math.max(0, Math.min(distance, PULL_MAX_DISTANCE));
    pullCord.style.setProperty("--pull-distance", pullDistance + "px");
    pullCord.classList.toggle("is-pulling", pullDistance > 0);
  }

  function finishPull(triggerThemeToggle) {
    isPointerPulling = false;
    pullStartY = 0;
    setPullDistance(0);

    if (triggerThemeToggle) {
      pullCord.classList.add("is-flash");
      window.setTimeout(function () {
        if (pullCord) {
          pullCord.classList.remove("is-flash");
        }
      }, 220);
      toggleTheme();
    }
  }

  function mountPullCord() {
    if (!document.body || document.querySelector(".theme-pull")) {
      return;
    }

    pullCord = document.createElement("div");
    pullCord.className = "theme-pull";
    pullCord.innerHTML =
      '<button type="button" class="theme-pull__button">' +
      '<span class="theme-pull__line" aria-hidden="true"></span>' +
      '<span class="theme-pull__knob" aria-hidden="true"></span>' +
      "</button>";

    pullButton = pullCord.querySelector(".theme-pull__button");

    if (!pullButton) {
      return;
    }

    pullButton.addEventListener("click", function (event) {
      event.preventDefault();

      if (suppressClick) {
        suppressClick = false;
        return;
      }

      if (event.detail === 0) {
        toggleTheme();
      }
    });

    pullButton.addEventListener("pointerdown", function (event) {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      event.preventDefault();
      isPointerPulling = true;
      pullStartY = event.clientY;
      pullButton.setPointerCapture(event.pointerId);
      pullCord.classList.add("is-armed");
    });

    pullButton.addEventListener("pointermove", function (event) {
      if (!isPointerPulling) {
        return;
      }

      setPullDistance(event.clientY - pullStartY);
    });

    pullButton.addEventListener("pointerup", function (event) {
      if (!isPointerPulling) {
        return;
      }

      const shouldToggle = pullDistance >= PULL_TRIGGER_DISTANCE;
      suppressClick = true;
      window.setTimeout(function () {
        suppressClick = false;
      }, 0);

      pullCord.classList.remove("is-armed");
      pullButton.releasePointerCapture(event.pointerId);
      finishPull(shouldToggle);
    });

    pullButton.addEventListener("pointercancel", function (event) {
      if (!isPointerPulling) {
        return;
      }

      pullCord.classList.remove("is-armed");
      pullButton.releasePointerCapture(event.pointerId);
      finishPull(false);
    });

    document.body.appendChild(pullCord);
    updatePullCord();
  }

  applyTheme(resolveTheme());

  document.addEventListener("DOMContentLoaded", function () {
    mountPullCord();
    updatePullCord();
  });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handlePreferenceChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handlePreferenceChange);
  }
})();
