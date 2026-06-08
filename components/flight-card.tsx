"use client"

import { useState } from "react"
import { Plane } from "lucide-react"
import type { Flight } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"
import { getAirlineColor, getAirlineLogoUrl } from "@/lib/airline-logos"

interface FlightCardProps {
  flight: Flight
}

export function FlightCard({ flight }: FlightCardProps) {
  const airlineColor = getAirlineColor(flight.airline.name)

  return (
    <div className="rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md">
      {/*
        모바일(기본): flex-wrap 으로 자연스럽게 줄바꿈.
        sm+ 부터는 grid 4컬럼 — 항공사명 길이와 무관하게 컬럼 정렬이 흐트러지지 않음.
        [항공사 180px] [시간 1fr] [소요시간 auto] [가격/배지 auto]
      */}
      <div className="flex flex-wrap items-center gap-4 sm:grid sm:grid-cols-[180px_1fr_auto_auto] sm:gap-6">
        {/* 항공사 — 고정 폭, 긴 이름은 truncate */}
        <div className="flex min-w-0 items-center gap-3">
          <AirlineLogo flight={flight} />
          <span
            className="truncate text-base font-semibold"
            style={{ color: airlineColor }}
            title={flight.airline.name}
          >
            {flight.airline.name}
          </span>
        </div>

        {/* 출발/도착 시간 */}
        <div className="flex min-w-0 items-center gap-2 text-foreground">
          <span className="whitespace-nowrap text-lg font-medium">
            {flight.departure.time} {flight.departure.code}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="whitespace-nowrap text-lg font-medium">
            {flight.arrival.time} {flight.arrival.code}
          </span>
          {flight.date && (
            <span className="ml-2 whitespace-nowrap text-sm text-muted-foreground">
              {flight.date}
            </span>
          )}
        </div>

        {/* 소요 시간 — 폰트 일관되게, 점선 제거 */}
        <div className="whitespace-nowrap text-foreground">
          {flight.duration}
        </div>

        {/* 가격 + 직항/경유 배지 */}
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
          <span className="whitespace-nowrap text-xl font-bold text-red-500">
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
