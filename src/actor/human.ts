import { Collision } from "../engine/collision.js";

export class Human {
  public decayDuration: number;
  public decayStep: number;
  public _discontent = 0;
  public breakupEmojis = breakupEmojis;
  public valueHistory: number[] = [];
  public thoughtHistory: number[] = [];
  private stressUntilDay = 0;
  private defaultDiscontentDelta = 0.0001;
  public mood: keyof typeof Human.MOOD_BIAS = "neutral";

  // Based on emotional scale bounds [-50, 49].
  public static MOOD_BIAS = {
    happy: 20,
    fine: 15,
    calm: 10,
    neutral: 0,
    worry: -10,
    stress: -25,
    sad: -30,
    mad: -35,
    collapsed: -50,
  };

  // Less is more sharp.
  protected emotionSharpness = 1.5;

  constructor(
    public value: number,
    protected emotionality: number,
    public breakupReasons: Record<Collision["reason"], string>,
    public thoughtList: string[],
    public emojiList: string[],
    public exGoodQuotes: string[] = [],
    public exGoodEmojis: string[] = [],
    public exBadQuotes: string[] = [],
    public exBadEmojis: string[] = [],
    decayRange: [number, number],
  ) {
    const [min, max] = decayRange;

    this.decayDuration = Math.floor(Math.random() * (max - min) + min);

    this.decayStep = (value - 100) / this.decayDuration;
  }

  public set discontent(value: number) {
    this._discontent = Math.max(0, Math.min(1, value));
  }

  public get discontent() {
    return this._discontent;
  }

  public addDiscontent(amount: number = this.defaultDiscontentDelta) {
    this.discontent += amount;
  }

  public retainDiscontent() {
    if (this.discontent > 0) {
      this.discontent = Math.max(
        0,
        this.discontent - this.defaultDiscontentDelta,
      );
    }
  }

  private maybeTriggerStressPeriod(
    day: number,
    force: boolean | undefined = false,
  ) {
    const chance = 0.05;

    if (force || (day > this.stressUntilDay && Math.random() < chance)) {
      // Five to ten days of stress.
      this.stressUntilDay = day + Math.floor(5 + Math.random() * 5);
    }
  }

  public liveOneDay(day: number, mood: "stress" | "casual" = "casual") {
    this.maybeTriggerStressPeriod(day, mood === "stress");

    if (day <= this.stressUntilDay) {
      this.emotionSharpness = 1.1;
    } else {
      this.emotionSharpness = 1.5;
    }

    // Generate raw emotional impulse:
    // - Math.random(): base noise between 0..1.
    // - Subtract 0.5 to center around 0 (-0.5 to +0.5).
    // - Subtract discontent bias (more discontent → more negative).
    // - Multiply by 2 to stretch result to roughly [-3, -1].
    const raw = (Math.random() - 0.5 - this.discontent) * 2;

    // Apply a nonlinear smoothing curve:
    // - Amplifies strong emotions, softens weak ones.
    // - Keeps the sign (positive or negative).
    const soft =
      Math.sign(raw) * Math.pow(Math.abs(raw), this.emotionSharpness);

    const capacity = this.valueHistory.at(0) ?? 100;

    // Normalize current emotional value into [0, 1] range:
    // - 0 when near 10% capacity.
    // - 1 when at full capacity.
    const normalized = (this.value - capacity * 0.1) / (capacity * 0.9);

    // Define maximum possible emotion change (5% of capacity).
    const amplitude = capacity * this.emotionality;

    // Create a bell-shaped limiter based on emotional position:
    // - Peak influence at center (normalized ≈ 0.5).
    // - Fades out toward edges (0 or 1).
    const limiter = 1 / (1 + Math.pow(2 * (normalized - 0.5), 4));

    // Final delta for this day:
    // - Combines soft impulse, strength limit, and position limiter.
    const delta = amplitude * soft * limiter;

    // Apply the resulting emotion delta.
    this.emote(delta);
  }

  public emote(delta: number) {
    this.value += delta;
  }

  public save() {
    this.valueHistory.push(this.value);
  }

  public saveThought(emotion: number) {
    this.thoughtHistory.push(emotion);
  }
}

export const breakupEmojis: Record<Collision["reason"], string> = {
  "fells out of love": "😔",
  "wants different pace": "😬",
  "emotionally drained": "🥱",
  "lack of freedom": "😵",
  "lack of understanding": "😕",
  "lack of trust": "😒",
  "unmet expectations": "😐",
  "lack of common goals": "😔",
};
