export class Info {
  private currentDay: HTMLDivElement;
  private brakeUpDay: HTMLDivElement;
  private brokeUpBy: HTMLDivElement;
  private brokeUpReason: HTMLDivElement;

  constructor() {
    this.currentDay = document.getElementById("current-day") as HTMLDivElement;

    this.brokeUpBy = document.getElementById("broke-up-by") as HTMLDivElement;

    this.brokeUpReason = document.getElementById(
      "broke-up-reason",
    ) as HTMLDivElement;

    this.brakeUpDay = document.getElementById("brake-up-day") as HTMLDivElement;
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

  public updateBrokeUp(person: string, reason: string) {
    this.brokeUpBy.textContent = person;
    this.brokeUpReason.textContent = reason;
  }
}
