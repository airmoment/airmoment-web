"use client"

import { useState } from "react"
import { Star, Plane } from "lucide-react"
import type { Flight } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"

interface FlightCardProps {
  flight: Flight
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* 항공사 정보 */}
        <div className="flex min-w-[120px] items-center gap-3">
          <AirlineLogo flight={flight} />
          <span
            className="text-lg font-semibold"
            style={{ color: flight.airline.color }}
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

        {/* 소요 시간 */}
        <div className="flex items-center">
          <span className="text-foreground">{flight.duration}</span>
          <span className="ml-4 text-muted-foreground">- - - - - - -</span>
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
 *   1) photo URL이 있고 정상 로드 → <img>
 *   2) logo === "star" → 별 아이콘
 *   3) 그 외 → 비행기 아이콘
 * 이미지 로드 실패 시 자동으로 아이콘 폴백.
 */
function AirlineLogo({ flight }: { flight: Flight }) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasPhoto = Boolean(flight.airline.photo) && !imgFailed

  if (hasPhoto) {
    return (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted/30">
        <img
          src={flight.airline.photo}
          alt={flight.airline.name}
          className="h-9 w-9 object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  if (flight.airline.logo === "star") {
    return (
      <Star
        className="h-6 w-6 flex-shrink-0"
        style={{ color: flight.airline.color }}
        fill={flight.airline.color}
      />
    )
  }

  return (
    <Plane
      className="h-6 w-6 flex-shrink-0"
      style={{ color: flight.airline.color }}
    />
  )
}
