const BASE_URL = "http://15.165.123.108:8080"
const TOKEN_KEY = "airmoment.accessToken"
const USER_KEY = "airmoment.user"

// ─────────────────────────────────────────────
// 공통 응답 타입
// ─────────────────────────────────────────────

export interface ApiEnvelope<T = unknown> {
  status: number
  message: string
  data: T
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

/** 기본 fetch 타임아웃 (ms). 항공권 조회처럼 외부 API에 의존하는 호출은
 *  꽤 오래 걸릴 수 있어 넉넉히 15초로 두지만, 무한 대기는 막는다. */
const DEFAULT_TIMEOUT_MS = 15_000

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null,
  options: { timeoutMs?: number } = {}
): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  )

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        408,
        `요청 시간 초과 (${options.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms). 백엔드 응답이 지연되고 있어요.`
      )
    }
    throw err
  }
  clearTimeout(timeoutId)

  let body: ApiEnvelope<T> | null = null
  try {
    body = (await res.json()) as ApiEnvelope<T>
  } catch {
    // 본문이 비어있을 수 있음 (예: 일부 DELETE 응답)
  }

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? `API error: ${res.status}`)
  }
  return body as ApiEnvelope<T>
}

// ─────────────────────────────────────────────
// 1. 항공권 조회
// ─────────────────────────────────────────────

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
  departureTime: string
  arrivalTime: string
  duration: number
  price: number
}

export interface ApiPredict {
  decision: "BUY" | "WAIT"
}

export interface PricePredictionPoint {
  day: number
  q10: number
  q25: number
  q50: number
  q75: number
  q90: number
}

export interface PriceForecast {
  route: string
  daysUntilDeparture: number
  currentPrice: number
  predictions: PricePredictionPoint[]
  predictedAt: string
}

export interface ApiFlightData {
  predict: ApiPredict
  priceForecast?: PriceForecast
  totalCount: number
  flightList: ApiFlightItem[]
}

export async function searchFlights(
  params: FlightSearchParams,
  token: string
): Promise<ApiEnvelope<ApiFlightData>> {
  const qs = new URLSearchParams({
    departureCode: params.departureCode,
    arrivalCode: params.arrivalCode,
    departureAt: params.departureAt,
  })
  if (params.sort) qs.set("sort", params.sort)
  if (params.nonstopOnly !== undefined) qs.set("nonstopOnly", String(params.nonstopOnly))
  if (params.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice))

  return request<ApiFlightData>(`/api/v1/flights?${qs.toString()}`, { method: "GET" }, token)
}

// ─────────────────────────────────────────────
// 2. 회원가입
// ─────────────────────────────────────────────

export interface SignupBody {
  email: string
  password: string
  name: string
}

export async function signup(body: SignupBody): Promise<ApiEnvelope<null>> {
  return request<null>("/api/v1/members/signup", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// ─────────────────────────────────────────────
// 3. 로그인
// ─────────────────────────────────────────────

export interface LoginBody {
  email: string
  password: string
}

export interface LoginData {
  accessToken: string
  refreshToken: string
}

export async function login(body: LoginBody): Promise<ApiEnvelope<LoginData>> {
  return request<LoginData>("/api/v1/members/login", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// ─────────────────────────────────────────────
// 4. 관심 노선 설정
// ─────────────────────────────────────────────

export interface InterestBody {
  departureCode: string
  arrivalCode: string
  departureAt: string
  nonstopOnly: boolean
}

export interface BookmarkData {
  interestId: number
}

export async function addBookmark(
  body: InterestBody,
  token: string
): Promise<ApiEnvelope<BookmarkData>> {
  return request<BookmarkData>(
    "/api/v1/interests/bookmark",
    { method: "POST", body: JSON.stringify(body) },
    token
  )
}

// ─────────────────────────────────────────────
// 5. 관심 노선 해제
// ─────────────────────────────────────────────

export async function removeBookmark(
  interestId: number,
  token: string
): Promise<ApiEnvelope<null>> {
  return request<null>(
    `/api/v1/interests/${interestId}`,
    { method: "DELETE" },
    token
  )
}

// ─────────────────────────────────────────────
// 6. 이메일 수신 설정
// ─────────────────────────────────────────────

export async function subscribeEmail(
  body: InterestBody,
  token: string
): Promise<ApiEnvelope<BookmarkData>> {
  return request<BookmarkData>(
    "/api/v1/interests/email-notification",
    { method: "POST", body: JSON.stringify(body) },
    token
  )
}

// ─────────────────────────────────────────────
// 7. 이메일 수신 해제
// ─────────────────────────────────────────────

export async function unsubscribeEmail(
  interestId: number,
  token: string
): Promise<ApiEnvelope<null>> {
  return request<null>(
    `/api/v1/interests/email-notification/${interestId}`,
    { method: "DELETE" },
    token
  )
}

// ─────────────────────────────────────────────
// 8. 마이페이지 조회
// ─────────────────────────────────────────────

export interface MypageInterest {
  interestId: number
  departureCode: string
  arrivalCode: string
  departureAt: string
  departureDayOfWeek: string
  nonStopOnly: boolean
  isBookmarked: boolean
  isEmailNotificationEnabled: boolean
  /** 예측이 아직 수행되지 않은 경우 null. UI에서 차트 대신 안내문/스켈레톤 표시. */
  predictions: PricePredictionPoint[] | null
  predictedAt: string | null
}

export interface MypageData {
  interests: MypageInterest[]
}

export async function getMypage(token: string): Promise<ApiEnvelope<MypageData>> {
  return request<MypageData>("/api/v1/mypage", { method: "GET" }, token)
}

// ─────────────────────────────────────────────
// 토큰 관리 (브라우저 전용)
// ─────────────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export interface StoredUser {
  email: string
  name?: string
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// ─────────────────────────────────────────────
// 표시용 포맷 유틸 (UI에서 사용)
// ─────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export { ApiError }
