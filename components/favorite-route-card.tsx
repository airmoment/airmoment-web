"use client"

import { useState } from "react"
import { Calendar, User, Heart } from "lucide-react"
import { PriceTrendChart } from "./price-trend-chart"
import type { FavoriteRoute } from "@/lib/mock-data"

interface FavoriteRouteCardProps {
  route: FavoriteRoute
}

export function FavoriteRouteCard({ route }: FavoriteRouteCardProps) {
  const [isFavorite, setIsFavorite] = useState(route.isFavorite)
  const [alertEnabled, setAlertEnabled] = useState(route.alertEnabled)

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 좌측: 노선 정보 */}
        <div className="space-y-4">
          {/* 배지 및 태그 */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#4a6d87] px-2 py-0.5 text-xs font-medium text-white">
              ONE-WAY
            </span>
            <span className="text-sm text-primary">직항만 포함</span>
          </div>

          {/* 노선 */}
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold text-foreground">
              {route.departure} → {route.arrival}
            </h3>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="transition-transform hover:scale-110"
            >
              <Heart
                className={`h-7 w-7 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </button>
          </div>

          {/* 날짜 및 승객 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{route.date}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">성인 {route.passengers}명, {route.seatClass}</span>
            </div>
          </div>

          {/* 이메일 알림 토글 */}
          <div className="mt-6 space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              EMAIL ALERT
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">최저가 도달 알림</span>
              <button
                type="button"
                onClick={() => setAlertEnabled(!alertEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  alertEnabled ? "bg-[#4a6d87]" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    alertEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 우측: 가격 추이 차트 */}
        <div className="flex items-center justify-center">
          <PriceTrendChart data={route.priceHistory} />
        </div>
      </div>
    </div>
  )
}
