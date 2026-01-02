import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"

const testimonials = [
  {
    quote:
      "This app transformed my daily routine. The guided meditations are beautifully crafted and I feel more centered than ever. The journey from chaos to calm has been remarkable.",
    name: "Sarah Mitchell",
    designation: "Yoga Instructor",
    src: "/woman-meditating-peaceful-serene.jpg",
  },
  {
    quote:
      "As someone who struggled with anxiety, this app has been a lifeline. The breathing exercises and sleep meditations have genuinely changed my life for the better.",
    name: "David Chen",
    designation: "Software Engineer",
    src: "/man-meditation-calm-peaceful.jpg",
  },
  {
    quote:
      "The mindfulness practices here are authentic and effective. I've recommended this app to all my clients. It's rare to find such quality and thoughtfulness in one place.",
    name: "Dr. Aisha Rahman",
    designation: "Clinical Psychologist",
    src: "/woman-mindfulness-professional-serene.jpg",
  },
  {
    quote:
      "I've tried countless meditation apps, but this one stands out. The interface is beautiful, the content is meaningful, and I actually look forward to my daily practice now.",
    name: "Marcus Thompson",
    designation: "Creative Director",
    src: "/man-peaceful-meditation-creative.jpg",
  },
  {
    quote:
      "The community aspect and progress tracking keep me motivated. This isn't just an app, it's a complete wellness companion that fits perfectly into my busy lifestyle.",
    name: "Emma Rodriguez",
    designation: "Marketing Manager",
    src: "/woman-wellness-happy-meditation.jpg",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-accent/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-primary">What People Are Saying</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Join thousands finding their inner peace</p>
        </div>

        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </section>
  )
}
