import { Human } from "./human.js";

export class Woman extends Human {
  private bigEmotionDay = 30;
  private smallEmotionDay = 14;
  public amplitude = 50;

  constructor(
    public value: number,
    decayRange: [number, number],
    private initialManCapacity: number,
  ) {
    super(value, decayRange);
  }

  private emote(value: number) {
    this.value += value;
  }

  private getEmotionAmplitude(): number {
    return this.amplitude * (1 + this.discontent * 0.05);
  }

  public addDiscontent() {
    super.addDiscontent();

    this.emote(-(Math.random() * 10 + 10));
  }

  public changeEmotions(day: number) {
    if (day > this.decayDuration) {
      const amplitude = this.getEmotionAmplitude();

      if (day % this.bigEmotionDay === 0) {
        this.emote((Math.random() - 0.5) * amplitude);
      } else if (
        day % this.smallEmotionDay === 0 ||
        this.isRageFromDiscontent()
      ) {
        this.emote((Math.random() - 0.5) * (amplitude / 2));
      }

      this.value = Math.max(
        -this.initialManCapacity,
        Math.min(this.initialManCapacity, this.value),
      );
    }
  }

  public decay(day: number) {
    if (day <= this.decayDuration) {
      const noise = (Math.random() - 0.5) * this.decayStep * 5;

      const direction = Math.random() < 0.9 ? -1 : 1;

      this.value += direction * (this.decayStep + noise);
    }
  }

  public retainDiscontent() {
    if (this.discontent > 0) {
      this.discontent -= this.discontent * 0.9;
    }
  }
}
