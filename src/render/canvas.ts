export class Canvas {
  protected ctx: CanvasRenderingContext2D;
  protected logicalHeight: number = 0;
  protected logicalWidth: number = 0;
  protected scale: number = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.adaptCanvasToContainer(canvas);
  }

  private adaptCanvasToContainer(canvas: HTMLCanvasElement) {
    this.resize = this.resize.bind(this);
    this.resize();

    const observer = new ResizeObserver(this.resize);

    observer.observe(canvas);
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;

      this.logicalWidth = rect.width;
      this.logicalHeight = rect.height;

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  }

  protected mapX = (day: number) => day;

  protected mapY(value: number): number {
    return this.logicalHeight / 2 - value * this.scale;
  }

  protected drawCanvas(
    windowStart: number,
    windowMaxX: number,
    windowMaxY: number,
  ) {
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    this.mapX = (day: number) =>
      ((day - windowStart) / windowMaxX) * this.logicalWidth;

    this.scale = ((this.logicalHeight / 2) * 0.8) / windowMaxY;

    this.ctx.lineWidth = 2 * this.scale;
  }
}
