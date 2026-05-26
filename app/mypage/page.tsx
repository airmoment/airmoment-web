import { TrendingDown } from "lucide-react"
import { FavoriteRouteCard } from "@/components/favorite-route-card"
import { mockFavoriteRoutes } from "@/lib/mock-data"

export default function MyPage() {
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
          <span className="text-sm text-muted-foreground">
            총 {mockFavoriteRoutes.length}개의 저장된 노선
          </span>
        </div>

        {/* 관심 노선 카드 리스트 */}
        <div className="space-y-6">
          {mockFavoriteRoutes.map((route) => (
            <FavoriteRouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>
    </main>
  )
}
