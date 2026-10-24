// Сгенерировано scripts/generate_audio.py — не редактировать вручную
export interface Sentence {
  text: string;
  from: number; // кадр начала относительно начала сцены
  to: number;
}

export interface SceneConfig {
  id: string;
  title: string;
  audioFile: string;
  durationInFrames: number;
  sentences: Sentence[];
}

export const FPS = 30;

export const SCENES: SceneConfig[] = [
  {
    id: "01-hook",
    title: "Вступление",
    audioFile: "01-hook.mp3",
    durationInFrames: 597,
    sentences: [
      { text: "Вы разблокируете телефон взглядом.", from: 3, to: 101 },
      { text: "Получаете подборку видео, которые точно понравятся.", from: 100, to: 236 },
      { text: "Переводите текст за секунду.", from: 236, to: 327 },
      { text: "За всем этим стоит одна технология — искусственный интеллект.", from: 327, to: 480 },
      { text: "Но как он на самом деле работает?", from: 480, to: 577 },
    ],
  },
  {
    id: "02-what",
    title: "Что такое ИИ",
    audioFile: "02-what.mp3",
    durationInFrames: 474,
    sentences: [
      { text: "Обычной программе человек задаёт правила: если так — сделай вот это.", from: 3, to: 176 },
      { text: "Искусственный интеллект устроен наоборот.", from: 174, to: 285 },
      { text: "Ему показывают данные и правильные ответы, а правила он находит сам.", from: 285, to: 454 },
    ],
  },
  {
    id: "03-data",
    title: "Данные",
    audioFile: "03-data.mp3",
    durationInFrames: 568,
    sentences: [
      { text: "Представим, что компьютер должен отличать кошку от собаки.", from: 3, to: 147 },
      { text: "Мы не объясняем ему, что такое уши или усы.", from: 146, to: 279 },
      { text: "Мы показываем тысячи фотографий с подписями.", from: 279, to: 398 },
      { text: "А для компьютера каждая фотография — это просто таблица чисел.", from: 398, to: 547 },
    ],
  },
  {
    id: "04-network",
    title: "Нейронная сеть",
    audioFile: "04-network.mp3",
    durationInFrames: 523,
    sentences: [
      { text: "Эти числа проходят через нейронную сеть — слои простых вычислительных элементов.", from: 3, to: 187 },
      { text: "Каждый нейрон умножает входящие числа на свои веса, складывает и передаёт дальше.", from: 185, to: 376 },
      { text: "На выходе сеть даёт ответ: кошка или собака.", from: 376, to: 503 },
    ],
  },
  {
    id: "05-learning",
    title: "Обучение",
    audioFile: "05-learning.mp3",
    durationInFrames: 512,
    sentences: [
      { text: "Сначала веса случайны, и сеть угадывает наугад.", from: 3, to: 140 },
      { text: "Но после каждой ошибки веса чуть-чуть подправляются в сторону правильного ответа.", from: 139, to: 302 },
      { text: "Повторите это миллионы раз — и точность вырастет с пятидесяти процентов почти до ста.", from: 302, to: 492 },
    ],
  },
  {
    id: "06-scale",
    title: "Масштаб",
    audioFile: "06-scale.mp3",
    durationInFrames: 386,
    sentences: [
      { text: "Точно так же учатся большие языковые модели, которые пишут тексты и отвечают на вопросы.", from: 3, to: 209 },
      { text: "Только примеров у них — триллионы слов, а весов — сотни миллиардов.", from: 208, to: 366 },
    ],
  },
  {
    id: "07-outro",
    title: "Итог",
    audioFile: "07-outro.mp3",
    durationInFrames: 463,
    sentences: [
      { text: "Искусственный интеллект — это не магия и не разум из фантастики.", from: 3, to: 157 },
      { text: "Это математика, данные и очень много примеров.", from: 155, to: 286 },
      { text: "Подписывайтесь, чтобы узнать, что у него внутри, ещё глубже.", from: 286, to: 442 },
    ],
  },
];

export const getSceneStart = (index: number): number =>
  SCENES.slice(0, index).reduce((sum, s) => sum + s.durationInFrames, 0);

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);
