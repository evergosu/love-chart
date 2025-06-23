import { Human } from "./human.js";

export class Man extends Human {
  private resilience = 0;
  private rancor = 0.9;

  constructor(
    public capacity: number,
    decayRange: [number, number],
  ) {
    super(capacity, decayRange);
  }

  public decay(day: number) {
    if (day <= this.decayDuration) {
      const progress = day / this.decayDuration;

      this.value = this.capacity - progress ** 2 * (this.capacity - 100);
    }
  }

  public looseCapacity() {
    this.resilience++;

    this.value *= this.rancor;
  }

  public retainCapacity() {
    this.value *= 1 + 0.03 * this.resilience;
  }

  public retainDiscontent() {
    if (this.discontent > 0) {
      this.discontent -= this.discontent * 0.5;
    }
  }
}
