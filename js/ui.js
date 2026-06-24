const UI = {
  currentSelection: [],

  showScreen(name) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(`screen-${name}`).style.display = "flex";
  },



  updateScores(screenSuffix) {
    const state = Game.state;
    const suffix = screenSuffix || "";
    const container = document.getElementById(`dual-score${suffix}`);
    const p1 = document.getElementById(`score-p1${suffix}`);
    const p2 = document.getElementById(`score-p2${suffix}`);
    const divider = container ? container.querySelector(".dual-score-divider") : null;
    if (!p1 || !p2) return;

    p1.querySelector(".dual-score-value").textContent = state.scores[1];
    p2.querySelector(".dual-score-value").textContent = state.scores[2];

    if (state.mode === "2p") {
      container.style.display = "flex";
      p2.style.display = "flex";
      if (divider) divider.style.display = "block";
      p1.querySelector(".dual-score-label").textContent = "Игрок 1";
      p2.querySelector(".dual-score-label").textContent = "Игрок 2";
      p1.classList.toggle("active", state.currentPlayer === 1);
      p2.classList.toggle("active", state.currentPlayer === 2);
    } else {
      container.style.display = "flex";
      p1.classList.add("active");
      p1.classList.remove("active");
      p1.classList.add("active");
      p2.style.display = "none";
      if (divider) divider.style.display = "none";
      p1.querySelector(".dual-score-label").textContent = "Твой счёт";
    }
  },

  showScorePopup(value, streak) {
    const popup = document.createElement("div");
    popup.className = `score-popup ${value > 0 ? "positive" : "negative"}`;
    let text = value > 0 ? `+${value}` : `${value}`;
    if (streak >= 3) {
      text += ` x${streak}🔥`;
    }
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
  },

  updateStreak(screenSuffix) {
    const suffix = screenSuffix || "";
    const el = document.getElementById(`streak-display${suffix}`);
    if (!el) return;
    const streak = Game.state.streak;
    if (streak >= 3) {
      el.textContent = `СЕРИЯ: ${streak} 🔥`;
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  },

  renderSelection() {
    this.currentSelection = Cards.showSelection();
    const state = Game.state;
    const container = document.getElementById("selection-cards");

    const banner = document.getElementById("turn-banner");
    if (state.mode === "2p") {
      banner.textContent = `Ход: Игрок ${state.currentPlayer}`;
      banner.className = `turn-banner player-${state.currentPlayer}`;
      banner.style.display = "block";
    } else {
      banner.style.display = "none";
    }

    this.updateScores("");
    this.updateStreak("");
    document.getElementById("remaining").textContent = state.remaining;

    const progress = ((state.totalCards - state.remaining) / state.totalCards) * 100;
    document.getElementById("progress-bar").style.width = `${progress}%`;

    container.innerHTML = this.currentSelection.map((card, i) =>
      `<div class="card face-down" data-index="${i}">
        <span class="card-number">0${i + 1}</span>
        <span class="card-label">?</span>
      </div>`
    ).join("");

    container.querySelectorAll(".card").forEach(el => {
      el.addEventListener("click", () => {
        const index = parseInt(el.dataset.index);
        const card = Cards.pickCard(index, this.currentSelection);
        Game.state.currentCard = card;
        this.renderCard(card);
      });
    });

    this.showScreen("selection");
  },

  renderCard(card) {
    document.getElementById("task-title").textContent = card.task.title;
    document.getElementById("card-prompt").textContent = card.prompt;
    document.getElementById("card-hint").textContent = card.hint;

    const banner = document.getElementById("turn-banner-card");
    if (Game.state.mode === "2p") {
      banner.textContent = `Ход: Игрок ${Game.state.currentPlayer}`;
      banner.className = `turn-banner player-${Game.state.currentPlayer}`;
      banner.style.display = "block";
    } else {
      banner.style.display = "none";
    }

    this.updateScores("-card");
    this.updateStreak("-card");
    this.showScreen("card");
  },

  renderSetup() {
    this.showScreen("setup");
    const summary = Stats.getSummary();
    const el = document.getElementById("quick-stats");
    if (summary.totalGames > 0) {
      el.innerHTML = `Игр: ${summary.totalGames} | Изучено: ${summary.mastered}/${summary.totalWords} | Рекорд серии: ${summary.bestStreak}`;
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  },

  renderStats() {
    const summary = Stats.getSummary();
    const mastered = Stats.getMastered();
    const learning = Stats.getLearning();
    const allWords = Stats.getAll();

    document.getElementById("stats-summary").innerHTML = `
      <div class="stats-row">
        <div class="stats-block">
          <div class="stats-num">${summary.totalGames}</div>
          <div class="stats-label">Игр</div>
        </div>
        <div class="stats-block">
          <div class="stats-num">${summary.totalCards}</div>
          <div class="stats-label">Карточек</div>
        </div>
        <div class="stats-block">
          <div class="stats-num">${summary.bestStreak}</div>
          <div class="stats-label">Рекорд серии</div>
        </div>
        <div class="stats-block">
          <div class="stats-num">${summary.mastered}/${summary.totalWords}</div>
          <div class="stats-label">Изучено</div>
        </div>
      </div>
    `;

    let wordsHtml = "";
    if (mastered.length > 0) {
      wordsHtml += `<div class="stats-section"><h3>Изучено (${mastered.length})</h3>`;
      mastered.forEach(w => {
        wordsHtml += `<div class="stats-word mastered">${w}</div>`;
      });
      wordsHtml += "</div>";
    }
    if (learning.length > 0) {
      wordsHtml += `<div class="stats-section"><h3>Учу (${learning.length})</h3>`;
      learning.forEach(w => {
        const total = w.correct + w.wrong;
        const pct = total > 0 ? Math.round((w.correct / total) * 100) : 0;
        wordsHtml += `<div class="stats-word learning">${w.word} — ✓${w.correct} ✗${w.wrong} (${pct}%)</div>`;
      });
      wordsHtml += "</div>";
    }
    const unknownCount = typeof words !== "undefined" ? words.length - mastered.length - learning.length : 0;
    if (unknownCount > 0) {
      wordsHtml += `<div class="stats-section"><h3>Не изучено (${unknownCount})</h3></div>`;
    }

    document.getElementById("stats-words").innerHTML = wordsHtml;
    this.showScreen("stats");
  },

  renderResults() {
    const state = Game.state;
    const container = document.getElementById("results-content");
    const streakHtml = state.bestStreak >= 3
      ? `<div class="result-streak">Лучшая серия: ${state.bestStreak} 🔥</div>`
      : "";

    if (state.mode === "1p") {
      container.innerHTML = `
        <div class="result-block">
          <h2>Итоговый счет</h2>
          <div class="big-score">${state.scores[1]}</div>
        </div>
        ${streakHtml}
      `;
    } else {
      const winner = Game.getWinner();
      let winnerText = "Ничья!";
      if (winner === 1) winnerText = "Победил Игрок 1!";
      if (winner === 2) winnerText = "Победил Игрок 2!";

      container.innerHTML = `
        <div class="result-block">
          <h2>Игрок 1</h2>
          <div class="big-score">${state.scores[1]}</div>
        </div>
        <div class="result-block">
          <h2>Игрок 2</h2>
          <div class="big-score">${state.scores[2]}</div>
        </div>
        <div class="result-block winner-block">
          <h2>${winnerText}</h2>
        </div>
        ${streakHtml}
      `;
    }

    this.showScreen("results");
  }
};
