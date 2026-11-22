export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  icon: string;
}

// Status colors (green/amber/red) sit below the strict CVD-separation floor for a
// free categorical palette, so every segment always carries an icon + text label
// here rather than relying on color alone to distinguish them.
export function DonutChart({ segments, size = 160 }: { segments: ChartSegment[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const strokeWidth = size * 0.18;
  const radius = size / 2 - strokeWidth / 2;
  const center = size / 2;

  let cumulative = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const pct = total === 0 ? 0 : (s.value / total) * 100;
      const dashArray = `${pct} ${100 - pct}`;
      const dashOffset = 100 - cumulative + 25;
      cumulative += pct;
      return { ...s, pct, dashArray, dashOffset };
    });

  return (
    <div className="row" style={{ alignItems: 'center', gap: 24 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}
      >
        {total === 0 ? (
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        ) : (
          arcs.map((a) => (
            <circle
              key={a.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={strokeWidth}
              strokeDasharray={a.dashArray}
              strokeDashoffset={a.dashOffset}
              pathLength={100}
              transform={`rotate(-90 ${center} ${center})`}
            >
              <title>
                {a.label}: {a.value} ({Math.round(a.pct)}%)
              </title>
            </circle>
          ))
        )}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.16} fill="var(--text-h)">
          {total}
        </text>
      </svg>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {segments.map((s) => (
          <li key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: 3,
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span>
              {s.icon} {s.label}: <strong>{s.value}</strong>
              {total > 0 && <span className="muted"> ({Math.round((s.value / total) * 100)}%)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({ bars }: { bars: ChartSegment[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div>
      {bars.map((b) => (
        <div key={b.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
            <span>
              {b.icon} {b.label}
            </span>
            <strong>{b.value}</strong>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
            <div
              title={`${b.label}: ${b.value}`}
              style={{
                width: `${(b.value / max) * 100}%`,
                height: '100%',
                background: b.color,
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
