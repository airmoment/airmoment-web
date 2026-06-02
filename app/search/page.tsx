import { SearchSummaryBar } from "@/components/search-summary-bar"
import { AIPredictionSection } from "@/components/ai-prediction-section"
import { FlightList } from "@/components/flight-list"
import {
  mockSearchParams,
  mockPricePrediction,
  mockPredictionFactors,
  mockPriceDropPeriods,
  mockFlights,
  totalResults as mockTotalResults,
  type Flight,
  type PricePrediction,
  type SearchParams,
} from "@/lib/mock-data"
import {
  searchFlights,
  formatDuration,
  formatTime,
  type ApiFlightItem,
} from "@/lib/api"

function mapApiItemToFlight(
  item: ApiFlightItem,
  index: number,
  departureCode: string,
  arrivalCode: string
): Flight {
  return {
    id: String(index),
    airline: {
      name: item.airlineName,
      code: item.airlineName,
      logo: "plane",
      color: "#4D85AA",
      photo: item.airlinePhoto || undefined,
    },
    departure: {
      time: formatTime(item.departureTime),
      airport: departureCode,
      code: departureCode,
    },
    arrival: {
      time: formatTime(item.arrivalTime),
      airport: arrivalCode,
      code: arrivalCode,
    },
    date: "",
    duration: formatDuration(item.duration),
    price: item.price,
    tripType: "편도",
  }
}

function decisionToPrediction(decision: "BUY" | "WAIT"): PricePrediction {
  if (decision === "BUY") {
    return {
      ...mockPricePrediction,
      status: "buy",
      message: "지금 구매하세요!",
      score: 75,
      dropProbability: 22,
    }
  }
  return {
    ...mockPricePrediction,
    status: "wait",
    message: "기다리세요!",
    score: 35,
    dropProbability: 78,
  }
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const departureCode = params.departureCode ?? "ICN"
  const arrivalCode = params.arrivalCode ?? "SYD"
  const departureAt = params.departureAt ?? "2026-06-10"
  const nonstopOnly = params.nonstopOnly === "true"
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const sort = params.sort

  const token = process.env.API_TOKEN ?? ""

  let flights: Flight[] = mockFlights
  let totalResults = mockTotalResults
  let prediction: PricePrediction = mockPricePrediction

  try {
    const result = await searchFlights(
      { departureCode, arrivalCode, departureAt, nonstopOnly, maxPrice, sort },
      token
    )
    flights = result.data.flightList.map((item, i) =>
      mapApiItemToFlight(item, i, departureCode, arrivalCode)
    )
    totalResults = result.data.totalCount
    prediction = decisionToPrediction(result.data.predict.decision)
  } catch {
    // API 실패 시 mock 데이터 사용
  }

  const route = { departureCode, arrivalCode, departureAt, nonstopOnly }

  const displaySearchParams: SearchParams = {
    departure: {
      city: departureCode,
      country: "",
      code: departureCode,
    },
    arrival: {
      city: arrivalCode,
      country: "",
      code: arrivalCode,
    },
    passengers: 1,
    date: departureAt,
    seatClass: "일반석",
    tripType: "편도",
    directOnly: nonstopOnly,
  }

  return (
    <main className="min-h-screen bg-background pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <SearchSummaryBar searchParams={displaySearchParams} route={route} />

        <div className="mt-6">
          <AIPredictionSection
            prediction={prediction}
            factors={mockPredictionFactors}
            dropPeriods={mockPriceDropPeriods}
          />
        </div>

        <div className="mt-6">
          <FlightList flights={flights} totalResults={totalResults} />
        </div>
      </div>
    </main>
  )
}
