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
    this.woman.liveOneDay(this.currentDay);
    this.man.liveOneDay(this.currentDay);

    this.collision.check(this.currentDay);

    if (this.collision.brakeUpDay) {
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
