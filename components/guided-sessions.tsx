import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

const sessions = [
  {
    title: "Breath Awareness",
    instructor: "Sarah Chen",
    duration: "12 min",
    type: "Beginner",
  },
  {
    title: "Body Scan Relaxation",
    instructor: "Michael Torres",
    duration: "20 min",
    type: "Intermediate",
  },
  {
    title: "Loving Kindness",
    instructor: "Amara Johnson",
    duration: "15 min",
    type: "All Levels",
  },
  {
    title: "Stress Release",
    instructor: "David Park",
    duration: "18 min",
    type: "Intermediate",
  },
]

export function GuidedSessions() {
  return (
    <section className="py-24 px-4 bg-accent/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium">Guided Sessions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert-led meditation sessions for every experience level and intention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session, index) => (
            <Card key={index} className="border-border/40">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-serif text-2xl font-medium">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">with {session.instructor}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                      <span>{session.duration}</span>
                      <span>•</span>
                      <span>{session.type}</span>
                    </div>
                  </div>
                  <Button size="icon" variant="outline" className="rounded-full shrink-0 bg-transparent">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
