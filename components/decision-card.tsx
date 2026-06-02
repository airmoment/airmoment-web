"use client"

import { Check, Clock, TrendingDown } from "lucide-react"
import type { ApiPredict, PriceForecast } from "@/lib/api"

interface DecisionCardProps {
  predict: ApiPredict
  forecast: PriceForecast | undefined
}

function formatKrw(v: number) {
  return `₩${v.toLocaleString("ko-KR")}`
}

/**
 * 예측 데이터에서 의사결정용 요약 값을 뽑아낸다.
 * - 현재가: predictions[day=0].q50  또는 forecast.currentPrice
 * - 예상 최저가 도달일: 미래 예측들 중 q50이 가장 낮은 day
 * - 예상 최저가 범위: 그 날의 q10 ~ q90
 * - 예상 절감액: 현재가 - q10 (최선의 시나리오)
 */
function summarizeForecast(forecast: PriceForecast | undefined) {
  if (!forecast || forecast.predictions.length === 0) return null
  const current = forecast.currentPrice
  const futurePoints = forecast.predictions.filter((p) => p.day > 0)
  if (futurePoints.length === 0) return null

  const lowestByMedian = futurePoints.reduce((acc, p) =>
    p.q50 < acc.q50 ? p : acc
  )
  const expectedLowRange = {
    low: lowestByMedian.q10,
    median: lowestByMedian.q50,
    high: lowestByMedian.q90,
    day: lowestByMedian.day,
  }
  const maxSavings = Math.max(0, current - lowestByMedian.q10)

  return { current, expectedLowRange, maxSavings }
}

export function DecisionCard({ predict, forecast }: DecisionCardProps) {
  const isBuy = predict.decision === "BUY"
  const summary = summarizeForecast(forecast)

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">구매 추천</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            CatBoost 분류 + XGBoost 회귀 Decision Engine
          </p>
        </div>
        {/* BUY/WAIT 배지 */}
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            isBuy
              ? "bg-primary text-white"
              : "border border-primary text-primary"
          }`}
        >
          {isBuy ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          <span>{isBuy ? "지금 사세요" : "기다리세요"}</span>
        </div>
      </div>

      {/* 메시지 */}
      <p className="text-base text-foreground">
        {isBuy
          ? "현재 가격이 예상 최저가 범위 근처입니다. 지금 구매하는 것을 권장합니다."
          : "향후 가격이 더 내려갈 가능성이 있어요. 잠시 기다리는 것을 권장합니다."}
      </p>

      {/* 수치 정보 */}
      {summary && (
        <div className="mt-5 grid gap-3 rounded-lg bg-muted/30 p-4 sm:grid-cols-3">
          <Metric label="현재가" value={formatKrw(summary.current)} />
          <Metric
            label={`예상 최저가 (${summary.expectedLowRange.day}일 후)`}
            value={`${formatKrw(summary.expectedLowRange.low)} ~ ${formatKrw(summary.expectedLowRange.high)}`}
            sub={`중앙값 ${formatKrw(summary.expectedLowRange.median)}`}
          />
          <Metric
            label="예상 최대 절감액"
            value={formatKrw(summary.maxSavings)}
            icon={<TrendingDown className="h-4 w-4 text-primary" />}
            highlight
          />
        </div>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-base font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
