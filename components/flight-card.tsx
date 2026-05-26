import { Star, Plane } from "lucide-react"
import type { Flight } from "@/lib/mock-data"
import { formatPrice } from "@/lib/mock-data"

interface FlightCardProps {
  flight: Flight
}

export function FlightCard({ flight }: FlightCardProps) {
  const AirlineLogo = () => {
    if (flight.airline.logo === "star") {
      return (
        <Star
          className="h-6 w-6"
          style={{ color: flight.airline.color }}
          fill={flight.airline.color}
        />
      )
    }
    return (
      <Plane
        className="h-6 w-6"
        style={{ color: flight.airline.color }}
      />
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* 항공사 정보 */}
        <div className="flex items-center gap-3 min-w-[100px]">
          <AirlineLogo />
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
