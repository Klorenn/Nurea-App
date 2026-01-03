"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Save,
  Upload,
  Globe,
  Video,
  Home,
  DollarSign,
  Calendar,
  MapPin,
  X,
  CheckCircle2,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfessionalProfileEditPage() {
  const [specialties, setSpecialties] = useState(["Clinical Psychology", "Cognitive Behavioral Therapy"])
  const [languages, setLanguages] = useState(["Spanish", "English"])
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newLanguage, setNewLanguage] = useState("")

  const addSpecialty = () => {
    if (newSpecialty && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (spec: string) => {
    setSpecialties(specialties.filter((s) => s !== spec))
  }

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage])
      setNewLanguage("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang))
  }

  return (
    <DashboardLayout role="professional">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" /> Profile Settings
            </h1>
            <p className="text-muted-foreground mt-1">Customize your public profile and professional information</p>
          </div>
          <Button className="rounded-xl font-bold">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-accent/20 p-1 rounded-xl w-full sm:w-auto mb-6">
            <TabsTrigger
              value="basic"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Services & Pricing
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload a professional headshot (recommended: 400x400px)</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-8">
                  <Avatar className="h-32 w-32 border-4 border-border/40">
                    <AvatarImage src="/prof-1.jpg" />
                    <AvatarFallback>EV</AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      <Upload className="mr-2 h-4 w-4" /> Upload New Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>This information will be visible on your public profile</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Elena" className="rounded-xl bg-accent/20 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Vargas" className="rounded-xl bg-accent/20 border-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" defaultValue="Clinical Psychologist" className="rounded-xl bg-accent/20 border-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    defaultValue="I specialize in helping adults navigate anxiety, depression, and life transitions..."
                    className="min-h-[150px] rounded-xl bg-accent/20 border-none resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Tell patients about your background and approach</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Specialties & Languages</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {specialties.map((spec) => (
                      <Badge
                        key={spec}
                        variant="secondary"
                        className="bg-accent/30 text-accent-foreground border-none rounded-xl px-4 py-2 flex items-center gap-2"
                      >
                        {spec}
                        <button
                          onClick={() => removeSpecialty(spec)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add specialty..."
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
                      className="rounded-xl bg-accent/20 border-none"
                    />
                    <Button onClick={addSpecialty} variant="outline" className="rounded-xl bg-transparent">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="outline"
                        className="rounded-xl px-4 py-2 flex items-center gap-2 bg-accent/10"
                      >
                        <Globe className="h-3 w-3" /> {lang}
                        <button
                          onClick={() => removeLanguage(lang)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Portuguese">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addLanguage} variant="outline" className="rounded-xl bg-transparent">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Consultation Types</CardTitle>
                <CardDescription>Select the consultation modes you offer</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 rounded-2xl border-2 border-border/40 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-bold">Online Consultation</h3>
                          <p className="text-sm text-muted-foreground">Video sessions via platform</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                    </div>
                    <div className="space-y-3">
                      <Label>Video Platform Preference</Label>
                      <Select defaultValue="google-meet">
                        <SelectTrigger className="rounded-xl bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google-meet">Google Meet</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="platform">NUREA Platform</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="space-y-2">
                        <Label>Price per Session (CLP)</Label>
                        <Input
                          type="number"
                          defaultValue="45000"
                          className="rounded-xl bg-accent/20 border-none"
                          prefix="$"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 rounded-2xl border-2 border-border/40 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Home className="h-6 w-6 text-secondary" />
                        <div>
                          <h3 className="font-bold">In-person Consultation</h3>
                          <p className="text-sm text-muted-foreground">At your clinic location</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Clinic Address</Label>
                        <Input
                          placeholder="Las Condes 1245, Santiago"
                          className="rounded-xl bg-accent/20 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price per Session (CLP)</Label>
                        <Input
                          type="number"
                          defaultValue="50000"
                          className="rounded-xl bg-accent/20 border-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Availability Calendar</CardTitle>
                <CardDescription>Set your working hours and availability</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Calendar integration coming soon. For now, you can manage availability through your dashboard.
                  </p>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" /> Open Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure how you receive payments</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bank Account (Private)</Label>
                    <Input
                      placeholder="Account number"
                      type="password"
                      className="rounded-xl bg-accent/20 border-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This information is private and only used for payment processing
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banco-chile">Banco de Chile</SelectItem>
                        <SelectItem value="banco-estado">Banco Estado</SelectItem>
                        <SelectItem value="santander">Santander</SelectItem>
                        <SelectItem value="bci">BCI</SelectItem>
                      </SelectContent>
                    </Select>
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

