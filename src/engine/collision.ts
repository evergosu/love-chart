import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";

type Bound = "lower" | "upper" | "none";

export class Collision {
  private bound: Bound = "none";
  private startDay: number = 0;
  public brokeUp: "man" | "woman" | null = null;
  public brakeUpDay: number | null = null;

  constructor(
    private man: Man,
    private woman: Woman,
  ) {}

  private handleLower(day: number) {
    if (this.woman.value > -this.man.value) {
      const duration = this.stop(day);

      if (duration <= 2) this.man.retainCapacity();
    }
  }

  private handleNone(day: number) {
    if (this.woman.value >= this.man.value) {
      this.start(day, "upper");

      this.woman.addDiscontent();
    }

    if (this.woman.value > 0) this.man.resetDiscontent();

    if (this.woman.value <= -this.man.value) {
      this.start(day, "lower");
      this.man.looseCapacity();
      this.man.addDiscontent();
      this.woman.resetDiscontent();
    }
  }

  private handlePersistentNeglect() {
    if (
      this.woman.value < -this.man.capacity / 3 &&
      this.man.isRageFromDiscontent()
    ) {
      this.man.looseCapacity();
    } else {
      this.man.addDiscontent();
    }
  }

  private handleUpper(day: number) {
    if (this.woman.value < this.man.value) {
      const duration = this.stop(day);

      if (duration >= 2) this.woman.hate();
    }
  }

  private shouldCollide(day: number) {
    return day > this.man.decayDuration && day > this.woman.decayDuration;
  }

  private start(day: number, bound: Bound) {
    this.bound = bound;
    this.startDay = day;
  }

  private stop(day: number): number {
    const duration = day - this.startDay;

    this.bound = "none";
    this.startDay = 0;

    return duration;
  }

  public check(day: number) {
    if (!this.shouldCollide(day)) return;

    this.handlePersistentNeglect();

    switch (this.bound) {
      case "none":
        this.handleNone(day);
        break;
      case "upper":
        this.handleUpper(day);
        break;
      case "lower":
        this.handleLower(day);
        break;
    }
  }

  public checkBreakup(day: number) {
    if (this.brakeUpDay != null) return;

    const manCollapsed = this.man.value < Math.floor(this.man.capacity / 3);

    const womanCollapsed = this.woman.value < -this.man.capacity * 0.8;

    if (womanCollapsed || manCollapsed) {
      this.brakeUpDay = day;
      this.brokeUp = manCollapsed ? "man" : "woman";
    }
  }
}
