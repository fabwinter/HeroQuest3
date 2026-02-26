import { EdgePlacement, HeroQuestMapDocument, Point, TrapEntity } from "./types";

const DOOR_FRAMES: EdgePlacement[] = [
  { edge: true, x: 10, y: 8, dir: "E" },
  { edge: true, x: 12, y: 11, dir: "W" },
  { edge: true, x: 16, y: 7, dir: "N" },
  { edge: true, x: 20, y: 14, dir: "W" }
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(state: { v: number }): number {
  state.v ^= state.v << 13;
  state.v ^= state.v >>> 17;
  state.v ^= state.v << 5;
  return (state.v >>> 0) / 4294967296;
}

function pickOpenTile(state: { v: number }, used: Set<string>): Point {
  for (let i = 0; i < 1000; i += 1) {
    const point = { x: Math.floor(rand(state) * 24) + 1, y: Math.floor(rand(state) * 17) + 1 };
    const key = `${point.x},${point.y}`;
    if (!used.has(key) && !(point.x === 1 && point.y === 1)) {
      used.add(key);
      return point;
    }
  }

  throw new Error("Unable to find open tile during generation");
}

export function generateMap(input: {
  seed: string;
  prompt: string;
  monsterBudget: number;
  trapDensity: number;
  furnitureDensity: number;
  editionPackId: HeroQuestMapDocument["meta"]["editionPackId"];
  toggles: Record<string, boolean>;
}): HeroQuestMapDocument {
  const state = { v: hashSeed(input.seed || "default-seed") || 1 };
  const usedTiles = new Set<string>();

  const entities: HeroQuestMapDocument["entities"] = [];
  const events: HeroQuestMapDocument["events"] = [];

  entities.push(
    {
      id: "door_1",
      kind: "door",
      placement: { layer: "public", reveal: "start", at: DOOR_FRAMES[0] },
      data: { doorType: "normal", state: "closed" }
    },
    {
      id: "door_2",
      kind: "door",
      placement: {
        layer: input.toggles.allowSecretDoors ? "gm" : "public",
        reveal: input.toggles.allowSecretDoors ? "never" : "start",
        at: DOOR_FRAMES[1]
      },
      data: { doorType: input.toggles.allowSecretDoors ? "secret" : "normal", state: input.toggles.allowSecretDoors ? "hidden" : "closed" }
    }
  );

  const monsterCount = Math.max(0, Math.min(10, Math.round(input.monsterBudget / 2)));
  for (let i = 0; i < monsterCount; i += 1) {
    const point = pickOpenTile(state, usedTiles);
    entities.push({
      id: `monster_${i + 1}`,
      kind: "monster",
      placement: { layer: "gm", reveal: "on_open", at: point },
      data: { monsterId: i % 3 === 0 ? "orc" : i % 2 === 0 ? "skeleton" : "goblin", groupId: "encounter_1" }
    });
  }

  const trapTypes: TrapEntity["data"]["trapType"][] = [];
  if (input.toggles.pit) trapTypes.push("pit");
  if (input.toggles.falling_block) trapTypes.push("falling_block");
  if (input.toggles.spear) trapTypes.push("spear");
  if (input.toggles.chest_trap) trapTypes.push("chest_trap");

  const trapCount = Math.max(0, Math.min(8, Math.round(input.trapDensity * 8)));
  for (let i = 0; i < trapCount; i += 1) {
    const point = pickOpenTile(state, usedTiles);
    const trapType = trapTypes.length > 0 ? trapTypes[i % trapTypes.length] : "pit";
    entities.push({
      id: `trap_${i + 1}`,
      kind: "trap",
      placement: { layer: "gm", reveal: "on_search", at: point },
      data: { trapType, armed: true, discovered: false }
    });
  }

  const furnitureCount = Math.max(0, Math.min(8, Math.round(input.furnitureDensity * 8)));
  for (let i = 0; i < furnitureCount; i += 1) {
    const point = pickOpenTile(state, usedTiles);
    entities.push({
      id: `furniture_${i + 1}`,
      kind: "furniture",
      placement: { layer: "gm", reveal: "on_open", at: point },
      data: { furnitureId: i % 3 === 0 ? "table" : i % 2 === 0 ? "bookcase" : "chest", passable: false, blocksLos: true }
    });
  }

  events.push({
    id: "ev_open_door_1",
    trigger: { type: "on_open_door", ref: "door_1" },
    actions: [
      { type: "message", value: input.prompt || "The chamber opens into darkness." },
      { type: "reveal", ref: "encounter_1" }
    ]
  });

  if (input.toggles.allowSecretDoors) {
    events.push({
      id: "ev_search_secret_door",
      trigger: { type: "on_search_traps", at: { x: 12, y: 11 } },
      actions: [{ type: "message", value: "A hidden seam is visible behind the stonework." }, { type: "reveal", ref: "door_2" }]
    });
  }

  if (trapCount > 0) {
    events.push({
      id: "ev_trap_trigger_1",
      trigger: { type: "on_trap_trigger", ref: "trap_1" },
      actions: [{ type: "damage", value: { target: "active_hero", amount: 1 } }, { type: "message", value: "A trap is sprung." }]
    });
  }

  return {
    meta: {
      id: `map_${Math.abs(hashSeed(input.seed || "default")).toString(16)}`,
      title: "Generated HeroQuest Map",
      seed: input.seed,
      createdAt: new Date().toISOString(),
      generator: { name: "hq-next-gen", version: "0.2.0", mode: "rule_based" },
      editionPackId: input.editionPackId
    },
    board: {
      templateId: "HQ_BASE_26x19",
      width: 26,
      height: 19,
      coordSystem: "xy_top_left",
      doorFrames: DOOR_FRAMES
    },
    entities,
    events
  };
}
