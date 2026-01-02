import { Search, CalendarDays, MessageSquare, Star } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Search",
      description: "Find the right professional by specialty, location, or insurance coverage.",
      img: "/search-professionals.jpg",
    },
    {
      icon: CalendarDays,
      title: "2. Book",
      description: "Choose a time that works for you and confirm your appointment instantly.",
      img: "/booking-calendar.jpg",
    },
    {
      icon: MessageSquare,
      title: "3. Connect",
      description: "Use our secure chat for pre-consultation questions or online sessions.",
      img: "/secure-chat.jpg",
    },
    {
      icon: Star,
      title: "4. Review",
      description: "Share your experience to help our community grow and maintain quality.",
      img: "/professional-rating.jpg",
    },
  ]

  return (
    <section className="py-24 px-6 bg-accent/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <p className="text-secondary font-bold text-sm uppercase tracking-widest">Simple Process</p>
          <h2 className="text-4xl lg:text-6xl text-foreground font-bold tracking-tight">
            How NUREA works for <span className="text-secondary">patients</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-md group">
                <img
                  src={step.img || "/placeholder.svg"}
                  alt={step.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent p-6 flex items-end">
                  <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-2">
                <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
