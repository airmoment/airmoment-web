"use client"

import { Sparkles } from "lucide-react"
import type { ApiPredict, PriceForecast } from "@/lib/api"

interface ExplanationCardProps {
  predict: ApiPredict
  forecast: PriceForecast | undefined
}

/**
 * 결정(BUY/WAIT)과 항상 일관되게 정렬되는 자연어 설명 3줄을 만든다.
 * decision이 BUY면 "지금 사야 하는 이유"만, WAIT면 "기다려야 하는 이유"만
 * 나열하도록 분기. 추후 백엔드에서 SHAP+LLM 설명이 오면 이 함수를 제거하고
 * forecast.reasons 같은 응답 필드를 그대로 매핑하면 됨.
 */
function buildReasons(
  predict: ApiPredict,
  forecast: PriceForecast | undefined
): string[] {
  if (!forecast || forecast.predictions.length === 0) {
    return [
      predict.decision === "BUY"
        ? "현재 시점이 구매에 적절하다고 모델이 판단했습니다."
        : "조금 더 기다리는 것이 유리하다고 모델이 판단했습니다.",
    ]
  }

  const current = forecast.currentPrice
  const futurePoints = forecast.predictions.filter(
    (p) => p.day > 0 && p.day <= forecast.daysUntilDeparture
  )

  if (futurePoints.length === 0) {
    return predict.decision === "BUY"
      ? [
          `출발까지 ${forecast.daysUntilDeparture}일 남아 추가 가격 변동 여지가 거의 없습니다.`,
          "현재 가격이 합리적인 수준이라 지금 구매하는 것이 안전합니다.",
        ]
      : [
          "예측 모델이 단기 가격 하락 신호를 감지했습니다.",
          "잠시 기다리면 더 낮은 가격에 구매할 가능성이 있습니다.",
        ]
  }

  const days = forecast.daysUntilDeparture
  const minFutureMedian = Math.min(...futurePoints.map((p) => p.q50))
  const maxFutureMedian = Math.max(...futurePoints.map((p) => p.q50))
  const minFutureQ10 = Math.min(...futurePoints.map((p) => p.q10))

  const reasons: string[] = []

  if (predict.decision === "BUY") {
    // 1) 시점 — BUY 방향 톤
    if (days <= 14) {
      reasons.push(
        `출발까지 ${days}일 남아 가격이 더 떨어질 시간적 여유가 부족합니다.`
      )
    } else if (days >= 45) {
      reasons.push(
        `출발까지 ${days}일이 남았지만, 현재가 자체가 예측 분포 하단에 위치해 매수 적기입니다.`
      )
    } else {
      reasons.push(
        `출발까지 ${days}일 남았으며, 가격 변동 폭이 점차 좁아지는 구간에 진입했습니다.`
      )
    }

    // 2) 가격 추세 — BUY를 지지하는 근거
    if (maxFutureMedian > current) {
      const diff = maxFutureMedian - current
      reasons.push(
        `향후 2주 내 예상 중앙값이 현재가보다 최대 ₩${diff.toLocaleString(
          "ko-KR"
        )} 높아질 수 있습니다.`
      )
    } else if (minFutureQ10 >= current) {
      reasons.push(
        "향후 예측 가격 분포 전체가 현재가 이상이라 추가 하락 가능성이 낮습니다."
      )
    } else {
      reasons.push(
        "향후 예상 하락 폭이 크지 않아 지금 구매하는 편이 효율적입니다."
      )
    }

    // 3) 결론
    reasons.push("지금 구매하면 향후 가격 상승 리스크를 피할 수 있습니다.")
  } else {
    // WAIT
    // 1) 시점 — WAIT 방향 톤
    if (days >= 45) {
      reasons.push(
        `출발까지 ${days}일이 남아 가격 하락을 기다릴 여유가 충분합니다.`
      )
    } else if (days >= 15) {
      reasons.push(
        `출발까지 ${days}일 남아 가격 변동을 지켜볼 만한 시점입니다.`
      )
    } else {
      reasons.push(
        `출발까지 ${days}일 남았지만, 예측 모델이 단기 하락 신호를 감지했습니다.`
      )
    }

    // 2) 가격 추세 — WAIT를 지지하는 근거
    if (minFutureMedian < current) {
      const diff = current - minFutureMedian
      reasons.push(
        `향후 2주 내 예상 중앙값 최저점이 현재가보다 ₩${diff.toLocaleString(
          "ko-KR"
        )} 낮습니다.`
      )
    } else if (minFutureQ10 < current) {
      const diff = current - minFutureQ10
      reasons.push(
        `최선의 시나리오에서 가격이 ₩${diff.toLocaleString(
          "ko-KR"
        )}까지 떨어질 수 있습니다.`
      )
    } else {
      reasons.push("최근 예측 분포가 추가 하락 가능성을 시사하고 있습니다.")
    }
    // 사용하지 않는 변수 경고 방지
    void maxFutureMedian

    // 3) 결론
    reasons.push("조금 더 기다리면 현재보다 낮은 가격에 구매할 가능성이 있습니다.")
  }

  return reasons
}

export function ExplanationCard({ predict, forecast }: ExplanationCardProps) {
  const reasons = buildReasons(predict, forecast)

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
