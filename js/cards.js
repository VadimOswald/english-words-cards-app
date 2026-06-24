const Cards = {
  generateCard() {
    const word = Stats.weightedRandom(words);
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    const rendered = task.render(word);
    return {
      word,
      task,
      prompt: rendered.prompt,
      hint: rendered.hint
    };
  },

  showSelection() {
    return [
      this.generateCard(),
      this.generateCard(),
      this.generateCard()
    ];
  },

  pickCard(index, cards) {
    return cards[index];
  }
};
