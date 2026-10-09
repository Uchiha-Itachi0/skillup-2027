import profile from "@/data/profile.json";
import plan from "@/data/plan.json";
import dsa from "@/data/dsa.json";
import ai from "@/data/ai.json";
import log from "@/data/log.json";
import journal from "@/data/journal.json";

export { profile, plan, dsa, ai, log, journal };

type Group = { name: string; phase: number; count?: number; problems?: { name: string; url: string }[] };
const GROUPS = dsa.groups as Group[];

export type TrackId = "dsa" | "systems" | "ai";
export type StopStatus = "done" | "current" | "next";
export type ResolveKey = "d1" | "d3" | "d7" | "d21";
export type ResolveResult = "pass" | "fail" | null;

export const RESOLVE_OFFSETS: Record<ResolveKey, number> = { d1: 1, d3: 3, d7: 7, d21: 21 };
export const RESOLVE_KEYS: ResolveKey[] = ["d1", "d3", "d7", "d21"];

export const TRACK_LABEL: Record<string, string> = {
  dsa: "DSA",
  systems: "Databases & system design",
  ai: "AI engineering",
  plan: "Plan",
};

const DAY = 86_400_000;

/** Today's date in India, as YYYY-MM-DD. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function toTime(d: string): number {
  return Date.parse(d + "T00:00:00Z");
}

export function addDays(d: string, n: number): string {
  return new Date(toTime(d) + n * DAY).toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toTime(b) - toTime(a)) / DAY);
}

export function fmt(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return new Date(toTime(d)).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

/** Monday of the week containing d. */
export function weekStart(d: string): string {
  const dow = new Date(toTime(d)).getUTCDay(); // 0 = Sunday
  return addDays(d, -((dow + 6) % 7));
}

export type LoggedProblem = (typeof dsa.log)[number];

export type ResolveState = {
  key: ResolveKey;
  due: string;
  result: ResolveResult;
  state: "passed" | "failed" | "due" | "overdue" | "upcoming";
};

export function resolveStates(p: LoggedProblem, today: string): ResolveState[] {
  return RESOLVE_KEYS.map((key) => {
    const due = addDays(p.solved, RESOLVE_OFFSETS[key]);
    const result = (p.resolves as Record<string, ResolveResult>)[key] ?? null;
    let state: ResolveState["state"];
    if (result === "pass") state = "passed";
    else if (result === "fail") state = "failed";
    else if (due === today) state = "due";
    else if (due < today) state = "overdue";
    else state = "upcoming";
    return { key, due, result, state };
  });
}

export function isLearned(p: LoggedProblem): boolean {
  return (p.resolves as Record<string, ResolveResult>).d21 === "pass";
}

/** Everything due today or overdue, oldest first. */
export function dueResolves(today: string) {
  const out: { problem: LoggedProblem; r: ResolveState }[] = [];
  for (const p of dsa.log) {
    for (const r of resolveStates(p, today)) {
      if (r.state === "due" || r.state === "overdue") out.push({ problem: p, r });
    }
  }
  return out.sort((a, b) => a.r.due.localeCompare(b.r.due));
}

/** Next unsolved problems in NeetCode order. */
export function nextProblems(n: number) {
  const solved = new Set(dsa.log.map((p) => p.name));
  const out: { name: string; url: string; group: string }[] = [];
  for (const g of GROUPS) {
    for (const p of g.problems ?? []) {
      if (!solved.has(p.name)) out.push({ ...p, group: g.name });
      if (out.length >= n) return out;
    }
  }
  return out;
}

export const TOTAL_PROBLEMS = GROUPS.reduce((s, g) => s + (g.problems?.length ?? g.count ?? 0), 0);

export function weekScore(today: string) {
  const from = weekStart(today);
  const to = addDays(from, 6);
  const inWeek = (d: string) => d >= from && d <= to;
  const weekLog = log.filter((e) => inWeek(e.date));
  const learningDays = new Set(weekLog.map((e) => e.date)).size;
  const newProblems = dsa.log.filter((p) => inWeek(p.solved)).length;
  let resolvesDue = 0;
  let resolvesPassed = 0;
  for (const p of dsa.log) {
    for (const r of resolveStates(p, today)) {
      if (inWeek(r.due) && r.due <= today) {
        resolvesDue++;
        if (r.result === "pass") resolvesPassed++;
      }
    }
  }
  const theory = weekLog.filter((e) => e.kind === "theory").length;
  const posts = weekLog.filter((e) => e.kind === "post").length;
  return { from, to, learningDays, newProblems, resolvesDue, resolvesPassed, theory, posts };
}

/** Consecutive learning days ending today (or yesterday, if today has nothing yet). */
export function streak(today: string): number {
  const days = new Set(log.map((e) => e.date));
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function currentPhase(today: string) {
  return plan.phases.find((p) => today >= p.start && today <= p.end) ?? plan.phases[plan.phases.length - 1];
}

export function activityByDay(): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of log) m.set(e.date, (m.get(e.date) ?? 0) + 1);
  return m;
}
