"use client"

import { useState, useEffect, useMemo } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Search,
  Loader2,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Trash2,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  FileText,
  X,
  RefreshCw,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

type AccountStatus = "active" | "warning" | "suspended" | "pending"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: "patient" | "professional" | "admin"
  avatar_url?: string
  blocked: boolean
  account_status: AccountStatus
  warning_message?: string
  subscription_status?: string | null
  trial_end_date?: string | null
  selected_plan_id?: string | null
  created_at: string
  email_verified?: boolean
  phone?: string
  location?: string
  specialty?: string
  license_number?: string
  verified?: boolean
  date_of_birth?: string
}

export default function AdminUsersPage() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const isSpanish = language === "es"
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  // Modal states
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [warningMessage, setWarningMessage] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadUsers()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadUsers(true), 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users || [])
      } else {
        const msg = data.message || (isSpanish ? "No se pudieron cargar los usuarios" : "Could not load users")
        setError(msg)
        if (!silent) {
          toast({
            title: isSpanish ? "Error" : "Error",
            description: msg,
            variant: "destructive",
          })
        }
      }
    } catch (err) {
      console.error("Error loading users:", err)
      const msg = isSpanish ? "No se pudieron cargar los usuarios" : "Could not load users"
      setError(msg)
      if (!silent) {
        toast({ title: "Error", description: msg, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    let filtered = users

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((user) =>
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.specialty?.toLowerCase().includes(query)
      )
    }

    // Filter by tab
    switch (activeTab) {
      case "pending":
        filtered = filtered.filter((u) => u.role === "professional" && !u.verified)
        break
      case "professionals":
        filtered = filtered.filter((u) => u.role === "professional" && u.verified)
        break
      case "patients":
        filtered = filtered.filter((u) => u.role === "patient")
        break
      case "warned":
        filtered = filtered.filter((u) => u.account_status === "warning" || u.account_status === "suspended")
        break
    }

    return filtered
  }, [users, searchQuery, activeTab])

  const tabCounts = useMemo(() => ({
    all: users.length,
    pending: users.filter((u) => u.role === "professional" && !u.verified).length,
    professionals: users.filter((u) => u.role === "professional" && u.verified).length,
    patients: users.filter((u) => u.role === "patient").length,
    warned: users.filter((u) => u.account_status === "warning" || u.account_status === "suspended").length,
  }), [users])

  const handleApprove = async (user: User) => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/professionals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId: user.id, verified: true }),
      })

      if (!response.ok) throw new Error("Failed to approve")

      toast({
        title: isSpanish ? "✅ Perfil aprobado" : "✅ Profile approved",
        description: isSpanish 
          ? `${user.first_name} ahora puede atender pacientes`
          : `${user.first_name} can now see patients`,
      })
      
      await loadUsers()
    } catch (error) {
      toast({
        title: isSpanish ? "Error" : "Error",
        description: isSpanish ? "No se pudo aprobar el perfil" : "Could not approve profile",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage.trim()) return
    
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          account_status: "warning",
          warning_message: warningMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send warning")

      toast({
        title: isSpanish ? "⚠️ Advertencia enviada" : "⚠️ Warning sent",
        description: isSpanish 
          ? `Se notificó a ${selectedUser.first_name}`
          : `${selectedUser.first_name} has been notified`,
      })
      
      setWarningDialogOpen(false)
      setWarningMessage("")
      setSelectedUser(null)
      await loadUsers()
    } catch (error) {
      toast({
        title: isSpanish ? "Error" : "Error",
        description: isSpanish ? "No se pudo enviar la advertencia" : "Could not send warning",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!selectedUser) return
    
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          account_status: "suspended",
          blocked: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to suspend")

      toast({
        title: isSpanish ? "⛔ Cuenta suspendida" : "⛔ Account suspended",
        description: isSpanish 
          ? `${selectedUser.first_name} ya no puede acceder a NUREA`
          : `${selectedUser.first_name} can no longer access NUREA`,
      })
      
      setSuspendDialogOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (error) {
      toast({
        title: isSpanish ? "Error" : "Error",
        description: isSpanish ? "No se pudo suspender la cuenta" : "Could not suspend account",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: isSpanish ? "🗑️ Usuario eliminado" : "🗑️ User deleted",
        description: isSpanish 
          ? "Todos los datos han sido eliminados permanentemente"
          : "All data has been permanently deleted",
      })
      
      setDeleteConfirmDialogOpen(false)
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (error) {
      toast({
        title: isSpanish ? "Error" : "Error",
        description: isSpanish ? "No se pudo eliminar el usuario" : "Could not delete user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async (user: User) => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          account_status: "active",
          blocked: false,
          warning_message: null,
        }),
      })

      if (!response.ok) throw new Error("Failed to reactivate")

      toast({
        title: isSpanish ? "✅ Cuenta reactivada" : "✅ Account reactivated",
        description: isSpanish 
          ? `${user.first_name} puede acceder nuevamente`
          : `${user.first_name} can access again`,
      })
      
      await loadUsers()
    } catch (error) {
      toast({
        title: isSpanish ? "Error" : "Error",
        description: isSpanish ? "No se pudo reactivar la cuenta" : "Could not reactivate account",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.account_status === "suspended" || user.blocked) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="h-3 w-3" />
          {isSpanish ? "Suspendido" : "Suspended"}
        </Badge>
      )
    }
    if (user.account_status === "warning") {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1">
          <AlertTriangle className="h-3 w-3" />
          {isSpanish ? "Advertencia" : "Warning"}
        </Badge>
      )
    }
    if (user.role === "professional" && !user.verified) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1">
          <Clock className="h-3 w-3" />
          {isSpanish ? "Pendiente" : "Pending"}
        </Badge>
      )
    }
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {isSpanish ? "Activo" : "Active"}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                {isSpanish ? "Moderación y Alertas" : "Moderation & Alerts"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isSpanish
                  ? "Gestiona usuarios, verificaciones y acciones disciplinarias"
                  : "Manage users, verifications and disciplinary actions"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadUsers()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {isSpanish ? "Actualizar" : "Refresh"}
            </Button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Search and Tabs */}
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar por nombre, email o especialidad..." : "Search by name, email or specialty..."}
                className="pl-10 h-11 rounded-xl bg-card border-border/40"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-card border border-border/40 p-1 h-auto flex-wrap">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                  {isSpanish ? "Todos" : "All"} ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  {isSpanish ? "Pendientes" : "Pending"} ({tabCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="professionals" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  {isSpanish ? "Profesionales" : "Professionals"} ({tabCounts.professionals})
                </TabsTrigger>
                <TabsTrigger value="patients" className="rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white">
                  {isSpanish ? "Pacientes" : "Patients"} ({tabCounts.patients})
                </TabsTrigger>
                <TabsTrigger value="warned" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  {isSpanish ? "Advertidos/Suspendidos" : "Warned/Suspended"} ({tabCounts.warned})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30">
                      <th className="text-left p-4 font-semibold text-sm">
                        {isSpanish ? "Usuario" : "User"}
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        {isSpanish ? "Rol" : "Role"}
                      </th>
                      <th className="text-left p-4 font-semibold text-sm hidden md:table-cell">
                        {isSpanish ? "Especialidad / RUT" : "Specialty / ID"}
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        {isSpanish ? "Estado" : "Status"}
                      </th>
                      <th className="text-right p-4 font-semibold text-sm">
                        {isSpanish ? "Acciones" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">
                            {isSpanish ? "No se encontraron usuarios" : "No users found"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr 
                          key={user.id} 
                          className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-border/40">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {user.first_name} {user.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {user.role === "professional" && <Stethoscope className="h-3 w-3 mr-1" />}
                              {user.role === "patient" && <Users className="h-3 w-3 mr-1" />}
                              {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {user.role === "professional" ? (
                              <div className="text-sm">
                                <p className="font-medium">{user.specialty || "-"}</p>
                                <p className="text-muted-foreground text-xs">
                                  {user.license_number || "Sin RUT"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(user)}
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                  {isSpanish ? "Acciones" : "Actions"}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {/* Ver Perfil */}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setProfileSheetOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {isSpanish ? "👁️ Ver Perfil Completo" : "👁️ View Full Profile"}
                                </DropdownMenuItem>

                                {/* Aprobar (solo para profesionales pendientes) */}
                                {user.role === "professional" && !user.verified && (
                                  <DropdownMenuItem 
                                    onClick={() => handleApprove(user)}
                                    className="text-emerald-600"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {isSpanish ? "✅ Aprobar Perfil" : "✅ Approve Profile"}
                                  </DropdownMenuItem>
                                )}

                                {/* Reactivar (solo para suspendidos/advertidos) */}
                                {(user.account_status === "warning" || user.account_status === "suspended") && (
                                  <DropdownMenuItem 
                                    onClick={() => handleReactivate(user)}
                                    className="text-emerald-600"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {isSpanish ? "✅ Reactivar Cuenta" : "✅ Reactivate Account"}
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {/* Enviar Advertencia */}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setWarningDialogOpen(true)
                                  }}
                                  className="text-amber-600"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  {isSpanish ? "⚠️ Enviar Advertencia" : "⚠️ Send Warning"}
                                </DropdownMenuItem>

                                {/* Suspender */}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setSuspendDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  {isSpanish ? "⛔ Suspender Cuenta" : "⛔ Suspend Account"}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Eliminar */}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isSpanish ? "🗑️ Eliminar Usuario" : "🗑️ Delete User"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Profile Sheet */}
        <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedUser?.first_name?.[0]}{selectedUser?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p>{selectedUser?.first_name} {selectedUser?.last_name}</p>
                  <p className="text-sm text-muted-foreground font-normal capitalize">
                    {selectedUser?.role}
                  </p>
                </div>
              </SheetTitle>
            </SheetHeader>

            {selectedUser && (
              <div className="mt-6 space-y-6">
                {/* Estado */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedUser)}
                  {selectedUser.verified && (
                    <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20">
                      {isSpanish ? "Verificado" : "Verified"}
                    </Badge>
                  )}
                </div>

                {/* Warning Message */}
                {selectedUser.warning_message && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      {isSpanish ? "Advertencia activa" : "Active warning"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.warning_message}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Info Grid */}
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{selectedUser.email}</p>
                    </div>
                  </div>

                  {selectedUser.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isSpanish ? "Teléfono" : "Phone"}</p>
                        <p className="text-sm font-medium">{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedUser.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isSpanish ? "Ubicación" : "Location"}</p>
                        <p className="text-sm font-medium">{selectedUser.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isSpanish ? "Registrado" : "Registered"}</p>
                      <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>

                  {selectedUser.role === "professional" && (
                    <>
                      <Separator />
                      <p className="text-sm font-semibold">
                        {isSpanish ? "Datos Profesionales" : "Professional Data"}
                      </p>
                      
                      {selectedUser.specialty && (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{isSpanish ? "Especialidad" : "Specialty"}</p>
                            <p className="text-sm font-medium">{selectedUser.specialty}</p>
                          </div>
                        </div>
                      )}

                      {selectedUser.license_number && (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">RUT / Registro</p>
                            <p className="text-sm font-medium">{selectedUser.license_number}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold mb-3">
                    {isSpanish ? "Acciones rápidas" : "Quick actions"}
                  </p>
                  
                  {selectedUser.role === "professional" && !selectedUser.verified && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => {
                        handleApprove(selectedUser)
                        setProfileSheetOpen(false)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                      {isSpanish ? "Aprobar perfil" : "Approve profile"}
                    </Button>
                  )}

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setProfileSheetOpen(false)
                      setWarningDialogOpen(true)
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    {isSpanish ? "Enviar advertencia" : "Send warning"}
                  </Button>

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setProfileSheetOpen(false)
                      setSuspendDialogOpen(true)
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2 text-red-500" />
                    {isSpanish ? "Suspender cuenta" : "Suspend account"}
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Warning Dialog */}
        <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {isSpanish ? "Enviar Advertencia" : "Send Warning"}
              </DialogTitle>
              <DialogDescription>
                {isSpanish 
                  ? `Envía una advertencia a ${selectedUser?.first_name}. El usuario será notificado y su cuenta será marcada.`
                  : `Send a warning to ${selectedUser?.first_name}. The user will be notified and their account will be flagged.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isSpanish ? "Mensaje de advertencia" : "Warning message"}</Label>
                <Textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder={isSpanish 
                    ? "Describe el motivo de la advertencia..."
                    : "Describe the reason for the warning..."}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWarningDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button 
                onClick={handleSendWarning} 
                disabled={!warningMessage.trim() || actionLoading}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSpanish ? "Enviar advertencia" : "Send warning"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Ban className="h-5 w-5" />
                {isSpanish ? "Suspender Cuenta" : "Suspend Account"}
              </DialogTitle>
              <DialogDescription>
                {isSpanish 
                  ? `¿Estás seguro de que quieres suspender la cuenta de ${selectedUser?.first_name} ${selectedUser?.last_name}? No podrán acceder a NUREA hasta que reactives su cuenta.`
                  : `Are you sure you want to suspend ${selectedUser?.first_name} ${selectedUser?.last_name}'s account? They won't be able to access NUREA until you reactivate their account.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleSuspend}
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSpanish ? "Suspender cuenta" : "Suspend account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog - First confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                {isSpanish ? "Eliminar Usuario" : "Delete User"}
              </DialogTitle>
              <DialogDescription>
                {isSpanish 
                  ? "Esta acción eliminará permanentemente todos los datos del usuario, incluyendo citas, documentos y pagos. Esta acción NO SE PUEDE DESHACER."
                  : "This action will permanently delete all user data, including appointments, documents and payments. This action CANNOT BE UNDONE."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  ⚠️ {isSpanish ? "Zona de peligro" : "Danger zone"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isSpanish 
                    ? `Estás a punto de eliminar a: ${selectedUser?.first_name} ${selectedUser?.last_name} (${selectedUser?.email})`
                    : `You are about to delete: ${selectedUser?.first_name} ${selectedUser?.last_name} (${selectedUser?.email})`}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setDeleteConfirmDialogOpen(true)
                }}
              >
                {isSpanish ? "Continuar" : "Continue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog - Second confirmation (Danger Zone) */}
        <AlertDialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
          <AlertDialogContent className="border-red-500/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                {isSpanish ? "¿Eliminar permanentemente?" : "Delete permanently?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isSpanish 
                  ? "Esta es tu última oportunidad de cancelar. Una vez eliminado, no hay vuelta atrás."
                  : "This is your last chance to cancel. Once deleted, there's no going back."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {isSpanish ? "No, conservar usuario" : "No, keep user"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSpanish ? "Sí, eliminar permanentemente" : "Yes, delete permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      
    </RouteGuard>
  )
}
