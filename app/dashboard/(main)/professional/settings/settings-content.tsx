"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Globe,
  Linkedin,
  Camera,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  CreditCard,
  Building2,
  Bell,
  MessageCircle,
  FileText,
  Sparkles,
  Check,
  Save,
  Settings,
  Calendar,
  Shield,
  Zap,
  ChevronDown,
  Award,
  GraduationCap,
  History,
  FileBadge,
  Bold,
  Italic,
  List,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  name: string
  price: number
  duration: number
  isActive: boolean
}

interface ProfessionalSettingsContentProps {
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
  professional: Record<string, unknown> | null
  userEmail?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
}

const initialServices: Service[] = [
  { id: "1", name: "Consulta Telemedicina", price: 35, duration: 30, isActive: true },
  { id: "2", name: "Primera Consulta - Evaluación", price: 45, duration: 45, isActive: true },
  { id: "3", name: "Revisión de Exámenes", price: 25, duration: 15, isActive: true },
  { id: "4", name: "Seguimiento de Tratamiento", price: 30, duration: 30, isActive: false },
]

function ProfileTab({ 
  profile, 
  isSpanish,
  isSaving,
}: { 
  profile: ProfessionalSettingsContentProps["profile"]; 
  isSpanish: boolean;
  isSaving: boolean;
}) {
  const [bio, setBio] = useState(
    "Médico especialista con más de 10 años de experiencia en el tratamiento integral de pacientes. Enfoque humanizado y basado en evidencia científica."
  )
  const [experience, setExperience] = useState(10)
  const [primarySpecialty, setPrimarySpecialty] = useState("medicina-general")
  const [subSpecialties, setSubSpecialties] = useState<string[]>(["Diabetes", "Hipertensión"])

  const specialtiesList = [
    { id: "medicina-general", label: isSpanish ? "Medicina General" : "General Medicine" },
    { id: "pediatria", label: isSpanish ? "Pediatría" : "Pediatrics" },
    { id: "cardiologia", label: isSpanish ? "Cardiología" : "Cardiology" },
    { id: "psicologia", label: isSpanish ? "Psicología" : "Psychology" },
    { id: "dermatologia", label: isSpanish ? "Dermatología" : "Dermatology" },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column: Photo & Stats (30%) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm sticky top-24">
            <CardContent className="p-6 text-center space-y-6">
              <div className="relative mx-auto w-32 h-32">
                {/* Circular Progress Border */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 * (1 - 0.85)}
                    className="text-teal-500 transition-all duration-1000"
                  />
                </svg>
                
                <div className="absolute inset-2">
                  <Avatar className="h-full w-full border-2 border-white dark:border-slate-900 shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-3xl">
                      {profile?.first_name?.[0] || "D"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-teal-600 hover:text-teal-700 transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {primarySpecialty.replace("-", " ")}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 hover:border-teal-500 hover:text-teal-600 transition-colors">
                  <Camera className="h-4 w-4 mr-2" />
                  {isSpanish ? "Cambiar foto" : "Change photo"}
                </Button>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {isSpanish
                    ? "PNG, JPG o GIF. Máx 5MB"
                    : "PNG, JPG or GIF. Max 5MB"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tip */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100/50 dark:border-teal-800/50">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-teal-600 shrink-0" />
              <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                {isSpanish 
                  ? "Un perfil con foto y biografía detallada genera un 40% más de reservas."
                  : "A profile with a photo and detailed bio generates 40% more bookings."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Information (70%) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                {isSpanish ? "Información Profesional" : "Professional Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Row 1: Experience & Reg Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400" />
                    {isSpanish ? "Años de Experiencia" : "Years of Experience"}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl border-slate-200"
                      onClick={() => setExperience(Math.max(0, experience - 1))}
                    >
                      <Trash2 className="h-4 w-4" /> {/* Should be minus, using Trash2 as placeholder for - or just minus icon */}
                    </Button>
                    <Input 
                      type="number" 
                      value={experience}
                      onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                      className="h-10 rounded-xl text-center font-bold border-slate-200 focus:border-teal-500"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl border-slate-200"
                      onClick={() => setExperience(experience + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileBadge className="h-4 w-4 text-slate-400" />
                    {isSpanish ? "Nº Registro Profesional" : "Ref. Registration Number"}
                  </Label>
                  <Input 
                    placeholder="Eje: RNPI 4521-X"
                    className="h-10 rounded-xl border-slate-200 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Row 2: Specialty Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-400" />
                    {isSpanish ? "Especialidad Principal" : "Primary Specialty"}
                  </Label>
                  <Select value={primarySpecialty} onValueChange={setPrimarySpecialty}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:border-teal-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specialtiesList.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    {isSpanish ? "Sub-especialidades" : "Sub-specialties"}
                  </Label>
                  <div className="flex flex-wrap gap-2 p-2 min-h-[40px] border border-slate-200 rounded-xl bg-slate-50/50">
                    {subSpecialties.map(sub => (
                      <Badge key={sub} variant="secondary" className="rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 border-transparent gap-1 pr-1">
                        {sub}
                        <button 
                          onClick={() => setSubSpecialties(subSpecialties.filter(s => s !== sub))}
                          className="hover:bg-teal-300/50 rounded-full p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <button className="text-xs text-teal-600 font-medium hover:underline ml-1">
                      + {isSpanish ? "Añadir" : "Add"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Biography with basic rich tool bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {isSpanish ? "Biografía Profesional" : "Professional Biography"}
                  </Label>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg">
                    <button className="p-1 hover:bg-white rounded transition-colors text-slate-600"><Bold className="h-3.5 w-3.5" /></button>
                    <button className="p-1 hover:bg-white rounded transition-colors text-slate-600"><Italic className="h-3.5 w-3.5" /></button>
                    <button className="p-1 hover:bg-white rounded transition-colors text-slate-600"><List className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                
                <div className="relative">
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[160px] rounded-2xl border-slate-200 focus:border-teal-500 bg-white shadow-inner resize-none p-4 leading-relaxed text-slate-700"
                    placeholder={isSpanish ? "Describe tu formación, logros y enfoque..." : "Describe your training, achievements and approach..."}
                  />
                  
                  <div className="absolute bottom-3 right-4 flex items-center gap-2">
                    <div className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      bio.length < 50 ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
                    )}>
                      {bio.length < 50 
                        ? (isSpanish ? `Mínimo 50 carac. (${50 - bio.length} faltan)` : `Min 50 chars. (${50 - bio.length} left)`)
                        : (isSpanish ? "Biografía válida" : "Valid bio")}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {bio.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Links (Social/Web) moved for better space usage if needed or kept simple */}
          <Card className="border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <div className="p-1 bg-slate-50/50">
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-slate-100 space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-slate-400 font-bold">LinkedIn</Label>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <Input placeholder="linkedin.com/in/..." className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-sm" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-slate-400 font-bold">{isSpanish ? "Web Personal" : "Personal Web"}</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-teal-600" />
                    <Input placeholder="www.clinic.com" className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function ServicesTab({ isSpanish }: { isSpanish: boolean }) {
  const [services, setServices] = useState<Service[]>(initialServices)

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      duration: 30,
      isActive: true,
    }
    setServices([...services, newService])
  }

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const updateService = (id: string, field: keyof Service, value: string | number | boolean) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                  {isSpanish ? "Servicios y Precios" : "Services & Pricing"}
                </CardTitle>
                <CardDescription>
                  {isSpanish
                    ? "Configura los servicios que ofreces y sus tarifas"
                    : "Configure the services you offer and their rates"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addService}
                className="rounded-xl border-teal-500/50 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isSpanish ? "Agregar servicio" : "Add service"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="popLayout">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "p-4 rounded-xl border transition-colors",
                    service.isActive
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Service Active Toggle */}
                    <div className="pt-2">
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={(checked) =>
                          updateService(service.id, "isActive", checked)
                        }
                      />
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label className="text-xs text-muted-foreground">
                          {isSpanish ? "Nombre del servicio" : "Service name"}
                        </Label>
                        <Input
                          value={service.name}
                          onChange={(e) =>
                            updateService(service.id, "name", e.target.value)
                          }
                          placeholder={isSpanish ? "Ej: Consulta general" : "E.g.: General consultation"}
                          className="rounded-lg h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {isSpanish ? "Precio (USD)" : "Price (USD)"}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            value={service.price}
                            onChange={(e) =>
                              updateService(service.id, "price", parseInt(e.target.value) || 0)
                            }
                            className="rounded-lg h-9 pl-7"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {isSpanish ? "Duración" : "Duration"}
                        </Label>
                        <Select
                          value={service.duration.toString()}
                          onValueChange={(v) =>
                            updateService(service.id, "duration", parseInt(v))
                          }
                        >
                          <SelectTrigger className="rounded-lg h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                            <SelectItem value="90">90 min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(service.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {services.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {isSpanish
                    ? "No tienes servicios configurados"
                    : "You have no services configured"}
                </p>
                <Button
                  variant="link"
                  onClick={addService}
                  className="text-teal-600 mt-2"
                >
                  {isSpanish ? "Agregar tu primer servicio" : "Add your first service"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function AvailabilityTab({ isSpanish }: { isSpanish: boolean }) {
  const [autoAccept, setAutoAccept] = useState(true)
  const [blockHolidays, setBlockHolidays] = useState(true)
  const [minAdvance, setMinAdvance] = useState("24")

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Booking Rules */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Reglas de Reserva" : "Booking Rules"}
            </CardTitle>
            <CardDescription>
              {isSpanish
                ? "Configura cómo los pacientes pueden reservar contigo"
                : "Configure how patients can book with you"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Accept Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-600" />
                  <span className="font-medium text-sm">
                    {isSpanish ? "Aceptar reservas automáticas" : "Auto-accept bookings"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {autoAccept
                    ? isSpanish
                      ? "Las citas se confirman automáticamente al pagar"
                      : "Appointments are automatically confirmed upon payment"
                    : isSpanish
                    ? "Deberás aprobar cada reserva manualmente"
                    : "You'll need to manually approve each booking"}
                </p>
              </div>
              <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
            </div>

            {/* Min Advance Time */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <span className="font-medium text-sm">
                    {isSpanish
                      ? "Tiempo mínimo de anticipación"
                      : "Minimum advance notice"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {isSpanish
                    ? "Tiempo mínimo antes de que un paciente pueda reservar"
                    : "Minimum time before a patient can book"}
                </p>
              </div>
              <Select value={minAdvance} onValueChange={setMinAdvance}>
                <SelectTrigger className="w-[100px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12h</SelectItem>
                  <SelectItem value="24">24h</SelectItem>
                  <SelectItem value="48">48h</SelectItem>
                  <SelectItem value="72">72h</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Block Holidays */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <span className="font-medium text-sm">
                    {isSpanish
                      ? "Bloquear feriados nacionales"
                      : "Block national holidays"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {isSpanish
                    ? "Bloquea automáticamente los feriados de Chile"
                    : "Automatically block Chilean national holidays"}
                </p>
              </div>
              <Switch checked={blockHolidays} onCheckedChange={setBlockHolidays} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function PaymentsTab({ isSpanish }: { isSpanish: boolean }) {
  const [requireAdvancePayment, setRequireAdvancePayment] = useState(true)
  const [bankConnected] = useState(true)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Bank Connection */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Cuenta Bancaria" : "Bank Account"}
            </CardTitle>
            <CardDescription>
              {isSpanish
                ? "Conecta tu cuenta para recibir pagos"
                : "Connect your account to receive payments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "p-4 rounded-xl border-2 flex items-center justify-between",
                bankConnected
                  ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    bankConnected
                      ? "bg-emerald-500/20 text-emerald-600"
                      : "bg-amber-500/20 text-amber-600"
                  )}
                >
                  {bankConnected ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {bankConnected
                      ? isSpanish
                        ? "Cuenta conectada"
                        : "Account connected"
                      : isSpanish
                      ? "Sin cuenta conectada"
                      : "No account connected"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bankConnected
                      ? "Banco Estado •••• 4521"
                      : isSpanish
                      ? "Conecta tu cuenta para recibir pagos"
                      : "Connect your account to receive payments"}
                  </p>
                </div>
              </div>
              <Button
                variant={bankConnected ? "outline" : "default"}
                size="sm"
                className="rounded-lg"
              >
                {bankConnected
                  ? isSpanish
                    ? "Cambiar"
                    : "Change"
                  : isSpanish
                  ? "Conectar"
                  : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Settings */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Configuración de Pagos" : "Payment Settings"}
            </CardTitle>
            <CardDescription>
              {isSpanish
                ? "La ventaja competitiva de NUREA: pagos garantizados"
                : "NUREA's competitive advantage: guaranteed payments"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20 border border-teal-500/20">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  <span className="font-semibold text-sm text-teal-900 dark:text-teal-100">
                    {isSpanish
                      ? "Exigir pago por adelantado (Depósito en garantía)"
                      : "Require advance payment (Escrow deposit)"}
                  </span>
                </div>
                <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
                  {isSpanish
                    ? "El paciente paga al reservar. Los fondos se mantienen en garantía y se liberan a tu cuenta después de la consulta. Elimina el ausentismo y garantiza tu ingreso."
                    : "Patient pays upon booking. Funds are held in escrow and released to your account after the consultation. Eliminates no-shows and guarantees your income."}
                </p>
                <Badge className="bg-teal-600 text-white text-[10px] mt-1">
                  {isSpanish ? "Recomendado" : "Recommended"}
                </Badge>
              </div>
              <Switch
                checked={requireAdvancePayment}
                onCheckedChange={setRequireAdvancePayment}
                className="ml-4 shrink-0"
              />
            </div>

            {!requireAdvancePayment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
              >
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                  {isSpanish
                    ? "Sin pago adelantado, podrías experimentar más ausencias de pacientes."
                    : "Without advance payment, you may experience more patient no-shows."}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function ExtrasTab({ isSpanish }: { isSpanish: boolean }) {
  const [preConsultNotes, setPreConsultNotes] = useState(true)
  const [whatsappReminders, setWhatsappReminders] = useState(false)

  const extras = [
    {
      id: "pre-notes",
      icon: FileText,
      title: isSpanish ? "Notas pre-consulta" : "Pre-consultation notes",
      description: isSpanish
        ? "Solicita al paciente el motivo de consulta antes de entrar"
        : "Ask the patient for the consultation reason before entering",
      enabled: preConsultNotes,
      onChange: setPreConsultNotes,
      isPro: false,
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      title: isSpanish ? "Recordatorios por WhatsApp" : "WhatsApp reminders",
      description: isSpanish
        ? "Envía recordatorios automáticos a los pacientes por WhatsApp"
        : "Send automatic reminders to patients via WhatsApp",
      enabled: whatsappReminders,
      onChange: setWhatsappReminders,
      isPro: true,
    },
    {
      id: "email-summary",
      icon: Bell,
      title: isSpanish ? "Resumen diario por email" : "Daily email summary",
      description: isSpanish
        ? "Recibe un resumen de tus citas cada mañana"
        : "Receive a summary of your appointments every morning",
      enabled: true,
      onChange: () => {},
      isPro: false,
    },
    {
      id: "ai-notes",
      icon: Sparkles,
      title: isSpanish ? "Notas con IA" : "AI Notes",
      description: isSpanish
        ? "Genera notas clínicas automáticas con inteligencia artificial"
        : "Generate automatic clinical notes with artificial intelligence",
      enabled: false,
      onChange: () => {},
      isPro: true,
      comingSoon: true,
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Funciones Adicionales" : "Additional Features"}
            </CardTitle>
            <CardDescription>
              {isSpanish
                ? "Personaliza tu experiencia con herramientas avanzadas"
                : "Customize your experience with advanced tools"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {extras.map((extra) => (
                <motion.div
                  key={extra.id}
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "relative p-4 rounded-xl border transition-all",
                    extra.enabled && !extra.comingSoon
                      ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-500/30"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
                    extra.comingSoon && "opacity-60"
                  )}
                >
                  {extra.isPro && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] px-2">
                      PRO
                    </Badge>
                  )}
                  {extra.comingSoon && (
                    <Badge
                      variant="outline"
                      className="absolute -top-2 right-8 text-[10px] bg-white dark:bg-slate-900"
                    >
                      {isSpanish ? "Próximamente" : "Coming Soon"}
                    </Badge>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          extra.enabled && !extra.comingSoon
                            ? "bg-teal-500/20 text-teal-600"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                        )}
                      >
                        <extra.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{extra.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {extra.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={extra.enabled}
                      onCheckedChange={extra.onChange}
                      disabled={extra.comingSoon}
                      className="shrink-0"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export function ProfessionalSettingsContent({
  profile,
  professional,
  userEmail,
}: ProfessionalSettingsContentProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [activeTab, setActiveTab] = useState("profile")
  const [hasChanges, setHasChanges] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const tabs = [
    { id: "profile", label: isSpanish ? "Perfil Público" : "Public Profile", icon: User },
    { id: "services", label: isSpanish ? "Servicios y Precios" : "Services & Pricing", icon: DollarSign },
    { id: "availability", label: isSpanish ? "Disponibilidad" : "Availability", icon: Calendar },
    { id: "payments", label: isSpanish ? "Pagos" : "Payments", icon: CreditCard },
    { id: "extras", label: "Extras", icon: Zap },
  ]

  return (
    <div className="space-y-6 relative pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-teal-600" />
            </div>
            {isSpanish ? "Configuración Profesional" : "Professional Settings"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isSpanish
              ? "Gestiona tu visibilidad, servicios y plataforma de atención"
              : "Manage your visibility, services and care platform"}
          </p>
        </div>

        {/* Profile Completeness Bar */}
        <div className="w-full md:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-600 dark:text-slate-400 italic">
              {isSpanish ? "Completitud del perfil" : "Profile completeness"}
            </span>
            <span className="font-bold text-teal-600">85%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.3)]"
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            {isSpanish ? "Añade una sub-especialidad para llegar al 100%" : "Add a sub-specialty to reach 100%"}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl h-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <tab.icon className="h-4 w-4 mr-2 inline-block" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.label.split(" ")[0]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfileTab profile={profile} isSpanish={isSpanish} isSaving={isSaving} />
        </TabsContent>

        <TabsContent value="services" className="mt-0">
          <ServicesTab isSpanish={isSpanish} />
        </TabsContent>

        <TabsContent value="availability" className="mt-0">
          <AvailabilityTab isSpanish={isSpanish} />
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          <PaymentsTab isSpanish={isSpanish} />
        </TabsContent>

        <TabsContent value="extras" className="mt-0">
          <ExtrasTab isSpanish={isSpanish} />
        </TabsContent>
      </Tabs>

      {/* Fixed Save Button */}
      <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 z-50 group"
          >
            <div className="absolute inset-0 bg-teal-600 blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
            <Button
              size="lg"
              disabled={isSaving}
              onClick={() => {
                setIsSaving(true)
                setTimeout(() => setIsSaving(false), 2000)
              }}
              className="relative rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-2xl h-14 px-8 font-semibold transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              {isSaving 
                ? (isSpanish ? "Guardando..." : "Saving...") 
                : (isSpanish ? "Guardar Cambios" : "Save Changes")}
            </Button>
          </motion.div>
      </AnimatePresence>
    </div>
  )
}
