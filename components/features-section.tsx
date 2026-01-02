import { Heart, ShieldCheck, Zap, Users } from "lucide-react"

export function FeaturesSection() {
  const benefits = [
    {
      icon: Heart,
      title: "Human Connection",
      description: "We focus on professionals who prioritize empathetic and personalized care for every patient.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: ShieldCheck,
      title: "Verified Excellence",
      description: "Every professional on NUREA undergoes a rigorous verification process for your peace of mind.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Real-time availability allows you to book your consultation in seconds, no waiting lines.",
      color: "bg-accent/40 text-accent-foreground",
    },
    {
      icon: Users,
      title: "Patient First",
      description: "A platform designed for your comfort, from profile management to secure chat with experts.",
      color: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <section className="py-24 px-6 bg-background" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[450px_1fr] gap-16 items-center">
          <div className="space-y-6">
            <p className="text-primary font-bold text-sm uppercase tracking-[0.2em]">Why choose NUREA</p>
            <h2 className="text-4xl lg:text-5xl text-foreground font-bold leading-[1.1] tracking-tight">
              A healthcare marketplace built on <span className="text-primary">trust</span>.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              NUREA isn't just a directory. It's a bridge between you and the best healthcare professionals in the
              region, focusing on human-centric care and seamless accessibility.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-accent/20 border border-accent/30">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img
                        src={`/professional-.jpg?height=40&width=40&query=professional-${i}`}
                        alt="Professional"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">
                  Join <span className="text-primary font-bold">2,500+</span> specialists today
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-[2rem] bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
