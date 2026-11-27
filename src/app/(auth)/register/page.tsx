"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, PawPrint, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const [name, setName] = useState("")
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
        <CardTitle className="text-2xl">Daftar</CardTitle>
        <CardDescription>Buat akun untuk mulai tracking kalori</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Nama lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input
                placeholder="Bubub"
                className="pl-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
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
                placeholder="Minimal 8 karakter"
                type="password"
                className="pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full py-3">
            Daftar Sekarang
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center pb-4 text-sm text-ink-soft">
        Sudah punya akun?{" "}
        <Link href="/login" className="ml-1 font-semibold text-brand-700 hover:underline">
          Masuk di sini
        </Link>
      </CardFooter>
    </Card>
  )
}