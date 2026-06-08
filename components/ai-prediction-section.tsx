"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { PriceGauge } from "./price-gauge"
import { DonutChart } from "./donut-chart"
import type { PricePrediction, PredictionFactors, PriceDropPeriod } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"

interface AIPredictionSectionProps {
  prediction: PricePrediction
  factors: PredictionFactors
  dropPeriods: PriceDropPeriod[]
}

export function AIPredictionSection({
  prediction,
  factors,
  dropPeriods,
}: AIPredictionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [threshold, setThreshold] = useState(50)
  const [gainWeight, setGainWeight] = useState(50)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">가격 조정 가능성 예측 결과</h2>
        {/* 관심노선 토글은 상단 SearchSummaryBar에서 일괄 관리 (중복 제거) */}
      </div>

      {/* Main Prediction Card */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 좌측: 예측 상태 */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              과거 항공권 가격 추이로부터 예상한 결과는
            </p>
            <h3 className="text-2xl font-bold text-foreground">{prediction.message}</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm text-foreground">
                  가까운 시일 내에 가격이 오를 가능성이 높습니다
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-foreground">
                  적당한 시기이지만, 상황을 지켜보세요
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm text-foreground">
                  가까운 시일 내에 가격이 내릴 가능성이 높습니다
                </span>
              </div>
            </div>
          </div>

          {/* 중앙: 게이지 UI */}
          <div className="flex items-center justify-center">
            <PriceGauge score={prediction.score} />
          </div>

          {/* 우측: AI 예측 데이터 */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">AI 모델의 예측 데이터는</p>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-foreground">가격 하락 확률:</span>
                <span className="text-xl font-bold text-foreground">{prediction.dropProbability}%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-foreground">예상 절감 금액:</span>
                <span className="text-xl font-bold text-foreground">
                  최대 ₩{formatPrice(prediction.maxSavings)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-foreground">예측 최저가 범위:</span>
                <span className="text-xl font-bold text-foreground">
                  ₩{formatPrice(prediction.priceRange.min)} ~ ₩{formatPrice(prediction.priceRange.max)}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">현재 최저가 대비 최대 30% 저렴</p>
          </div>
        </div>
      </div>

      {/* Expandable AI 상세 예측 리포트 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mx-auto flex items-center gap-2 rounded-full bg-[#4a6d87] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3d5a6e]"
      >
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        AI 상세 예측 리포트 {isExpanded ? "접기" : "펼치기"}
      </button>

      {isExpanded && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 예측 근거 (XGBoost) */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">예측 근거 (XGBoost)</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>출발까지 남은 기간</span>
                    <span className="font-medium">+{factors.daysUntilDeparture}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${factors.daysUntilDeparture}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>최근 가격 변동</span>
                    <span className="font-medium">+{factors.recentPriceChange}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#4a6d87]"
                      style={{ width: `${factors.recentPriceChange}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {factors.explanation}
              </p>
            </div>

            {/* 가격 하락 예상 구간 */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">가격 하락 예상 구간</h4>
              <div className="flex items-center justify-center gap-4">
                {dropPeriods.map((period) => (
                  <div key={period.period} className="flex flex-col items-center gap-2">
                    <DonutChart
                      percentage={period.percentage}
                      size={80}
                      strokeWidth={8}
                      color={period.percentage >= 70 ? "#4a6d87" : period.percentage >= 30 ? "#eab308" : "#e5e7eb"}
                    />
                    <span className="text-sm text-muted-foreground">{period.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                7일 이내에 가격이 하락할 확률이 가장 높습니다.
                <br />
                대기하시는 것을 추천합니다.
              </p>
            </div>

            {/* 예측 기준 설정 */}
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">예측 기준 설정</h4>
                <p className="text-sm text-muted-foreground">
                  모델의 예측 기준을 직접 조정하여 다른 예측 결과 확인 가능
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-foreground">가격 하락 임계값(Threshold)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">0</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="flex-1 accent-[#4a6d87]"
                    />
                    <span className="text-sm text-muted-foreground">1</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>보수적</span>
                    <span>공격적</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground">기대 절감액(Expected Gain)가중치</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Low</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gainWeight}
                      onChange={(e) => setGainWeight(Number(e.target.value))}
                      className="flex-1 accent-[#4a6d87]"
                    />
                    <span className="text-sm text-muted-foreground">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
