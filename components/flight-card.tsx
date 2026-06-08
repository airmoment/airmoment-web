"use client"

import { useState } from "react"
import { Plane } from "lucide-react"
import type { Flight } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"
import { getAirlineColor, getAirlineLogoUrl } from "@/lib/airline-logos"

interface FlightCardProps {
  flight: Flight
}

/**
 * 출발 시각에 비행시간을 더했을 때 며칠을 넘어가는지 계산.
 * - 같은 날 도착 → 0
 * - 다음 날 도착 → 1
 * - 그 이후 → 2+
 * durationMinutes가 없으면 단순 문자열 비교로 폴백.
 */
function computeDayOffset(
  depTime: string,
  arrTime: string,
  durationMinutes?: number
): number {
  if (durationMinutes !== undefined) {
    const [dh, dm] = depTime.split(":").map(Number)
    const depMin = dh * 60 + dm
    const arrAbsolute = depMin + durationMinutes
    return Math.floor(arrAbsolute / 1440)
  }
  return arrTime < depTime ? 1 : 0
}

export function FlightCard({ flight }: FlightCardProps) {
  const airlineColor = getAirlineColor(flight.airline.name)
  const dayOffset = computeDayOffset(
    flight.departure.time,
    flight.arrival.time,
    flight.durationMinutes
  )

  return (
    <div className="rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md">
      {/*
        모바일(기본): flex-wrap.
        sm+ 부터는 grid 3컬럼:
        [항공사 180px] [시간 ↔ 소요시간 ↔ 시간 (1fr)] [가격/배지 auto]
        가운데가 시간-소요시간-시간 묶음이라 빈 공간 없이 균형 잡힘.
      */}
      <div className="flex flex-wrap items-center gap-4 sm:grid sm:grid-cols-[180px_1fr_auto] sm:gap-6">
        {/* 항공사 — 고정 폭, 긴 이름은 truncate */}
        <div className="flex min-w-0 items-center gap-3">
          <AirlineLogo flight={flight} />
          <span
            className="truncate text-lg font-semibold"
            style={{ color: airlineColor }}
            title={flight.airline.name}
          >
            {flight.airline.name}
          </span>
        </div>

        {/* 시간 묶음 — 내부에 고정폭 sub-grid [출발 | 소요 | 도착] 둬서
            모든 카드에서 동일한 X 좌표에 정렬되도록 */}
        <div className="flex min-w-0 items-center justify-center">
          <div className="grid grid-cols-[100px_130px_100px] items-center gap-3">
            {/* 출발 — 우측 정렬 (소요시간 쪽으로 붙음) */}
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="whitespace-nowrap text-xl font-semibold tabular-nums text-foreground">
                {flight.departure.time}
              </span>
              <span className="text-sm text-muted-foreground">
                {flight.departure.code}
              </span>
            </div>

            {/* 소요시간 + 화살표 — 가운데, 숫자 폭 통일로 카드 간 정렬 */}
            <div className="flex flex-col items-center text-sm text-muted-foreground">
              <span className="whitespace-nowrap tabular-nums">
                {flight.duration}
              </span>
              <div className="mt-0.5 flex w-full items-center">
                <div className="h-px flex-1 bg-border" />
                <span className="px-1 text-xs">→</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            {/* 도착 — 좌측 정렬 (+ 다음날 위첨자) */}
            <div className="flex items-baseline justify-start gap-1.5">
              <span className="whitespace-nowrap text-xl font-semibold tabular-nums text-foreground">
                {flight.arrival.time}
                {dayOffset > 0 && (
                  <sup
                    className="ml-0.5 text-xs font-medium text-primary"
                    title={`도착 ${dayOffset}일 후`}
                  >
                    +{dayOffset}
                  </sup>
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {flight.arrival.code}
              </span>
            </div>
          </div>
        </div>

        {/* 가격 + 직항/경유 배지 — 우측 */}
        <div className="flex items-center justify-end gap-2">
          {flight.isDirect === true && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-sm font-semibold text-white">
              직항
            </span>
          )}
          {flight.isDirect === false && (
            <span
              className="text-sm text-muted-foreground"
              title="비행시간이 길어 경유로 추정됩니다"
            >
              경유
            </span>
          )}
          <span className="whitespace-nowrap text-xl font-bold tabular-nums text-red-500">
            ₩{formatPrice(flight.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * 항공사 로고. 우선순위:
 *   1) 매핑 테이블 → Daisycon CDN (IATA 코드 기반)
 *   2) 백엔드의 airlinePhoto
 *   3) 비행기 아이콘 (color 적용)
 * 이미지 로드 실패하면 다음 단계로 자동 폴백.
 */
function AirlineLogo({ flight }: { flight: Flight }) {
  const [primaryFailed, setPrimaryFailed] = useState(false)
  const [secondaryFailed, setSecondaryFailed] = useState(false)

  const mappedUrl = getAirlineLogoUrl(flight.airline.name)
  const fallbackUrl = flight.airline.photo

  const urlToShow = !primaryFailed
    ? mappedUrl
    : !secondaryFailed
      ? fallbackUrl
      : undefined

  const isPrimary = !primaryFailed && Boolean(mappedUrl)

  if (urlToShow) {
    return (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted/30">
        <img
          src={urlToShow}
          alt={flight.airline.name}
          className="h-9 w-9 object-contain"
          onError={() => {
            if (isPrimary) setPrimaryFailed(true)
            else setSecondaryFailed(true)
          }}
        />
      </div>
    )
  }

  // 최종 폴백: 컬러 적용된 비행기 아이콘
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${getAirlineColor(flight.airline.name)}15` }}
    >
      <Plane
        className="h-5 w-5"
        style={{ color: getAirlineColor(flight.airline.name) }}
      />
    </div>
  )
}
