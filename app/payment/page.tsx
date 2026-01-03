"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, CheckCircle2, AlertCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

type PaymentStatus = "pending" | "processing" | "success" | "failed"

export default function PaymentPage() {
  const [status, setStatus] = useState<PaymentStatus>("pending")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")

  const handlePayment = () => {
    setStatus("processing")
    // Simulate payment processing
    setTimeout(() => {
      setStatus("success")
    }, 2000)
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
        <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-secondary p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Payment Successful!</CardTitle>
            <CardDescription className="text-white/80 font-medium mt-2">
              Your appointment has been confirmed
            </CardDescription>
          </div>

          <CardContent className="p-8 space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-bold text-lg">#TXN-99231-2024</p>
            </div>
            <div className="bg-accent/20 p-6 rounded-2xl space-y-3 border border-border/40">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold">$45,000 CLP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Appointment</span>
                <span className="font-bold">Oct 5, 2024 • 14:30</span>
              </div>
            </div>
            <Button className="w-full h-12 rounded-xl font-bold text-lg" asChild>
              <Link href="/dashboard/appointments">View Appointment</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === "failed") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
        <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-destructive/10 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-destructive/20 p-3 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-destructive">Payment Failed</CardTitle>
            <CardDescription className="mt-2">We couldn't process your payment</CardDescription>
          </div>

          <CardContent className="p-8 space-y-6">
            <p className="text-muted-foreground text-center">
              Please check your card details and try again, or use a different payment method.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStatus("pending")}>
                Try Again
              </Button>
              <Button className="flex-1 rounded-xl font-bold" asChild>
                <Link href="/dashboard/appointments">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Link
        href="/dashboard/appointments"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Complete Payment</h1>
          <p className="text-muted-foreground">Secure your appointment with Dr. Elena Vargas</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/40 shadow-lg rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl font-bold">Payment Details</CardTitle>
                </div>
                <CardDescription>Your payment is secured with 256-bit SSL encryption</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="rounded-xl h-12 bg-accent/20 border-none"
                    maxLength={19}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="rounded-xl h-12 bg-accent/20 border-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="rounded-xl h-12 bg-accent/20 border-none"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="rounded-xl h-12 bg-accent/20 border-none"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Lock className="h-3 w-3" />
                  <span>Secured by Webpay • Powered by Transbank</span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Option */}
            <Card className="border-border/40 shadow-lg rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-6 border-b border-border/40">
                <CardTitle className="text-lg font-bold">Alternative: Bank Transfer</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  You can also pay via bank transfer. Instructions will be sent to your email after booking.
                </p>
                <Button variant="outline" className="w-full rounded-xl bg-transparent">
                  Use Bank Transfer
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="border-border/40 shadow-lg rounded-[2.5rem] overflow-hidden sticky top-8">
              <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span className="font-bold">$45,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-bold">$0</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">$45,000 CLP</span>
                  </div>
                </div>

                <div className="bg-accent/20 p-4 rounded-xl border border-border/40 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Appointment</p>
                  <p className="font-bold">Dr. Elena Vargas</p>
                  <p className="text-sm text-muted-foreground">Oct 5, 2024 • 14:30</p>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none mt-2">
                    Online Session
                  </Badge>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={status === "processing" || !cardNumber || !cardName || !expiry || !cvv}
                  className={cn(
                    "w-full h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20",
                    status === "processing" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {status === "processing" ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Processing...
                    </span>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" /> Pay $45,000 CLP
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By completing payment, you agree to our Terms of Service and Cancellation Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

