import { Collision } from "../engine/collision.js";
import { Human } from "./human.js";

export class Woman extends Human {
  private theseDays = 30;
  public amplitude = 40;

  constructor(
    public value: number,
    decayRange: [number, number],
    public initialManCapacity: number,
  ) {
    super(
      value,
      0.08,
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

  public liveOneDay(day: number) {
    // Gradually reduce capacity over time (fatigue).
    this.decayValue(day);

    if (day % this.theseDays === 0) {
      super.liveOneDay(day, "stress");
    } else {
      super.liveOneDay(day);
    }
  }

  public decayValue(day: number) {
    if (day <= this.decayDuration) {
      const decayRate = 1.7;

      if (Math.abs(this.value) < decayRate) {
        this.value = 0;
      } else {
        this.value += this.value > 0 ? -decayRate : decayRate;
      }
    }
  }

  public emote(delta: number) {
    // Add daily emotional change to value.
    this.value += delta;

    const cap = this.initialManCapacity;

    // Clamp value softly if it exceeds max cap:
    // Reflects excess back downward (no hard stop).
    if (this.value > cap) {
      this.value = cap - (this.value - cap) * 0.5;
    } else if (this.value < -cap) {
      this.value = -cap - (this.value + cap) * 0.5;
    }
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
  "🤭",
  "🫶",
  "😇",
  "😄",
  "😃",
  "😆",
  "🥰",
  "😎",
  "🤗",
  "😘",
  "😋",
  "😌",
  "😊",
  "😄",
  "😀",
  "🥹",
  "☺️",
  "😉",
  "😇",
  "😌",
  "😙",
  "😃",
  "😽",
  "😄",
  "🥰",
  "😍",
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
  "Мне всё равно",
  "Ну и ладно",
  "Я спокойна",
  "Пусть будет так",
  "Он не раздражает",
  "Нормально",
  "Всё привычно",
  "У меня свои дела",
  "Пока всё терпимо",
  "Он не мешает",
  "Я держусь",
  "Иногда даже приятно",
  "Интересно наблюдать",
  "Он старается",
  "Может, не всё плохо",
  "Он может быть милым",
  "У нас есть моменты",
  "С ним бывает тепло",
  "Он рядом",
  "Мне не одиноко",
  "Он нужен мне",
  "Я чувствую себя лучше",
  "Он делает меня счастливой",
  "Он важен для меня",
  "Я улыбаюсь рядом с ним",
  "Мне с ним спокойно",
  "Я люблю, когда он рядом",
  "Он заботится",
  "Я могу доверять ему",
  "Он видит меня",
  "Я люблю его",
  "Он моё всё",
  "Я счастлива",
  "Он наполняет меня",
  "Я думаю о нём",
  "С ним я расцветаю",
  "Я чувствую себя живой",
  "Он меня понимает",
  "С ним безопасно",
  "Он моя опора",
  "Он часть меня",
  "Мне хорошо",
  "Это мой человек",
  "Я его люблю",
  "Это настоящее",
  "Он смысл моего дня",
  "Я его берегу",
  "Я нашла своего",
  "Это взаимно",
  "Это любовь",
  "Я счастлива как никогда",
  // Half.
  "Мне больно",
  "Он меня не слышит",
  "Я одна",
  "Я ему не важна",
  "Меня игнорируют",
  "Он холодный",
  "Я не нужна",
  "Я устала",
  "Меня это мучает",
  "Я пустая",
  "Я больше не верю",
  "Я разочарована",
  "Он причиняет боль",
  "Я жду напрасно",
  "Меня не ценят",
  "Это не любовь",
  "Я ничего не чувствую",
  "Мне страшно",
  "Мне плохо",
  "Он меня разрушает",
  "Я теряю себя",
  "Я с ним исчезаю",
  "Он давит на меня",
  "Он меня ломает",
  "Мне тяжело",
  "Я без сил",
  "Мне плохо с ним",
  "Я слабею",
  "Я не хочу быть с ним",
  "Он всё разрушил",
  "Я не могу больше",
  "Я плачу",
  "Я в тишине",
  "Я не справляюсь",
  "Я просто терплю",
  "Я не узнаю себя",
  "Меня нет",
  "Он не со мной",
  "Я хочу уйти",
  "Он чужой",
  "Я не его",
  "Меня нет в этом",
  "Я потеряна",
  "Это больше не важно",
  "Мне всё равно",
  "Он исчезает",
  "Между нами пустота",
  "Ничего не осталось",
  "Я в темноте",
  "Это больно",
  "Я не нужна",
];

export const breakupReasons: Record<Collision["reason"], string> = {
  "fells out of love": "Моё сердце остыло",
  "wants different pace": "Он тянет и тянет...",
  "emotionally drained": "Я устала от этого",
  "lacks of freedom": "Я потеряла свободу",
  "lacks of understanding": "Он не слышит меня",
  "lacks of trust": "Я ему не доверяю",
  "unmet expectations": "Это не то, что я хотела",
  "lacks of common goals": "Мы хотим разного",
};

export const exGoodQuotes: string[] = [
  "С ним я была счастливой",
  "Он был заботливым и добрым",
  "У нас были чудесные моменты",
  "Иногда мне его не хватает",
  "Он знал, как меня поддержать",
];

export const exGoodEmojis: string[] = ["😊", "🙂", "🥲", "😌", "😇"];

export const exBadQuotes: string[] = [
  "Он разбил мне сердце",
  "Я устала от борьбы за нас",
  "Он никогда не понимал меня",
  "Он был не тем, за кого себя выдавал",
  "Я была несчастна с ним",
];

export const exBadEmojis: string[] = ["😢", "😞", "😔", "😠", "😩"];
