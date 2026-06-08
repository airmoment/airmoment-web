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
// 80% 구간은 옅은 파랑(브랜드 컬러), 50% 구간은 연보라 — 비슷한 한기 톤이라
// 차분하면서도 색상 자체가 달라 색맹 사용자에게도 구분이 명확하다.
const PRIMARY_BAND_OUTER = "rgba(74, 109, 135, 0.12)" // 옅은 파랑
const PRIMARY_BAND_INNER = "rgba(167, 139, 250, 0.32)" // violet-400 (연보라)

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

/**
 * 차트 포인트에 마우스 올렸을 때 뜨는 툴팁.
 * 날짜를 헤더로, 중앙값을 강조해서, 보조 정보(범위)는 작게.
 * day=0 (현재)은 모든 분위수가 같으므로 "현재가" 한 줄로 단순화.
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number | [number, number] }>
  label?: number
}) {
  if (!active || !payload || payload.length === 0) return null

  const median = payload.find((p) => p.name === "중앙값 예측")?.value as
    | number
    | undefined
  const band50 = payload.find((p) => p.name === "50% 예측 구간")?.value as
    | [number, number]
    | undefined
  const band80 = payload.find((p) => p.name === "80% 예측 구간")?.value as
    | [number, number]
    | undefined

  const isNow = label === 0

  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm shadow-md">
      <div className="mb-1.5 text-sm font-semibold text-foreground">
        {label !== undefined ? formatTick(label) : ""}
      </div>

      {isNow ? (
        // 현재가 — 한 줄만
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground">현재가</span>
          <span className="text-sm font-semibold text-primary">
            {median !== undefined ? formatKrw(median) : "-"}
          </span>
        </div>
      ) : (
        <div className="space-y-1">
          {median !== undefined && (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">중앙값 예측</span>
              <span className="text-sm font-semibold text-primary">
                {formatKrw(median)}
              </span>
            </div>
          )}
          {band50 && (
            <div className="flex items-baseline justify-between gap-3 text-muted-foreground">
              <span>50% 범위</span>
              <span className="text-foreground">
                {formatKrw(band50[0])} ~ {formatKrw(band50[1])}
              </span>
            </div>
          )}
          {band80 && (
            <div className="flex items-baseline justify-between gap-3 text-muted-foreground">
              <span>80% 범위</span>
              <span className="text-foreground">
                {formatKrw(band80[0])} ~ {formatKrw(band80[1])}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PriceBandChart({
  predictions,
  decisionLabel,
  route,
  daysUntilDeparture,
}: PriceBandChartProps) {
  // 출발일 이후의 예측은 의미 없으므로 잘라낸다.
  // (백엔드는 항상 0/1/3/7/14일 5포인트를 보내지만, 출발까지 N일 남았으면
  //  day <= N 인 포인트만 유효함.)
  const validPredictions =
    daysUntilDeparture !== undefined
      ? predictions.filter((p) => p.day <= daysUntilDeparture)
      : predictions

  // 데이터가 너무 적으면 (예: 오늘 출발) 차트 대신 안내 카드 표시.
  if (validPredictions.length < 2) {
    return (
      <ShortHorizonNotice
        currentPrice={validPredictions[0]?.q50}
        daysUntilDeparture={daysUntilDeparture}
        route={route}
      />
    )
  }

  // recharts에 넣기 좋게 변형
  // 차트엔 q10/q90, q25/q75는 [low, high] 튜플 형태의 Area로 표시한다.
  const data = validPredictions.map((p) => ({
    day: p.day,
    q50: p.q50,
    band80: [p.q10, p.q90] as [number, number],
    band50: [p.q25, p.q75] as [number, number],
  }))

  const today = data.find((d) => d.day === 0)
  const currentPrice = today?.q50

  // Y축 범위 — 데이터의 실제 min/max 기반으로 위아래 15% 여유.
  // 0부터 시작하면 밴드가 납작해 보이므로 줌인.
  const allValues = validPredictions.flatMap((p) => [p.q10, p.q90, p.q50])
  const dataMin = Math.min(...allValues)
  const dataMax = Math.max(...allValues)
  const padding = Math.max((dataMax - dataMin) * 0.15, 10000)
  // 만원 단위로 깔끔하게 라운드
  const yMin = Math.floor((dataMin - padding) / 10000) * 10000
  const yMax = Math.ceil((dataMax + padding) / 10000) * 10000

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
          <span className="rounded-full border border-primary bg-primary/5 px-3 py-1 text-sm font-semibold text-primary">
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
              domain={[yMin, yMax]}
              tickFormatter={formatManTick}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />

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
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <Legend swatchClassName="bg-[#4a6d87]/15" label="80% 예측 구간 (q10–q90)" />
        <Legend swatchClassName="bg-violet-400/35" label="50% 예측 구간 (q25–q75)" />
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

/**
 * 출발이 임박해서 (오늘 또는 1일 이내) 유효한 예측 포인트가 부족할 때
 * 차트 대신 보여주는 안내. 가격이 있으면 현재가만 강조한다.
 */
function ShortHorizonNotice({
  currentPrice,
  daysUntilDeparture,
  route,
}: {
  currentPrice?: number
  daysUntilDeparture?: number
  route?: string
}) {
  const headline =
    daysUntilDeparture === 0
      ? "오늘 출발 — 가격 예측이 제공되지 않습니다"
      : "출발이 임박해 가격 예측 데이터가 제한적입니다"

  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
      <p className="text-sm font-medium text-foreground">{headline}</p>
      {currentPrice !== undefined && (
        <p className="mt-2 text-base">
          {route ? <span className="text-muted-foreground">{route} 현재가 · </span> : null}
          <span className="font-semibold text-primary">{formatKrw(currentPrice)}</span>
        </p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        남은 기간이 짧을수록 가격 변동 폭이 줄어들어 예측 의미가 작아집니다.
      </p>
    </div>
  )
}
