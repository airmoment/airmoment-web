"use client"

import Link from "next/link"
import { User } from "lucide-react"

export function Header() {
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
          <Link
            href="/mypage"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            aria-label="마이페이지"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white">
              <User className="h-4 w-4" strokeWidth={2} />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
