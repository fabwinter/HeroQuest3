import { HeroQuestMapDocument, ValidationResult } from "./types";

const WIDTH = 26;
const HEIGHT = 19;

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

export function validateMap(map: HeroQuestMapDocument): ValidationResult {
  const errors: string[] = [];

  if (map.board.width !== WIDTH || map.board.height !== HEIGHT) {
    errors.push("Board must be exactly 26x19");
  }

  const occupancy = new Set<string>();
  const entityIds = new Set(map.entities.map((entity) => entity.id));

  for (const entity of map.entities) {
    if (entity.kind === "door") {
      const door = entity.placement.at;
      if (!door.edge) {
        errors.push(`Door ${entity.id} is not edge-placed`);
      }

      if (!inBounds(door.x, door.y)) {
        errors.push(`Door ${entity.id} edge coordinates are out of bounds`);
      }
      continue;
    }

    const tile = entity.placement.at;
    if (!inBounds(tile.x, tile.y)) {
      errors.push(`Entity ${entity.id} is out of bounds`);
      continue;
    }

    const key = `${tile.x},${tile.y}`;
    if (occupancy.has(key)) {
      errors.push(`Tile overlap detected at ${key}`);
    } else {
      occupancy.add(key);
    }

    if (tile.x === 1 && tile.y === 1) {
      errors.push(`Entity ${entity.id} blocks the assumed stairs/start tile (1,1)`);
    }
  }

  for (const event of map.events) {
    if (event.trigger.at && !inBounds(event.trigger.at.x, event.trigger.at.y)) {
      errors.push(`Event ${event.id} has out-of-bounds trigger coordinates`);
    }

    if (event.trigger.ref && !entityIds.has(event.trigger.ref)) {
      errors.push(`Event ${event.id} trigger ref '${event.trigger.ref}' does not match any entity`);
    }

    for (const action of event.actions) {
      if (action.ref && !entityIds.has(action.ref)) {
        errors.push(`Event ${event.id} action ref '${action.ref}' does not match any entity`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
