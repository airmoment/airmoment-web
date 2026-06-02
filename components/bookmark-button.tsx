"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { addBookmark, ApiError, removeBookmark, type InterestBody } from "@/lib/api"
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
  const [interestId, setInterestId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const isBookmarked = interestId !== null

  async function doToggle(currentToken: string) {
    setLoading(true)
    try {
      if (isBookmarked && interestId !== null) {
        await removeBookmark(interestId, currentToken)
        setInterestId(null)
        toast({ title: "관심노선이 해제되었습니다." })
      } else {
        const res = await addBookmark(route, currentToken)
        setInterestId(res.data.interestId)
        toast({ title: "관심노선이 설정되었습니다." })
      }
    } catch (err) {
      // 디버깅: 실제 에러를 콘솔에 항상 남긴다
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
    // 비로그인: 로그인 모달 띄우고, 로그인 성공 시 자동으로 토글 액션 실행
    if (!token) {
      requestLogin(() => {
        // 이 시점엔 context의 token이 갱신되어 있다.
        // 하지만 클로저로 잡힌 token은 아직 null이라, 직접 storage에서 읽지 않고
        // 다음 렌더에서 토글하도록 잠시 대기하는 게 안전한데, 간단한 처리 위해
        // localStorage에서 바로 꺼내 쓴다.
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
