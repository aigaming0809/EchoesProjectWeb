/**
 * ════════════════════════════════════════════════════════════════
 *  26 STAGE CAMPAIGN — Yu-Gi-Oh! Eternal Echoes
 * ════════════════════════════════════════════════════════════════
 */

export type Stage = {
  no: number;
  slug: string;
  name: string;
  act: string;
  accent: string;
};

export const TOTAL_STAGES = 26;

export const STAGES: Stage[] = [
  { no: 1,  slug: "simon-muran",    name: "Simon Muran",         act: "PROLOG", accent: "#7de2ff" },
  { no: 2,  slug: "heishin-1",      name: "Heishin (Kudeta)",    act: "PROLOG", accent: "#c15bff" },
  { no: 3,  slug: "villager-1",     name: "Villager 1",          act: "ACT I",  accent: "#9ee493" },
  { no: 4,  slug: "villager-2",     name: "Villager 2",          act: "ACT I",  accent: "#9ee493" },
  { no: 5,  slug: "villager-3",     name: "Villager 3",          act: "ACT I",  accent: "#9ee493" },
  { no: 6,  slug: "seto-1",         name: "Priest Seto 1st",     act: "ACT I",  accent: "#63f2ff" },
  { no: 7,  slug: "mage-soldier",   name: "Mage Soldier",        act: "ACT II", accent: "#8f7dff" },
  { no: 8,  slug: "jono-1",         name: "Jono",                act: "ACT II", accent: "#ffb347" },
  { no: 9,  slug: "teana-1",        name: "Teana",               act: "ACT II", accent: "#ff7de2" },
  { no: 10, slug: "ocean-mage",     name: "Ocean Mage",          act: "ACT III", accent: "#31d8ff" },
  { no: 11, slug: "secmeton",       name: "High Mage Secmeton",  act: "ACT III", accent: "#00b7ff" },
  { no: 12, slug: "forest-mage",    name: "Forest Mage",         act: "ACT III", accent: "#5cff9d" },
  { no: 13, slug: "anubisius",      name: "High Mage Anubisius", act: "ACT III", accent: "#22c55e" },
  { no: 14, slug: "mountain-mage",  name: "Mountain Mage",       act: "ACT III", accent: "#ffa64d" },
  { no: 15, slug: "atenza",         name: "High Mage Atenza",    act: "ACT III", accent: "#f97316" },
  { no: 16, slug: "desert-mage",    name: "Desert Mage",         act: "ACT III", accent: "#d9c27e" },
  { no: 17, slug: "martis",         name: "High Mage Martis",    act: "ACT III", accent: "#eab308" },
  { no: 18, slug: "meadow-mage",    name: "Meadow Mage",         act: "ACT III", accent: "#a3e635" },
  { no: 19, slug: "kepura",         name: "High Mage Kepura",    act: "ACT III", accent: "#84cc16" },
  { no: 20, slug: "labyrinth-mage", name: "Labyrinth Mage",      act: "ACT IV", accent: "#a855f7" },
  { no: 21, slug: "guardian-sebek", name: "Guardian Sebek",      act: "ACT IV", accent: "#38bdf8" },
  { no: 22, slug: "guardian-neku",  name: "Guardian Neku",       act: "ACT IV", accent: "#f472b6" },
  { no: 23, slug: "heishin-2",      name: "Heishin 2nd",         act: "ACT V",  accent: "#c15bff" },
  { no: 24, slug: "seto-3",         name: "Priest Seto 3rd",     act: "ACT V",  accent: "#63f2ff" },
  { no: 25, slug: "darknite",       name: "DarkNite",            act: "ACT VI", accent: "#ff2e63" },
  { no: 26, slug: "nitemare",       name: "Nitemare",            act: "ACT VI", accent: "#ff2e63" },
];

const stagesModule = { totalStages: TOTAL_STAGES, stages: STAGES };
export default stagesModule;
