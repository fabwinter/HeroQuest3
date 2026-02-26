export type EditionPackId = "legacy_us" | "legacy_eu" | "rerelease_2021" | "homebrew";
export type Direction = "N" | "E" | "S" | "W";
export type DoorType = "normal" | "secret" | "false" | "exit" | "teleport";
export type DoorState = "closed" | "open" | "hidden";
export type EntityKind = "door" | "monster" | "furniture" | "trap";

export interface Point { x: number; y: number; }
export interface EdgePlacement { edge: true; x: number; y: number; dir: Direction; }
export interface Placement { layer: "gm" | "public"; reveal: "start" | "on_open" | "on_search" | "on_step" | "never"; at: Point | EdgePlacement; }

export interface Entity {
  id: string;
  kind: EntityKind;
  placement: Placement;
  data: Record<string, unknown>;
}

export interface HeroQuestMapDocument {
  meta: {
    id: string;
    title: string;
    seed: string;
    createdAt: string;
    generator: { name: string; version: string; mode: "rule_based" };
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
  events: Array<{ id: string; trigger: { type: string; ref?: string; at?: Point }; actions: Array<{ type: string; ref?: string; value?: unknown }> }>;
}
