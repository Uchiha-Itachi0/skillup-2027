import type { Metadata } from "next";
import DsaBoard from "@/components/DsaBoard";
import { dsa, groupProgress, isLearned, problemState, resolveStates, todayIST, TOTAL_PROBLEMS } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "DSA · Skill-up 2027" };

export default function DsaPage() {
  const today = todayIST();
  const progress = groupProgress(today);
  const groups = dsa.groups.map((g) => ({ ...progress[g.name], phase: g.phase }));
  const rows = [...dsa.log].reverse().map((p) => ({
    ...p,
    resolves: resolveStates(p, today).map((r) => ({ key: r.key, due: r.due, state: r.state })),
    state: problemState(p.name, today),
  }));
  const solved = dsa.log.length;
  const learned = dsa.log.filter(isLearned).length;

  return (
    <>
      <h1>NeetCode 150, one square at a time.</h1>
      <p className="lede">
        {solved} of {TOTAL_PROBLEMS} solved, {learned} learned. A problem counts as learned once its day-21 re-solve
        passes in under 25 minutes, with no AI.
      </p>
      <DsaBoard groups={groups} rows={rows} />
    </>
  );
}
