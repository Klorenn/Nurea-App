"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2, ArrowRight } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-secondary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Verify Your Email</CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            We've sent you a verification link
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Check your inbox</h3>
            <p className="text-muted-foreground">
              We've sent a verification link to your email address. Please click the link to verify your account and
              complete your registration.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button className="text-primary font-bold hover:underline">resend verification email</button>.
            </p>
            <Button className="w-full h-12 rounded-xl font-bold text-lg" asChild>
              <Link href="/login">
                Continue to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

