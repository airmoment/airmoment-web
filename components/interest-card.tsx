"use client"

import { Bell, BellRing, Calendar, Heart } from "lucide-react"
import { PriceBandChart } from "@/components/price-band-chart"
import type { MypageInterest } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface InterestCardProps {
  interest: MypageInterest
}

export function InterestCard({ interest }: InterestCardProps) {
  const route = `${interest.departureCode} → ${interest.arrivalCode}`
  const dateLabel = `${interest.departureAt} (${interest.departureDayOfWeek})`

  // 마이페이지 응답엔 interestId가 없어서 해제 API를 직접 호출할 수 없다.
  // 토글 시도하면 안내 토스트만 띄운다. (백엔드가 interestId 추가하면 정상 동작 가능)
  const explainCannotToggle = () =>
    toast({
      title: "해제 기능 준비 중",
      description:
        "백엔드 응답에 interestId가 포함되면 여기서도 바로 해제 가능합니다. (관심노선/알림 추가는 검색 결과 페이지에서 동작합니다)",
    })

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* 좌측: 노선 정보 + 토글 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#4a6d87] px-2 py-0.5 text-xs font-medium text-white">
              ONE-WAY
            </span>
            {interest.nonStopOnly && (
              <span className="text-sm text-primary">직항만 포함</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold text-foreground">{route}</h3>
          </div>

          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{dateLabel}</span>
            </div>
          </div>

          {/* 토글 그룹 */}
          <div className="space-y-3 pt-2">
            <ToggleRow
              icon={
                <Heart
                  className={`h-5 w-5 ${
                    interest.isBookmarked
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              }
              label="관심노선"
              enabled={interest.isBookmarked}
              onToggle={explainCannotToggle}
            />
            <ToggleRow
              icon={
                interest.isEmailNotificationEnabled ? (
                  <BellRing className="h-5 w-5 text-primary" />
                ) : (
                  <Bell className="h-5 w-5 text-muted-foreground" />
                )
              }
              label="최저가 알림"
              enabled={interest.isEmailNotificationEnabled}
              onToggle={explainCannotToggle}
            />
          </div>

          <p className="pt-1 text-xs text-muted-foreground">
            마지막 예측: {new Date(interest.predictedAt).toLocaleString("ko-KR")}
          </p>
        </div>

        {/* 우측: 가격 밴드 차트 */}
        <div>
          <PriceBandChart
            predictions={interest.predictions}
            route={route}
            // 마이페이지 응답엔 daysUntilDeparture가 없음
          />
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-[#4a6d87]" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}
