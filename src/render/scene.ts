import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";
import { Canvas } from "./canvas.js";
import { Collision } from "../engine/collision.js";

export class Scene extends Canvas {
  private currentSpacing: number = 0;
  private offset: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private drawCharacter(x: number, emoji: string, color: string) {
    const bodyLength = 40 * this.scale;
    const legLength = 20 * this.scale;
    const armLength = 20 * this.scale;
    const headOffset =
      this.logicalHeight / 1.2 - (bodyLength + legLength / 2) * this.scale;
    this.offset = headOffset;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 8 * this.scale;

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
    this.ctx.font = `${42 * this.scale}px serif`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(emoji, x, headOffset + 8 * this.scale);

    this.ctx.restore();
  }

  private drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    tailDir: "up" | "down",
    isWoman: boolean,
  ) {
    const paddingX = 10;
    const radius = 10;
    const height = 24;
    ctx.font = "14px sans-serif";

    const textWidth = ctx.measureText(text).width;
    const width = textWidth + paddingX * 2;

    const canvasWidth = this.logicalWidth;
    const edgePadding = 6;

    let bubbleX = x - width / 2;

    if (!isWoman) {
      bubbleX -= 80 * this.scale;
      if (bubbleX < edgePadding) bubbleX = edgePadding;
      if (bubbleX + width > canvasWidth - edgePadding)
        bubbleX = canvasWidth - edgePadding - width;
    } else {
      bubbleX += 80 * this.scale;
      if (bubbleX + width > canvasWidth - edgePadding)
        bubbleX = canvasWidth - edgePadding - width;
      if (bubbleX < edgePadding) bubbleX = edgePadding;
    }

    const bubbleY =
      tailDir === "up" ? y - height - 60 * this.scale : y + 10 * this.scale;
    const bubbleCenterX = bubbleX + width / 2;

    // Bubble.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bubbleX + radius, bubbleY);
    ctx.lineTo(bubbleX + width - radius, bubbleY);
    ctx.quadraticCurveTo(
      bubbleX + width,
      bubbleY,
      bubbleX + width,
      bubbleY + radius,
    );
    ctx.lineTo(bubbleX + width, bubbleY + height - radius);
    ctx.quadraticCurveTo(
      bubbleX + width,
      bubbleY + height,
      bubbleX + width - radius,
      bubbleY + height,
    );
    ctx.lineTo(bubbleX + radius, bubbleY + height);
    ctx.quadraticCurveTo(
      bubbleX,
      bubbleY + height,
      bubbleX,
      bubbleY + height - radius,
    );
    ctx.lineTo(bubbleX, bubbleY + radius);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fill();

    // Tail.
    ctx.beginPath();
    ctx.moveTo(x, this.offset - 20);
    if (tailDir === "up") {
      ctx.lineTo(bubbleCenterX - 6, bubbleY + height);
      ctx.lineTo(bubbleCenterX + 6, bubbleY + height);
    } else {
      ctx.lineTo(bubbleCenterX - 6, bubbleY);
      ctx.lineTo(bubbleCenterX + 6, bubbleY);
    }
    ctx.closePath();
    ctx.fill();

    // Thought.
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, bubbleCenterX, bubbleY + height / 2);
    ctx.restore();
  }

  private drawThoughts(
    man: Man,
    manX: number,
    woman: Woman,
    womanX: number,
    day: number,
    collision: Collision,
  ) {
    let manText = man.thoughtList.at(man.thoughtHistory.at(day)!)!;

    if (
      collision.brakeUpDay &&
      day >= collision.brakeUpDay &&
      collision.brokeUp === "man"
    ) {
      manText = man.breakupReasons[collision.reason];

      if (day === man.valueHistory.length - 1) {
        if (man.valueHistory[day] > man.valueHistory[collision.brakeUpDay]) {
          manText =
            man.exGoodQuotes[
              Math.floor(Math.random() * man.exGoodQuotes.length)
            ];
        } else {
          manText =
            man.exBadQuotes[Math.floor(Math.random() * man.exBadQuotes.length)];
        }
      }
    }

    this.drawSpeechBubble(
      this.ctx,
      manText,
      manX,
      this.offset - 20 * this.scale,
      "up",
      false,
    );

    let womanText = man.thoughtList.at(man.thoughtHistory.at(day)!)!;

    if (
      collision.brakeUpDay &&
      day >= collision.brakeUpDay &&
      collision.brokeUp === "woman"
    ) {
      womanText = woman.breakupReasons[collision.reason];

      if (day === woman.valueHistory.length - 1) {
        if (
          woman.valueHistory[day] > woman.valueHistory[collision.brakeUpDay]
        ) {
          womanText =
            woman.exGoodQuotes[
              Math.floor(Math.random() * woman.exGoodQuotes.length)
            ];
        } else {
          womanText =
            woman.exBadQuotes[
              Math.floor(Math.random() * woman.exBadQuotes.length)
            ];
        }
      }
    }

    this.drawSpeechBubble(
      this.ctx,
      womanText,
      womanX,
      this.offset - 50 * this.scale,
      "up",
      true,
    );
  }

  public drawSurvived() {
    const ctx = this.ctx;

    // Draw semi-transparent background
    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // Draw heart
    ctx.font = `bold ${80 * this.scale}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e00";
    ctx.fillText(
      "❤️",
      this.logicalWidth / 2,
      this.logicalHeight / 2 - 95 * this.scale,
    );

    // Draw message
    ctx.font = `bold ${10 * this.scale}px sans-serif`;
    ctx.fillStyle = "#000";
    ctx.fillText(
      "they lived to die on the same day",
      this.logicalWidth / 2,
      this.logicalHeight / 10,
    );
    ctx.restore();
  }

  public draw(
    man: Man,
    woman: Woman,
    collision: Collision,
    day: number,
    isHappyEnd: boolean,
    windowMaxX: number,
    windowMaxY: number,
  ) {
    this.drawCanvas(0, windowMaxX, windowMaxY);

    const safeDay = Math.max(
      0,
      Math.min(day, man.valueHistory.length - 1, woman.valueHistory.length - 1),
    );

    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    const maxSpacing = this.logicalWidth * 0.8;

    const targetSpacingRaw =
      Math.abs(woman.valueHistory[safeDay] - man.valueHistory[safeDay]) * 2;

    const targetSpacing = Math.min(targetSpacingRaw, maxSpacing);

    const centerX = this.logicalWidth / 2;

    const antialiasing = 0.1;

    this.currentSpacing += (targetSpacing - this.currentSpacing) * antialiasing;

    const manX = centerX - this.currentSpacing / 2;

    const womanX = centerX + this.currentSpacing / 2;

    let manEmoji = man.emojiList.at(man.thoughtHistory.at(day)!)!;

    if (
      collision.brakeUpDay &&
      day >= collision.brakeUpDay &&
      collision.brokeUp === "man"
    ) {
      manEmoji = man.breakupEmojis[collision.reason];

      if (day === man.valueHistory.length - 1) {
        if (man.valueHistory[day] > man.valueHistory[collision.brakeUpDay]) {
          manEmoji =
            man.exGoodEmojis[
              Math.floor(Math.random() * man.exGoodEmojis.length)
            ];
        } else {
          manEmoji =
            man.exBadEmojis[Math.floor(Math.random() * man.exBadEmojis.length)];
        }
      }
    }

    this.drawCharacter(manX, manEmoji, "#4682B4");

    let womanEmoji = woman.emojiList.at(woman.thoughtHistory.at(day)!)!;

    if (
      collision.brakeUpDay &&
      day >= collision.brakeUpDay &&
      collision.brokeUp === "woman"
    ) {
      womanEmoji = woman.breakupEmojis[collision.reason];

      if (day === woman.valueHistory.length - 1) {
        if (
          woman.valueHistory[day] > woman.valueHistory[collision.brakeUpDay]
        ) {
          womanEmoji =
            woman.exGoodEmojis[
              Math.floor(Math.random() * woman.exGoodEmojis.length)
            ];
        } else {
          womanEmoji =
            woman.exBadEmojis[
              Math.floor(Math.random() * woman.exBadEmojis.length)
            ];
        }
      }
    }

    this.drawCharacter(womanX, womanEmoji, "#FF69B4");

    this.drawThoughts(man, manX, woman, womanX, day, collision);

    if (isHappyEnd) {
      this.drawSurvived();
    }
  }
}
