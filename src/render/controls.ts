export class Controls {
  private newAtMaxButton: HTMLButtonElement;
  public newAtMax: HTMLDivElement;
  public down: HTMLButtonElement;
  public up: HTMLButtonElement;

  constructor() {
    this.up = document.getElementById("speed-up") as HTMLButtonElement;

    this.down = document.getElementById("speed-down") as HTMLButtonElement;

    this.newAtMax = document.getElementById("new-at-max") as HTMLDivElement;

    this.newAtMaxButton = document.getElementById(
      "new-at-max-button",
    ) as HTMLButtonElement;

    this.newAtMaxButton.onclick = () => window.location.reload();
  }

  public updateNewAtMax(daysPerSecond: number) {
    this.newAtMax.textContent = daysPerSecond.toString();
  }
}
