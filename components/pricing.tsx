import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, GraduationCap, Gift } from "lucide-react"

const plans = [
  {
    name: "Standard",
    price: "$25",
    period: "/month",
    description: "For established professionals",
    features: [
      "Unlimited patient bookings",
      "Profile visibility in search",
      "Secure video consultations",
      "Patient messaging system",
      "Appointment calendar management",
      "Review and rating system",
      "Payment processing",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Recent Graduate",
    price: "$15",
    period: "/month",
    description: "Special pricing for new professionals",
    badge: "Limited Time",
    features: [
      "Everything in Standard",
      "50% off first 3 months",
      "Priority onboarding support",
      "Marketing assistance",
      "Mentorship program access",
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight">Professional Subscription Plans</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Affordable pricing designed for healthcare professionals in Chile and beyond
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border-border/40 relative rounded-[2.5rem] overflow-hidden ${
                plan.popular ? "border-primary shadow-2xl shadow-primary/10" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white border-none px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-4 right-4 z-10">
                  <Badge className="bg-secondary text-white border-none px-3 py-1 rounded-full text-xs font-bold">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-6 pt-12 bg-primary/5">
                <CardTitle className="font-sans text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  {plan.name === "Recent Graduate" && <GraduationCap className="h-5 w-5 text-primary" />}
                  {plan.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-lg ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-12 rounded-xl font-bold text-lg"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.name === "Recent Graduate" ? "Apply for Discount" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referral System */}
        <Card className="max-w-4xl mx-auto border-primary/20 bg-linear-to-br from-primary/5 via-secondary/5 to-transparent rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center p-8 bg-primary/5">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Referral Program</CardTitle>
            <CardDescription className="text-base">
              Refer a professional and get 1 month free subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg">How it works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Share your unique referral link with a healthcare professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>They sign up and complete their profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>You both get 1 month free subscription!</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="bg-card p-4 rounded-2xl border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Your Referral Link
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-accent/20 px-3 py-2 rounded-xl text-xs font-mono">
                      nurea.app/ref/your-code
                    </code>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      Copy
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unlimited referrals! The more professionals you bring, the more free months you earn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
