"use client"

import { formatPrice } from "@/lib/mock-data"

interface PriceHistoryPoint {
  date: string
  price: number
}

interface PriceTrendChartProps {
  data: PriceHistoryPoint[]
}

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  if (data.length === 0) return null

  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const chartWidth = 500
  const chartHeight = 200
  const padding = { top: 30, right: 80, bottom: 40, left: 50 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * graphWidth
    const y = padding.top + graphHeight - ((d.price - minPrice) / priceRange) * graphHeight
    return { x, y, ...d }
  })

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ")

  // Y-axis labels
  const yLabels = [100, 150, 200, 250]

  return (
    <div className="w-full rounded-lg bg-[#e8f4fc] p-4">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yLabels.map((label) => {
          const y = padding.top + graphHeight - ((label * 10000 - minPrice) / priceRange) * graphHeight
          return (
            <g key={label}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#d1e7f5"
                strokeWidth="1"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground text-sm">
                {label}
              </text>
            </g>
          )
        })}

        {/* Vertical grid lines and x-axis labels */}
        {points.map((p, i) => (
          <g key={p.date}>
            <line
              x1={p.x}
              y1={padding.top}
              x2={p.x}
              y2={padding.top + graphHeight}
              stroke="#d1e7f5"
              strokeWidth="1"
            />
            <text
              x={p.x}
              y={chartHeight - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-sm"
            >
              {p.date}
            </text>
          </g>
        ))}

        {/* Line path */}
        <path
          d={pathD}
          fill="none"
          stroke="#e53935"
          strokeWidth="2"
          strokeDasharray="6,4"
          strokeLinecap="round"
        />

        {/* Data points with labels */}
        {points.map((p, i) => (
          <g key={`${p.date}-point`}>
            <circle cx={p.x} cy={p.y} r="5" fill="#e53935" />
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-medium"
            >
              {formatPrice(p.price)}W
            </text>
          </g>
        ))}

        {/* Arrow at the end */}
        {points.length > 1 && (
          <polygon
            points={`${points[points.length - 1].x + 8},${points[points.length - 1].y - 4} ${points[points.length - 1].x + 8},${points[points.length - 1].y + 4} ${points[points.length - 1].x + 16},${points[points.length - 1].y}`}
            fill="#e53935"
          />
        )}
      </svg>
    </div>
  )
}
