"use client"

import { useState, useMemo } from "react"

interface DataPoint {
  label: string
  value: number
  confidence: number
  color: string
  price: number
}

interface SovereignChartProps {
  data: DataPoint[]
}

/**
 * Zero-dependency native SVG bar+line chart.
 * Replaces recharts entirely -- no external libs.
 */
export function SovereignChart({ data }: SovereignChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const PADDING = { top: 24, right: 64, bottom: 48, left: 80 }
  const W = 700
  const H = 320

  const chartW = W - PADDING.left - PADDING.right
  const chartH = H - PADDING.top - PADDING.bottom

  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value)) * 1.15, [data])
  const barW = chartW / data.length
  const innerBarW = barW * 0.55

  // Confidence Y scale (90-100)
  const confMin = 90
  const confMax = 100
  const confRange = confMax - confMin

  const barX = (i: number) => PADDING.left + i * barW + (barW - innerBarW) / 2
  const barH = (v: number) => (v / maxVal) * chartH
  const barY = (v: number) => PADDING.top + chartH - barH(v)
  const confY = (c: number) => PADDING.top + chartH - ((c - confMin) / confRange) * chartH

  // Confidence line path
  const linePath = useMemo(() => {
    return data
      .map((d, i) => {
        const x = PADDING.left + i * barW + barW / 2
        const y = confY(d.confidence)
        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Y-axis ticks for FDV
  const yTicks = useMemo(() => {
    const step = maxVal / 5
    return Array.from({ length: 6 }, (_, i) => i * step)
  }, [maxVal])

  // Right Y-axis ticks for confidence
  const confTicks = [90, 92, 94, 96, 98, 100]

  const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        role="img"
        aria-label="Sovereign Anchor Analytics: bar chart showing target FDV and confidence line for each token"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={`grid-${tick}`}
            x1={PADDING.left}
            y1={PADDING.top + chartH - (tick / maxVal) * chartH}
            x2={W - PADDING.right}
            y2={PADDING.top + chartH - (tick / maxVal) * chartH}
            stroke="hsl(220 14% 16%)"
            strokeDasharray="3 3"
          />
        ))}

        {/* Y-axis labels (FDV) */}
        {yTicks.map((tick) => (
          <text
            key={`ylabel-${tick}`}
            x={PADDING.left - 8}
            y={PADDING.top + chartH - (tick / maxVal) * chartH + 3}
            textAnchor="end"
            fill="hsl(220 10% 55%)"
            fontSize="8"
            fontFamily="monospace"
          >
            ${tick.toFixed(1)}B
          </text>
        ))}

        {/* Right Y-axis labels (confidence) */}
        {confTicks.map((tick) => (
          <text
            key={`conf-${tick}`}
            x={W - PADDING.right + 8}
            y={confY(tick) + 3}
            textAnchor="start"
            fill="hsl(160 45% 40%)"
            fontSize="8"
            fontFamily="monospace"
          >
            {tick}%
          </text>
        ))}

        {/* Y axis label */}
        <text
          x={14}
          y={PADDING.top + chartH / 2}
          textAnchor="middle"
          fill="hsl(220 10% 55%)"
          fontSize="7"
          fontFamily="monospace"
          transform={`rotate(-90 14 ${PADDING.top + chartH / 2})`}
          style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}
        >
          TARGET FDV (BILLIONS USD)
        </text>

        {/* Bars */}
        {data.map((d, i) => (
          <g
            key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-crosshair"
          >
            {/* Hover highlight */}
            {hovered === i && (
              <rect
                x={PADDING.left + i * barW}
                y={PADDING.top}
                width={barW}
                height={chartH}
                fill="hsla(43, 72%, 52%, 0.04)"
              />
            )}
            {/* Bar */}
            <rect
              x={barX(i)}
              y={barY(d.value)}
              width={innerBarW}
              height={barH(d.value)}
              fill={d.color}
              fillOpacity={hovered === i ? 0.6 : 0.35}
              stroke={d.color}
              strokeWidth={1}
            />
            {/* X label */}
            <text
              x={PADDING.left + i * barW + barW / 2}
              y={H - PADDING.bottom + 16}
              textAnchor="middle"
              fill="hsl(220 10% 55%)"
              fontSize="8"
              fontFamily="monospace"
            >
              {d.label}
            </text>
          </g>
        ))}

        {/* Confidence line */}
        <path
          d={linePath}
          fill="none"
          stroke="hsl(160 45% 40%)"
          strokeWidth={1.5}
        />
        {/* Confidence dots */}
        {data.map((d, i) => (
          <circle
            key={`dot-${d.label}`}
            cx={PADDING.left + i * barW + barW / 2}
            cy={confY(d.confidence)}
            r={hovered === i ? 5 : 3}
            fill="hsl(160 45% 40%)"
          />
        ))}

        {/* Axes */}
        <line
          x1={PADDING.left}
          y1={PADDING.top + chartH}
          x2={W - PADDING.right}
          y2={PADDING.top + chartH}
          stroke="hsl(220 14% 16%)"
        />
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + chartH}
          stroke="hsl(220 14% 16%)"
        />
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="absolute pointer-events-none bg-background border border-border p-3 z-10"
          style={{
            left: `${((PADDING.left + hovered * barW + barW / 2) / W) * 100}%`,
            top: `${((barY(data[hovered].value) - 8) / H) * 100}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-[10px] font-mono font-bold text-foreground">
            {data[hovered].label} @ ${fmt.format(data[hovered].price)}/token
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
            FDV: ${data[hovered].value.toFixed(3)}B
          </p>
          <p className="text-[9px] font-mono text-accent mt-0.5">
            Confidence: {data[hovered].confidence}%
          </p>
        </div>
      )}
    </div>
  )
}
