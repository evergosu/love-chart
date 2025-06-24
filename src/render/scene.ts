import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";
import { Canvas } from "./canvas.js";

export class Scene extends Canvas {
  private currentSpacing: number = 0;
  private offset: number = 0;
  private manThought = "";
  private womanThought = "";
  private manEmoji = "";
  private womanEmoji = "";

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
  ) {
    if (day % 30 === 0) {
      const emotion = Math.floor(Math.random() * 100) - 5;
      this.manThought = man.thoughts.at(emotion) ?? "";
      this.womanThought = woman.thoughts.at(emotion) ?? "";
    }

    if (this.manThought) {
      this.drawSpeechBubble(
        this.ctx,
        this.manThought,
        manX,
        this.offset - 20 * this.scale,
        "up",
        false,
      );
    }

    if (this.womanThought) {
      this.drawSpeechBubble(
        this.ctx,
        this.womanThought,
        womanX,
        this.offset - 50 * this.scale,
        "up",
        true,
      );
    }
  }

  public draw(
    man: Man,
    woman: Woman,
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

    if (day % 30 === 0) {
      const emotion = Math.floor(Math.random() * 100) - 5;
      this.manEmoji = man.emojis.at(emotion) ?? "";
      this.womanEmoji = woman.emojis.at(emotion) ?? "";
    }

    this.drawCharacter(manX, this.manEmoji, "#4682B4");

    this.drawCharacter(womanX, this.womanEmoji, "#FF69B4");

    this.drawThoughts(man, manX, woman, womanX, day);
  }
}
