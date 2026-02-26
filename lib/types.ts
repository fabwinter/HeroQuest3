export type EditionPackId = "legacy_us" | "legacy_eu" | "rerelease_2021" | "homebrew";
export type GeneratorMode = "rule_based";
export type Direction = "N" | "E" | "S" | "W";

export type DoorType = "normal" | "secret" | "false" | "exit" | "teleport";
export type DoorState = "closed" | "open" | "hidden";
export type EntityKind = "door" | "monster" | "furniture" | "trap";

export interface Point {
  x: number;
  y: number;
}

export interface EdgePlacement {
  edge: true;
  x: number;
  y: number;
  dir: Direction;
}

export interface TilePlacement {
  layer: "gm" | "public";
  reveal: "start" | "on_open" | "on_search" | "on_step" | "never";
  at: Point;
}

export interface DoorPlacement {
  layer: "gm" | "public";
  reveal: "start" | "on_open" | "on_search" | "on_step" | "never";
  at: EdgePlacement;
}

export interface DoorEntity {
  id: string;
  kind: "door";
  placement: DoorPlacement;
  data: { doorType: DoorType; state: DoorState };
}

export interface MonsterEntity {
  id: string;
  kind: "monster";
  placement: TilePlacement;
  data: { monsterId: "goblin" | "orc" | "skeleton"; groupId: string };
}

export interface TrapEntity {
  id: string;
  kind: "trap";
  placement: TilePlacement;
  data: { trapType: "pit" | "falling_block" | "spear" | "chest_trap"; armed: boolean; discovered: boolean };
}

export interface FurnitureEntity {
  id: string;
  kind: "furniture";
  placement: TilePlacement;
  data: { furnitureId: "bookcase" | "chest" | "table" | "throne"; passable: boolean; blocksLos: boolean };
}

export type Entity = DoorEntity | MonsterEntity | TrapEntity | FurnitureEntity;

export interface Event {
  id: string;
  trigger: { type: "on_open_door" | "on_search_traps" | "on_trap_trigger"; ref?: string; at?: Point };
  actions: Array<{ type: "reveal" | "message" | "damage"; ref?: string; value?: unknown }>;
}

export interface HeroQuestMapDocument {
  meta: {
    id: string;
    title: string;
    seed: string;
    createdAt: string;
    generator: { name: string; version: string; mode: GeneratorMode };
    editionPackId: EditionPackId;
  };
  board: {
    templateId: "HQ_BASE_26x19";
    width: 26;
    height: 19;
    coordSystem: "xy_top_left";
    doorFrames: EdgePlacement[];
  };
  entities: Entity[];
  events: Event[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
