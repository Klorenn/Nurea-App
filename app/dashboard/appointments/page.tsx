"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Video, Clock, MoreVertical, ExternalLink, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const appointments = [
  {
    id: "NR-99231",
    professional: "Dr. Elena Vargas",
    specialty: "Clinical Psychologist",
    date: "Oct 5, 2024",
    time: "14:30",
    mode: "Online Video",
    status: "Upcoming",
    price: 45000,
    image: "/prof-1.jpg",
  },
  {
    id: "NR-98112",
    professional: "Dr. Marco Polo",
    specialty: "Cardiologist",
    date: "Sep 28, 2024",
    time: "10:00",
    mode: "In-person",
    location: "Las Condes 1245, Santiago",
    status: "Completed",
    price: 55000,
    image: "/prof-2.jpg",
  },
]

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage your consultations and medical history.</p>
          </div>
          <Button className="rounded-xl font-bold">
            <CalendarDays className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-accent/20 p-1 rounded-xl w-full sm:w-auto mb-6">
            <TabsTrigger
              value="upcoming"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {appointments
              .filter((a) => a.status === "Upcoming")
              .map((appt) => (
                <Card
                  key={appt.id}
                  className="border-border/40 overflow-hidden rounded-[2rem] hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-primary/5 p-8 flex flex-col justify-center items-center md:items-start md:border-r border-border/40 w-full md:w-64">
                        <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                          <CalendarDays className="h-5 w-5" /> {appt.date}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <Clock className="h-4 w-4" /> {appt.time}
                        </div>
                        <Badge className="mt-6 bg-secondary text-white border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                          Confirmed
                        </Badge>
                      </div>

                      <div className="flex-1 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
                            <img
                              src={`${appt.image}?height=100&width=100&query=headshot`}
                              alt={appt.professional}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">{appt.professional}</h3>
                            <p className="text-primary font-bold text-sm">{appt.specialty}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                              {appt.mode === "Online Video" ? (
                                <>
                                  <Video className="h-3.5 w-3.5" /> Secure Video Consultation
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-3.5 w-3.5" /> In-person Visit
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                          {appt.mode === "Online Video" && (
                            <Button className="rounded-xl font-bold bg-secondary hover:bg-secondary/90 flex-1 md:flex-none">
                              Join Session
                            </Button>
                          )}
                          <Button variant="outline" className="rounded-xl font-bold bg-transparent flex-1 md:flex-none">
                            Reschedule
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {appointments
              .filter((a) => a.status === "Completed")
              .map((appt) => (
                <Card
                  key={appt.id}
                  className="border-border/40 overflow-hidden rounded-[2rem] opacity-80 hover:opacity-100 transition-opacity"
                >
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="p-8 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 grayscale">
                          <img
                            src={`${appt.image}?height=100&width=100&query=headshot`}
                            alt={appt.professional}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{appt.professional}</h3>
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-bold text-muted-foreground rounded-full h-5"
                            >
                              ID: {appt.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appt.date} • {appt.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" className="rounded-xl font-bold bg-transparent flex-1 md:flex-none">
                          View Summary
                        </Button>
                        <Button variant="outline" className="rounded-xl font-bold bg-transparent flex-1 md:flex-none">
                          Re-book
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Prescription / Documents Summary */}
        <section className="pt-8">
          <h2 className="text-2xl font-bold mb-6">Recent Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Medical Certificate", date: "Sep 28, 2024", prof: "Dr. Marco Polo" },
              { name: "Lab Results - Bloodwork", date: "Sep 20, 2024", prof: "Clinical Labs" },
              { name: "Session Summary", date: "Sep 15, 2024", prof: "Dr. Elena Vargas" },
            ].map((doc, i) => (
              <Card
                key={i}
                className="border-border/40 rounded-[1.5rem] bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-bold group-hover:text-primary transition-colors">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.date} • {doc.prof}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
