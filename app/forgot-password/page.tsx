"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
        <Link
          href="/login"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-secondary p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Check Your Email</CardTitle>
            <CardDescription className="text-white/80 font-medium mt-2">
              We've sent you a password reset link
            </CardDescription>
          </div>

          <CardContent className="p-8 space-y-6 text-center">
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions
              to reset your password.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button className="text-primary font-bold hover:underline">try again</button>.
            </p>
          </CardContent>

          <CardFooter className="p-8 pt-0 justify-center">
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            Enter your email to receive a reset link
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="rounded-xl h-12 bg-accent/20 border-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll send you a secure link to reset your password. This link will expire in 1 hour.
          </p>
          <Button
            className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
            onClick={() => setEmailSent(true)}
          >
            Send Reset Link
          </Button>
        </CardContent>

        <CardFooter className="p-8 pt-0 justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

