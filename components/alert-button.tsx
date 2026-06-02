"use client"

import { useEffect, useState } from "react"
import { Bell, BellRing } from "lucide-react"
import {
  ApiError,
  getMypage,
  subscribeEmail,
  unsubscribeEmail,
  type InterestBody,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface AlertButtonProps {
  /** 현재 검색 조건. 이메일 알림 등록 시 그대로 백엔드로 보냄. */
  route: InterestBody
  /** 추가 className */
  className?: string
}

/**
 * 구매시기 알림받기 버튼.
 * BookmarkButton과 거의 동일한 구조 — POST/DELETE 엔드포인트만 다름.
 * - mypage 응답엔 interestId가 없어서, 이전 세션에서 등록된 것은 해제 불가
 *   (마이페이지에서 해제 안내). 백엔드가 interestId를 응답에 추가하면 해소됨.
 */
export function AlertButton({ route, className }: AlertButtonProps) {
  const { token, requestLogin } = useAuth()
  const [interestId, setInterestId] = useState<number | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  // 로그인 상태로 마운트되면 mypage 조회해서 현재 노선의 알림 설정 상태를 미리 가져온다.
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
        if (match?.isEmailNotificationEnabled) {
          setIsEnabled(true)
          setInterestId(match.interestId)
        }
      } catch (err) {
        console.warn("[AlertButton] mypage prefetch failed:", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, route.departureCode, route.arrivalCode, route.departureAt, route.nonstopOnly])

  async function doToggle(currentToken: string) {
    setLoading(true)
    console.log("[AlertButton] doToggle entry. isEnabled=", isEnabled, "interestId=", interestId)
    try {
      // 해제 시도
      if (isEnabled) {
        if (interestId === null) {
          toast({
            title: "이 세션에서 해제할 수 없습니다",
            description: "이전에 등록된 알림은 마이페이지에서 해제할 수 있습니다.",
          })
          return
        }
        await unsubscribeEmail(interestId, currentToken)
        setInterestId(null)
        setIsEnabled(false)
        toast({ title: "이메일 알림이 해제되었습니다." })
        return
      }

      // 등록 시도
      try {
        const res = await subscribeEmail(route, currentToken)
        setInterestId(res.data.interestId)
        setIsEnabled(true)
        toast({
          title: "이메일 알림이 설정되었습니다.",
          description: "가입 시 입력한 이메일로 최저가 도달 알림을 보내드려요.",
        })
      } catch (err) {
        const status = (err as { status?: number })?.status
        const message = (err as { message?: string })?.message ?? ""
        if (status === 400 && message.includes("이미")) {
          setIsEnabled(true)
          setInterestId(null)
          toast({
            title: "이미 알림이 설정되어 있습니다",
            description: "해제는 마이페이지에서 가능합니다.",
          })
          return
        }
        throw err
      }
    } catch (err) {
      console.error("[AlertButton] toggle failed:", err)
      let title = "알림 처리 실패"
      let description = "요청 중 오류가 발생했습니다."
      if (err instanceof ApiError) {
        title = `알림 처리 실패 (${err.status})`
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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        isEnabled
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-foreground hover:bg-muted/50"
      } ${className ?? ""}`}
    >
      {isEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      구매시기 알림받기
    </button>
  )
}
