import { HeroQuestMapDocument, Point } from "./types";

const DOOR_FRAMES = [
  { edge: true as const, x: 10, y: 8, dir: "E" as const },
  { edge: true as const, x: 12, y: 11, dir: "W" as const },
  { edge: true as const, x: 16, y: 7, dir: "N" as const }
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

function pickPoint(state: { v: number }): Point {
  return { x: Math.floor(rand(state) * 24) + 1, y: Math.floor(rand(state) * 17) + 1 };
}

export function generateMap(input: { seed: string; prompt: string; monsterBudget: number; trapDensity: number; furnitureDensity: number; editionPackId: HeroQuestMapDocument["meta"]["editionPackId"]; toggles: Record<string, boolean> }): HeroQuestMapDocument {
  const state = { v: hashSeed(input.seed || "default-seed") || 1 };

  const entities: HeroQuestMapDocument["entities"] = [];
  const events: HeroQuestMapDocument["events"] = [];

  DOOR_FRAMES.slice(0, 2).forEach((frame, index) => {
    entities.push({ id: `door_${index + 1}`, kind: "door", placement: { layer: "public", reveal: "start", at: frame }, data: { doorType: "normal", state: "closed" } });
  });

  const monsterCount = Math.max(0, Math.min(8, Math.round(input.monsterBudget / 2)));
  for (let i = 0; i < monsterCount; i += 1) {
    entities.push({ id: `monster_${i + 1}`, kind: "monster", placement: { layer: "gm", reveal: "on_open", at: pickPoint(state) }, data: { monsterId: i % 2 === 0 ? "goblin" : "orc", groupId: "encounter_1" } });
  }

  const trapCount = Math.round(input.trapDensity * 6);
  for (let i = 0; i < trapCount; i += 1) {
    entities.push({ id: `trap_${i + 1}`, kind: "trap", placement: { layer: "gm", reveal: "on_search", at: pickPoint(state) }, data: { trapType: input.toggles.falling_block ? "falling_block" : "pit", armed: true, discovered: false } });
  }

  const furnitureCount = Math.round(input.furnitureDensity * 6);
  for (let i = 0; i < furnitureCount; i += 1) {
    entities.push({ id: `furniture_${i + 1}`, kind: "furniture", placement: { layer: "gm", reveal: "on_open", at: pickPoint(state) }, data: { furnitureId: i % 2 === 0 ? "bookcase" : "chest", passable: false, blocksLos: true } });
  }

  events.push({
    id: "ev_open_door_1",
    trigger: { type: "on_open_door", ref: "door_1" },
    actions: [{ type: "message", value: input.prompt || "The chamber opens into darkness." }, { type: "reveal", ref: "encounter_1" }]
  });

  if (trapCount > 0) {
    events.push({ id: "ev_trap_hint", trigger: { type: "on_search_traps", at: { x: 10, y: 8 } }, actions: [{ type: "message", value: "You notice suspicious floor seams." }] });
  }

  return {
    meta: {
      id: `map_${Math.abs(hashSeed(input.seed || "default")).toString(16)}`,
      title: "Generated HeroQuest Map",
      seed: input.seed,
      createdAt: new Date().toISOString(),
      generator: { name: "hq-next-gen", version: "0.1.0", mode: "rule_based" },
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
