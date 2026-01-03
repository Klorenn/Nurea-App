"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminDashboard() {
  return (
    <DashboardLayout role="professional">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage users, professionals, and platform settings</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: "2,341", icon: Users, color: "text-primary", bg: "bg-primary/10" },
            {
              label: "Active Professionals",
              value: "156",
              icon: UserCheck,
              color: "text-secondary",
              bg: "bg-secondary/10",
            },
            {
              label: "Pending Approvals",
              value: "12",
              icon: Clock,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Monthly Revenue",
              value: "$45.2k",
              icon: TrendingUp,
              color: "text-secondary",
              bg: "bg-secondary/10",
            },
          ].map((stat, i) => (
            <Card key={i} className="border-border/40 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="professionals" className="w-full">
          <TabsList className="bg-accent/20 p-1 rounded-xl w-full sm:w-auto mb-6">
            <TabsTrigger
              value="professionals"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Professionals
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Professional Approvals</CardTitle>
                    <CardDescription>Review and approve new professional registrations</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search professionals..." className="pl-10 rounded-xl bg-background" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {[
                    {
                      id: 1,
                      name: "Dr. Carlos Mendez",
                      specialty: "Psychiatrist",
                      email: "carlos.mendez@example.com",
                      status: "pending",
                      submitted: "2 days ago",
                    },
                    {
                      id: 2,
                      name: "Dr. Ana Silva",
                      specialty: "Pediatrician",
                      email: "ana.silva@example.com",
                      status: "pending",
                      submitted: "1 week ago",
                    },
                    {
                      id: 3,
                      name: "Dr. Roberto Fuentes",
                      specialty: "Dermatologist",
                      email: "roberto.fuentes@example.com",
                      status: "approved",
                      submitted: "3 days ago",
                    },
                  ].map((prof) => (
                    <div key={prof.id} className="p-6 hover:bg-accent/5 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border border-border/40">
                            <AvatarFallback>{prof.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{prof.name}</h3>
                            <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                            <p className="text-xs text-muted-foreground mt-1">{prof.email}</p>
                            <p className="text-xs text-muted-foreground">Submitted {prof.submitted}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {prof.status === "pending" ? (
                            <>
                              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                                Pending Review
                              </Badge>
                              <Button size="sm" className="rounded-xl bg-secondary hover:bg-secondary/90">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-xl bg-transparent">
                                <XCircle className="h-4 w-4 mr-2" /> Reject
                              </Button>
                            </>
                          ) : (
                            <Badge className="bg-secondary text-white border-none">
                              <UserCheck className="h-3 w-3 mr-1" /> Approved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all platform users</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-10 rounded-xl bg-background" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {[
                    { id: 1, name: "Andrés Bello", email: "andres@example.com", role: "Patient", status: "Active" },
                    { id: 2, name: "Camila Jara", email: "camila@example.com", role: "Patient", status: "Active" },
                    { id: 3, name: "Roberto Silva", email: "roberto@example.com", role: "Patient", status: "Suspended" },
                  ].map((user) => (
                    <div key={user.id} className="p-6 hover:bg-accent/5 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border border-border/40">
                            <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Badge variant="secondary" className="mt-1">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={user.status === "Active" ? "default" : "destructive"}
                            className={user.status === "Active" ? "bg-secondary" : ""}
                          >
                            {user.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Review Moderation</CardTitle>
                <CardDescription>Monitor and moderate user reviews</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Review moderation interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Country & Language Settings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage available countries and languages for the platform
                    </p>
                    <div className="flex gap-3">
                      <Badge className="bg-primary">Chile (Active)</Badge>
                      <Badge variant="outline">Argentina (Coming Soon)</Badge>
                      <Badge variant="outline">Spain (Coming Soon)</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Subscription Plans</h3>
                    <p className="text-sm text-muted-foreground">
                      Standard: $25 USD/month • Recent Graduates: $15 USD/month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

