"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { isLoggedIn, isHydrated, user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#4a6d87]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span
              className="text-xl tracking-wide text-white"
              style={{ fontFamily: "'Nico Moji', cursive" }}
            >
              AirMoment
            </span>
          </Link>

          {/* User Profile Button */}
          {/* SSR/CSR 사이 깜박임 방지: hydration 끝나기 전엔 공통 아이콘만 표시 */}
          {!isHydrated ? (
            <ProfileIconButton aria-label="프로필" onClick={() => {}} />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="마이페이지 메뉴"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white">
                    <User className="h-4 w-4" strokeWidth={2} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {user?.name ? `${user.name}님` : user?.email ?? "내 계정"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mypage">마이페이지</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ProfileIconButton
              aria-label="로그인"
              onClick={() => setAuthOpen(true)}
            />
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}

function ProfileIconButton({
  onClick,
  ...rest
}: { onClick: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
      {...rest}
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white">
        <User className="h-4 w-4" strokeWidth={2} />
      </div>
    </button>
  )
}
