export interface TrendPoint {
  date: string;
  trend: number;
}

export function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number } | null {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const { x, y } of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function computeTrendLine(
  entries: { date: string; weight: number }[]
): TrendPoint[] {
  if (entries.length < 2) return [];

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const baseTime = new Date(sorted[0].date).getTime();
  const msPerDay = 86400000;

  const points = sorted.map((e) => ({
    x: (new Date(e.date).getTime() - baseTime) / msPerDay,
    y: e.weight,
  }));

  const reg = linearRegression(points);
  if (!reg) return [];

  return sorted.map((e) => {
    const dayOffset = (new Date(e.date).getTime() - baseTime) / msPerDay;
    return {
      date: e.date,
      trend: Math.round((reg.slope * dayOffset + reg.intercept) * 10) / 10,
    };
  });
}
