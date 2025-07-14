import { Collision } from "../engine/collision.js";
import { Human } from "./human.js";

export class Man extends Human {
  public capacityHistory: number[] = [];

  constructor(
    public capacity: number,
    decayRange: [number, number],
  ) {
    super(
      capacity,
      0.03,
      breakupReasons,
      thoughtList,
      emojiList,
      exGoodQuotes,
      exGoodEmojis,
      exBadQuotes,
      exBadEmojis,
      decayRange,
    );
  }

  public override liveOneDay(day: number) {
    // Gradually reduce capacity over time (fatigue).
    this.decayCapacity(day);

    super.liveOneDay(day);
  }

  public override emote(delta: number) {
    // Add daily emotional change to value.
    this.value += delta;

    // Clamp value softly if it exceeds max capacity:
    // Reflects excess back downward (no hard stop).
    if (this.value > this.capacity) {
      const excess = this.value - this.capacity;
      this.value = this.capacity - excess;
    } else if (this.value < 0) {
      this.value = -this.value;
    }
  }

  public decayCapacity(day: number) {
    // If within the decay period, apply quadratic decay.
    if (day <= this.decayDuration) {
      const progress = day / this.decayDuration;

      // Reduce capacity over time toward 100:
      // Starts slowly, speeds up with time (progress²).
      this.capacity = this.capacity - progress ** 2 * (this.capacity - 100);
    }
  }

  public override save() {
    super.save();
    this.capacityHistory.push(this.capacity);
  }

  public looseCapacity(multiplier = 0.9) {
    this.capacity *= multiplier;
  }

  public retainCapacity() {
    this.capacity /= Math.sqrt(0.9);
  }
}

// 0-49 is neutral into positive.
// 50-99 is negative into neutral.
// Same for thoughts.
const emojiList = [
  "😐",
  "🙂",
  "😌",
  "😊",
  "☺️",
  "😇",
  "😉",
  "😃",
  "😄",
  "😁",
  "😆",
  "😋",
  "😎",
  "😍",
  "🤩",
  "🥰",
  "😘",
  "😚",
  "😙",
  "🤗",
  "😺",
  "😻",
  "😀",
  "😸",
  "😽",
  "🤠",
  "😇",
  "😄",
  "😃",
  "😁",
  "😆",
  "😅",
  "😺",
  "😎",
  "🤗",
  "🥰",
  "😘",
  "😋",
  "😌",
  "😊",
  "😄",
  "😀",
  "☺️",
  "😉",
  "😇",
  "😎",
  "🙂",
  "😃",
  "😄",
  "😙",
  "😽",
  // Half.
  "😱",
  "😨",
  "😰",
  "😖",
  "😣",
  "🥺",
  "😢",
  "😭",
  "☹️",
  "🙁",
  "😞",
  "😟",
  "😔",
  "😩",
  "😫",
  "🥴",
  "😵‍💫",
  "🥵",
  "🥶",
  "😓",
  "😿",
  "😾",
  "😒",
  "😤",
  "😠",
  "😡",
  "🤬",
  "😶",
  "😑",
  "🫥",
  "🫠",
  "😵",
  "🤯",
  "😬",
  "🙄",
  "😩",
  "😮‍💨",
  "😷",
  "🤢",
  "🤮",
  "😕",
  "😖",
  "😣",
  "😔",
  "😓",
  "😶‍🌫️",
  "😢",
  "😭",
  "😩",
  "😿",
  "😞",
];

const thoughtList = [
  "Всё ровно",
  "Пожалуй, всё хорошо",
  "Настроение получше",
  "Она рядом — и это радует",
  "Чувствую лёгкость",
  "Мне спокойно",
  "Мне нравится быть с ней",
  "Всё светлее",
  "Она делает мой день",
  "Улыбаюсь внутри",
  "С ней тепло",
  "Хорошо, что мы вместе",
  "Мне повезло",
  "Мы подходим друг другу",
  "Чувствую себя собой",
  "Сердце спокойно",
  "У нас получается",
  "Хочется её обнять",
  "Она меня понимает",
  "Это приятно",
  "Я чувствую любовь",
  "Она важна для меня",
  "Я хочу её радовать",
  "Она приносит свет",
  "Люблю её голос",
  "Я влюблён",
  "Мы в гармонии",
  "С ней хорошо молчать",
  "Я счастлив",
  "Каждый день с ней лучше",
  "Я дышу ей",
  "Хочу быть рядом всегда",
  "Она — часть меня",
  "Ничего не нужно, кроме неё",
  "Она всё для меня",
  "Мы одно целое",
  "С ней безопасно",
  "Она — мой дом",
  "Она даёт мне силы",
  "Я нашёл своё",
  "Это любовь",
  "Она вдохновляет меня",
  "С ней всё возможно",
  "Я спокоен рядом с ней",
  "Я ей доверяю",
  "Она моя опора",
  "Я становлюсь лучше с ней",
  "Внутри свет",
  "Я живу",
  "Я счастлив по-настоящему",
  // Half.
  "Это невыносимо",
  "Я не знаю, что делать",
  "Мне больно",
  "Кажется, я теряю её",
  "Она отдаляется",
  "Я ей не нужен",
  "Я в одиночестве",
  "Нас ничего не связывает",
  "Меня не слышат",
  "Она холодна",
  "Меня будто нет",
  "Мне тяжело",
  "Я разочарован",
  "Всё рушится",
  "Я в отчаянии",
  "Она меня ранит",
  "Мы чужие",
  "Я устал",
  "Не хочу продолжать",
  "Я в тупике",
  "Я пустой",
  "Она злая",
  "Я один",
  "Нет смысла",
  "Она меня игнорирует",
  "Это конец",
  "Я без сил",
  "Мне страшно",
  "Я не справляюсь",
  "Я кричу внутри",
  "Это ломает меня",
  "Я ненавижу всё",
  "Она всё разрушила",
  "Мне невыносимо с ней",
  "Я умираю внутри",
  "Она жестока",
  "Больше нет любви",
  "Я не важен",
  "Я сломлен",
  "Это боль",
  "Я исчезаю",
  "Она меня оттолкнула",
  "Я не нужен",
  "Мне плохо",
  "Мне всё равно",
  "Я сдаюсь",
  "Я ничего не чувствую",
  "Тоска",
  "Я потерян",
  "Мне хочется уйти",
  "Я один и всегда был",
];

const breakupReasons: Record<Collision["reason"], string> = {
  "fells out of love": "Больше не люблю её",
  "wants different pace": "Она слишком торопит",
  "emotionally drained": "Я опустошён",
  "lack of freedom": "Меня душит эта связь",
  "lack of understanding": "Она меня не понимает",
  "lack of trust": "Я не могу ей доверять",
  "unmet expectations": "Это не то, чего я ждал",
  "lack of common goals": "У нас разные пути",
};

const exGoodQuotes: string[] = [
  "Она была светом в моей жизни",
  "С ней я чувствовал себя живым",
  "Мы пережили много хорошего вместе",
  "Иногда скучаю по её улыбке",
  "Она делала меня лучше",
];

export const exGoodEmojis: string[] = ["😌", "😊", "🙂", "🥲", "😇"];

const exBadQuotes: string[] = [
  "С ней я терял себя",
  "Она разрушила моё доверие",
  "Я больше не хочу таких отношений",
  "Всё было ложью",
  "Хуже было только одиночество",
];

export const exBadEmojis: string[] = ["😞", "😔", "😤", "😠", "😩"];
