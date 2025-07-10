import { Collision } from "../engine/collision.js";
import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";
import { Graph } from "./graph.js";
import { Scene } from "./scene.js";
import { Info } from "./info.js";
import { Controls } from "./controls.js";

export class Player {
  private currentDay = 0;
  private frameId: number | null = null;
  private graph: Graph;
  private isPlaying = false;
  private lastTickTime: number = performance.now();
  private scene: Scene;
  private timeline: HTMLInputElement;
  private info = new Info();
  private controls = new Controls();
  private refreshRate: number = 60;

  constructor(
    private man: Man,
    private woman: Woman,
    private collision: Collision,
    private totalDays: number,
    private daysPerSecond: number,
    private frameDays: number,
    private isDebug: boolean,
  ) {
    this.totalDays = this.collision.brakeUpDay ? totalDays : 365;

    this.estimateRefreshRate((hz) => {
      this.refreshRate = hz;
      console.log("Estimated refresh rate:", hz, "Hz");
    });

    const days = Number(window.localStorage.getItem("daysPerSecond"));

    if (days) {
      this.daysPerSecond = days;
    } else {
      this.daysPerSecond = daysPerSecond;
    }

    this.tick = this.tick.bind(this);

    this.graph = new Graph(
      document.getElementById("graph") as HTMLCanvasElement,
    );

    this.scene = new Scene(
      document.getElementById("scene") as HTMLCanvasElement,
    );

    this.timeline = document.getElementById("timeline") as HTMLInputElement;

    this.controls.up.onclick = this.speedUp.bind(this);

    this.controls.down.onclick = this.speedDown.bind(this);

    this.setupCanvasDrag(document.getElementById("graph") as HTMLCanvasElement);

    this.timeline.max = String(this.totalDays);

    this.timeline.oninput = () => {
      this.seek(Number(this.timeline.value));
    };
  }

  private estimateRefreshRate(
    callback: (hz: number) => void,
    samples = 60,
    expectedRates = [60, 120, 144, 165, 240],
  ) {
    const frameTimes: number[] = [];

    let lastTimestamp = performance.now();

    function frame(timestamp: number) {
      const delta = timestamp - lastTimestamp;

      lastTimestamp = timestamp;

      frameTimes.push(delta);

      if (frameTimes.length < samples) {
        requestAnimationFrame(frame);
      } else {
        const filtered = frameTimes.filter((d) => d > 5 && d < 100);

        const avg =
          filtered.reduce((sum, val) => sum + val, 0) / filtered.length;

        const rawHz = 1000 / avg;

        const closestHz = expectedRates.reduce((prev, curr) =>
          Math.abs(curr - rawHz) < Math.abs(prev - rawHz) ? curr : prev,
        );

        callback(closestHz);
      }
    }

    requestAnimationFrame(frame);
  }

  private speedUp() {
    if (this.daysPerSecond < 10) {
      this.daysPerSecond++;
    } else {
      this.daysPerSecond += 10;
    }

    window.localStorage.setItem("daysPerSecond", String(this.daysPerSecond));
  }

  private speedDown() {
    if (this.daysPerSecond <= 10) {
      this.daysPerSecond = Math.max(1, this.daysPerSecond - 1);
    } else {
      this.daysPerSecond -= 10;
    }

    window.localStorage.setItem("daysPerSecond", String(this.daysPerSecond));
  }

  setupCanvasDrag(canvas: HTMLCanvasElement) {
    let dragging = false;

    let lastX = 0;

    const onDrag = (clientX: number) => {
      const dx = clientX - lastX;

      lastX = clientX;

      const visibleDays = Math.max(1, this.frameDays);

      const pixelsPerDay = canvas.clientWidth / visibleDays;

      const deltaDays = Math.round(dx / pixelsPerDay);
      this.seek(this.currentDay - deltaDays);
    };

    canvas.addEventListener("mousedown", (e) => {
      dragging = true;
      lastX = e.clientX;

      this.pause();
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;

      onDrag(e.clientX);
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
      this.play();
    });

    canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;

        dragging = true;
        lastX = e.touches[0].clientX;

        this.pause();
      },
      { passive: true },
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging || e.touches.length !== 1) return;

        e.preventDefault();

        onDrag(e.touches[0].clientX);
      },
      { passive: false },
    );

    window.addEventListener("touchend", () => {
      dragging = false;
      this.play();
    });
  }

  private updateFrame(day: number) {
    const windowStart = Math.max(0, day - this.frameDays);

    this.graph.draw(
      this.man.capacityHistory,
      this.woman.valueHistory,
      this.man.valueHistory,
      this.collision,
      Math.floor(day),
      Math.floor(windowStart),
      this.frameDays,
      this.man.capacityHistory[0],
    );

    this.scene.draw(
      this.man,
      this.woman,
      this.collision,
      Math.floor(day) - 1,
      this.collision.brakeUpDay == null && day === this.totalDays,
      this.frameDays,
      this.man.capacityHistory[0],
    );

    if (this.isDebug) {
      this.graph.drawOverlayInfo(
        this.man,
        this.woman,
        this.collision,
        Math.floor(day) - 1,
      );
    }

    this.timeline.value = String(day);
    this.updateViews(day);
  }

  private updateViews(day: number) {
    this.info.updateCurrentDay(day);

    const isAfterBrokenDay =
      this.collision.brakeUpDay && day >= this.collision.brakeUpDay;

    if (isAfterBrokenDay) {
      this.info.updateBrokeUp(this.collision.brokeUp!, this.collision.reason);
      this.info.updateBrakeUpDay(this.collision.brakeUpDay!);
    }

    this.controls.updateNewAtMax(this.daysPerSecond);
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTickTime = performance.now();
      this.frameId = requestAnimationFrame((t) => this.tick(t));
    }
  }

  pause() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    this.isPlaying = false;
  }

  stop() {
    this.pause();
    this.currentDay = 0;
    this.frameId = null;
    this.lastTickTime = performance.now();
  }

  forward(days = 10) {
    this.pause();
    this.currentDay = Math.min(this.totalDays, this.currentDay + days);
    this.lastTickTime = performance.now();
    this.updateFrame(this.currentDay);
  }

  rewind(days = 10) {
    this.pause();
    this.currentDay = Math.max(0, this.currentDay - days);
    this.lastTickTime = performance.now();
    this.updateFrame(this.currentDay);
  }

  seek(day: number) {
    this.pause();

    const newDay = Math.max(0, Math.min(this.totalDays, day));

    this.currentDay = newDay;
    this.lastTickTime = performance.now();
    this.updateFrame(this.currentDay);
  }

  tick(timestamp: number) {
    if (!this.isPlaying) return;

    const deltaInSeconds = (timestamp - this.lastTickTime) / 1000;

    // Cap frame rate to refresh rate of device.
    if (deltaInSeconds < 1 / this.refreshRate) {
      this.frameId = requestAnimationFrame(this.tick);

      return;
    }

    this.lastTickTime = timestamp;

    this.currentDay += deltaInSeconds * this.daysPerSecond;

    if (this.currentDay >= this.totalDays) {
      this.currentDay = this.totalDays;
      this.updateFrame(this.currentDay);
      this.pause();

      return;
    }

    this.updateFrame(this.currentDay);

    this.frameId = requestAnimationFrame(this.tick);
  }
}
