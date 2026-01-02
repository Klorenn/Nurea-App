import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, MessageSquare, ArrowRight, Star, Heart, ChevronRight, Settings } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function PatientDashboard() {
  return (
    <DashboardLayout role="patient">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Welcome Card */}
        <Card className="md:col-span-2 border-primary/10 bg-linear-to-br from-primary/5 via-background to-transparent shadow-lg shadow-primary/5">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Welcome back, Andrés!</h2>
                <p className="text-muted-foreground text-lg">
                  You have <span className="text-primary font-bold">1 appointment</span> scheduled for today.
                </p>
                <div className="pt-2">
                  <Button className="rounded-xl px-6 h-11">Book New Appointment</Button>
                </div>
              </div>
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary rotate-3">
                <Heart className="h-12 w-12 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Summary Card */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Health Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
              <span className="text-muted-foreground">Blood Type</span>
              <span className="font-bold">O+</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
              <span className="text-muted-foreground">Allergies</span>
              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-none">
                Penicillin
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
              <span className="text-muted-foreground">Next Checkup</span>
              <span className="font-medium">Oct 12, 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upcoming Appointments */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            <Card className="border-border/40 hover:shadow-md transition-all group">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex flex-col items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      <div className="bg-primary w-full text-[10px] text-white py-0.5 text-center uppercase tracking-tighter">
                        OCT
                      </div>
                      <div className="text-2xl pt-1 leading-none tracking-tighter">05</div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">Dr. Elena Vargas</h4>
                      <p className="text-sm text-muted-foreground">Clinical Psychologist • Online Session</p>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> 14:30 - 15:30
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" /> secure-meeting-link
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      Join Meeting
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-md transition-all opacity-80 group">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex flex-col items-center justify-center text-muted-foreground font-bold overflow-hidden shrink-0">
                      <div className="bg-muted w-full text-[10px] text-muted-foreground py-0.5 text-center uppercase tracking-tighter">
                        OCT
                      </div>
                      <div className="text-2xl pt-1 leading-none tracking-tighter">12</div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg group-hover:text-secondary transition-colors">Dr. Marco Polo</h4>
                      <p className="text-sm text-muted-foreground">Cardiologist • In-person Visit</p>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> 09:00 - 09:45
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> Las Condes, Santiago
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg h-9 px-4 border-secondary/20 bg-secondary/5 text-secondary"
                    >
                      Confirmed
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Favorite Professionals */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Favorite Specialists</h3>
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/40 hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-xl border border-border/40">
                      <AvatarImage src={`/fav-${i}.jpg?height=48&width=48&query=doctor-${i}`} />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">Dr. {i === 1 ? "Sofia Rossi" : "Lucas Mendez"}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {i === 1 ? "Dermatologist" : "Pediatrician"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs font-bold">{i === 1 ? "4.9" : "4.8"}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              className="w-full rounded-xl border-dashed border-primary/20 hover:bg-primary/5 hover:border-primary/40 bg-transparent"
            >
              Browse More Specialists
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
