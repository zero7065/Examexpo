// First-run tour persistence.
export const TOUR_KEY = "exampadi_tour_seen";

export function tourSeen() {
  try { return !!localStorage.getItem(TOUR_KEY); } catch { return true; }
}

export function markTourSeen() {
  try { localStorage.setItem(TOUR_KEY, "1"); } catch { /* private mode */ }
}
