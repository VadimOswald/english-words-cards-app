const Stats = {
  STORAGE_KEY: "english_cards_stats",

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || { words: {}, totalGames: 0, totalCards: 0, bestStreak: 0 };
    } catch {
      return { words: {}, totalGames: 0, totalCards: 0, bestStreak: 0 };
    }
  },

  save(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  record(wordEn, result) {
    const data = this.load();
    const key = wordEn.toLowerCase();
    if (!data.words[key]) {
      data.words[key] = { correct: 0, wrong: 0, lastSeen: null };
    }
    if (result === "done") {
      data.words[key].correct++;
    } else {
      data.words[key].wrong++;
    }
    data.words[key].lastSeen = new Date().toISOString().split("T")[0];
    this.save(data);
  },

  saveGameEnd(stats) {
    const data = this.load();
    data.totalGames++;
    data.totalCards += stats.cardsPlayed;
    if (stats.bestStreak > data.bestStreak) {
      data.bestStreak = stats.bestStreak;
    }
    this.save(data);
  },

  getWord(wordEn) {
    const data = this.load();
    return data.words[wordEn.toLowerCase()] || null;
  },

  getAll() {
    return this.load().words;
  },

  getMastered() {
    const words = this.load().words;
    return Object.entries(words)
      .filter(([, v]) => v.correct >= 3 && v.wrong === 0)
      .map(([k]) => k);
  },

  getLearning() {
    const words = this.load().words;
    return Object.entries(words)
      .filter(([, v]) => v.wrong > 0)
      .map(([k, v]) => ({ word: k, ...v }));
  },

  getUnknown(seenWords) {
    const words = this.load().words;
    return seenWords.filter(w => !words[w.toLowerCase()]);
  },

  getSummary() {
    const data = this.load();
    const mastered = this.getMastered().length;
    const totalWords = typeof words !== "undefined" ? words.length : 0;
    return {
      totalGames: data.totalGames,
      totalCards: data.totalCards,
      bestStreak: data.bestStreak,
      mastered,
      totalWords
    };
  },

  getWeight(wordEn) {
    const data = this.load();
    const key = wordEn.toLowerCase();
    const stat = data.words[key];

    if (!stat) return 1.0;

    const correct = stat.correct || 0;
    const wrong = stat.wrong || 0;

    let weight = Math.max(0.1, 1 - correct * 0.15);
    weight += wrong * 0.2;

    return Math.min(weight, 2.0);
  },

  weightedRandom(wordList) {
    const weights = wordList.map(w => this.getWeight(w.en));
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;

    for (let i = 0; i < wordList.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return wordList[i];
    }

    return wordList[wordList.length - 1];
  },

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};
