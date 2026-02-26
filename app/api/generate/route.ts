import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMap } from "@/lib/generator";

const requestSchema = z.object({
  seed: z.string().min(1).default("default-seed"),
  prompt: z.string().default(""),
  editionPackId: z.enum(["legacy_us", "legacy_eu", "rerelease_2021", "homebrew"]).default("legacy_us"),
  sliders: z.object({
    monsterBudget: z.number().min(0).max(20),
    trapDensity: z.number().min(0).max(1),
    furnitureDensity: z.number().min(0).max(1)
  }),
  toggles: z.record(z.boolean())
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const map = generateMap({
    seed: parsed.data.seed,
    prompt: parsed.data.prompt,
    editionPackId: parsed.data.editionPackId,
    monsterBudget: parsed.data.sliders.monsterBudget,
    trapDensity: parsed.data.sliders.trapDensity,
    furnitureDensity: parsed.data.sliders.furnitureDensity,
    toggles: parsed.data.toggles
  });

  return NextResponse.json(map);
}
