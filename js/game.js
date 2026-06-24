const Game = {
  state: null,

  init(mode, cardCount) {
    this.state = {
      mode,
      totalCards: cardCount,
      remaining: cardCount,
      currentPlayer: 1,
      scores: { 1: 0, 2: 0 },
      currentCard: null,
      streak: 0,
      bestStreak: 0,
      wordsEncountered: []
    };
  },

  recordResult(result) {
    if (!this.state) return;
    const player = this.state.currentPlayer;
    let earned = result === "done" ? 1 : -2;

    if (result === "done") {
      this.state.streak++;
      if (this.state.streak > this.state.bestStreak) {
        this.state.bestStreak = this.state.streak;
      }
      if (this.state.streak >= 3) {
        earned += this.state.streak;
      }
    } else {
      this.state.streak = 0;
    }

    this.state.scores[player] += earned;
    this.state.remaining--;

    if (this.state.currentCard) {
      this.state.wordsEncountered.push(this.state.currentCard.word.en);
      Stats.record(this.state.currentCard.word.en, result);
    }

    return earned;
  },

  nextTurn() {
    if (this.state.mode === "2p") {
      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    }
  },

  isGameOver() {
    return this.state.remaining === 0;
  },

  getWinner() {
    if (this.state.mode === "1p") return null;
    const s1 = this.state.scores[1];
    const s2 = this.state.scores[2];
    if (s1 > s2) return 1;
    if (s2 > s1) return 2;
    return 0;
  },

  validateCardCount(count) {
    if (count < 2 || count > 9999) return false;
    if (count % 2 !== 0) return false;
    return true;
  }
};
