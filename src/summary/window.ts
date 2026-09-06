export const MAX_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface TimeWindow {
  since: Date;
  until: Date;
}

export function resolveWindow(now: Date, lastSuccessAt: Date | null): TimeWindow {
  const until = now;
  if (lastSuccessAt === null || lastSuccessAt.getTime() >= now.getTime()) {
    return { since: new Date(now.getTime() - MAX_WINDOW_MS), until };
  }

  const elapsed = now.getTime() - lastSuccessAt.getTime();
  const windowMs = Math.min(elapsed, MAX_WINDOW_MS);
  return { since: new Date(now.getTime() - windowMs), until };
}

export function formatWindowLabel(window: TimeWindow): string {
  const ms = window.until.getTime() - window.since.getTime();
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) {
    return `過去 ${minutes} 分鐘`;
  }
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  const hoursText = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `過去 ${hoursText} 小時`;
}
