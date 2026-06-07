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
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* 항공사 정보 */}
        <div className="flex min-w-[140px] items-center gap-3">
          <AirlineLogo flight={flight} />
          <span
            className="text-base font-semibold"
            style={{ color: airlineColor }}
          >
            {flight.airline.name}
          </span>
        </div>

        {/* 출발/도착 시간 */}
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-lg font-medium">
            {flight.departure.time} {flight.departure.code}({flight.departure.airport})
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-lg font-medium">
            {flight.arrival.time} {flight.arrival.code}({flight.arrival.airport})
          </span>
          <span className="ml-2 text-sm text-muted-foreground">{flight.date}</span>
        </div>

        {/* 소요 시간 + 직항 배지 */}
        <div className="flex items-center gap-2">
          <span className="text-foreground">{flight.duration}</span>
          {flight.isDirect && (
            <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
              직항
            </span>
          )}
          <span className="ml-2 text-muted-foreground">- - - - - - -</span>
        </div>

        {/* 가격 */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{flight.tripType}</span>
          <span className="text-xl font-bold text-red-500">
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
