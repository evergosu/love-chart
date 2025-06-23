import { Collision } from "./collision.js";
import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";

export class Simulator {
  private currentDay = 0;
  public lastDay: number;

  constructor(
    private man: Man,
    private woman: Woman,
    private collision: Collision,
    totalDays: number,
  ) {
    this.lastDay = totalDays;
  }

  private simulateDay() {
    this.woman.decay(this.currentDay);
    this.man.decay(this.currentDay);
    this.woman.changeEmotions(this.currentDay);

    this.collision.check(this.currentDay);
    this.collision.checkBreakup(this.currentDay);

    if (this.collision.brakeUpDay) {
      this.man.retainDiscontent();
      this.woman.retainDiscontent();
      this.lastDay = Math.floor(this.collision.brakeUpDay * 1.5);
    }

    this.woman.save();
    this.man.save();
    this.currentDay++;
  }

  public simulateLife() {
    while (this.currentDay < this.lastDay) {
      this.simulateDay();
    }
  }
}
