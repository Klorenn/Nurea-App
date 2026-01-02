"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { ShieldCheck, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">Access your secure health portal</CardDescription>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="rounded-xl h-12 bg-accent/20 border-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" className="rounded-xl h-12 bg-accent/20 border-none" />
            </div>
          </div>

          <Button className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">Sign In</Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-white px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="rounded-xl h-12 bg-transparent">
              Google
            </Button>
            <Button variant="outline" className="rounded-xl h-12 bg-transparent">
              Apple
            </Button>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0 justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
