import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["5 guided sessions", "Daily meditation timer", "Basic breathing exercises", "Community access"],
  },
  {
    name: "Premium",
    price: "$12",
    period: "/month",
    description: "Unlock your full potential",
    features: [
      "Unlimited guided sessions",
      "Personalized recommendations",
      "Offline downloads",
      "Advanced sleep stories",
      "Progress tracking",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$199",
    description: "One-time payment, forever access",
    features: [
      "Everything in Premium",
      "Exclusive masterclasses",
      "Early access to new content",
      "Lifetime updates",
      "VIP community",
    ],
  },
]

export function Pricing() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium">Free Plan & Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your mindfulness journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-border/40 relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="font-serif text-2xl font-medium mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-serif font-medium">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                  {plan.name === "Free" ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
