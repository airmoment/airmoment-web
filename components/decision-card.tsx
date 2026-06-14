"use client"

import { Check, Clock, TrendingDown } from "lucide-react"
import type { ApiPredict, PriceForecast } from "@/lib/api"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DecisionCardProps {
  predict: ApiPredict
  forecast: PriceForecast | undefined
}

function formatKrw(v: number) {
  return `₩${v.toLocaleString("ko-KR")}`
}

/**
 * 예측 데이터에서 의사결정용 요약 값을 뽑아낸다.
 *
 * 절감액 표시 규칙 (decision과 항상 일관되도록):
 *  - BUY: 절감액은 "기다림"을 전제로 한 개념이라 BUY와 모순 → 항상 "-"
 *  - WAIT + 현재가 > 예측 중앙값(q50_best): 기다리면 평균적으로 절감 가능
 *    → maxSavings = current - q10_best (최선 시나리오 기준)
 *  - WAIT + 현재가 ≤ 예측 중앙값: 기다려도 더 떨어질 전망 없음 (드문 케이스)
 *    → "-"
 */
function summarizeForecast(
  forecast: PriceForecast | undefined,
  decision: "BUY" | "WAIT"
) {
  if (!forecast || forecast.predictions.length === 0) return null
  const current = forecast.currentPrice
  // 출발일 이후 예측은 의미 없으므로 제외.
  const futurePoints = forecast.predictions.filter(
    (p) => p.day > 0 && p.day <= forecast.daysUntilDeparture
  )
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

  // BUY는 절감액 의미가 없으므로 무조건 "-"
  if (decision === "BUY") {
    return { current, expectedLowRange, maxSavings: 0, noSavings: true }
  }

  // WAIT: 현재가가 예측 중앙값보다 높을 때만 절감액 표시
  const currentAboveMedian = current > lowestByMedian.q50
  if (!currentAboveMedian) {
    return { current, expectedLowRange, maxSavings: 0, noSavings: true }
  }
  const maxSavings = current - lowestByMedian.q10
  return { current, expectedLowRange, maxSavings, noSavings: false }
}

  
  export function DecisionCard({ predict, forecast }: DecisionCardProps) {
  const isBuy = predict.decision === "BUY"
  const summary = summarizeForecast(forecast, predict.decision)

  // 결정별 색 토큰 — 카드 좌측 보더, 메인 배지, 강조 텍스트 모두 이 색에 맞춤
  const accent = isBuy
    ? {
        borderLeft: "border-l-emerald-500",
        badgeBg: "bg-emerald-500",
        ringTint: "ring-emerald-100",
        text: "text-emerald-700",
        Icon: Check,
      }
    : {
        borderLeft: "border-l-amber-500",
        badgeBg: "bg-amber-500",
        ringTint: "ring-amber-100",
        text: "text-amber-700",
        Icon: Clock,
      }

  const { Icon } = accent

  return (
    <div
      className={`overflow-hidden rounded-xl border border-l-4 border-border bg-white shadow-sm ${accent.borderLeft}`}
    >
      <div className="p-6">
        {/* Header + Big Decision Badge */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">구매 추천</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              CatBoost 분류 + XGBoost 회귀 Decision Engine
            </p>
          </div>

          {/* 큰 배지 — 한눈에 BUY/WAIT 잡힘 */}
          <div
            className={`flex flex-shrink-0 items-center gap-3 rounded-2xl px-5 py-3 text-white shadow-md ring-4 ${accent.badgeBg} ${accent.ringTint}`}
          >
            <Icon className="h-6 w-6" strokeWidth={3} />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold tracking-wide">
                {isBuy ? "BUY" : "WAIT"}
              </span>
              <span className="text-sm font-medium text-white/90">
                {isBuy ? "지금 사세요" : "기다리세요"}
              </span>
            </div>
          </div>
        </div>

        {/* 한 줄 설명 */}
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
              value={formatKrw(summary.expectedLowRange.median)}
              hoverHint={`예상 범위 ${formatKrw(summary.expectedLowRange.low)} ~ ${formatKrw(summary.expectedLowRange.high)}`}
            />
            <Metric
              label="예상 최대 절감액"
              value={summary.noSavings ? "-" : formatKrw(summary.maxSavings)}
              sub={
                summary.noSavings
                  ? "현재가가 예측 최저 이하"
                  : undefined
              }
              icon={<TrendingDown className={`h-4 w-4 ${accent.text}`} />}
              accentClass={summary.noSavings ? undefined : accent.text}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
  icon,
  accentClass,
  hoverHint,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  accentClass?: string
  /** 값 위에 마우스를 올렸을 때 보일 추가 정보 (예: 범위, 보조 설명) */
  hoverHint?: string
}) {
  const valueClasses = `text-base font-semibold ${accentClass ?? "text-foreground"}`
  const valueNode = hoverHint ? (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            className={`${valueClasses} inline-block cursor-help underline decoration-muted-foreground/40 decoration-dotted underline-offset-[5px]`}
          >
            {value}
          </p>
        </TooltipTrigger>
        <TooltipContent side="bottom">{hoverHint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <p className={valueClasses}>{value}</p>
  )

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {valueNode}
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  )
}
