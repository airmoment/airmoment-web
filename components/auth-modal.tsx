"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ApiError, login, signup } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

type Mode = "login" | "signup"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 로그인 성공 시 추가로 실행할 콜백 (모달 외부에서 후속 액션 트리거용) */
  onAuthenticated?: () => void
  /** 모달을 처음 열 때 어느 탭에서 시작할지 */
  defaultMode?: Mode
}

export function AuthModal({
  open,
  onOpenChange,
  onAuthenticated,
  defaultMode = "login",
}: AuthModalProps) {
  const { login: storeLogin } = useAuth()
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setEmail("")
    setPassword("")
    setName("")
    setError(null)
    setLoading(false)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "signup") {
        await signup({ email, password, name })
        // 회원가입 직후 자동 로그인
      }
      const res = await login({ email, password })
      storeLogin(res.data.accessToken, { email, name: name || undefined })
      reset()
      onOpenChange(false)
      onAuthenticated?.()
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "로그인" : "회원가입"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="auth-email">
              이메일
            </label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="auth-password">
              비밀번호
            </label>
            <Input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="auth-name">
                이름
              </label>
              <Input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-medium text-primary hover:underline"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-medium text-primary hover:underline"
              >
                로그인
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
