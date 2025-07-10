import { Simulator } from "./engine/simulator.js";
import { Collision } from "./engine/collision.js";
import { Woman } from "./actor/woman.js";
import { Man } from "./actor/man.js";
import { Player } from "./render/player.js";

const man = new Man(150, [14, 90]);
const woman = new Woman(150, [14, 90], man.capacity);
const collision = new Collision(man, woman);
const totalDays = 100 * 365;

const simulation = new Simulator(man, woman, collision, totalDays);

simulation.simulateLife();

const player = new Player(
  man,
  woman,
  collision,
  simulation.lastDay,
  30,
  365,
  false,
);

player.play();
