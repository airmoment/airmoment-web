"use client"

import { useState } from "react"
import { Bell, BellRing, Calendar, Heart } from "lucide-react"
import { PriceBandChart } from "@/components/price-band-chart"
import {
  addBookmark,
  removeBookmark,
  subscribeEmail,
  unsubscribeEmail,
  type MypageInterest,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface InterestCardProps {
  interest: MypageInterest
  /** 토글 후 마이페이지 데이터 재조회 트리거 (부모에서 다시 fetch) */
  onChanged?: () => void
}

export function InterestCard({ interest, onChanged }: InterestCardProps) {
  const { token } = useAuth()
  const route = `${interest.departureCode} → ${interest.arrivalCode}`
  const dateLabel = `${interest.departureAt} (${interest.departureDayOfWeek})`

  // 낙관적 업데이트를 위한 로컬 상태. 실패 시 원상복구.
  const [isBookmarked, setIsBookmarked] = useState(interest.isBookmarked)
  const [isEmailEnabled, setIsEmailEnabled] = useState(interest.isEmailNotificationEnabled)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  const interestBody = {
    departureCode: interest.departureCode,
    arrivalCode: interest.arrivalCode,
    departureAt: interest.departureAt,
    nonstopOnly: interest.nonStopOnly,
  }

  async function toggleBookmark() {
    if (!token || bookmarkLoading) return
    const next = !isBookmarked
    setBookmarkLoading(true)
    setIsBookmarked(next) // 낙관적 업데이트
    try {
      if (next) {
        await addBookmark(interestBody, token)
        toast({ title: "관심노선이 설정되었습니다." })
      } else {
        await removeBookmark(interest.interestId, token)
        toast({ title: "관심노선이 해제되었습니다." })
      }
      onChanged?.()
    } catch (err) {
      // 실패 시 원상복구
      setIsBookmarked(!next)
      const msg = (err as { message?: string })?.message || "요청에 실패했습니다."
      toast({ title: "관심노선 처리 실패", description: msg, variant: "destructive" })
    } finally {
      setBookmarkLoading(false)
    }
  }

  async function toggleEmail() {
    if (!token || emailLoading) return
    const next = !isEmailEnabled
    setEmailLoading(true)
    setIsEmailEnabled(next) // 낙관적 업데이트
    try {
      if (next) {
        await subscribeEmail(interestBody, token)
        toast({ title: "이메일 알림이 설정되었습니다." })
      } else {
        await unsubscribeEmail(interest.interestId, token)
        toast({ title: "이메일 알림이 해제되었습니다." })
      }
      onChanged?.()
    } catch (err) {
      setIsEmailEnabled(!next)
      const msg = (err as { message?: string })?.message || "요청에 실패했습니다."
      toast({ title: "알림 처리 실패", description: msg, variant: "destructive" })
    } finally {
      setEmailLoading(false)
    }
  }

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
                    isBookmarked
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              }
              label="관심노선"
              enabled={isBookmarked}
              loading={bookmarkLoading}
              onToggle={toggleBookmark}
            />
            <ToggleRow
              icon={
                isEmailEnabled ? (
                  <BellRing className="h-5 w-5 text-primary" />
                ) : (
                  <Bell className="h-5 w-5 text-muted-foreground" />
                )
              }
              label="최저가 알림"
              enabled={isEmailEnabled}
              loading={emailLoading}
              onToggle={toggleEmail}
            />
          </div>

          {interest.predictedAt && (
            <p className="pt-1 text-xs text-muted-foreground">
              마지막 예측: {new Date(interest.predictedAt).toLocaleString("ko-KR")}
            </p>
          )}
        </div>

        {/* 우측: 가격 밴드 차트 (predictions이 null인 경우 안내) */}
        <div>
          {interest.predictions && interest.predictions.length > 0 ? (
            <PriceBandChart predictions={interest.predictions} route={route} />
          ) : (
            <PredictionPlaceholder />
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  enabled,
  loading,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  enabled: boolean
  loading: boolean
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
        disabled={loading}
        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${
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

function PredictionPlaceholder() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">예측 데이터 준비 중</p>
        <p className="text-xs text-muted-foreground">
          해당 노선에 대한 가격 예측이 아직 수행되지 않았어요.
          <br />
          잠시 후 다시 확인해주세요.
        </p>
      </div>
    </div>
  )
}
