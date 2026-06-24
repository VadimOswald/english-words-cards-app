document.addEventListener("DOMContentLoaded", () => {
  let selectedMode = "1p";
  let canInteract = true;

  // THEME
  const savedTheme = localStorage.getItem("english_cards_theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  function updateThemeIcon(theme) {
    document.getElementById("theme-icon").textContent = theme === "dark" ? "☾" : "☀";
  }

  document.getElementById("theme-switcher").addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("english_cards_theme", next);
    updateThemeIcon(next);
  });

  function getCurrentScreen() {
    const screens = document.querySelectorAll(".screen");
    for (const s of screens) {
      if (s.style.display !== "none") return s.id.replace("screen-", "");
    }
    return null;
  }

  function startGame() {
    const countInput = document.getElementById("card-count");
    const count = parseInt(countInput.value);
    const errorEl = document.getElementById("count-error");
    if (!Game.validateCardCount(count)) {
      errorEl.textContent = "Только четное число от 2 до 9999";
      return;
    }
    errorEl.textContent = "";
    Game.init(selectedMode, count);
    UI.renderSelection();
  }

  function handleDone() {
    if (!canInteract) return;
    canInteract = false;
    const earned = Game.recordResult("done");
    UI.showScorePopup(earned, Game.state.streak);
    setTimeout(() => {
      if (Game.isGameOver()) {
        Stats.saveGameEnd({
          cardsPlayed: Game.state.totalCards,
          bestStreak: Game.state.bestStreak
        });
        UI.renderResults();
      } else {
        Game.nextTurn();
        UI.renderSelection();
      }
      canInteract = true;
    }, 850);
  }

  function handleSkip() {
    if (!canInteract) return;
    canInteract = false;
    const earned = Game.recordResult("skip");
    UI.showScorePopup(earned, 0);
    setTimeout(() => {
      if (Game.isGameOver()) {
        Stats.saveGameEnd({
          cardsPlayed: Game.state.totalCards,
          bestStreak: Game.state.bestStreak
        });
        UI.renderResults();
      } else {
        Game.nextTurn();
        UI.renderSelection();
      }
      canInteract = true;
    }, 850);
  }

  // MODE SELECTOR
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedMode = btn.dataset.mode;
    });
  });

  // BUTTONS
  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("done-btn").addEventListener("click", handleDone);
  document.getElementById("skip-btn").addEventListener("click", handleSkip);
  document.getElementById("restart-btn").addEventListener("click", () => UI.renderSetup());
  document.getElementById("stats-btn").addEventListener("click", () => UI.renderStats());
  document.getElementById("stats-back-btn").addEventListener("click", () => UI.renderSetup());
  document.getElementById("stats-reset-btn").addEventListener("click", () => {
    if (confirm("Сбросить всю статистику?")) {
      Stats.reset();
      UI.renderStats();
    }
  });

  // KEYBOARD SHORTCUTS
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement.tagName;
    if (tag === "INPUT") return;

    const screen = getCurrentScreen();

    if (screen === "setup") {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); startGame(); }
      if (e.key.toLowerCase() === "s") UI.renderStats();
    }

    if (screen === "selection") {
      if (e.key === "1") { const el = document.querySelector('.card[data-index="0"]'); if (el) el.click(); }
      if (e.key === "2") { const el = document.querySelector('.card[data-index="1"]'); if (el) el.click(); }
      if (e.key === "3") { const el = document.querySelector('.card[data-index="2"]'); if (el) el.click(); }
    }

    if (screen === "card") {
      if (e.key === "Enter") { e.preventDefault(); handleDone(); }
      if (e.key === "Escape") { e.preventDefault(); handleSkip(); }
    }

    if (screen === "results") {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); UI.renderSetup(); }
    }

    if (screen === "stats") {
      if (e.key === "Escape") UI.renderSetup();
    }
  });

  // INIT
  UI.renderSetup();
});
