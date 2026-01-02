"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Video, Home, ChevronRight, Clock, CreditCard, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<"online" | "in-person" | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string | null>(null)

  const timeSlots = ["09:00", "10:30", "14:00", "15:30", "17:00", "18:30"]

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col h-[600px]">
          {/* Header Progress */}
          <div className="bg-primary/5 p-8 border-b border-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Book Consultation</h2>
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary bg-white">
                Step {step} of 4
              </Badge>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    step >= s ? "bg-primary" : "bg-primary/10",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Select Consultation Mode</h3>
                  <p className="text-muted-foreground">How would you like to meet with the specialist?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => {
                      setType("online")
                      nextStep()
                    }}
                    className={cn(
                      "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all group",
                      type === "online"
                        ? "border-primary bg-primary/5"
                        : "border-border/40 hover:border-primary/40 hover:bg-accent/20",
                    )}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Video className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">Online Session</p>
                      <p className="text-xs text-muted-foreground mt-1">Via NUREA Secure Video</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setType("in-person")
                      nextStep()
                    }}
                    className={cn(
                      "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all group",
                      type === "in-person"
                        ? "border-secondary bg-secondary/5"
                        : "border-border/40 hover:border-secondary/40 hover:bg-accent/20",
                    )}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                      <Home className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">In-person Visit</p>
                      <p className="text-xs text-muted-foreground mt-1">Visit at clinic location</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Select Date & Time</h3>
                  <p className="text-muted-foreground">Choose your preferred availability.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 pt-4">
                  <div className="border border-border/40 rounded-2xl p-2 bg-white">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Available Slots
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((t) => (
                        <Button
                          key={t}
                          variant={time === t ? "default" : "outline"}
                          className={cn("rounded-xl h-11 bg-transparent", time === t && "bg-primary text-white")}
                          onClick={() => setTime(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Payment Method</h3>
                  <p className="text-muted-foreground">Secure your appointment with a deposit.</p>
                </div>
                <div className="grid gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="h-20 justify-between px-6 rounded-2xl border-2 hover:border-primary transition-all bg-transparent group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Pay securely via Webpay</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 justify-between px-6 rounded-2xl border-2 hover:border-primary transition-all bg-transparent group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Home className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Manual transfer confirmation</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Consultation Fee</span>
                    <span className="font-bold">$45,000 CLP</span>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">Appointment Confirmed!</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your session with <strong>Dr. Elena Vargas</strong> is scheduled for Oct 5th at 14:30.
                  </p>
                </div>
                <div className="bg-accent/20 p-6 rounded-[2rem] w-full max-w-md space-y-4 border border-border/40">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-bold">Online Video</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-bold">#NR-99231</span>
                  </div>
                </div>
                <div className="flex gap-4 w-full pt-4">
                  <Button variant="outline" className="flex-1 rounded-xl bg-transparent" onClick={onClose}>
                    Close
                  </Button>
                  <Button className="flex-1 rounded-xl" asChild>
                    <a href="/dashboard/appointments">Go to Dashboard</a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {step < 4 && (
            <div className="p-8 border-t border-border/40 flex justify-between bg-white">
              <Button variant="ghost" onClick={prevStep} disabled={step === 1} className="rounded-xl font-bold">
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={(step === 1 && !type) || (step === 2 && !time)}
                className="px-10 rounded-xl font-bold"
              >
                {step === 3 ? "Complete Booking" : "Next"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
