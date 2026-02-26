"use client";

import { useMemo, useState } from "react";
import { HeroQuestMapDocument } from "@/lib/types";

const cell = 28;

const initial = {
  seed: "HQ-SEED-1",
  prompt: "A crypt with one patrol and trapped treasure.",
  editionPackId: "legacy_us",
  monsterBudget: 8,
  trapDensity: 0.25,
  furnitureDensity: 0.35,
  pit: true,
  falling_block: false,
  spear: true,
  chest_trap: true,
  strictRules: true,
  allowSecretDoors: true,
  allowFalseDoors: false,
  allowTeleportDoors: false
};

export default function Page() {
  const [state, setState] = useState(initial);
  const [map, setMap] = useState<HeroQuestMapDocument | null>(null);
  const [loading, setLoading] = useState(false);

  const entitiesByKind = useMemo(() => {
    if (!map) return {} as Record<string, number>;
    return map.entities.reduce<Record<string, number>>((acc, e) => {
      acc[e.kind] = (acc[e.kind] ?? 0) + 1;
      return acc;
    }, {});
  }, [map]);

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seed: state.seed,
        prompt: state.prompt,
        editionPackId: state.editionPackId,
        sliders: {
          monsterBudget: state.monsterBudget,
          trapDensity: state.trapDensity,
          furnitureDensity: state.furnitureDensity
        },
        toggles: {
          pit: state.pit,
          falling_block: state.falling_block,
          spear: state.spear,
          chest_trap: state.chest_trap,
          strictRules: state.strictRules,
          allowSecretDoors: state.allowSecretDoors,
          allowFalseDoors: state.allowFalseDoors,
          allowTeleportDoors: state.allowTeleportDoors
        }
      })
    });

    setMap(await res.json());
    setLoading(false);
  };

  const downloadJson = () => {
    if (!map) return;
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${map.meta.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <aside className="panel">
        <h2>HeroQuest Map Generator</h2>
        <div className="section">
          <label>Seed</label>
          <input value={state.seed} onChange={(e) => setState({ ...state, seed: e.target.value })} />
        </div>
        <div className="section">
          <label>Edition Pack</label>
          <select value={state.editionPackId} onChange={(e) => setState({ ...state, editionPackId: e.target.value })}>
            <option value="legacy_us">Legacy US</option>
            <option value="legacy_eu">Legacy EU</option>
            <option value="rerelease_2021">Re-release 2021</option>
            <option value="homebrew">Homebrew</option>
          </select>
        </div>
        <div className="section">
          <label>Theme prompt</label>
          <textarea value={state.prompt} onChange={(e) => setState({ ...state, prompt: e.target.value })} />
        </div>
        <div className="section">
          <label>Monster budget: {state.monsterBudget}</label>
          <input type="range" min={0} max={20} value={state.monsterBudget} onChange={(e) => setState({ ...state, monsterBudget: Number(e.target.value) })} />
          <label>Trap density: {state.trapDensity.toFixed(2)}</label>
          <input type="range" min={0} max={1} step={0.05} value={state.trapDensity} onChange={(e) => setState({ ...state, trapDensity: Number(e.target.value) })} />
          <label>Furniture density: {state.furnitureDensity.toFixed(2)}</label>
          <input type="range" min={0} max={1} step={0.05} value={state.furnitureDensity} onChange={(e) => setState({ ...state, furnitureDensity: Number(e.target.value) })} />
        </div>
        <div className="section">
          {["pit", "falling_block", "spear", "chest_trap", "strictRules", "allowSecretDoors", "allowFalseDoors", "allowTeleportDoors"].map((key) => (
            <label className="check" key={key}>
              <input type="checkbox" checked={Boolean((state as Record<string, unknown>)[key])} onChange={(e) => setState({ ...state, [key]: e.target.checked })} />{key}
            </label>
          ))}
        </div>
        <div className="actions">
          <button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
          <button onClick={downloadJson} disabled={!map}>Export JSON</button>
        </div>
      </aside>
      <section className="grid">
        <svg width={26 * cell} height={19 * cell} style={{ background: "#f8fafc", borderRadius: 8 }}>
          {Array.from({ length: 27 }).map((_, i) => <line key={`v-${i}`} x1={i * cell} y1={0} x2={i * cell} y2={19 * cell} stroke="#d1d5db" strokeWidth={1} />)}
          {Array.from({ length: 20 }).map((_, i) => <line key={`h-${i}`} x1={0} y1={i * cell} x2={26 * cell} y2={i * cell} stroke="#d1d5db" strokeWidth={1} />)}
          {map?.entities.map((e) => {
            if (!("x" in e.placement.at)) return null;
            const x = e.placement.at.x * cell + cell / 2;
            const y = e.placement.at.y * cell + cell / 2;
            const color = e.kind === "monster" ? "#dc2626" : e.kind === "trap" ? "#f59e0b" : e.kind === "furniture" ? "#2563eb" : "#16a34a";
            return <circle key={e.id} cx={x} cy={y} r={8} fill={color}><title>{e.id}</title></circle>;
          })}
        </svg>
        <h3>Generated summary</h3>
        <pre>{map ? JSON.stringify(entitiesByKind, null, 2) : "Generate a map to see entities."}</pre>
      </section>
    </main>
  );
}
