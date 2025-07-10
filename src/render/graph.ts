import { Man } from "../actor/man.js";
import { Woman } from "../actor/woman.js";
import { Collision } from "../engine/collision.js";
import { Canvas } from "./canvas.js";

export class Graph extends Canvas {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private drawAxis() {
    this.ctx.save();
    this.ctx.strokeStyle = "#888";
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.mapY(0));
    this.ctx.lineTo(this.logicalWidth, this.mapY(0));
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawBlueTunnel(values: number[], start: number, end: number) {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(100, 149, 237, 0.2)";

    this.ctx.beginPath();
    this.ctx.moveTo(this.mapX(start), this.mapY(values[start]));

    for (let day = start; day <= end; day++) {
      this.ctx.lineTo(this.mapX(day), this.mapY(values[day]));
    }

    for (let day = end; day >= start; day--) {
      this.ctx.lineTo(this.mapX(day), this.mapY(-values[day]));
    }

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawGrayTunnel(values: number[], start: number, end: number) {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(160, 160, 160, 0.2)";
    this.ctx.beginPath();
    this.ctx.moveTo(this.mapX(start), this.mapY(values[start]));

    for (let day = start; day <= end; day++) {
      this.ctx.lineTo(this.mapX(day), this.mapY(values[day]));
    }

    for (let day = end; day >= start; day--) {
      this.ctx.lineTo(this.mapX(day), this.mapY(-values[day]));
    }

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawTunnel(
    values: number[],
    collision: Collision,
    dayLimit: number,
    windowStart: number,
    windowMaxX: number,
  ) {
    const start = Math.max(windowStart, 0);

    const end =
      collision.brakeUpDay != null && collision.brakeUpDay < dayLimit
        ? collision.brakeUpDay
        : Math.min(dayLimit, windowStart + windowMaxX);

    this.drawBlueTunnel(values, start, end);

    if (collision.brakeUpDay != null) {
      const start = Math.max(windowStart, collision.brakeUpDay);

      this.drawGrayTunnel(values, start, dayLimit);
    }
  }

  private clampToTunnel(value: number, capacity: number): number {
    return Math.max(-capacity, Math.min(capacity, value));
  }

  private drawManValueLine(
    values: number[],
    capacity: number[],
    collision: Collision,
    dayLimit: number,
    windowStart: number,
    windowMaxX: number,
  ) {
    const start = Math.max(windowStart, 0);
    const endRed =
      collision.brakeUpDay != null && collision.brakeUpDay < dayLimit
        ? collision.brakeUpDay
        : Math.min(dayLimit, windowStart + windowMaxX);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(100, 149, 237, 1)";

    this.ctx.moveTo(
      this.mapX(start),
      this.mapY(this.clampToTunnel(values[start], capacity[start])),
    );

    for (let day = start; day <= endRed; day++) {
      const val = this.clampToTunnel(values[day], capacity[day]);
      this.ctx.lineTo(this.mapX(day), this.mapY(val));
    }

    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#aaa";

    for (let day = endRed; day <= dayLimit; day++) {
      this.ctx.lineTo(
        this.mapX(day),
        this.mapY(this.clampToTunnel(values[day], capacity[day])),
      );
    }

    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawRedLine(values: number[], start: number, end: number) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ff4f8b";
    this.ctx.moveTo(this.mapX(start), this.mapY(values[start]));

    if (start) {
      this.ctx.moveTo(this.mapX(start), this.mapY(values[start]));
    }

    for (let day = start; day <= end; day++) {
      this.ctx.lineTo(this.mapX(day), this.mapY(values[day]));
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawGrayLine(values: number[], start: number, end: number) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#aaa";

    let memoryY = 0;
    let lastY = values[start];
    let hasTouchedZero = false;

    this.ctx.moveTo(this.mapX(start), this.mapY(lastY));

    for (let day = start; day < end; day++) {
      const y = values[day];

      if (!hasTouchedZero) {
        const touchedZero = y === 0 || y * lastY < 0;

        if (touchedZero) {
          hasTouchedZero = true;
          memoryY = y;
        }

        this.ctx.lineTo(this.mapX(day), this.mapY(y));

        lastY = y;
      } else {
        this.ctx.lineTo(this.mapX(day), this.mapY(memoryY));
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawWomanLine(
    values: number[],
    collision: Collision,
    dayLimit: number,
    windowStart: number,
    windowMaxX: number,
  ) {
    const start = Math.max(windowStart, 0);

    const endRed =
      collision.brakeUpDay != null && collision.brakeUpDay < dayLimit
        ? collision.brakeUpDay
        : Math.min(dayLimit, windowStart + windowMaxX);

    this.drawRedLine(values, start, endRed);

    if (collision.brakeUpDay != null && dayLimit > collision.brakeUpDay) {
      this.drawGrayLine(values, endRed, dayLimit);
    }
  }

  private drawMarker(day: number, value: number, emoji: string) {
    const x = this.mapX(day);
    const y = this.mapY(value);

    this.ctx.save();
    this.ctx.fillStyle = "#000";
    this.ctx.font = "24px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("✂️", x, this.mapY(-10));

    this.ctx.beginPath();
    this.ctx.moveTo(x, this.mapY(0));
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = "#000";
    this.ctx.stroke();

    this.ctx.fillText(emoji, x, y);
    this.ctx.restore();
  }

  private drawBreakup(
    tunnel: number[],
    line: number[],
    collision: Collision,
    dayLimit: number,
  ) {
    if (collision.brakeUpDay != null && dayLimit >= collision.brakeUpDay) {
      const isBrokenByMan = collision.brokeUp === "man";

      const value = isBrokenByMan
        ? -tunnel[collision.brakeUpDay]
        : line[collision.brakeUpDay];

      const emoji = isBrokenByMan ? "♂️" : "♀️";

      this.drawMarker(collision.brakeUpDay, value, emoji);
    }
  }

  public drawOverlayInfo(
    man: Man,
    woman: Woman,
    collision: Collision,
    day: number,
  ) {
    const ctx = this.ctx;
    const padding = 6;
    const lineHeight = 14;
    const lines: string[] = [];

    lines.push(`day: ${day}`);
    lines.push(`M capacity: ${Math.floor(man.capacityHistory[day])}`);
    lines.push(`M value: ${Math.floor(man.valueHistory[day])}`);
    lines.push(`W value: ${Math.floor(woman.valueHistory[day])}`);
    lines.push(`M discontent: ${man.discontent}`);
    lines.push(`W discontent: ${woman.discontent}`);
    lines.push(`r state: ${collision.relationshipState}`);
    lines.push(`l state: ${collision.loveState}`);
    lines.push(`b day: ${collision["brakeUpDay"]}`);
    lines.push(`b by: ${collision["brokeUp"]}`);
    lines.push(`b reason: ${collision["reason"]}`);

    const width = 180;
    const height = padding * 2 + lines.length * lineHeight;
    const x = this.logicalWidth - width - 10;
    const y = 10;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x, y, width, height);

    ctx.font = `${lineHeight - 2}px monospace`;
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "top";

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + padding, y + padding + i * lineHeight);
    }

    ctx.restore();
  }

  public draw(
    tunnel: number[],
    redLine: number[],
    blueLine: number[],
    collision: Collision,
    dayLimit: number,
    windowStart: number,
    windowMaxX: number,
    windowMaxY: number,
  ) {
    this.drawCanvas(windowStart, windowMaxX, windowMaxY);

    this.drawTunnel(tunnel, collision, dayLimit, windowStart, windowMaxX);

    this.drawManValueLine(
      blueLine,
      tunnel,
      collision,
      dayLimit,
      windowStart,
      windowMaxX,
    );

    this.drawWomanLine(redLine, collision, dayLimit, windowStart, windowMaxX);

    this.drawBreakup(tunnel, redLine, collision, dayLimit);

    this.drawAxis();
  }
}
