const BASE_URL = "http://15.165.123.108:8080"

export interface FlightSearchParams {
  departureCode: string
  arrivalCode: string
  departureAt: string
  sort?: string
  nonstopOnly?: boolean
  maxPrice?: number
}

export interface ApiFlightItem {
  airlineName: string
  airlinePhoto: string
  departureTime: string  // "HH:MM:SS"
  arrivalTime: string    // "HH:MM:SS"
  duration: number       // minutes
  price: number
}

export interface ApiPredict {
  decision: "BUY" | "WAIT"
}

export interface ApiFlightData {
  predict: ApiPredict
  totalCount: number
  flightList: ApiFlightItem[]
}

export interface ApiResponse {
  status: number
  message: string
  data: ApiFlightData
}

export async function searchFlights(
  params: FlightSearchParams,
  token: string
): Promise<ApiResponse> {
  const url = new URL(`${BASE_URL}/api/v1/flights`)
  url.searchParams.set("departureCode", params.departureCode)
  url.searchParams.set("arrivalCode", params.arrivalCode)
  url.searchParams.set("departureAt", params.departureAt)
  if (params.sort) url.searchParams.set("sort", params.sort)
  if (params.nonstopOnly !== undefined)
    url.searchParams.set("nonstopOnly", String(params.nonstopOnly))
  if (params.maxPrice !== undefined)
    url.searchParams.set("maxPrice", String(params.maxPrice))

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}
