"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { PricePredictionPoint } from "@/lib/api"

interface PriceBandChartProps {
  predictions: PricePredictionPoint[]
  /** 차트 우측 상단에 표시할 라벨 (예: "지금 사세요!" / "기다리세요!") */
  decisionLabel?: string
  /** 차트 상단 메타 정보 */
  route?: string
  /** 출발까지 남은 일수 */
  daysUntilDeparture?: number
}

const PRIMARY = "#4a6d87"
const PRIMARY_BAND_OUTER = "rgba(74, 109, 135, 0.12)"
const PRIMARY_BAND_INNER = "rgba(74, 109, 135, 0.25)"

function formatTick(day: number) {
  if (day === 0) return "현재(지금)"
  return `+${day}일`
}

function formatKrw(v: number) {
  return `₩${v.toLocaleString("ko-KR")}`
}

function formatManTick(v: number) {
  return `${Math.round(v / 10000)}만`
}

export function PriceBandChart({
  predictions,
  decisionLabel,
  route,
  daysUntilDeparture,
}: PriceBandChartProps) {
  // recharts에 넣기 좋게 변형
  // 차트엔 q10/q90, q25/q75는 [low, high] 튜플 형태의 Area로 표시한다.
  const data = predictions.map((p) => ({
    day: p.day,
    q50: p.q50,
    band80: [p.q10, p.q90] as [number, number],
    band50: [p.q25, p.q75] as [number, number],
  }))

  const today = data.find((d) => d.day === 0)
  const currentPrice = today?.q50

  return (
    <div className="w-full">
      {/* 상단 메타 */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {route && <span className="font-medium text-foreground">{route}</span>}
          {route && daysUntilDeparture !== undefined && <span className="opacity-50">|</span>}
          {daysUntilDeparture !== undefined && <span>출발까지 {daysUntilDeparture}일</span>}
          <span className="opacity-50">|</span>
          <span>예측 방법: Split Conformal</span>
        </div>
        {decisionLabel && (
          <span className="rounded-full border border-primary bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            {decisionLabel}
          </span>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={formatTick}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatManTick}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value: number | [number, number], name: string) => {
                if (Array.isArray(value)) {
                  return [`${formatKrw(value[0])} ~ ${formatKrw(value[1])}`, name]
                }
                return [formatKrw(value as number), name]
              }}
              labelFormatter={(label: number) => formatTick(label)}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />

            {/* 80% 구간 (q10~q90) */}
            <Area
              type="monotone"
              dataKey="band80"
              name="80% 예측 구간"
              fill={PRIMARY_BAND_OUTER}
              stroke="transparent"
              activeDot={false}
              isAnimationActive={false}
            />
            {/* 50% 구간 (q25~q75) */}
            <Area
              type="monotone"
              dataKey="band50"
              name="50% 예측 구간"
              fill={PRIMARY_BAND_INNER}
              stroke="transparent"
              activeDot={false}
              isAnimationActive={false}
            />

            {/* 중앙값 라인 */}
            <Line
              type="monotone"
              dataKey="q50"
              name="중앙값 예측"
              stroke={PRIMARY}
              strokeWidth={2.5}
              dot={{ r: 4, stroke: PRIMARY, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />

            {/* 현재가 기준선 */}
            {currentPrice !== undefined && (
              <ReferenceLine
                y={currentPrice}
                stroke="#9ca3af"
                strokeDasharray="4 4"
              />
            )}
            {/* 현재가 점 */}
            {currentPrice !== undefined && (
              <ReferenceDot x={0} y={currentPrice} r={6} fill={PRIMARY} stroke="#fff" strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <Legend swatchClassName="bg-[#4a6d87]/12" label="80% 예측 구간 (q10–q90)" />
        <Legend swatchClassName="bg-[#4a6d87]/25" label="50% 예측 구간 (q25–q75)" />
        <Legend dot label="중앙값 예측 (q50)" />
        {currentPrice !== undefined && (
          <Legend solidDot label={`현재가 ${formatKrw(currentPrice)}`} />
        )}
      </div>
    </div>
  )
}

function Legend({
  swatchClassName,
  dot,
  solidDot,
  label,
}: {
  swatchClassName?: string
  dot?: boolean
  solidDot?: boolean
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatchClassName && (
        <span className={`inline-block h-3 w-4 rounded-sm ${swatchClassName}`} />
      )}
      {dot && (
        <span className="inline-flex h-3 w-3 items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[#4a6d87] bg-white" />
        </span>
      )}
      {solidDot && <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4a6d87]" />}
      <span>{label}</span>
    </span>
  )
}
