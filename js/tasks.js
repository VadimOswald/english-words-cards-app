const tasks = [
  {
    id: 1,
    type: "ru_to_en",
    title: "Переведи на английский",
    render(word) {
      return { prompt: word.ru, hint: "Назови английский перевод" };
    }
  },
  {
    id: 2,
    type: "en_to_ru",
    title: "Переведи на русский",
    render(word) {
      return { prompt: word.en, hint: "Назови русский перевод" };
    }
  },
  {
    id: 3,
    type: "fill_blank",
    title: "Заполни пропуск",
    render(word) {
      const sentence = word.example.replace(
        new RegExp(word.en, "gi"),
        "______"
      );
      return { prompt: sentence, hint: word.ru };
    }
  },
  {
    id: 4,
    type: "make_sentence",
    title: "Составь предложение",
    render(word) {
      return { prompt: word.en, hint: "Используй слово в предложении" };
    }
  },
  {
    id: 5,
    type: "make_question",
    title: "Придумай вопрос",
    render(word) {
      return { prompt: word.en, hint: "Составь вопрос со словом" };
    }
  },
  {
    id: 6,
    type: "synonym",
    title: "Синоним",
    render(word) {
      return { prompt: word.en, hint: "Назови английский синоним" };
    }
  },
  {
    id: 7,
    type: "antonym",
    title: "Антоним",
    render(word) {
      return { prompt: word.en, hint: "Назови английский антоним" };
    }
  },
  {
    id: 8,
    type: "explain",
    title: "Объясни значение",
    render(word) {
      return { prompt: word.en, hint: "Объясни простыми английскими словами" };
    }
  }
];
