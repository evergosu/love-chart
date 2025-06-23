import { Collision } from "../engine/collision.js";
import { Human } from "../actor/human.js";
import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";
import { Canvas } from "./canvas.js";

export class Scene extends Canvas {
  private currentSpacing: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private drawCharacter(x: number, emoji: string, color: string) {
    const bodyLength = 40;
    const legLength = 20;
    const armLength = 20;
    const headOffset =
      this.logicalHeight / 2 - (bodyLength + legLength / 2) * this.scale;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 8;

    // Body
    this.ctx.beginPath();
    this.ctx.moveTo(x, headOffset);
    this.ctx.lineTo(x, headOffset + bodyLength);
    this.ctx.stroke();

    // Arms
    this.ctx.beginPath();
    this.ctx.moveTo(x - armLength, headOffset + bodyLength / 2);
    this.ctx.lineTo(x + armLength, headOffset + bodyLength / 2);
    this.ctx.stroke();

    // Legs
    const legStartY = headOffset + bodyLength;
    this.ctx.beginPath();
    this.ctx.moveTo(x, legStartY);
    this.ctx.lineTo(x - legLength, legStartY + legLength);
    this.ctx.moveTo(x, legStartY);
    this.ctx.lineTo(x + legLength, legStartY + legLength);
    this.ctx.stroke();

    // Head
    this.ctx.font = "42px serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(emoji, x, headOffset + 5);

    this.ctx.restore();
  }

  private getEmoji(h: Human, c: Collision, day: number): string {
    if (c.brakeUpDay && day >= c.brakeUpDay) return "😐";
    if (day < h.decayDuration) return "😍";
    if (h.history[day] > 100) return "😍";
    if (h.history[day] > 80) return "😊";
    if (h.history[day] < 60) return "🥺";
    if (h.history[day] < 0) return "😡";
    if (h.discontent > 20) return "😭";
    if (h.discontent > 10) return "😡";
    if (h.discontent > 5) return "😕";
    return "😐";
  }

  public draw(
    man: Man,
    woman: Woman,
    collision: Collision,
    day: number,
    windowMaxX: number,
    windowMaxY: number,
  ) {
    this.drawCanvas(0, windowMaxX, windowMaxY);

    const safeDay = Math.max(
      0,
      Math.min(day, man.history.length - 1, woman.history.length - 1),
    );

    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    const maxSpacing = this.logicalWidth * 0.8;

    const targetSpacingRaw =
      Math.abs(woman.history[safeDay] - man.history[safeDay]) * 2;

    const targetSpacing = Math.min(targetSpacingRaw, maxSpacing);

    const centerX = this.logicalWidth / 2;

    const antialiasing = 0.1;

    this.currentSpacing += (targetSpacing - this.currentSpacing) * antialiasing;

    const manX = centerX - this.currentSpacing / 2;

    const womanX = centerX + this.currentSpacing / 2;

    this.drawCharacter(manX, this.getEmoji(man, collision, safeDay), "#4682B4");

    this.drawCharacter(
      womanX,
      this.getEmoji(woman, collision, safeDay),
      "#FF69B4",
    );
  }
}
