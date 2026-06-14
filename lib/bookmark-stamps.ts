/**
 * 관심노선/알림 등록 시각을 브라우저에 저장하기 위한 유틸.
 *
 * 왜 필요한가:
 *   백엔드의 interestId가 단순 자동증가가 아니라 노선 기준으로 재사용/재발급되는
 *   경우가 있어, "큰 id = 최근 등록" 가정이 깨진다. 정확한 등록 시각을 알려면
 *   백엔드에 createdAt 필드 추가가 정공법이지만, 추가 전엔 프론트에서 직접
 *   타임스탬프를 보관해 마이페이지에서 최신순 정렬에 사용한다.
 *
 * 한계: 같은 브라우저에서 등록한 노선만 정확하다. 다른 기기/세션에서 등록한
 *      노선은 stamp가 없으므로 fallback(interestId DESC)으로 정렬된다.
 */

const STORAGE_KEY = "airmoment.bookmarkStamps"

export interface RouteKey {
  departureCode: string
  arrivalCode: string
  departureAt: string
  /** API에서 nonstopOnly(camelCase)와 nonStopOnly(camel+S) 두 가지 표기 모두 들어오므로
   *  여기서는 boolean으로 받아 키 생성 시 통일된 문자열로 변환한다. */
  nonstopOnly: boolean
}

function makeKey(route: RouteKey): string {
  return `${route.departureCode}-${route.arrivalCode}-${route.departureAt}-${route.nonstopOnly}`
}

function readAll(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeAll(stamps: Record<string, number>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps))
  } catch {
    // localStorage 쿼터 초과 등 — 무시
  }
}

/** 노선의 등록 시각을 현재 시각으로 기록 (재등록 시 덮어쓰기) */
export function markBookmarked(route: RouteKey): void {
  const stamps = readAll()
  stamps[makeKey(route)] = Date.now()
  writeAll(stamps)
}

/** 노선의 등록 시각을 반환 (없으면 undefined) */
export function getBookmarkStamp(route: RouteKey): number | undefined {
  return readAll()[makeKey(route)]
}

/** 모든 stamp를 한 번에 읽기 — 마이페이지 정렬용 */
export function getAllBookmarkStamps(): Record<string, number> {
  return readAll()
}

/** 노선 키를 stamps에서 조회하기 위한 헬퍼 (key 생성 일치) */
export function routeKeyOf(route: RouteKey): string {
  return makeKey(route)
}
