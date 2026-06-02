"use client"

import { TrendingUp } from "lucide-react"
import { PriceBandChart } from "@/components/price-band-chart"
import type { PriceForecast } from "@/lib/api"

interface ForecastChartCardProps {
  forecast: PriceForecast | undefined
}

export function ForecastChartCard({ forecast }: ForecastChartCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">가격 추이 예측</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            LightGBM + Split Conformal Prediction — 분위수 구간 그래프
          </p>
        </div>
      </div>

      {forecast ? (
        <>
          <PriceBandChart
            predictions={forecast.predictions}
            route={forecast.route}
            daysUntilDeparture={forecast.daysUntilDeparture}
          />
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            • 단일 예측값이 아닌 구간으로 제공되어 예측의 <strong>불확실성</strong>까지 함께 전달합니다.
            <br />
            • 밴드 폭이 넓을수록 가격 변동 가능성이 크고, 좁을수록 안정적인 예측입니다.
            <br />
            • 중앙값 라인의 방향으로 향후 가격이 오를지(↑) 내릴지(↓)를 직관적으로 확인하세요.
          </p>
        </>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
          가격 예측 데이터가 없습니다.
        </div>
      )}
    </div>
  )
}
