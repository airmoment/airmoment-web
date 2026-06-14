"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ApiError, getMypage, type MypageInterest } from "@/lib/api"
import { InterestCard } from "@/components/interest-card"
import { Button } from "@/components/ui/button"

export default function MyPage() {
  const { token, isHydrated, openLoginModal } = useAuth()
  const [interests, setInterests] = useState<MypageInterest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // 토글 동작 등으로 강제 재조회가 필요할 때 증가시키면 useEffect가 다시 동작.
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      setInterests(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await getMypage(token)
        if (cancelled) return
        // 가장 최근 등록한 노선이 위에 오도록 interestId 내림차순 정렬.
        // (interestId는 자동 증가 PK라 큰 값이 더 최근 등록임을 가정)
        const sorted = [...(res.data.interests ?? [])].sort(
          (a, b) => b.interestId - a.interestId
        )
        setInterests(sorted)
      } catch (err) {
        if (cancelled) return
        const msg =
          err instanceof ApiError ? err.message : "마이페이지를 불러오지 못했습니다."
        setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, isHydrated, refreshTick])

  return (
    <main className="min-h-screen bg-background pt-14">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-6 w-6 text-[#4a6d87]" />
            <h1 className="text-xl font-semibold text-foreground">
              내 관심 노선 및 가격 추이
            </h1>
          </div>
          {interests && (
            <span className="text-sm text-muted-foreground">
              총 {interests.length}개의 저장된 노선
            </span>
          )}
        </div>

        {/* 상태별 렌더 */}
        {!isHydrated ? (
          <EmptyState message="불러오는 중..." />
        ) : !token ? (
          <NotLoggedInState onLogin={openLoginModal} />
        ) : loading ? (
          <EmptyState message="마이페이지를 불러오는 중..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : !interests || interests.length === 0 ? (
          <EmptyInterestsState />
        ) : (
          <div className="space-y-6">
            {interests.map((interest) => (
              <InterestCard
                key={interest.interestId}
                interest={interest}
                onChanged={() => setRefreshTick((t) => t + 1)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-muted-foreground">
      {message}
    </div>
  )
}

function NotLoggedInState({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
      <p className="text-foreground">로그인이 필요한 페이지입니다.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        관심 노선과 가격 예측을 확인하려면 먼저 로그인해주세요.
      </p>
      <Button onClick={onLogin} className="mt-6">
        로그인
      </Button>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="font-medium text-red-700">불러오기 실패</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  )
}

function EmptyInterestsState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
      <p className="text-foreground">아직 등록된 관심 노선이 없어요.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        검색 결과 페이지에서 관심노선을 추가하면 여기서 가격 추이를 확인할 수 있어요.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">검색하러 가기</Link>
      </Button>
    </div>
  )
}
