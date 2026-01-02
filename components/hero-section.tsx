import { Button } from "@/components/ui/button"
import { Search, MapPin, Stethoscope } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-accent/20 to-background z-0" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-tight">
            Healthcare that feels <span className="text-primary italic">human</span>.
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-muted-foreground font-light">
            Find and book appointments with top healthcare professionals in Chile. Trust, care, and accessibility in one
            place.
          </p>
        </div>

        <div className="bg-card shadow-2xl shadow-primary/10 rounded-3xl p-4 md:p-6 max-w-5xl mx-auto border border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Specialty (e.g. Psychologist, Pediatrician)"
              className="pl-12 h-14 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary/20"
            />
          </div>

          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Select>
              <SelectTrigger className="pl-12 h-14 bg-accent/30 border-none rounded-2xl focus:ring-primary/20">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="santiago">Santiago</SelectItem>
                <SelectItem value="valparaiso">Valparaíso</SelectItem>
                <SelectItem value="concepcion">Concepción</SelectItem>
                <SelectItem value="remote">Online / Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            className="h-14 px-10 rounded-2xl text-lg font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto"
          >
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest w-full mb-2">
            Trusted by patients across
          </p>
          <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="h-8 w-8 bg-primary/20 rounded-lg" />
            <span className="font-semibold text-lg">FONASA</span>
          </div>
          <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="h-8 w-8 bg-secondary/20 rounded-lg" />
            <span className="font-semibold text-lg">ISAPRE</span>
          </div>
          <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="h-8 w-8 bg-accent/40 rounded-lg" />
            <span className="font-semibold text-lg">MINSAL</span>
          </div>
        </div>
      </div>
    </section>
  )
}
