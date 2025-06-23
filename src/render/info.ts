export class Info {
  private currentDay: HTMLSpanElement;
  private brakeUpDay: HTMLSpanElement;
  private brokeUp: HTMLSpanElement;

  constructor() {
    this.currentDay = document.getElementById("current-day") as HTMLSpanElement;

    this.brokeUp = document.getElementById("broke-up") as HTMLSpanElement;

    this.brakeUpDay = document.getElementById(
      "brake-up-day",
    ) as HTMLSpanElement;
  }

  private formatDuration(daysTotal: number): string {
    const years = Math.floor(daysTotal / 365);
    const months = Math.floor((daysTotal % 365) / 30);
    const days = Math.floor(daysTotal % 30);

    return (
      `${years.toString().padStart(2, "0")}y ` +
      `${months.toString().padStart(2, "0")}m ` +
      `${days.toString().padStart(2, "0")}d`
    );
  }

  public updateCurrentDay(day: string | number) {
    this.currentDay.textContent =
      typeof day === "number" ? this.formatDuration(day) : day;
  }

  public updateBrakeUpDay(day: string | number) {
    this.brakeUpDay.textContent =
      typeof day === "number" ? this.formatDuration(day) : day;
  }

  public updateBrokeUp(day: string | number) {
    this.brokeUp.textContent =
      typeof day === "number" ? this.formatDuration(day) : day;
  }
}
