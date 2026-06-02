"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import {
  addBookmark,
  ApiError,
  getMypage,
  removeBookmark,
  type InterestBody,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface BookmarkButtonProps {
  /** 현재 검색 조건. 관심노선 등록 시 그대로 백엔드로 보냄. */
  route: InterestBody
  /** 시각 스타일 변형. 기본은 pill(둥근 알약 버튼), compact는 작은 헤더형. */
  variant?: "pill" | "compact"
  /** 추가 className */
  className?: string
}

export function BookmarkButton({ route, variant = "pill", className }: BookmarkButtonProps) {
  const { token, requestLogin } = useAuth()
  /**
   * 북마크 상태.
   * - `interestId`가 number면: 이 세션에서 등록했거나 mypage에서 받아온 id가 있음 → 해제 가능
   * - `interestId`가 null이지만 `isBookmarked`가 true면: 이전 세션에서 등록했고 id를 모르는 상태 → 해제 불가, 마이페이지로 안내
   * - 둘 다 falsy면: 미등록
   */
  const [interestId, setInterestId] = useState<number | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  // 로그인 상태로 마운트되면 mypage 조회해서 현재 노선의 북마크 상태를 미리 가져온다.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await getMypage(token)
        if (cancelled) return
        const match = res.data.interests.find(
          (i) =>
            i.departureCode === route.departureCode &&
            i.arrivalCode === route.arrivalCode &&
            i.departureAt === route.departureAt &&
            i.nonStopOnly === route.nonstopOnly
        )
        if (match?.isBookmarked) {
          setIsBookmarked(true)
          // mypage 응답에 interestId가 빠져있어서 id는 알 수 없음
          setInterestId(null)
        }
      } catch (err) {
        // 초기 상태 조회 실패는 조용히 무시 (사용자 액션은 가능)
        console.warn("[BookmarkButton] mypage prefetch failed:", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, route.departureCode, route.arrivalCode, route.departureAt, route.nonstopOnly])

  async function doToggle(currentToken: string) {
    setLoading(true)
    try {
      // 해제 시도
      if (isBookmarked) {
        if (interestId === null) {
          toast({
            title: "이 세션에서 해제할 수 없습니다",
            description: "이전에 등록된 관심노선은 마이페이지에서 해제할 수 있습니다.",
          })
          return
        }
        await removeBookmark(interestId, currentToken)
        setInterestId(null)
        setIsBookmarked(false)
        toast({ title: "관심노선이 해제되었습니다." })
        return
      }

      // 등록 시도
      try {
        const res = await addBookmark(route, currentToken)
        setInterestId(res.data.interestId)
        setIsBookmarked(true)
        toast({ title: "관심노선이 설정되었습니다." })
      } catch (err) {
        // 이미 등록된 케이스를 우아하게 처리: UI는 등록 상태로 동기화 (id는 모름)
        if (
          err instanceof ApiError &&
          err.status === 400 &&
          err.message.includes("이미")
        ) {
          setIsBookmarked(true)
          setInterestId(null)
          toast({
            title: "이미 관심노선으로 등록되어 있습니다",
            description: "해제는 마이페이지에서 가능합니다.",
          })
          return
        }
        throw err
      }
    } catch (err) {
      console.error("[BookmarkButton] toggle failed:", err)
      let title = "관심노선 처리 실패"
      let description = "요청 중 오류가 발생했습니다."
      if (err instanceof ApiError) {
        title = `관심노선 처리 실패 (${err.status})`
        description = err.message || "응답 본문이 비어있습니다. 콘솔을 확인해주세요."
      } else if (err instanceof Error) {
        description = err.message || description
      }
      toast({ title, description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function handleClick() {
    if (loading) return
    if (!token) {
      requestLogin(() => {
        const fresh =
          typeof window !== "undefined"
            ? window.localStorage.getItem("airmoment.accessToken")
            : null
        if (fresh) void doToggle(fresh)
      })
      return
    }
    void doToggle(token)
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
          isBookmarked
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-primary hover:bg-primary/5"
        } ${className ?? ""}`}
      >
        <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
        관심노선
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        isBookmarked
          ? "border-primary bg-primary/10 text-primary"
          : "border-primary text-primary hover:bg-primary/5"
      } ${className ?? ""}`}
    >
      <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      관심노선
    </button>
  )
}
