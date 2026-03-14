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
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

const initialServices: Service[] = [
  { id: "1", name: "Consulta Telemedicina", price: 35, duration: 30, isActive: true },
  { id: "2", name: "Primera Consulta - Evaluación", price: 45, duration: 45, isActive: true },
  { id: "3", name: "Revisión de Exámenes", price: 25, duration: 15, isActive: true },
  { id: "4", name: "Seguimiento de Tratamiento", price: 30, duration: 30, isActive: false },
]

function ProfileTab({ profile, isSpanish }: { profile: ProfessionalSettingsContentProps["profile"]; isSpanish: boolean }) {
  const [bio, setBio] = useState(
    "Médico especialista con más de 10 años de experiencia en el tratamiento integral de pacientes. Enfoque humanizado y basado en evidencia científica."
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Photo & Bio Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Foto de Perfil y Biografía" : "Profile Photo & Bio"}
            </CardTitle>
            <CardDescription>
              {isSpanish
                ? "Esta información será visible para los pacientes en tu perfil público"
                : "This information will be visible to patients on your public profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-start gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-teal-500/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-2xl">
                    {profile?.first_name?.[0] || "D"}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Camera className="h-4 w-4 mr-2" />
                  {isSpanish ? "Cambiar foto" : "Change photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {isSpanish
                    ? "JPG, PNG o GIF. Máximo 2MB. Recomendado: 400x400px"
                    : "JPG, PNG or GIF. Max 2MB. Recommended: 400x400px"}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                {isSpanish ? "Descripción profesional" : "Professional description"}
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none"
                placeholder={
                  isSpanish
                    ? "Cuéntale a tus pacientes sobre tu experiencia y enfoque..."
                    : "Tell your patients about your experience and approach..."
                }
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500 {isSpanish ? "caracteres" : "characters"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Links Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Enlaces Profesionales" : "Professional Links"}
            </CardTitle>
            <CardDescription>
              {isSpanish
                ? "Añade enlaces a tus perfiles profesionales"
                : "Add links to your professional profiles"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-600" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/tu-perfil"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-600" />
                {isSpanish ? "Sitio Web Personal" : "Personal Website"}
              </Label>
              <Input
                id="website"
                placeholder="https://www.tu-sitio.com"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-teal-600" />
          </div>
          {isSpanish ? "Configuración del Consultorio" : "Practice Settings"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {isSpanish
            ? "Gestiona tus servicios, horarios y preferencias de atención"
            : "Manage your services, schedules and care preferences"}
        </p>
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
          <ProfileTab profile={profile} isSpanish={isSpanish} />
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
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50"
          >
            <Button
              size="lg"
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/30 h-12 px-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSpanish ? "Guardar Cambios" : "Save Changes"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
