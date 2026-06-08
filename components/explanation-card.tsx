"use client"

import { Sparkles } from "lucide-react"
import type { ApiPredict, PriceForecast } from "@/lib/api"

interface ExplanationCardProps {
  predict: ApiPredict
  forecast: PriceForecast | undefined
}

/**
 * TODO: 백엔드에서 SHAP + LLM으로 생성된 자연어 설명 필드가 추가되면
 *       이 함수를 통째로 제거하고 백엔드 응답을 그대로 표시한다.
 * 현재는 보유한 수치 데이터만으로 만든 룰베이스 임시 메시지.
 */
function buildPlaceholderReasons(
  predict: ApiPredict,
  forecast: PriceForecast | undefined
): string[] {
  const reasons: string[] = []
  if (!forecast || forecast.predictions.length === 0) {
    return [
      predict.decision === "BUY"
        ? "현재 시점이 구매에 적절하다고 모델이 판단했습니다."
        : "조금 더 기다리는 것이 유리하다고 모델이 판단했습니다.",
    ]
  }

  const current = forecast.currentPrice
  // 출발일 이후 예측은 의미 없으므로 제외.
  const futurePoints = forecast.predictions.filter(
    (p) => p.day > 0 && p.day <= forecast.daysUntilDeparture
  )
  if (futurePoints.length === 0) return reasons

  const minFutureMedian = Math.min(...futurePoints.map((p) => p.q50))
  const maxFutureMedian = Math.max(...futurePoints.map((p) => p.q50))
  const trendDown = minFutureMedian < current
  const trendUp = maxFutureMedian > current

  // 출발까지 남은 기간
  if (forecast.daysUntilDeparture <= 14) {
    reasons.push(
      `출발까지 ${forecast.daysUntilDeparture}일 남아 가격 상승 압력이 높아지고 있습니다.`
    )
  } else if (forecast.daysUntilDeparture >= 45) {
    reasons.push(
      `출발까지 ${forecast.daysUntilDeparture}일 남아 가격 하락 여지가 충분합니다.`
    )
  } else {
    reasons.push(`출발까지 ${forecast.daysUntilDeparture}일 남았습니다.`)
  }

  // 향후 추세
  if (trendDown && predict.decision === "WAIT") {
    const diff = current - minFutureMedian
    reasons.push(
      `2주 내 예상 중앙값 최저점이 현재가보다 ₩${diff.toLocaleString("ko-KR")} 낮습니다.`
    )
  } else if (trendUp && predict.decision === "BUY") {
    const diff = maxFutureMedian - current
    reasons.push(
      `2주 내 예상 중앙값 최고점이 현재가보다 ₩${diff.toLocaleString("ko-KR")} 높을 수 있습니다.`
    )
  } else if (predict.decision === "BUY") {
    reasons.push("향후 가격이 현재 수준 이하로 떨어질 확률이 낮습니다.")
  } else {
    reasons.push("최근 예측 가격 분포가 하락 방향을 가리키고 있습니다.")
  }

  // 마지막 한마디
  reasons.push(
    predict.decision === "BUY"
      ? "지금 구매하면 더 비싼 가격에 사는 위험을 피할 수 있습니다."
      : "조금만 기다리면 더 낮은 가격으로 살 가능성이 있습니다."
  )
  return reasons
}

export function ExplanationCard({ predict, forecast }: ExplanationCardProps) {
  const reasons = buildPlaceholderReasons(predict, forecast)

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI 판단 근거</h2>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            SHAP 기반 요인 추출 + LLM 자연어 설명
          </p>
        </div>
        <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground">
          LLM 연동 예정 · 룰베이스 임시
        </span>
      </div>

      <ul className="space-y-2.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex gap-2 text-sm leading-6 text-foreground">
            <span className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-muted-foreground">
        AI의 판단은 참고용입니다. 최종 구매 결정은 사용자가 직접 내려주세요.
      </p>
    </div>
  )
}
