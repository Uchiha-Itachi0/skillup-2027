import { activityByDay, addDays, fmt, profile, weekStart } from "@/lib/data";

/** One square per day from the first week to the goal date. Darker = more done that day. */
export default function Heatmap({ today }: { today: string }) {
  const counts = activityByDay();
  const first = weekStart(profile.start);
  const last = profile.goalDate;
  const days: string[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
  const weeks = Math.ceil(days.length / 7);

  const months: { col: number; label: string }[] = [];
  let lastMonth = "";
  for (let w = 0; w < weeks; w++) {
    const d = days[w * 7];
    const m = d.slice(0, 7);
    if (m !== lastMonth) {
      months.push({ col: w, label: fmt(d, { month: "short" }) });
      lastMonth = m;
    }
  }

  return (
    <div className="heat-scroll">
      <div className="heat-months" style={{ gridTemplateColumns: `repeat(${weeks}, 12px)` }}>
        {Array.from({ length: weeks }, (_, w) => (
          <span key={w}>{months.find((x) => x.col === w)?.label ?? ""}</span>
        ))}
      </div>
      <div className="heat" role="img" aria-label="Learning days from October 2026 to December 2027">
        {days.map((d) => {
          const n = counts.get(d) ?? 0;
          const cls = [
            d > today ? "future" : n >= 4 ? "on3" : n >= 2 ? "on2" : n >= 1 ? "on1" : "",
            d === today ? "today" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const before = d < profile.start;
          return (
            <span
              key={d}
              className={cls}
              style={before ? { visibility: "hidden" } : undefined}
              title={`${fmt(d, { day: "numeric", month: "short", year: "numeric" })}: ${n ? `${n} thing${n > 1 ? "s" : ""} done` : d > today ? "ahead" : "nothing logged"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
