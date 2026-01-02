import { Card, CardContent } from "@/components/ui/card"
import { Sunrise, Moon, Coffee, Sparkles } from "lucide-react"

const practices = [
  {
    icon: Sunrise,
    title: "Morning Meditation",
    description: "Start your day with clarity and intention",
    duration: "10 min",
  },
  {
    icon: Coffee,
    title: "Midday Reset",
    description: "Brief moments of peace during your busy day",
    duration: "5 min",
  },
  {
    icon: Moon,
    title: "Evening Wind Down",
    description: "Release the day and prepare for restful sleep",
    duration: "15 min",
  },
  {
    icon: Sparkles,
    title: "Mindful Moments",
    description: "Quick practices for anytime awareness",
    duration: "3 min",
  },
]

export function DailyPractices() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium">Daily Practices</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build a sustainable meditation routine with practices designed to fit seamlessly into your day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practices.map((practice, index) => {
            const Icon = practice.icon
            return (
              <Card key={index} className="border-border/40 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">{practice.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{practice.description}</p>
                    <p className="text-xs text-secondary font-medium">{practice.duration}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
