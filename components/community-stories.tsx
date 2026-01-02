import { Card, CardContent } from "@/components/ui/card"

const stories = [
  {
    name: "Emma Richardson",
    role: "Teacher",
    story:
      "After years of struggling with anxiety, this app helped me find a daily practice that actually sticks. The morning meditations have become my anchor.",
    image: "/peaceful-woman-meditating.jpg",
  },
  {
    name: "James Wu",
    role: "Software Engineer",
    story:
      "As someone who sits at a desk all day, the midday reset sessions are a game-changer. Five minutes of stillness completely shifts my afternoon.",
    image: "/man-meditation-peaceful.jpg",
  },
  {
    name: "Sofia Martinez",
    role: "Healthcare Worker",
    story:
      "Working in a high-stress environment, these practices help me stay grounded and present. The guided sessions feel like having a meditation teacher in my pocket.",
    image: "/woman-peaceful-mindfulness.jpg",
  },
]

export function CommunityStories() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium">Stories from the Community</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real experiences from people who found their path to stillness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card key={index} className="border-border/40">
              <CardContent className="pt-6 space-y-4">
                <p className="text-foreground/90 leading-relaxed italic">"{story.story}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={story.image || "/placeholder.svg"}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{story.name}</p>
                    <p className="text-sm text-muted-foreground">{story.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
