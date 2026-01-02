"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { ShieldCheck, User, Stethoscope, ArrowLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const [role, setRole] = useState<"patient" | "professional" | null>(null)

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <Card className="w-full max-w-lg border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-secondary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Join NUREA</CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            Start your journey to better health today
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-center block text-lg font-bold">Select your account type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole("patient")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                  role === "patient" ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/40",
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    role === "patient" ? "bg-primary text-white" : "bg-accent/20 text-muted-foreground",
                  )}
                >
                  <User className="h-6 w-6" />
                </div>
                <span className="font-bold">I'm a Patient</span>
              </button>
              <button
                onClick={() => setRole("professional")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                  role === "professional"
                    ? "border-secondary bg-secondary/5"
                    : "border-border/40 hover:border-secondary/40",
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    role === "professional" ? "bg-secondary text-white" : "bg-accent/20 text-muted-foreground",
                  )}
                >
                  <Stethoscope className="h-6 w-6" />
                </div>
                <span className="font-bold">I'm a Professional</span>
              </button>
            </div>
          </div>

          {role && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" className="rounded-xl bg-accent/10 border-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" className="rounded-xl bg-accent/10 border-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="rounded-xl bg-accent/10 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="rounded-xl bg-accent/10 border-none" />
              </div>
              <div className="flex items-start gap-2 pt-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  By signing up, I agree to NUREA's{" "}
                  <Link href="#" className="text-primary font-bold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary font-bold">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <Button
                className={cn(
                  "w-full h-12 rounded-xl font-bold text-lg mt-4",
                  role === "professional" ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90",
                )}
              >
                Create Account
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-8 pt-0 justify-center border-t border-border/20 mt-4">
          <p className="text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
