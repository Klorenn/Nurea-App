"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, UserX, UserCheck, Loader2, Trash2, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminUsersPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [blockedFilter, setBlockedFilter] = useState<string>("all")
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newRole, setNewRole] = useState<string>("")

  useEffect(() => {
    loadUsers()
  }, [roleFilter, blockedFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter !== "all") params.append("role", roleFilter)
      if (blockedFilter !== "all") params.append("blocked", blockedFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (userId: string, block: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, blocked: block }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo bloquear/desbloquear el usuario")
      }

      await loadUsers()
      setBlockDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error blocking user:", error)
      alert(error instanceof Error ? error.message : (isSpanish 
        ? "No se pudo bloquear/desbloquear el usuario"
        : "Could not block/unblock user"))
    }
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo cambiar el rol")
      }

      await loadUsers()
      setRoleDialogOpen(false)
      setSelectedUser(null)
      setNewRole("")
    } catch (error) {
      console.error("Error changing role:", error)
      alert(error instanceof Error ? error.message : (isSpanish 
        ? "No se pudo cambiar el rol"
        : "Could not change role"))
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar el usuario")
      }

      await loadUsers()
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(error instanceof Error ? error.message : (isSpanish 
        ? "No se pudo eliminar el usuario"
        : "Could not delete user"))
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              {isSpanish ? "Usuarios" : "Users"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Ver y gestionar usuarios de la plataforma"
                : "View and manage platform users"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar usuarios..." : "Search users..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Rol" : "Role"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="patient">{isSpanish ? "Paciente" : "Patient"}</SelectItem>
                <SelectItem value="professional">{isSpanish ? "Profesional" : "Professional"}</SelectItem>
                <SelectItem value="admin">{isSpanish ? "Admin" : "Admin"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={blockedFilter} onValueChange={setBlockedFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Estado" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="false">{isSpanish ? "Activos" : "Active"}</SelectItem>
                <SelectItem value="true">{isSpanish ? "Bloqueados" : "Blocked"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {isSpanish ? "No se encontraron usuarios" : "No users found"}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="p-6 hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-12 w-12 border border-border/40">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg truncate">
                                {user.first_name} {user.last_name}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="outline">{user.role}</Badge>
                                {user.blocked && (
                                  <Badge variant="destructive">
                                    {isSpanish ? "Bloqueado" : "Blocked"}
                                  </Badge>
                                )}
                                {user.email_verified && (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                    {isSpanish ? "Verificado" : "Verified"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isSpanish ? "Registrado:" : "Registered:"} {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setRoleDialogOpen(true)
                              }}
                              className="rounded-xl"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {isSpanish ? "Cambiar Rol" : "Change Role"}
                            </Button>
                            {user.blocked ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setBlockDialogOpen(true)
                                }}
                                className="rounded-xl"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {isSpanish ? "Desbloquear" : "Unblock"}
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setBlockDialogOpen(true)
                                }}
                                className="rounded-xl"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                {isSpanish ? "Bloquear" : "Block"}
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteDialogOpen(true)
                              }}
                              className="rounded-xl"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isSpanish ? "Eliminar" : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Block Dialog */}
        <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.blocked 
                  ? (isSpanish ? "Desbloquear Usuario" : "Unblock User")
                  : (isSpanish ? "Bloquear Usuario" : "Block User")}
              </DialogTitle>
              <DialogDescription>
                {selectedUser?.blocked
                  ? (isSpanish 
                      ? `¿Estás seguro de que quieres desbloquear a ${selectedUser?.first_name} ${selectedUser?.last_name}?`
                      : `Are you sure you want to unblock ${selectedUser?.first_name} ${selectedUser?.last_name}?`)
                  : (isSpanish
                      ? `¿Estás seguro de que quieres bloquear a ${selectedUser?.first_name} ${selectedUser?.last_name}? No podrá acceder a la plataforma.`
                      : `Are you sure you want to block ${selectedUser?.first_name} ${selectedUser?.last_name}? They will not be able to access the platform.`)}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                variant={selectedUser?.blocked ? "default" : "destructive"}
                onClick={() => handleBlock(selectedUser?.id, !selectedUser?.blocked)}
              >
                {selectedUser?.blocked 
                  ? (isSpanish ? "Desbloquear" : "Unblock")
                  : (isSpanish ? "Bloquear" : "Block")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Change Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isSpanish ? "Cambiar Rol de Usuario" : "Change User Role"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser && (
                  <>
                    {isSpanish ? "Cambiar rol de" : "Change role for"} {selectedUser.first_name} {selectedUser.last_name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? "Seleccionar rol" : "Select role"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">{isSpanish ? "Paciente" : "Patient"}</SelectItem>
                  <SelectItem value="professional">{isSpanish ? "Profesional" : "Professional"}</SelectItem>
                  <SelectItem value="admin">{isSpanish ? "Administrador" : "Admin"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button onClick={handleRoleChange} disabled={!newRole || newRole === selectedUser?.role}>
                {isSpanish ? "Cambiar Rol" : "Change Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isSpanish ? "Eliminar Usuario" : "Delete User"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser && (
                  <>
                    {isSpanish 
                      ? `¿Estás seguro de que quieres eliminar permanentemente a ${selectedUser.first_name} ${selectedUser.last_name}? Esta acción no se puede deshacer y eliminará todos los datos del usuario.`
                      : `Are you sure you want to permanently delete ${selectedUser.first_name} ${selectedUser.last_name}? This action cannot be undone and will delete all user data.`}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {isSpanish ? "Eliminar Permanentemente" : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </RouteGuard>
  )
}
