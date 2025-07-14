import { Human } from "../actor/human.js";
import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";

type LoveState =
  | "PerfectLove"
  | "SheIsFine_HeIsStressing"
  | "SheIsStressing_HeIsMad"
  | "SheIsStressing_HeIsFine"
  | "SheIsMad_HeIsStressing"
  | "SheIsBroken_HeIsBroken";

type RelationshipState = "Beguin" | "Love" | "Breakup";

export class Collision {
  public brokeUp: "man" | "woman" | null = null;
  public brakeUpDay: number | null = null;
  public relationshipState: RelationshipState = "Beguin";
  public loveState: LoveState = "PerfectLove";
  public reason:
    | "fells out of love"
    | "lack of freedom"
    | "lack of understanding"
    | "lack of trust"
    | "lack of common goals"
    | "emotionally drained"
    | "wants different pace"
    | "unmet expectations" = "fells out of love";

  constructor(
    private man: Man,
    private woman: Woman,
  ) {}

  private updateThoughts(
    day: number,
    human: Human,
    previousThought: number = 0,
    streak: number,
  ): number {
    if (this.brakeUpDay && day >= this.brakeUpDay) {
      return previousThought;
    }

    // Maximum of ±20 deviation.
    const spread = Math.min(20, Math.sqrt(human.discontent) * 2);
    const deviation = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
    const thought = Math.max(
      -50,
      Math.min(49, Human.MOOD_BIAS[human.mood] + deviation),
    );

    let inertiaDays = 2;

    if (human.mood === "happy" || human.mood === "sad") {
      inertiaDays = 4;
    }

    if (
      previousThought != null &&
      Math.abs(previousThought - thought) <= 5 &&
      streak < inertiaDays
    ) {
      return previousThought;
    }

    return thought;
  }

  private getThoughtStreak(emotions: number[], day: number): number {
    const current = emotions.at(day - 1);

    if (current == null) return 0;

    let streak = 1;

    for (let i = day - 2; i >= 0; i--) {
      if (emotions[i] !== current) break;

      streak++;
    }

    return streak;
  }

  private checkThoughts(day: number) {
    const manPrev = this.man.thoughtHistory.at(day - 1) ?? 0;
    const manStreak = this.getThoughtStreak(this.man.thoughtHistory, day);

    const womanPrev = this.woman.thoughtHistory.at(day - 1) ?? 0;
    const womanStreak = this.getThoughtStreak(this.woman.thoughtHistory, day);

    const manEmotion = this.updateThoughts(day, this.man, manPrev, manStreak);
    const womanEmotion = this.updateThoughts(
      day,
      this.woman,
      womanPrev,
      womanStreak,
    );

    this.man.saveThought(manEmotion);
    this.woman.saveThought(womanEmotion);
  }

  public isHumanBelowForLongTime(
    human: Human,
    threshold: number,
    minStreakLength: number,
  ): boolean {
    const history = human.valueHistory;

    let streak = 0;

    for (let i = 0; i < history.length; i++) {
      if (history[i] < threshold) {
        streak++;

        if (streak >= minStreakLength) {
          return true;
        }
      } else {
        streak = 0;
      }
    }

    return false;
  }

  public isHumanAboveForLongTime(
    human: Human,
    threshold: number,
    minStreakLength: number,
  ): boolean {
    const history = human.valueHistory;

    let streak = 0;

    for (let i = 0; i < history.length; i++) {
      if (history[i] > threshold) {
        streak++;

        if (streak >= minStreakLength) {
          return true;
        }
      } else {
        streak = 0;
      }
    }

    return false;
  }

  public isStagnant(human: Human, duration: number): boolean {
    const history = human.valueHistory;

    if (history.length < duration) return false;

    const recent = history.slice(-duration);

    const min = Math.min(...recent);

    const max = Math.max(...recent);

    // Flatline.
    return Math.abs(max - min) < 3;
  }

  public isDetachedForLongTime(
    delta: number,
    minStreakLength: number,
  ): boolean {
    const manHistory = this.man.valueHistory;
    const womanHistory = this.woman.valueHistory;

    const len = Math.min(manHistory.length, womanHistory.length);
    let streak = 0;

    for (let i = 0; i < len; i++) {
      const distance = Math.abs(manHistory[i] - womanHistory[i]);

      if (distance > delta) {
        streak++;
        if (streak >= minStreakLength) return true;
      } else {
        streak = 0;
      }
    }

    return false;
  }

  public valueDroppedFast(
    human: Human,
    days: number,
    threshold: number,
  ): boolean {
    const history = human.valueHistory;

    if (history.length < days) return false;

    const diff = history.at(-1)! - history.at(-days)!;

    return diff < -threshold;
  }

  private setBreakup(
    brakeUpDay: typeof this.brakeUpDay,
    brokeUp: typeof this.brokeUp,
    reason: typeof this.reason,
  ) {
    this.brakeUpDay = brakeUpDay;
    this.brokeUp = brokeUp;
    this.reason = reason;
  }

  public checkBreakup(day: number) {
    if (this.brakeUpDay == null) {
      // He see no attentions.
      if (day <= 14 && this.woman.value < this.man.capacity * 0.63) {
        this.setBreakup(day, "man", "unmet expectations");
        return;
      }

      // She see no attentions.
      if (day <= 14 && this.man.value < this.woman.value * 0.72) {
        this.setBreakup(day, "woman", "unmet expectations");
        return;
      }

      // He wanna fuck, nothing more.
      if (day <= 60 && this.isDetachedForLongTime(72, 7)) {
        this.setBreakup(day, "man", "wants different pace");
        return;
      }

      // She is searhing for family.
      if (day <= 60 && this.isDetachedForLongTime(54, 14)) {
        this.setBreakup(day, "woman", "wants different pace");
        return;
      }

      // If there is already a discontent, so there is no love.
      if (day <= 180 && this.man.discontent > 0.0103) {
        this.setBreakup(day, "man", "fells out of love");
        return;
      }

      // If there is already a discontent, so there is no love.
      if (day <= 180 && this.woman.discontent > 0.0101) {
        this.setBreakup(day, "woman", "fells out of love");
        return;
      }

      if (
        day < 300 &&
        // He give his half.
        this.isHumanAboveForLongTime(this.man, this.man.capacity * 0.6, 190) &&
        // But she wants more.
        this.isHumanAboveForLongTime(this.woman, this.man.capacity, 190)
      ) {
        this.setBreakup(day, "man", "lack of freedom");
        return;
      }

      if (
        day < 300 &&
        // She is frigid.
        this.isStagnant(this.woman, 17) &&
        this.isHumanBelowForLongTime(this.woman, this.man.capacity * 0.1, 17) &&
        // But he wants more.
        this.isHumanAboveForLongTime(this.man, this.man.capacity * 0.7, 17)
      ) {
        this.setBreakup(day, "woman", "lack of freedom");
        return;
      }

      if (
        day < 400 &&
        this.man.discontent > 0.026 &&
        this.man.discontent > this.woman.discontent
      ) {
        this.setBreakup(day, "man", "lack of understanding");
        return;
      }

      if (
        day < 400 &&
        this.woman.discontent > 0.015 &&
        this.woman.discontent > this.man.discontent
      ) {
        this.setBreakup(day, "woman", "lack of understanding");
        return;
      }

      if (
        this.valueDroppedFast(this.woman, 77, this.man.capacityHistory.at(0)!)
      ) {
        this.setBreakup(day, "man", "lack of trust");
        return;
      }

      if (
        this.valueDroppedFast(this.man, 52, this.woman.initialManCapacity * 0.5)
      ) {
        this.setBreakup(day, "woman", "lack of trust");
        return;
      }

      if (
        this.woman.value > this.man.value &&
        this.man.value < this.man.capacity * 0.1 &&
        this.isStagnant(this.man, 65)
      ) {
        this.setBreakup(day, "man", "emotionally drained");
        return;
      }

      if (
        this.woman.value < this.man.value * 0.2 &&
        this.woman.value > 0 &&
        this.isStagnant(this.woman, 10)
      ) {
        this.setBreakup(day, "woman", "emotionally drained");
        return;
      }

      if (day > 1815) {
        this.checkLackOfCommonGoals(day);
        return;
      }
    }
  }

  private checkLackOfCommonGoals(day: number) {
    const duration = 125;
    const manH = this.man.valueHistory;
    const womanH = this.woman.valueHistory;

    if (manH.length < duration || womanH.length < duration) return;

    const avgMan = manH.slice(-duration).reduce((a, b) => a + b, 0) / duration;
    const avgWoman =
      womanH.slice(-duration).reduce((a, b) => a + b, 0) / duration;

    if (
      avgMan > this.man.capacity * 0.1 &&
      womanH.slice(-duration).some((x) => x < 0)
    ) {
      this.setBreakup(day, "man", "lack of common goals");
    } else if (avgWoman > -avgMan * 40) {
      this.setBreakup(day, "woman", "lack of common goals");
    }
  }

  private getRelationshipState(day: number): RelationshipState {
    if (this.brakeUpDay && day > this.brakeUpDay) {
      this.man.retainDiscontent();
      this.woman.retainDiscontent();
      return "Breakup";
    } else if (day < this.man.decayDuration || day < this.woman.decayDuration) {
      return "Beguin";
    } else {
      return "Love";
    }
  }

  private getLoveState(
    woman: number,
    man: number,
    capacity: number,
  ): LoveState {
    if (woman >= 0) {
      if (woman > capacity) return "SheIsStressing_HeIsMad";
      else if (woman > man) return "SheIsFine_HeIsStressing";
      else return "PerfectLove";
    } else {
      if (woman < -man) {
        if (woman < -capacity) return "SheIsBroken_HeIsBroken";
        else return "SheIsMad_HeIsStressing";
      } else {
        return "SheIsStressing_HeIsFine";
      }
    }
  }

  public setRelationshipState(day: number) {
    this.relationshipState = this.getRelationshipState(day);
    if (this.relationshipState === "Love") {
      this.loveState = this.getLoveState(
        this.woman.value,
        this.man.value,
        this.man.capacity,
      );
    }
  }

  private capacityLooseDay: number | null = null;

  private trackCapacityLoss(day: number) {
    const capacity = this.man.capacity;
    const value = this.woman.value;
    const prev = this.woman.valueHistory.at(day - 1)!;

    const crossedUpperBound =
      value >= capacity && prev < this.man.capacityHistory.at(day - 1)!;
    const crossedLowerBound =
      value <= -capacity * 0.3 &&
      prev > -this.man.capacityHistory.at(day - 1)! * 0.3;
    const returnedToSafe = value < capacity && value > -capacity * 0.3;

    // Loose once per new bound violation.
    if (
      this.capacityLooseDay === null &&
      (crossedUpperBound || crossedLowerBound)
    ) {
      this.man.looseCapacity();
      this.capacityLooseDay = day;
      return;
    }

    // Retain only if she returns to safe zone within 5 days.
    if (
      this.capacityLooseDay !== null &&
      returnedToSafe &&
      day - this.capacityLooseDay <= 5
    ) {
      this.man.retainCapacity();
      this.capacityLooseDay = null;
    }

    // After 5 days without return → freeze.
    if (this.capacityLooseDay !== null && day - this.capacityLooseDay > 5) {
      this.capacityLooseDay = null;
    }
  }

  public check(day: number) {
    this.setRelationshipState(day);
    this.checkThoughts(day);
    this.checkBreakup(day);

    switch (this.relationshipState) {
      case "Beguin":
        this.man.mood = "neutral";
        this.woman.mood = "neutral";
        break;
      case "Breakup": {
        this.man.mood = "sad";
        this.woman.mood = "sad";
        this.man.retainDiscontent();
        this.woman.retainDiscontent();
        this.man.looseCapacity(0.99);
        break;
      }
      case "Love": {
        switch (this.loveState) {
          // woman > capacity.
          case "SheIsStressing_HeIsMad": {
            this.trackCapacityLoss(day);
            this.woman.mood = "stress";
            this.man.mood = "mad";
            this.man.addDiscontent();
            this.woman.addDiscontent();
            break;
          }
          // man < woman <= capacity.
          case "SheIsFine_HeIsStressing": {
            this.trackCapacityLoss(day);
            this.woman.mood = "fine";
            this.man.mood = "stress";
            this.woman.retainDiscontent();
            this.man.addDiscontent();
            break;
          }
          // 0 < woman <= man.
          case "PerfectLove": {
            this.woman.mood = "happy";
            this.man.mood = "happy";
            this.man.retainDiscontent();
            this.woman.retainDiscontent();
            break;
          }
          // -man <= woman < 0.
          case "SheIsStressing_HeIsFine": {
            this.trackCapacityLoss(day);
            this.woman.mood = "stress";
            this.man.mood = "fine";
            this.woman.addDiscontent();
            break;
          }
          // -capacity < woman < -man.
          case "SheIsMad_HeIsStressing": {
            this.trackCapacityLoss(day);
            this.woman.mood = "mad";
            this.man.mood = "stress";
            this.man.addDiscontent();
            this.woman.addDiscontent();
            break;
          }
          // woman < -capacity.
          case "SheIsBroken_HeIsBroken": {
            this.trackCapacityLoss(day);
            this.woman.mood = "collapsed";
            this.man.mood = "collapsed";
            this.man.addDiscontent();
            this.woman.addDiscontent();
            break;
          }
          default: {
            const _exhaustive: never = this.loveState;
            throw new Error(`Unhandled love state: ${_exhaustive}`);
          }
        }
        break;
      }

      default: {
        const _exhaustive: never = this.relationshipState;
        throw new Error(`Unhandled relationship state: ${_exhaustive}`);
      }
    }
  }
}
