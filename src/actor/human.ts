export class Human {
  public decayDuration: number;
  public decayStep: number;
  public discontent = 0;
  public history: number[] = [];

  constructor(
    public value: number,
    decayRange: [number, number],
  ) {
    const [min, max] = decayRange;

    this.decayDuration = Math.floor(Math.random() * (max - min) + min);

    this.decayStep = (150 - 100) / this.decayDuration;
  }

  public addDiscontent() {
    this.discontent++;
  }

  public hate() {
    this.discontent += 10;
  }

  public isRageFromDiscontent() {
    const increase = Math.min(this.discontent * 5, 50);

    return Math.random() * 100 <= increase;
  }

  public save() {
    this.history.push(this.value);
  }

  public resetDiscontent() {
    this.discontent = 0;
  }

  public retainDiscontent() {}
}
