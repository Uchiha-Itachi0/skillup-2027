// Deterministic date formatting. Node and browsers ship different locale data
// ("Sept" vs "Sep"), which breaks hydration, so dates are formatted by hand.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Style = "dm" | "dmy" | "my" | "m" | "MY" | "wdm" | "WDMY";

/** d is YYYY-MM-DD. dm: 9 Oct · dmy: 9 Oct 2026 · my: Oct 2026 · m: Oct · MY: October 2026 · wdm: Fri 9 Oct · WDMY: Friday 9 October 2026 */
export function fd(d: string, style: Style = "dm"): string {
  const [y, m, day] = d.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
  switch (style) {
    case "dm": return `${day} ${MONTHS[m - 1]}`;
    case "dmy": return `${day} ${MONTHS[m - 1]} ${y}`;
    case "my": return `${MONTHS[m - 1]} ${y}`;
    case "m": return MONTHS[m - 1];
    case "MY": return `${MONTHS_LONG[m - 1]} ${y}`;
    case "wdm": return `${DAYS[dow]} ${day} ${MONTHS[m - 1]}`;
    case "WDMY": return `${DAYS_LONG[dow]} ${day} ${MONTHS_LONG[m - 1]} ${y}`;
  }
}
