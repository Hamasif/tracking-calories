"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/")
  }

  return (
    <Card className="w-full max-w-md p-2 sm:p-4">
      <CardHeader className="items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow lg:hidden">
          <PawPrint className="h-6 w-6" />
        </span>
        <CardTitle className="text-2xl">Masuk</CardTitle>
        <CardDescription>Selamat datang kembali, dokter hewan!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input
                placeholder="nama@email.com"
                type="email"
                className="pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input
                placeholder="••••••••"
                type="password"
                className="pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full py-3">
            Masuk
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center pb-4 text-sm text-ink-soft">
        Belum punya akun?{" "}
        <Link href="/register" className="ml-1 font-semibold text-brand-700 hover:underline">
          Daftar di sini
        </Link>
      </CardFooter>
    </Card>
  )
}