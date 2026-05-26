"use client"

import { Bell } from "lucide-react"
import { PriceGauge } from "./price-gauge"
import type { PricePrediction, DailyPrice } from "@/lib/mock-data"
import { formatPriceShort } from "@/lib/mock-data"
import { useState } from "react"

interface PricePredictionSectionProps {
  prediction: PricePrediction
  dailyPrices: DailyPrice[]
}

export function PricePredictionSection({
  prediction,
  dailyPrices,
}: PricePredictionSectionProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState(2) // 기본값: 6월 11일 (최저가)

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          가격 조정 가능성 예측 결과
        </h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
        >
          <Bell className="h-4 w-4" />
          구매시기 알림받기
        </button>
      </div>

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

        {/* 우측: 일자별 최저가 비교 */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">더 합리적인 선택을 돕는</p>
          <h3 className="text-lg font-semibold text-foreground">일자별 최저가 비교</h3>

          <div className="flex gap-2">
            {dailyPrices.map((day, index) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDateIndex(index)}
                className={`flex-1 rounded-lg border-2 px-3 py-3 text-center transition-all ${
                  selectedDateIndex === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${day.isLowest ? "ring-2 ring-primary/20" : ""}`}
              >
                <p className="text-sm font-medium text-foreground">{day.displayDate}</p>
                <p
                  className={`mt-1 text-lg font-bold ${
                    day.isLowest ? "text-primary" : "text-foreground"
                  }`}
                >
                  {formatPriceShort(day.price)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
