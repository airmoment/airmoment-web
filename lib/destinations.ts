/**
 * 검색 도착지 목록. 메인 검색바와 검색 결과 페이지의 검색 조건 바에서 공유.
 * 새 도착지 추가하려면 여기에 한 줄 추가하면 양쪽 UI에 자동 반영.
 */

export interface Destination {
  city: string
  country: string
  /** IATA 공항 코드 */
  code: string
  /** 드롭다운에서 보조로 보여주는 정식 공항명 */
  airport: string
}

export const DESTINATIONS: Destination[] = [
  { city: "파리", country: "프랑스", code: "CDG", airport: "샤를 드골 국제공항" },
  { city: "뉴욕", country: "미국", code: "JFK", airport: "존 F. 케네디 국제공항" },
  { city: "시드니", country: "호주", code: "SYD", airport: "킹스포드 스미스 공항" },
]

export function findDestinationByCode(code: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.code === code)
}

// ─────────────────────────────────────────────
// 날짜 포맷 유틸 (검색바에서 공유)
// ─────────────────────────────────────────────

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

/** Date → "YYYY-MM-DD" (URL 쿼리·API 요청용) */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Date → "6.10.수" (사용자 표시용) */
export function formatDateDisplay(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}.${WEEKDAYS[date.getDay()]}`
}

/** "YYYY-MM-DD" → Date (또는 null) */
export function parseISODate(s: string | null | undefined): Date | null {
  if (!s) return null
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const [, y, mo, d] = m
  const date = new Date(Number(y), Number(mo) - 1, Number(d))
  return Number.isNaN(date.getTime()) ? null : date
}
